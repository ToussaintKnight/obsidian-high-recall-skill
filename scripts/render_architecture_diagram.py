from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


SRC = Path("docs/architecture/architecture_option_b_archify.architecture.json")
OUT = Path("docs/architecture/architecture_option_b_archify.png")
SCALE = 1.45

COLORS = {
    "bg": "#ffffff",
    "grid": "#eef3f7",
    "text": "#111827",
    "muted": "#64748b",
    "dim": "#94a3b8",
    "external_fill": "#f1f5f9",
    "external": "#64748b",
    "backend_fill": "#d9f6eb",
    "backend": "#059669",
    "database_fill": "#eee9ff",
    "database": "#7c3aed",
    "messagebus_fill": "#fff0df",
    "messagebus": "#ea580c",
    "cloud_fill": "#fff3cf",
    "cloud": "#d97706",
    "security_fill": "#ffe6ee",
    "security": "#e11d48",
}

TYPE_LABELS = {
    "external": "External",
    "backend": "Backend",
    "database": "Database",
    "messagebus": "Message bus",
    "cloud": "Cloud",
    "security": "Security",
}


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/consolab.ttf" if bold else "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=round(size * SCALE))
    return ImageFont.load_default()


F_NODE = font(11, True)
F_SUB = font(9)
F_TAG = font(7)
F_LABEL = font(8)
F_BOUNDARY = font(9, True)
F_LEGEND = font(9, True)
F_LEGEND_ITEM = font(8)


def s(value: float) -> int:
    return round(value * SCALE)


def xy(point: tuple[float, float] | list[float]) -> tuple[int, int]:
    return s(point[0]), s(point[1])


def rounded(draw: ImageDraw.ImageDraw, box, radius, fill, outline, width=2):
    draw.rounded_rectangle(tuple(s(v) for v in box), radius=s(radius), fill=fill, outline=outline, width=s(width))


def dashed_line(draw: ImageDraw.ImageDraw, p0, p1, fill, width=2, dash=8, gap=6):
    x0, y0 = p0
    x1, y1 = p1
    dx, dy = x1 - x0, y1 - y0
    length = math.hypot(dx, dy)
    if length == 0:
        return
    ux, uy = dx / length, dy / length
    pos = 0
    while pos < length:
        end = min(pos + s(dash), length)
        start_pt = (round(x0 + ux * pos), round(y0 + uy * pos))
        end_pt = (round(x0 + ux * end), round(y0 + uy * end))
        draw.line([start_pt, end_pt], fill=fill, width=s(width))
        pos += s(dash + gap)


def dashed_rect(draw: ImageDraw.ImageDraw, box, fill, width=1):
    x0, y0, x1, y1 = (s(v) for v in box)
    dashed_line(draw, (x0, y0), (x1, y0), fill, width)
    dashed_line(draw, (x1, y0), (x1, y1), fill, width)
    dashed_line(draw, (x1, y1), (x0, y1), fill, width)
    dashed_line(draw, (x0, y1), (x0, y0), fill, width)


def text_center(draw, center_x, y, text, fill, font_obj):
    draw.text((s(center_x), s(y)), text, fill=fill, font=font_obj, anchor="ma")


def component_rect(component):
    x, y = component["pos"]
    w, h = component["size"]
    return {"x": x, "y": y, "w": w, "h": h, "cx": x + w / 2, "cy": y + h / 2}


def boundary_rect(boundary, components):
    members = [components[item] for item in boundary["wraps"]]
    min_x = min(item["x"] for item in members)
    min_y = min(item["y"] for item in members)
    max_x = max(item["x"] + item["w"] for item in members)
    max_y = max(item["y"] + item["h"] for item in members)
    pad = boundary.get("pad", 30)
    return {
        **boundary,
        "x": min_x - pad,
        "y": min_y - pad,
        "w": max_x - min_x + pad * 2,
        "h": max_y - min_y + pad + 20,
    }


def anchor(rect, side):
    if side == "left":
        return [rect["x"], rect["cy"]]
    if side == "right":
        return [rect["x"] + rect["w"], rect["cy"]]
    if side == "top":
        return [rect["cx"], rect["y"]]
    if side == "bottom":
        return [rect["cx"], rect["y"] + rect["h"]]
    raise ValueError(f"unknown side: {side}")


def route_points(conn, components):
    start = anchor(components[conn["from"]], conn.get("fromSide", "right"))
    end = anchor(components[conn["to"]], conn.get("toSide", "left"))
    if "via" in conn:
        return [start, *conn["via"], end]
    route = conn.get("route", "auto")
    if route == "straight":
        return [start, end]
    if route == "orthogonal-v":
        mid_y = (start[1] + end[1]) / 2
        return [start, [start[0], mid_y], [end[0], mid_y], end]
    if route == "orthogonal-h" or route == "auto":
        if route == "auto" and (abs(start[0] - end[0]) < 4 or abs(start[1] - end[1]) < 4):
            return [start, end]
        mid_x = (start[0] + end[0]) / 2
        return [start, [mid_x, start[1]], [mid_x, end[1]], end]
    return [start, end]


def arrowhead(draw, start, end, fill):
    x0, y0 = xy(start)
    x1, y1 = xy(end)
    angle = math.atan2(y1 - y0, x1 - x0)
    size = s(8)
    spread = math.radians(24)
    p1 = (x1, y1)
    p2 = (round(x1 - size * math.cos(angle - spread)), round(y1 - size * math.sin(angle - spread)))
    p3 = (round(x1 - size * math.cos(angle + spread)), round(y1 - size * math.sin(angle + spread)))
    draw.polygon([p1, p2, p3], fill=fill)


def draw_connection(draw, conn, components):
    variant = conn.get("variant", "default")
    color = COLORS.get(variant, COLORS["backend"])
    if variant == "dashed":
        color = "#7c3aed"
    width = conn.get("width", 1.8 if variant == "emphasis" else 1.5)
    points = route_points(conn, components)
    for p0, p1 in zip(points, points[1:]):
        if variant in {"security", "dashed"}:
            dashed_line(draw, xy(p0), xy(p1), color, width=width)
        else:
            draw.line([xy(p0), xy(p1)], fill=color, width=s(width))
    arrowhead(draw, points[-2], points[-1], color)


def draw_label(draw, conn):
    if "label" not in conn:
        return
    x, y = conn.get("labelAt", [0, 0])
    variant = conn.get("variant", "backend")
    color = COLORS.get(variant, COLORS["backend"])
    if variant == "dashed":
        color = "#7c3aed"
    label = conn["label"]
    bbox = draw.textbbox((0, 0), label, font=F_LABEL)
    w = max(s(30), bbox[2] - bbox[0] + s(10))
    h = s(14)
    cx, cy = xy([x, y])
    draw.rounded_rectangle((cx - w // 2, cy - h + s(2), cx + w // 2, cy + s(2)), radius=s(3), fill="#ffffff")
    draw.text((cx, cy), label, fill=color, font=F_LABEL, anchor="mm")


def draw_component(draw, component, rect):
    ctype = component["type"]
    fill = COLORS[f"{ctype}_fill"]
    outline = COLORS[ctype]
    rounded(draw, (rect["x"], rect["y"], rect["x"] + rect["w"], rect["y"] + rect["h"]), 6, fill, outline, 1.5)
    text_center(draw, rect["cx"], rect["y"] + rect["h"] / 2 - 7, component["label"], COLORS["text"], F_NODE)
    if component.get("sublabel"):
        text_center(draw, rect["cx"], rect["y"] + rect["h"] / 2 + 10, component["sublabel"], COLORS["muted"], F_SUB)
    if component.get("tag"):
        text_center(draw, rect["cx"], rect["y"] + rect["h"] - 10, component["tag"], outline, F_TAG)


def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    view_w, view_h = data["meta"]["viewBox"]
    img = Image.new("RGB", (s(view_w), s(view_h)), COLORS["bg"])
    draw = ImageDraw.Draw(img)

    for x in range(0, int(view_w) + 1, 28):
        draw.line([(s(x), 0), (s(x), s(view_h))], fill=COLORS["grid"], width=1)
    for y in range(0, int(view_h) + 1, 28):
        draw.line([(0, s(y)), (s(view_w), s(y))], fill=COLORS["grid"], width=1)

    components = {item["id"]: component_rect(item) for item in data["components"]}

    for boundary in data.get("boundaries", []):
        rect = boundary_rect(boundary, components)
        color = COLORS["security"] if boundary["kind"] == "security-group" else COLORS["cloud"]
        dashed_rect(draw, (rect["x"], rect["y"], rect["x"] + rect["w"], rect["y"] + rect["h"]), color, 1)
        draw.text((s(rect["x"] + 8), s(rect["y"] + 18)), boundary["label"], fill=color, font=F_BOUNDARY, anchor="lm")

    for conn in data.get("connections", []):
        draw_connection(draw, conn, components)

    for component in data["components"]:
        draw_component(draw, component, components[component["id"]])

    for conn in data.get("connections", []):
        draw_label(draw, conn)

    legend_y = view_h - 16
    x = 40
    draw.text((s(x), s(legend_y - 13)), "Legend", fill=COLORS["text"], font=F_LEGEND, anchor="lm")
    seen = []
    for component in data["components"]:
        ctype = component["type"]
        if ctype not in seen:
            seen.append(ctype)
    for ctype in seen:
        draw.rounded_rectangle((s(x), s(legend_y - 8), s(x + 14), s(legend_y + 1)), radius=s(2), fill=COLORS[f"{ctype}_fill"], outline=COLORS[ctype], width=1)
        draw.text((s(x + 20), s(legend_y)), TYPE_LABELS[ctype], fill=COLORS["muted"], font=F_LEGEND_ITEM, anchor="lm")
        x += 30 + len(TYPE_LABELS[ctype]) * 5 + 28

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


OUT = Path("docs/marketing/social_preview.png")
OUT.parent.mkdir(parents=True, exist_ok=True)


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


W, H = 1280, 640
img = Image.new("RGB", (W, H), "#0f172a")
draw = ImageDraw.Draw(img)

F_TITLE = font(62, True)
F_SUB = font(30)
F_BODY = font(24)
F_TAG = font(20, True)

draw.rounded_rectangle((58, 58, W - 58, H - 58), radius=28, fill="#111827", outline="#334155", width=3)
draw.text((92, 100), "Obsidian High Recall", fill="#f8fafc", font=F_TITLE)
draw.text((96, 188), "Local-first high-recall search for Obsidian vaults", fill="#93c5fd", font=F_SUB)
draw.text((96, 246), "For AI agents and researchers who cannot afford to miss relevant notes.", fill="#d1d5db", font=F_BODY)

features = [
    ("Smart Connections reuse", "#34d399"),
    ("OHS fallback", "#fbbf24"),
    ("fixture benchmark", "#a78bfa"),
    ("raw notes stay local", "#fb7185"),
]

x, y = 96, 335
for label, color in features:
    tw = draw.textlength(label, font=F_TAG)
    draw.rounded_rectangle((x, y, x + tw + 34, y + 46), radius=23, fill="#1f2937", outline=color, width=2)
    draw.ellipse((x + 15, y + 17, x + 27, y + 29), fill=color)
    draw.text((x + 40, y + 12), label, fill="#f8fafc", font=F_TAG)
    x += int(tw) + 58

draw.rounded_rectangle((96, 462, 540, 532), radius=14, fill="#064e3b", outline="#34d399", width=2)
draw.text((126, 482), "npm test -> fixture recall smoke", fill="#d1fae5", font=F_BODY)

draw.text((96, 566), "github.com/ToussaintKnight/obsidian-high-recall-skill", fill="#94a3b8", font=F_BODY)

img.save(OUT)
print(OUT)

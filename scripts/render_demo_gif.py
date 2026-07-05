from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


OUT = Path("docs/demo/fixture_demo.gif")
OUT.parent.mkdir(parents=True, exist_ok=True)


def font(size, bold=False):
    candidates = [
        "C:/Windows/Fonts/consolab.ttf" if bold else "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).exists():
            return ImageFont.truetype(candidate, size=size)
    return ImageFont.load_default()


F_TITLE = font(28, True)
F_BODY = font(18)
F_DIM = font(15)

W, H = 1120, 620
BG = "#0f172a"
PANEL = "#111827"
BORDER = "#334155"
TEXT = "#e5e7eb"
MUTED = "#94a3b8"
GREEN = "#34d399"
BLUE = "#60a5fa"
AMBER = "#fbbf24"


frames = [
    [
        "$ git clone https://github.com/ToussaintKnight/obsidian-high-recall-skill.git",
        "$ cd obsidian-high-recall-skill",
        "",
        "Local-first high-recall search for Obsidian vaults.",
    ],
    [
        "$ npm test",
        "",
        "> syntax checks",
        "> public fixture recall smoke",
        "",
        "Fixture smoke passed: 3 cases have Recall@10 > 0.",
    ],
    [
        "$ node skills/obsidian-high-recall/scripts/obsidian_high_recall.mjs \\",
        '    query "data collection for embodied AI robot demonstrations" \\',
        "    --vault docs/fixtures/demo-vault --backend smart --limit 5",
    ],
    [
        "1. Embodied AI Data Collection.md",
        "   channels=lexical  recall=high",
        "   data collection, robot demonstrations, teleoperation, trajectories",
        "",
        "2. World Models and Simulation.md",
        "   simulation, synthetic data, sim-to-real, robot training",
    ],
    [
        "Privacy model",
        "",
        "- raw notes stay local",
        "- snippets and private queries are not published",
        "- public benchmark uses aggregate/anonymized data",
        "",
        "Use Smart Connections vectors when available; fallback locally when not.",
    ],
]


def draw_frame(lines, idx):
    img = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle((36, 36, W - 36, H - 36), radius=18, fill=PANEL, outline=BORDER, width=2)
    draw.ellipse((68, 64, 84, 80), fill="#ef4444")
    draw.ellipse((94, 64, 110, 80), fill="#f59e0b")
    draw.ellipse((120, 64, 136, 80), fill="#22c55e")
    draw.text((68, 108), "Obsidian High Recall", fill=TEXT, font=F_TITLE)
    draw.text((68, 146), "public fixture demo: install -> test -> query -> recall pack", fill=MUTED, font=F_DIM)

    y = 210
    for line in lines:
        color = TEXT
        if line.startswith("$"):
            color = GREEN
        elif line.startswith(">"):
            color = BLUE
        elif "passed" in line or "Privacy" in line:
            color = AMBER
        draw.text((82, y), line, fill=color, font=F_BODY)
        y += 34 if line else 24

    progress_w = int((idx + 1) / len(frames) * (W - 136))
    draw.rounded_rectangle((68, H - 82, W - 68, H - 68), radius=7, fill="#1f2937")
    draw.rounded_rectangle((68, H - 82, 68 + progress_w, H - 68), radius=7, fill=GREEN)
    draw.text((68, H - 55), "No private vault required for this demo", fill=MUTED, font=F_DIM)
    return img


images = [draw_frame(lines, idx) for idx, lines in enumerate(frames)]
images[0].save(OUT, save_all=True, append_images=images[1:], duration=[1400, 1600, 1700, 2200, 2200], loop=0)
print(OUT)

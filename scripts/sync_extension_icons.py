from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = Image.open(root / "brand" / "logo.png").convert("RGBA")
for size in (16, 32, 48, 128):
    output = root / "extension" / "icons" / f"icon{size}.png"
    source.resize((size, size), Image.Resampling.LANCZOS).save(output, optimize=True)
    print(f"wrote {output} ({size}x{size})")

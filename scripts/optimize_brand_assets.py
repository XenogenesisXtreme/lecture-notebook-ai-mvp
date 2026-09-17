from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
brand = root / "brand"

logo = Image.open(brand / "logo.png").convert("RGB")
logo.thumbnail((768, 768), Image.Resampling.LANCZOS)
logo.save(brand / "logo-optimized.png", format="PNG", optimize=True, compress_level=9)

banner = Image.open(brand / "repository-banner.png").convert("RGB")
banner.thumbnail((1600, 1100), Image.Resampling.LANCZOS)
banner.save(brand / "repository-banner-optimized.jpg", format="JPEG", quality=82, optimize=True, progressive=True)

for path in (brand / "logo-optimized.png", brand / "repository-banner-optimized.jpg"):
    print(f"{path.name}: {path.stat().st_size} bytes")

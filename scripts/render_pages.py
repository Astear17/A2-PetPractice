"""Render the pages used by the interactive tests.

This deliberately renders complete pages. Full-page images are the safe fallback when
automatic cropping cannot prove that a sign, picture option, or table is complete.
"""
from pathlib import Path
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[1]
MATERIALS = ROOT / "materials"
OUTPUT = ROOT / "assets" / "pages"

PAPERS = {
    "key-rw": ("a2-key-2020-reading-writing-question-paper.pdf", range(2, 12)),
    "key-l": ("a2-key-2020-listening-question-paper.pdf", range(2, 8)),
    "schools-rw": ("a2-key-for-schools-2020-reading-writing-question-paper.pdf", range(2, 12)),
    "schools-l": ("a2-key-for-schools-2020-listening-question-paper.pdf", range(2, 8)),
}


def main():
    renderer = shutil.which("pdftoppm")
    if not renderer:
        raise SystemExit("pdftoppm is required to render source pages")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for prefix, (filename, pages) in PAPERS.items():
        source = MATERIALS / filename
        if not source.exists():
            raise SystemExit(f"Missing source: {source}")
        for page in pages:
            target = OUTPUT / f"{prefix}-{page}"
            subprocess.run(
                [renderer, "-f", str(page), "-l", str(page), "-scale-to", "1200",
                 "-png", "-singlefile", str(source), str(target)],
                check=True,
            )
            print(f"Rendered {target.name}.png")


if __name__ == "__main__":
    main()

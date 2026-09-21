"""Make the public 2-page watermarked preview from a full A5 question paper.

Input : bytes of the A5 PDF (from the Question Papers vault).
Output: bytes of a 2-page PDF — page 1 and page 2 of the paper, each with a
        light diagonal "Ravi's Tuition - Free Preview" watermark.

This is the file that goes to 'Study Materials/Website Preview' and whose id
ends up in catalogue.json drive_file_id. The full paper NEVER gets a public id.

Install:  pip install pypdf reportlab
"""
from __future__ import annotations

import io

from pypdf import PdfReader, PdfWriter
from reportlab.pdfgen import canvas

WATERMARK_MAIN = "Ravi's Tuition - Free Preview"
WATERMARK_FOOT = "2-page preview | full paper after free login"
WATERMARK_OPACITY = 0.08


def _watermark_page(width: float, height: float) -> bytes:
    """Build a single transparent watermark page sized to the target page."""
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=(width, height))
    c.saveState()
    c.setFillColorRGB(1, 1, 1)
    c.setFillAlpha(WATERMARK_OPACITY)

    # Large diagonal line through the centre.
    c.setFont("Helvetica-Bold", max(24.0, min(width, height) / 14))
    c.translate(width / 2, height / 2)
    c.rotate(30)
    c.drawCentredString(0, 0, WATERMARK_MAIN)

    # A few quieter parallel lines.
    c.setFont("Helvetica", max(14.0, min(width, height) / 28))
    for dy in (-min(width, height) / 3, min(width, height) / 3):
        c.drawCentredString(0, dy, WATERMARK_MAIN)

    # Footer strip.
    c.rotate(-30)
    c.translate(-width / 2, -height / 2)
    c.setFont("Helvetica", 11)
    c.setFillAlpha(0.25)
    c.drawCentredString(width / 2, 24, WATERMARK_FOOT)
    c.restoreState()
    c.save()
    return buf.getvalue()


def make_preview(a5_bytes: bytes, pages: int = 2) -> bytes:
    """Return the first `pages` pages of the A5 paper, watermarked."""
    reader = PdfReader(io.BytesIO(a5_bytes))
    if not reader.pages:
        raise ValueError("PDF has no pages")
    writer = PdfWriter()
    for i in range(min(pages, len(reader.pages))):
        src = reader.pages[i]
        w = float(src.mediabox.width)
        h = float(src.mediabox.height)
        wm = PdfReader(io.BytesIO(_watermark_page(w, h))).pages[0]
        # add_page deep-copies the page (and shared resources) into the writer.
        # Merge the watermark onto that WRITER copy — never onto the reader's
        # page: papers with a shared /Resources object break the second
        # add_page if the reader page was mutated first.
        page = writer.add_page(src)
        merge = getattr(page, "mergePage", None) or getattr(page, "merge_page")
        merge(wm)  # watermark lands on top of the paper
    out = io.BytesIO()
    writer.write(out)
    return out.getvalue()


if __name__ == "__main__":  # manual test: python3 make_preview.py input.pdf out.pdf
    import sys

    data = open(sys.argv[1], "rb").read()
    open(sys.argv[2], "wb").write(make_preview(data))
    print(f"wrote {sys.argv[2]}")

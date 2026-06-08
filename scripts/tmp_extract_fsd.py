"""Helper utility: extract readable text from the IR FSD .docx.

Usage:
    python scripts/tmp_extract_fsd.py > fsd.txt

Reads word/document.xml from the .docx zip and renders paragraph/table text.
Used to cross-check field names / picklist values against the mockups.
"""
import zipfile, re, sys

PATH = r"docs/IR/DPEG_FSD_IR_Module_v1.2.docx"

with zipfile.ZipFile(PATH) as z:
    xml = z.read("word/document.xml").decode("utf-8", errors="replace")

xml = xml.replace("</w:p>", "</w:p>\n").replace("</w:tr>", "</w:tr>\n").replace("</w:tc>", "\t")
text = re.sub(r"<[^>]+>", "", xml)
text = (text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
            .replace("&quot;", '"').replace("&apos;", "'"))
out = []
for ln in (l.rstrip() for l in text.splitlines()):
    if ln.strip() == "" and (not out or out[-1].strip() == ""):
        continue
    out.append(ln)
sys.stdout.buffer.write("\n".join(out).encode("utf-8", errors="replace"))

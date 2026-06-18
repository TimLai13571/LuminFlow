# -*- coding: utf-8 -*-
import sys, os
sys.path.insert(0, r'C:\Users\Administrator\.qoder\skills\docx')
from scripts.wordfile import WordFile
import zipfile, shutil

docx_path = r'e:\Hackathon\LuminFlow\docs\demo\LuminFlow_Hackathon_Submission.docx'
unpacked = r'e:\Hackathon\LuminFlow\docs\demo\unpacked'

# Clean and extract
if os.path.exists(unpacked):
    shutil.rmtree(unpacked)
os.makedirs(unpacked)
with zipfile.ZipFile(docx_path, 'r') as z:
    z.extractall(unpacked)

doc = WordFile(unpacked)
d = doc['word/document.xml']
dom = d.dom  # Use the already-parsed DOM

NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS_WP = 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing'
NS_A = 'http://schemas.openxmlformats.org/drawingml/2006/main'

pgSz = dom.getElementsByTagNameNS(NS_W, 'pgSz')
pgMar = dom.getElementsByTagNameNS(NS_W, 'pgMar')

print('=== Page Dimensions ===')
if pgSz:
    w = int(pgSz[0].getAttribute('w:w'))
    h = int(pgSz[0].getAttribute('w:h'))
    w_mm = int(w/914400*25.4)
    h_mm = int(h/914400*25.4)
    print(f'Page size: {w} x {h} EMU = {w_mm}mm x {h_mm}mm')
if pgMar:
    top = int(pgMar[0].getAttribute('w:top'))
    bottom = int(pgMar[0].getAttribute('w:bottom'))
    left = int(pgMar[0].getAttribute('w:left'))
    right = int(pgMar[0].getAttribute('w:right'))
    print(f'Margins: top={top}, bottom={bottom}, left={left}, right={right} EMU')
    usable_h_emu = w - top - bottom
    usable_h_pt = usable_h_emu / 12700
    print(f'Usable height: {usable_h_emu} EMU = {usable_h_pt:.0f} pt')

# Images
print('\n=== Image Info ===')
drawings = dom.getElementsByTagNameNS(NS_W, 'drawing')
for i, dw in enumerate(drawings):
    blips = dw.getElementsByTagNameNS(NS_A, 'blip')
    for b in blips:
        embed = b.getAttribute('r:embed')
        if embed:
            print(f'Drawing {i+1}: embed={embed}')
    extents = dw.getElementsByTagNameNS(NS_WP, 'extent')
    for e in extents:
        cx = int(e.getAttribute('cx'))
        cy = int(e.getAttribute('cy'))
        print(f'  Extent: {cx} x {cy} EMU = {cx/914400*25.4:.1f}mm x {cy/914400*25.4:.1f}mm')

# Content stats
paras = dom.getElementsByTagNameNS(NS_W, 'p')
total_chars = 0
for p in paras:
    texts = p.getElementsByTagNameNS(NS_W, 't')
    for t in texts:
        if t.firstChild:
            total_chars += len(t.firstChild.nodeValue)

print(f'\n=== Content Summary ===')
print(f'Total paragraphs: {len(paras)}')
print(f'Total characters: {total_chars}')
print(f'Total drawings: {len(drawings)}')

# Use python-docx for simpler estimation
print(f'\n=== Quick Estimation via python-docx ===')
try:
    from docx import Document as DocxDoc
    pydoc = DocxDoc(docx_path)
    s = pydoc.sections[0]
    page_h_emu = s.page_height
    top_m = s.top_margin or 914400
    bot_m = s.bottom_margin or 914400
    usable_h_pt2 = (page_h_emu - top_m - bot_m) / 12700
    
    total_h = 0
    for para in pydoc.paragraphs:
        t = para.text.strip()
        style_name = para.style.name if para.style else 'Normal'
        
        font_pt = 10
        if style_name == 'Title':
            font_pt = 24
        elif style_name == 'Heading 1':
            font_pt = 15
        elif style_name == 'Heading 2':
            font_pt = 12
        elif style_name == 'Heading 3':
            font_pt = 11
        
        ls = 1.0
        if 'Heading' in style_name:
            ls = 1.15
        
        if not t:
            total_h += font_pt * ls
            continue
        
        chars_per_line = 85
        num_lines = max(1, (len(t) + chars_per_line - 1) // chars_per_line)
        
        extra = 0
        if style_name == 'Heading 1': extra = 12
        elif style_name == 'Heading 2': extra = 8
        elif style_name == 'Heading 3': extra = 6
        elif style_name == 'Title': extra = 14
        
        total_h += num_lines * font_pt * ls + extra
    
    for table in pydoc.tables:
        total_h += len(table.rows) * 14
    
    total_h += 300  # image estimate
    
    pages = total_h / usable_h_pt2
    print(f'Total content height: {total_h:.0f} pt')
    print(f'Usable page height: {usable_h_pt2:.0f} pt')
    print(f'Estimated pages: {pages:.1f}')
except Exception as e:
    print(f'python-docx error: {e}')

# Print full document text 
print(f'\n=== Full Document Text ===')
count = 0
for p in paras:
    pStyle_el = p.getElementsByTagNameNS(NS_W, 'pStyle')
    style_id = pStyle_el[0].getAttribute('w:val') if pStyle_el else 'Normal'
    texts = p.getElementsByTagNameNS(NS_W, 't')
    txt = ''.join(t.firstChild.nodeValue for t in texts if t.firstChild)
    count += 1
    has_img = '[IMG] ' if p.getElementsByTagNameNS(NS_W, 'drawing') else ''
    print(f'[{count:3d}][{style_id:20s}] {has_img}{txt[:200]}')

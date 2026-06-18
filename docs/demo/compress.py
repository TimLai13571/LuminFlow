# -*- coding: utf-8 -*-
import sys
sys.path.insert(0, r'C:\Users\Administrator\.qoder\skills\docx')
from scripts.wordfile import WordFile

doc = WordFile(r'e:\Hackathon\LuminFlow\docs\demo\unpacked')

NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
NS_W = NS

def make_element(tag, attrs=None):
    el = doc['word/styles.xml'].dom.createElementNS(NS, tag)
    if attrs:
        for k, v in attrs.items():
            el.setAttribute(k, v)
    return el

# === STEP 1: Reduce font sizes in styles.xml (already done from previous run) ===
styles = doc['word/styles.xml']

# 1a. Reduce default font from 11pt to 10pt
def_sz = styles.locate_element(tag='w:sz', line_number=range(3, 15), attrs={'w:val': '22'})
if def_sz:
    styles.swap_element(def_sz, '<w:sz xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="20"/>')
def_szCs = styles.locate_element(tag='w:szCs', line_number=range(3, 15), attrs={'w:val': '22'})
if def_szCs:
    styles.swap_element(def_szCs, '<w:szCs xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="20"/>')

# 1b. Reduce heading font sizes
for tag in ['w:sz', 'w:szCs']:
    nodes = styles.dom.getElementsByTagName(tag)
    for n in nodes:
        v = n.getAttribute('w:val')
        if v == '32': n.setAttribute('w:val', '30')
        if v == '26': n.setAttribute('w:val', '24')
        if v == '24': n.setAttribute('w:val', '22')

# 1c. Reduce Title font from 52 to 48
for tag in ['w:sz', 'w:szCs']:
    nodes = styles.dom.getElementsByTagName(tag)
    for n in nodes:
        if n.getAttribute('w:val') == '52':
            n.setAttribute('w:val', '48')

# 1d. Reduce Title spacing
title_spacing = styles.locate_element(tag='w:spacing', line_number=range(520, 540))
if title_spacing:
    title_spacing.setAttribute('w:before', '400')
    title_spacing.setAttribute('w:after', '100')

# 1e. Reduce heading spacings
for bv, av, nb, na in [('360','180','240','120'), ('240','120','180','80'), ('180','100','120','60')]:
    for s in styles.dom.getElementsByTagName('w:spacing'):
        if s.getAttribute('w:before') == bv and s.getAttribute('w:after') == av:
            s.setAttribute('w:before', nb)
            s.setAttribute('w:after', na)

# 1f. Add line spacing to Normal style
normal_style = styles.locate_element(tag='w:style', attrs={'w:styleId': 'a'}, line_number=range(390, 400))
if normal_style:
    pPrs = normal_style.getElementsByTagNameNS(NS, 'pPr')
    if pPrs:
        sp = make_element('w:spacing', {'w:line': '240', 'w:lineRule': 'auto', 'w:before': '0', 'w:after': '60'})
        pPrs[0].appendChild(sp)

print("Styles updated")

# === STEP 2: Trim text content ===
d = doc['word/document.xml']

def replace_para(search_text, new_text, style='a'):
    para = d.locate_element(tag='w:p', contains=search_text)
    if para:
        d.swap_element(para, f'<w:p xmlns:w="{NS_W}"><w:pPr><w:pStyle w:val="{style}"/></w:pPr><w:r><w:t>{new_text}</w:t></w:r></w:p>')
        print(f"  Replaced: {search_text[:60]}...")
        return True
    print(f"  NOT FOUND: {search_text[:60]}...")
    return False

def replace_list(search_text, new_text, numId, ilvl='0'):
    para = d.locate_element(tag='w:p', contains=search_text)
    if para:
        d.swap_element(para, f'<w:p xmlns:w="{NS_W}"><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="{ilvl}"/><w:numId w:val="{numId}"/></w:numPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:t>{new_text}</w:t></w:r></w:p>')
        print(f"  Replaced list: {search_text[:60]}...")
        return True
    print(f"  NOT FOUND list: {search_text[:60]}...")
    return False

# Trim Prototype Scope intro (para 96)
replace_para('intentionally bounded scope',
    'This prototype validates our core assumptions through focused, practical demonstration:')

# Condense Prototype Scope bullets
replace_list('Representative Data: Synthetic data',
    'Representative Data: Synthetic bank lending ICFR audit data with no real client information, enabling safe demonstration in any context.', '5')

replace_list('Focused Audit Demonstration: Three',
    'Focused Audit: Three objectives with full COSO 2013 mapping across all five dimensions, proving comprehensive framework coverage in manageable scope.', '5')

replace_list('Multi-Role Validation: Four stakeholder',
    'Multi-Role Validation: Four personas with distinct visibility controls and AI-tailored outputs, validating differentiated communication assumptions.', '5')

replace_list('Zero-Configuration Demonstration: All',
    'Zero-Configuration: Curated mock data with professionally prepared outputs enables full demonstration without API keys or external dependencies.', '5')

# Trim Business Value section
replace_list('Client Experience Transformation:',
    'Client Experience: Transforms audit from black-box to transparent partnership with real-time visibility and contextual communication.', '4')

replace_list('Engagement Team Efficiency: By',
    'Engagement Team Efficiency: AI automation frees teams from routine communication tasks to focus on high-judgment audit work.', '4')

replace_list('Firm Competitive Positioning:',
    'Firm Positioning: Demonstrates audit transparency as a competitive differentiator influencing client retention and fee negotiations.', '4')

# Trim Section intros
replace_para('driven by a specific hypothesis',
    'Key design choices and reasoning:')

replace_para('five core assumptions about the',
    'Our solution builds on five core assumptions about the evolving audit landscape:')

replace_para('purpose-built engines',
    "LuminFlow's four purpose-built AI engines, each using structured prompts with mock fallback data:")

replace_para('addresses all six Challenge',
    'LuminFlow addresses all six Challenge 2 priorities through integrated, AI-enhanced experiences for engagement teams and their clients.')

print("Text trimmed")

# === STEP 3: Add compact spacing to Normal paragraphs ===
# Skip body paragraph spacing to avoid schema ordering issues
print("Skipping body spacing (covered by styles)")

doc.persist(validate=False)
print("Done!")

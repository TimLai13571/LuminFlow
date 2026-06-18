# -*- coding: utf-8 -*-
import sys
sys.path.insert(0, r'C:\Users\Administrator\.qoder\skills\docx')
from scripts.wordfile import WordFile

doc = WordFile(r'e:\Hackathon\LuminFlow\docs\demo\unpacked')

NS_W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'

d = doc['word/document.xml']

def replace_para(search_text, new_text, style='a'):
    para = d.locate_element(tag='w:p', contains=search_text)
    if para:
        d.swap_element(para, f'<w:p xmlns:w="{NS_W}"><w:pPr><w:pStyle w:val="{style}"/></w:pPr><w:r><w:t>{new_text}</w:t></w:r></w:p>')
        print(f"  OK: {search_text[:50]}")
        return True
    print(f"  NF: {search_text[:50]}")
    return False

def replace_list(search_text, new_text, numId, ilvl='0'):
    para = d.locate_element(tag='w:p', contains=search_text)
    if para:
        d.swap_element(para, f'<w:p xmlns:w="{NS_W}"><w:pPr><w:pStyle w:val="ListParagraph"/><w:numPr><w:ilvl w:val="{ilvl}"/><w:numId w:val="{numId}"/></w:numPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:t>{new_text}</w:t></w:r></w:p>')
        print(f"  OK list: {search_text[:50]}")
        return True
    print(f"  NF list: {search_text[:50]}")
    return False

# === STYLES: Reduce fonts and spacing ===
styles = doc['word/styles.xml']

# Reduce default font 11pt -> 10pt (skip if already compressed)
try:
    def_sz = styles.locate_element(tag='w:sz', line_number=range(3, 15), attrs={'w:val': '22'})
    styles.swap_element(def_sz, '<w:sz xmlns:w="'+NS_W+'" w:val="20"/>')
    print("  Reduced default sz to 20")
except: print("  Default sz already compressed, skipping")
try:
    def_szCs = styles.locate_element(tag='w:szCs', line_number=range(3, 15), attrs={'w:val': '22'})
    styles.swap_element(def_szCs, '<w:szCs xmlns:w="'+NS_W+'" w:val="20"/>')
    print("  Reduced default szCs to 20")
except: print("  Default szCs already compressed, skipping")

# Reduce headings: H1 32->30(15pt), H2 26->24(12pt), H3 24->22(11pt)
for tag in ['w:sz', 'w:szCs']:
    for n in styles.dom.getElementsByTagName(tag):
        v = n.getAttribute('w:val')
        if v == '32': n.setAttribute('w:val', '30')
        if v == '26': n.setAttribute('w:val', '24')
        if v == '24': n.setAttribute('w:val', '22')

# Reduce Title 52->48, Subtitle 28->24, Tagline 24->22
for tag in ['w:sz', 'w:szCs']:
    for n in styles.dom.getElementsByTagName(tag):
        v = n.getAttribute('w:val')
        if v == '52': n.setAttribute('w:val', '48')
        if v == '28': n.setAttribute('w:val', '24')
        if v == '24': 
            # Only reduce Tagline, not headings (which were already adjusted)
            parent = n.parentNode
            if parent and parent.tagName.endswith('rPr'):
                gp = parent.parentNode
                if gp and gp.tagName.endswith('style'):
                    sid = gp.getAttribute('w:styleId')
                    if sid == 'TaglineStyle':
                        n.setAttribute('w:val', '22')

# Reduce heading spacings
for bv, av, nb, na in [('360','180','200','100'), ('240','120','160','60'), ('180','100','120','60')]:
    for s in styles.dom.getElementsByTagName('w:spacing'):
        if s.getAttribute('w:before') == bv and s.getAttribute('w:after') == av:
            s.setAttribute('w:before', nb)
            s.setAttribute('w:after', na)

# Title spacing
ts = styles.locate_element(tag='w:spacing', line_number=range(520, 540))
if ts:
    ts.setAttribute('w:before', '300')
    ts.setAttribute('w:after', '80')

# Add tight line spacing to Normal style
ns = styles.locate_element(tag='w:style', attrs={'w:styleId': 'a'}, line_number=range(390, 400))
if ns:
    pPrs = ns.getElementsByTagNameNS(NS_W, 'pPr')
    if pPrs:
        sp = styles.dom.createElementNS(NS_W, 'w:spacing')
        sp.setAttribute('w:line', '240')
        sp.setAttribute('w:lineRule', 'auto')
        sp.setAttribute('w:before', '0')
        sp.setAttribute('w:after', '40')
        pPrs[0].appendChild(sp)

# Also add spacing to ListParagraph style
lp = styles.locate_element(tag='w:style', attrs={'w:styleId': 'a4'}, line_number=range(544, 550))
if lp:
    pPrs = lp.getElementsByTagNameNS(NS_W, 'pPr')
    if pPrs:
        sp = styles.dom.createElementNS(NS_W, 'w:spacing')
        sp.setAttribute('w:line', '240')
        sp.setAttribute('w:lineRule', 'auto')
        sp.setAttribute('w:before', '0')
        sp.setAttribute('w:after', '20')
        pPrs[0].appendChild(sp)

print("Styles compressed")

# === TEXT: Trim verbose paragraphs ===

# --- Prototype Scope ---
replace_para('validates our core assumptions',
    'This prototype validates our core assumptions through focused demonstration:')

replace_list('Representative Data: Synthetic bank lending',
    'Representative Data: Synthetic bank lending ICFR data, enabling safe demo in any context.', '5')

replace_list('Focused Audit: Three',
    'Focused Audit: Three objectives with full COSO 2013 mapping across all five dimensions in manageable scope.', '5')

replace_list('Multi-Role Validation: Four personas',
    'Multi-Role: Four personas with distinct visibility controls and AI outputs, validating differentiated communication.', '5')

replace_list('Zero-Configuration: Curated',
    'Zero-Config: Curated mock data enables full demo without API key setup or external service dependencies.', '5')

# --- Business Value ---
replace_list('Client Experience: Transforms',
    'Client Experience: Transforms audit from black-box to transparent partnership with real-time visibility.', '4')

replace_list('Engagement Team Efficiency: AI',
    'Engagement Efficiency: AI automation frees teams for high-judgment work, reducing routine communication overhead.', '4')

replace_list('Firm Positioning: Demonstrates',
    'Firm Positioning: Transparency as competitive differentiator influencing retention, fees, and referrals.', '4')

# --- Section intros ---
replace_para('Key design choices and reasoning',
    'Key design choices and reasoning:')

replace_para('five core assumptions about the',
    'Our solution builds on five core assumptions about the evolving audit landscape:')

replace_para('four purpose-built AI engines',
    "LuminFlow's four purpose-built AI engines use structured prompts with mock fallback data:")

replace_para('addresses all six Challenge',
    'LuminFlow addresses all six Challenge 2 priorities through integrated, AI-enhanced experiences for engagement teams and clients.')

# --- Condense verbose section 3 descriptions ---
replace_para('The ObjectivePage provides complete transparency from audit objectives',
    'The ObjectivePage connects audit objectives to test procedures with full traceability:')

replace_para('SampleLens revolutionizes how sampling information is communicated',
    'SampleLens provides sampling transparency BEFORE sample selection occurs:')

replace_para('The ImpactSimulator provides real-time, AI-powered impact analysis',
    'ImpactSimulator provides real-time AI-powered impact analysis for changes or delays:')

replace_para('NarrativeLens generates differentiated communications tailored to each stakeholder',
    'NarrativeLens generates differentiated communications per stakeholder:')

# --- Condense section 2 descriptions ---
replace_para('LuminFlow organizes the audit lifecycle into three distinct phases',
    'LuminFlow organizes the audit lifecycle into three phases with purpose-built tools:')

print("Text compressed")

doc.persist(validate=False)
print("Done!")

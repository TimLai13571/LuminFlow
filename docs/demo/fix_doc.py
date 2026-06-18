import sys, os
sys.path.insert(0, r'C:\Users\Administrator\.qoder\skills\docx')
from scripts.wordfile import WordFile

doc = WordFile(r'e:\Hackathon\LuminFlow\docs\demo\unpacked', rsid="49AA37F8")

def esc(text):
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('\u2014', '&#8212;')
    text = text.replace('\u2013', '&#8211;')
    text = text.replace('\u2018', '&#8216;')
    text = text.replace('\u2019', '&#8217;')
    text = text.replace('\u201c', '&#8220;')
    text = text.replace('\u201d', '&#8221;')
    text = text.replace('\u2026', '&#8230;')
    return text

# ============================================================
# FIX: Use line_number to disambiguate since new Section 4 content
# also contains "Clients increasingly expect" etc.
# ============================================================

# 1.1 - Add emphasis on client expectation shift (early in document)
challenge_intro = doc["word/document.xml"].locate_element(
    tag="w:p", contains="Clients increasingly expect", line_number=range(100, 200))
cpPr = challenge_intro.getElementsByTagName("w:pPr")[0].toxml() if challenge_intro.getElementsByTagName("w:pPr") else '<w:pPr><w:spacing w:after="120"/></w:pPr>'
doc["word/document.xml"].swap_element(challenge_intro,
    f'<w:p w14:paraId="NEWCH01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{cpPr}<w:r><w:t>{esc("Clients increasingly expect clear, timely, and meaningful visibility into how audit requests, data submissions, and sampling activities are linked to audit objectives and outcomes. This expectation reflects a fundamental shift from passive compliance to active partnership. The current audit communication experience, however, remains fragmented:")}</w:t></w:r></w:p>')
print("Challenge intro updated")

# 1.2 - Solution description (early in document)
sol_intro = doc["word/document.xml"].locate_element(
    tag="w:p", contains="LuminFlow is an intelligent audit transparency", line_number=range(150, 300))
spPr = sol_intro.getElementsByTagName("w:pPr")[0].toxml() if sol_intro.getElementsByTagName("w:pPr") else '<w:pPr><w:spacing w:after="120"/></w:pPr>'
doc["word/document.xml"].swap_element(sol_intro,
    f'<w:p w14:paraId="NEWSOL01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{spPr}<w:r><w:t>{esc("LuminFlow is an intelligent audit transparency platform that addresses all six Challenge 2 priorities through an integrated, AI-enhanced experience designed for both engagement teams and their clients:")}</w:t></w:r></w:p>')
print("Solution intro updated")

# Update Integrated Visualization Framework description (early in document)
ivf = doc["word/document.xml"].locate_element(
    tag="w:p", contains="Integrated Visualization Framework:", line_number=range(200, 400))
ivf_pPr = ivf.getElementsByTagName("w:pPr")[0].toxml() if ivf.getElementsByTagName("w:pPr") else '<w:pPr><w:pStyle w:val="a4"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>'
doc["word/document.xml"].swap_element(ivf,
    f'<w:p w14:paraId="NEWIVF01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{ivf_pPr}<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{esc("Integrated Visualization Framework: ")}</w:t></w:r><w:r><w:t>{esc("Connects all audit dimensions \u2014 risk assessment, controls, substantive testing, and reporting \u2014 to specific audit objectives through interactive visualizations that both engagement teams and clients can explore. This creates a shared understanding of audit scope and progress, replacing static status reports with dynamic, drillable views.")}</w:t></w:r></w:p>')
print("IVF updated")

# Update Impact Analysis Engine (early in document)
iae = doc["word/document.xml"].locate_element(
    tag="w:p", contains="Impact Analysis Engine:", line_number=range(200, 500))
iae_pPr = iae.getElementsByTagName("w:pPr")[0].toxml() if iae.getElementsByTagName("w:pPr") else '<w:pPr><w:pStyle w:val="a4"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>'
doc["word/document.xml"].swap_element(iae,
    f'<w:p w14:paraId="NEWIAE01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{iae_pPr}<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{esc("Impact Analysis Engine: ")}</w:t></w:r><w:r><w:t>{esc("ImpactSimulator quantifies the ripple effect of audit changes or delays across the connected COSO framework, providing AI-recommended next steps and mitigation strategies. This enables engagement teams to proactively address client concerns rather than reactively explaining problems after they escalate.")}</w:t></w:r></w:p>')
print("IAE updated")

# ============================================================
# SAVE
# ============================================================
doc.persist(validate=False)
print("\nAll remaining edits applied successfully!")

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

# === STYLES: More aggressive compression ===
styles = doc['word/styles.xml']

# Reduce default font 11pt -> 10pt
try:
    def_sz = styles.locate_element(tag='w:sz', line_number=range(3, 15), attrs={'w:val': '22'})
    styles.swap_element(def_sz, '<w:sz xmlns:w="'+NS_W+'" w:val="20"/>')
except: pass
try:
    def_szCs = styles.locate_element(tag='w:szCs', line_number=range(3, 15), attrs={'w:val': '22'})
    styles.swap_element(def_szCs, '<w:szCs xmlns:w="'+NS_W+'" w:val="20"/>')
except: pass

# Headings: H1 32->30, H2 26->24, H3 24->22
for tag in ['w:sz', 'w:szCs']:
    for n in styles.dom.getElementsByTagName(tag):
        v = n.getAttribute('w:val')
        if v == '32': n.setAttribute('w:val', '30')
        if v == '26': n.setAttribute('w:val', '24')
        if v == '24': 
            parent = n.parentNode
            if parent and parent.tagName.endswith('rPr'):
                gp = parent.parentNode
                if gp and gp.tagName.endswith('style'):
                    sid = gp.getAttribute('w:styleId')
                    if sid in ('3', 'TaglineStyle'):  # Only H3 and Tagline
                        n.setAttribute('w:val', '22')

# Title 52->48, Subtitle 28->24
for tag in ['w:sz', 'w:szCs']:
    for n in styles.dom.getElementsByTagName(tag):
        v = n.getAttribute('w:val')
        if v == '52': n.setAttribute('w:val', '48')
        if v == '28': n.setAttribute('w:val', '24')

# Reduce spacings  
for bv, av, nb, na in [('360','180','180','90'), ('240','120','140','60'), ('180','100','100','50')]:
    for s in styles.dom.getElementsByTagName('w:spacing'):
        if s.getAttribute('w:before') == bv and s.getAttribute('w:after') == av:
            s.setAttribute('w:before', nb)
            s.setAttribute('w:after', na)

ts = styles.locate_element(tag='w:spacing', line_number=range(520, 540))
if ts: ts.setAttribute('w:before', '240'); ts.setAttribute('w:after', '60')

# Normal style line spacing
ns = styles.locate_element(tag='w:style', attrs={'w:styleId': 'a'}, line_number=range(390, 400))
if ns:
    for pPr in ns.getElementsByTagNameNS(NS_W, 'pPr'):
        sp = styles.dom.createElementNS(NS_W, 'w:spacing')
        sp.setAttribute('w:line', '240'); sp.setAttribute('w:lineRule', 'auto')
        sp.setAttribute('w:before', '0'); sp.setAttribute('w:after', '30')
        pPr.appendChild(sp)

# ListParagraph spacing
lp = styles.locate_element(tag='w:style', attrs={'w:styleId': 'a4'}, line_number=range(544, 550))
if lp:
    for pPr in lp.getElementsByTagNameNS(NS_W, 'pPr'):
        sp = styles.dom.createElementNS(NS_W, 'w:spacing')
        sp.setAttribute('w:line', '240'); sp.setAttribute('w:lineRule', 'auto')
        sp.setAttribute('w:before', '0'); sp.setAttribute('w:after', '20')
        pPr.appendChild(sp)

print("Styles updated")

# === TRIM TEXT ===

# Section 1.2 intro
replace_para('LuminFlow addresses all six Challenge',
    'LuminFlow addresses all six Challenge 2 priorities through integrated, AI-powered experiences for audit teams and clients.')

# Section 2.1 intro
replace_para('LuminFlow organizes the audit lifecycle into three',
    'LuminFlow organizes the audit lifecycle into three phases with purpose-built tools:')

# Section 2.2 intro  
replace_para('four purpose-built AI engines',
    "LuminFlow's four AI engines use structured prompts with mock fallback:")

# Section 3 intros
replace_para('The ObjectivePage connects audit objectives',
    'ObjectivePage connects audit objectives to test procedures:')

replace_para('SampleLens provides sampling transparency BEFORE',
    'SampleLens provides pre-selection sampling transparency:')

replace_para('ImpactSimulator provides real-time AI-powered impact',
    'ImpactSimulator provides real-time impact analysis:')

replace_para('NarrativeLens generates differentiated communications per',
    'NarrativeLens generates role-specific communications:')

# Section 4.1 intro
replace_para('Our solution builds on five core assumptions',
    'Five core assumptions about the evolving audit landscape:')

# Section 4.2 intro
replace_para('Key design choices and reasoning',
    'Key design decisions and rationale:')

# Section 4.4 intro
replace_para('This prototype validates our core assumptions through',
    'This prototype validates core assumptions through focused demonstration:')

# Prototype Scope bullets - further condense
replace_list('Representative Data: Synthetic bank lending',
    'Synthetic bank lending ICFR data, no real client info.', '5')

replace_list('Focused Audit: Three objectives',
    'Three objectives with full COSO 2013 mapping across all five dimensions.', '5')

replace_list('Multi-Role: Four personas',
    'Four stakeholder personas with distinct visibility controls and AI-tailored outputs.', '5')

replace_list('Zero-Config: Curated mock',
    'Curated mock data enables full demonstration without API key or external service dependencies.', '5')

# Business Value - further condense
replace_list('Client Experience: Transforms audit',
    'Transforms audit from black-box to transparent, collaborative partnership.', '4')

replace_list('Engagement Efficiency: AI automation',
    'AI automation frees teams from routine communication, focusing effort on high-judgment work.', '4')

replace_list('Firm Positioning: Transparency',
    'Transparency as competitive differentiator influencing client retention and fee negotiations.', '4')

# Section 2 AI pipeline descriptions - trim
replace_list('Risk Analyzer: Provides COSO-based risk',
    'Risk Analyzer: COSO-based risk assessment with residual risk scoring across all five framework dimensions.', '2')

replace_list('Sample Recommender: Intelligently determines',
    'Sample Recommender: AI-determined sample size ranges based on control frequency, characteristics, and risk levels.', '2')

replace_list('Impact Simulator: Models the cascading',
    'Impact Simulator: Models cascading consequences of delays, scope changes, or control deficiencies across the COSO dependency graph.', '2')

replace_list('Narrative Generator: Produces audience-adapted',
    'Narrative Generator: Produces audience-adapted communications from unified audit data for CFOs, audit directors, and IT.', '2')

# Section 2.1 Phase 1-3 tool descriptions - trim
replace_list('TraceMap: Interactive audit process full-linkage',
    'TraceMap: Interactive full-linkage map showing objective-to-procedure relationships.', '1')

replace_list('HeatLens: Risk heatmap with COSO',
    'HeatLens: Risk heatmap with COSO five-dimension scoring, factor breakdown, and risk scoring.', '1')

replace_list('SampleLens: AI-powered sampling preview',
    'SampleLens: AI sampling preview with size recommendations, document distribution charts, and methodology explanations.', '1')

replace_list('PBCView: PBC request tracking with',
    'PBCView: PBC request tracking with auto-generation, overdue alerts, and email draft automation.', '1')

replace_list('NarrativeLens: Audience-adapted narrative',
    'NarrativeLens: Audience-adapted narratives for Client, Internal Audit, and IT stakeholders.', '1')

replace_list('ImpactSimulator: Internal Audit dependency',
    'ImpactSimulator: BFS propagation model with force-directed visualization and before/after comparison tables.', '1')

# Section 3.1 tool descriptions - trim
replace_list('AuditTreeD3: Interactive D3 tree visualization',
    'AuditTreeD3: Interactive D3 tree connecting objectives, risks, controls, and test procedures with collapsible nodes.', '1')

replace_list('RadarChart: ECharts-based multi-dimensional',
    'RadarChart: Multi-dimensional assessment comparing current vs. prior period vs. industry benchmark across COSO dimensions.', '1')

replace_list('DualProgress: Side-by-side progress tracking',
    'DualProgress: Side-by-side tracking of audit procedures and client PBC submissions with gap warnings.', '1')

# Section 3.2
replace_list('AI-Generated Sample Ranges: Sample size intervals',
    'AI-Generated Ranges: Sample size intervals with confidence levels from control frequency, operating type, and RMM.', '2')

replace_list('Document Type Predictions: AI predicts required',
    'Document Predictions: AI-predicted document distribution with priority levels.', '2')

replace_list('Methodology Transparency: AILogicExplainer details the statistical',
    'Methodology: AILogicExplainer details statistical basis, factors, and recommendation logic in plain language.', '2')

replace_list('Interactive Visualizations: Sunburst chart for categorical',
    'Visualizations: Sunburst chart and historical trend bars for intuitive data exploration.', '2')

# Section 3.3
replace_list('ForceGraphD3: D3 force-directed graph showing',
    'ForceGraphD3: Force-directed COSO dependency graph with draggable nodes and hover highlighting.', '1')

replace_list('ComparisonTable: Before/after impact comparison',
    'ComparisonTable: Before/after impact comparison with delta calculations and mitigation strategies.', '1')

replace_list('AI Recommendations: Context-aware suggested next',
    'AI Recommendations: Context-aware next steps based on event type, severity, and affected COSO dimensions.', '1')

# Section 3.4
replace_list('CFO View: Financial impact focus with',
    'CFO: Financial impact with quantitative analysis and business implications.', '1')
replace_list('Internal Audit View: Control deficiency focus',
    'Internal Audit: Control deficiencies with remediation recommendations and residual risk assessment.', '1')
replace_list('IT View: System implication focus with',
    'IT: System implications with technical dependency mapping and configuration impacts.', '1')
replace_list('Approval Workflow: NarrativeApprovalFlow with',
    'Approval Workflow: Publish controls with engagement team oversight.', '1')

# Section 4.1 assumptions - trim
replace_list('Assumption 1 \u2014 Transparency Demand is Structural, Not Cyclical',
    'Transparency Demand is Structural: Clients expect real-time, contextual audit visibility driven by regulatory pressure and governance expectations.', '3')

replace_list('Assumption 2 \u2014 Audit Fragmentation Erodes Trust',
    'Fragmentation Erodes Trust: Disparate channels prevent coherent understanding, breeding anxiety and eroding confidence.', '3')

replace_list('Assumption 3 \u2014 Early Visibility Prevents Escalation',
    'Early Visibility Prevents Escalation: Surprises drive client-auditor conflict; pre-request visibility defuses tension before it escalates.', '3')

replace_list('Assumption 4 \u2014 Context Drives Understanding, Not Data Volume',
    'Context Over Volume: Clients need context, not more data points. Methodology explanation creates understanding where raw numbers create confusion.', '3')

replace_list('Assumption 5 \u2014 One Size Does Not Fit All Stakeholders',
    'Differentiated by Role: CFOs, audit directors, and IT managers have fundamentally different information needs requiring tailored communication.', '3')

# Section 4.2 rationales - trim
replace_list('Three-Phase Architecture (Planning \u2192 Execution \u2192 Communication)',
    'Three-Phase Architecture: Each phase serves distinct client needs \u2014 scope clarity (Planning), progress transparency (Execution), impact understanding (Communication).', '3')

replace_list('AI-Powered Sampling Preview (SampleLens)',
    'AI Sampling Preview: Exposes sampling logic upfront \u2014 sample ranges, document predictions, methodology \u2014 BEFORE selection, replacing post-hoc black-box decisions.', '3')

replace_list('Impact Simulation (ImpactSimulator)',
    'Impact Simulation: Enables proactive scenario analysis, modeling cascading COSO effects before they occur rather than explaining after the fact.', '3')

replace_list('Role-Based Visibility Control: We explicitly',
    'Role-Based Visibility: Different views for different stakeholders \u2014 information relevance varies dramatically by role, not because information is hidden.', '3')

replace_list('AI as Interpreter, Not Decision-Maker: Our AI',
    'AI as Interpreter: AI translates technical findings into plain-language narratives with explained methodology \u2014 judgment stays with audit professionals.', '3')

print("Text trimmed")
doc.persist(validate=False)
print("Done!")

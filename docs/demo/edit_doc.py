import sys, os
sys.path.insert(0, r'C:\Users\Administrator\.qoder\skills\docx')
from scripts.wordfile import WordFile
from PIL import Image
import shutil

doc = WordFile(r'e:\Hackathon\LuminFlow\docs\demo\unpacked', rsid="49AA37F8")

# ============================================================
# STEP 1: COPY DASHBOARD IMAGE TO MEDIA
# ============================================================
media_dir = os.path.join(doc.unpacked_path, 'word/media')
os.makedirs(media_dir, exist_ok=True)
shutil.copy(r'e:\Hackathon\LuminFlow\docs\demo\screenshots\luminflow-dashboard_doc.png',
            os.path.join(media_dir, 'dashboard.png'))
img = Image.open(os.path.join(media_dir, 'dashboard.png'))
width_emus = int(6.0 * 914400)
height_emus = int(width_emus * img.size[1] / img.size[0])

rels_editor = doc['word/_rels/document.xml.rels']
next_rid = rels_editor.get_next_relationship_id()
rels_editor.add_to(rels_editor.dom.documentElement,
    f'<Relationship Id="{next_rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/dashboard.png"/>')

ct_editor = doc['[Content_Types].xml']
ct_editor.add_to(ct_editor.dom.documentElement,
    '<Default Extension="png" ContentType="image/png"/>')

print(f"Image copied, rId={next_rid}, w={width_emus}, h={height_emus}")

# ============================================================
# Helper to sanitize text for XML (ascii-only, use entities)
# ============================================================
def esc(text):
    """Escape special chars and non-ASCII for XML"""
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    text = text.replace('\u2014', '&#8212;')  # em-dash
    text = text.replace('\u2013', '&#8211;')  # en-dash
    text = text.replace('\u2018', '&#8216;')  # left single quote
    text = text.replace('\u2019', '&#8217;')  # right single quote / apostrophe
    text = text.replace('\u201c', '&#8220;')  # left double quote
    text = text.replace('\u201d', '&#8221;')  # right double quote
    text = text.replace('\u2026', '&#8230;')  # ellipsis
    text = text.replace('\u00a0', '&#160;')   # non-breaking space
    return text

# ============================================================
# STEP 2: REPLACE SECTION 4 HEADING
# ============================================================
heading_node = doc["word/document.xml"].locate_element(
    tag="w:p", contains="4. Technical Architecture")
heading_pPr = heading_node.getElementsByTagName("w:pPr")
pPr_xml = heading_pPr[0].toxml() if heading_pPr else '<w:pPr><w:pStyle w:val="1"/></w:pPr>'

new_heading = f'<w:p w14:paraId="NEW00001" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{pPr_xml}<w:r><w:t>{esc("4. Design Assumptions & Business Rationale")}</w:t></w:r></w:p>'
heading_nodes = doc["word/document.xml"].swap_element(heading_node, new_heading)
print("Heading replaced")

# ============================================================
# STEP 3: DELETE OLD SECTION 4 CONTENT (4.1 - 4.4)
# ============================================================
paras_to_delete = [
    "4.1 System Architecture",
    "dual-stack architecture",
    "Frontend: React 18",
    "Backend: FastAPI",
    "Visualization: D3.js",
    "Internationalization: Custom i18n",
    "4.2 Tools",
    "4.3 Prompt",
    "YAML Template Architecture",
    "Context Injection:",
    "Audience Adaptation: Narrative",
    "Temperature Tuning:",
    "Structured Output Enforcement:",
    "Graceful Degradation:",
    "4.4 Scope",
    "This prototype demonstrates the concept",
    "Data: Synthetic",
    "Audit Areas: Three",
    "Roles: Four stakeholder",
    "Infrastructure: Zero",
    "Scalability: Modular",
]

deleted_count = 0
for text in paras_to_delete:
    try:
        node = doc["word/document.xml"].locate_element(tag="w:p", contains=text)
        doc["word/document.xml"].mark_for_deletion(node)
        deleted_count += 1
    except Exception as e:
        print(f"  Could not find/delete: {text[:40]}... ({e})")

print(f"Deleted {deleted_count} old paragraphs")

# ============================================================
# STEP 4: INSERT NEW SECTION 4 CONTENT
# ============================================================
ref_node = doc["word/document.xml"].locate_element(
    tag="w:p", contains="4. Design Assumptions")

def make_heading2(text):
    return f'<w:p w14:paraId="NEWH2001" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000"><w:pPr><w:pStyle w:val="2"/></w:pPr><w:r><w:t>{esc(text)}</w:t></w:r></w:p>'

def make_normal(text):
    return f'<w:p w14:paraId="NEWN0001" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000"><w:pPr><w:spacing w:after="120"/></w:pPr><w:r><w:t>{esc(text)}</w:t></w:r></w:p>'

def make_bold_list(text):
    parts = text.split(": ", 1)
    bold_part = parts[0] + ": "
    rest = parts[1] if len(parts) > 1 else ""
    return f'<w:p w14:paraId="NEWL0001" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000"><w:pPr><w:pStyle w:val="a4"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="3"/></w:numPr></w:pPr><w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{esc(bold_part)}</w:t></w:r><w:r><w:t>{esc(rest)}</w:t></w:r></w:p>'

def make_image_para():
    return f'<w:p w14:paraId="NEWIMG01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000"><w:pPr><w:jc w:val="center"/><w:spacing w:before="200" w:after="100"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="{width_emus}" cy="{height_emus}"/><wp:docPr id="10" name="Dashboard Screenshot"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="10" name="dashboard.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="{next_rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:ext cx="{width_emus}" cy="{height_emus}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>'

def make_caption(text):
    return f'<w:p w14:paraId="NEWCAP01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000"><w:pPr><w:jc w:val="center"/><w:spacing w:after="200"/></w:pPr><w:r><w:rPr><w:i/><w:iCs/><w:color w:val="666666"/><w:sz w:val="18"/><w:szCs w:val="18"/></w:rPr><w:t>{esc(text)}</w:t></w:r></w:p>'

# Build all new content paragraphs
new_content = []

# --- Dashboard Screenshot + Caption ---
new_content.append(make_image_para())
new_content.append(make_caption("Figure 1: LuminFlow Dashboard \u2014 Integrated KPI Overview with Risk Heatmap and Activity Timeline"))

# --- 4.1 Foundational Assumptions ---
new_content.append(make_heading2("4.1 Foundational Assumptions"))
new_content.append(make_normal("Our solution is built on five core assumptions about the evolving audit landscape. These assumptions are not merely theoretical \u2014 they directly inform every design decision in LuminFlow."))

new_content.append(make_bold_list("Assumption 1 \u2014 Transparency Demand is Structural, Not Cyclical: Clients increasingly expect real-time, contextual visibility into audit progress. This shift is driven by regulatory pressure (e.g., enhanced auditor reporting requirements), board-level governance expectations, and the broader digitalization of business relationships. We assume this demand will intensify, not diminish, making transparency infrastructure a strategic necessity rather than a nice-to-have."))
new_content.append(make_bold_list("Assumption 2 \u2014 Audit Fragmentation Erodes Trust: When clients receive information through disparate channels (spreadsheets, emails, portal messages, conference calls), they cannot form a coherent picture of audit progress. This fragmentation breeds anxiety, delays PBC submissions, and generates redundant clarification requests. We assume that consolidating all audit communications into a single, objective-linked platform significantly reduces client anxiety and increases perceived engagement value."))
new_content.append(make_bold_list("Assumption 3 \u2014 Early Visibility Prevents Escalation: The most costly client-auditor conflicts arise from surprises \u2014 unexpected sample requests, unexplained delays, or unclear impact of scope changes. We assume that providing clients with pre-request visibility (sampling logic, anticipated document types, methodology rationale) and real-time impact simulation transforms reactive confrontation into proactive collaboration."))
new_content.append(make_bold_list("Assumption 4 \u2014 Context Drives Understanding, Not Data Volume: Clients do not need more data points; they need better context. Presenting sampling results without methodology, or progress percentages without objective linkage, creates confusion rather than clarity. We assume that linking every piece of audit information to a specific objective, risk, and control \u2014 and explaining the \u201cwhy\u201d in plain language \u2014 dramatically improves client comprehension without increasing information overload."))
new_content.append(make_bold_list("Assumption 5 \u2014 One Size Does Not Fit All Stakeholders: A CFO, an internal audit director, and an IT manager have fundamentally different information needs and communication preferences. Sending identical updates to all stakeholders guarantees that most recipients will find the information either insufficient or irrelevant. We assume that role-based, audience-adapted communication is not a luxury but a necessity for effective multi-stakeholder audit engagements."))

# --- 4.2 Design Rationale ---
new_content.append(make_heading2("4.2 Design Rationale \u2014 Why We Built LuminFlow This Way"))
new_content.append(make_normal("Every design decision in LuminFlow is driven by a specific hypothesis about what creates value for both engagement teams and their clients. Below we articulate the key design choices and the reasoning behind them."))

new_content.append(make_bold_list("Three-Phase Architecture (Planning \u2192 Execution \u2192 Communication): We deliberately organized the platform around three distinct audit phases because each phase serves fundamentally different client needs. During Planning, clients need scope clarity and methodology understanding \u2014 hence TraceMap (objective linkage) and HeatLens (risk context). During Execution, they need progress visibility and pre-request transparency \u2014 hence SampleLens (sampling preview) and PBCView (request tracking). During Communication, they need audience-adapted synthesis \u2014 hence NarrativeLens (differentiated narratives) and ImpactSimulator (scenario analysis). A single-dashboard approach would conflate these distinct information needs, overwhelming clients with irrelevant detail while obscuring the specific context they need at each stage."))

new_content.append(make_bold_list("AI-Powered Sampling Preview (SampleLens): Rather than presenting sampling as a post-hoc, black-box decision, we designed SampleLens to expose the logic upfront \u2014 showing sample size ranges, document type predictions, and methodology explanations BEFORE selection occurs. The rationale is behavioral: clients who understand WHY certain samples are requested and HOW sample sizes are determined are far more likely to provide requested documents promptly and completely. This transforms sampling from a surprise demand into a collaborative, evidence-based conversation. The AI does not make sampling decisions; it accelerates the explanation and visualization of sampling methodology that engagement teams would otherwise communicate manually."))

new_content.append(make_bold_list("Impact Simulation (ImpactSimulator): Traditional audit communication is reactive \u2014 explaining impact after a delay or scope change has already occurred. We designed ImpactSimulator to enable proactive scenario analysis, allowing engagement teams to model the ripple effects of potential changes BEFORE they communicate with clients. The dependency graph visualization shows how a delay in one control test propagates to related objectives and risks. This shifts the client conversation from \u201chere is what went wrong\u201d to \u201chere is what we recommend, and here is why.\u201d The design principle: it is always better to present a problem with a solution than to report a problem in isolation."))

new_content.append(make_bold_list("Role-Based Visibility Control: We explicitly designed for information asymmetry \u2014 different stakeholders should see different views, not because information is being hidden, but because information relevance varies dramatically by role. The CFO\u2019s dashboard emphasizes financial impact, timelines, and resource implications. The internal audit director\u2019s view highlights control effectiveness, deficiency trends, and remediation status. The IT manager sees system dependencies, configuration impacts, and technical risk. This targeted approach reduces cognitive load and increases actionability for each stakeholder. The engagement team retains full control over what is visible to whom through the VisibilityPanel."))

new_content.append(make_bold_list("AI as Interpreter, Not Decision-Maker: Our AI pipelines are designed to interpret and translate \u2014 converting technical audit findings into plain-language narratives, generating sampling recommendations with fully explained methodology, and suggesting impact mitigation strategies with transparent reasoning. We deliberately avoid positioning AI as making autonomous audit decisions. The engagement team always retains professional judgment authority, with AI serving as an efficiency multiplier that accelerates analysis and communication. Every AI-generated output includes explainable methodology, allowing both the engagement team and the client to understand the basis for each recommendation or narrative."))

# --- 4.3 Business Value ---
new_content.append(make_heading2("4.3 Business Value \u2014 Why This Matters"))
new_content.append(make_normal("LuminFlow creates measurable value at three levels, each addressing a distinct stakeholder concern:"))

new_content.append(make_bold_list("Client Experience Transformation: LuminFlow transforms audit from a black-box process into a transparent, collaborative partnership. Clients gain real-time visibility into progress, understand the methodology behind sampling decisions, and receive communications tailored to their specific role and concerns. This reduces client anxiety, accelerates PBC submissions (because clients understand the urgency and context), and strengthens the trust relationship that is essential to long-term engagement retention. In an industry where audit quality is increasingly commoditized, client experience becomes the decisive competitive differentiator."))

new_content.append(make_bold_list("Engagement Team Efficiency: By automating narrative generation across three audience personas, impact simulation with mitigation strategy comparison, and sampling methodology explanation, LuminFlow dramatically reduces the time engagement teams spend on communication, coordination, and manual analysis. Teams can redirect their focus from formatting updates for different audiences to higher-value professional judgment, risk assessment, and client advisory work. The platform does not replace auditor expertise \u2014 it removes the friction that prevents auditors from applying their expertise where it matters most."))

new_content.append(make_bold_list("Firm Competitive Positioning: LuminFlow positions firms to demonstrate not just audit competence but audit transparency \u2014 a factor that directly influences client retention, fee negotiations, and referral pipelines. As clients become more sophisticated in their technology expectations (driven by their own digital transformation initiatives), firms that cannot provide modern, transparent engagement experiences risk being perceived as outdated, regardless of their technical audit quality. LuminFlow is designed to close this experience gap."))

# --- 4.4 Prototype Scope ---
new_content.append(make_heading2("4.4 Prototype Scope &amp; Validation"))
new_content.append(make_normal("This prototype demonstrates core concepts with intentionally bounded scope, designed to validate our key assumptions while remaining practical for evaluation:"))

new_content.append(make_bold_list("Representative Data: Synthetic data modeled on realistic bank lending ICFR audit patterns, including loan origination, credit risk assessment, and collateral valuation workflows. No client-identifiable information is used, enabling safe demonstration and evaluation."))
new_content.append(make_bold_list("Focused Audit Demonstration: Three audit objectives with full COSO 2013 control mapping across all five dimensions (Control Environment, Risk Assessment, Control Activities, Information & Communication, Monitoring). This scope proves the framework can scale modularly \u2014 additional objectives require only configuration, not architectural change."))
new_content.append(make_bold_list("Multi-Role Validation: Four stakeholder personas (Engagement Partner, CFO, Internal Audit Director, Finance Clerk) with distinct visibility controls and AI-tailored outputs, validating the core assumption that differentiated communication creates superior stakeholder experience."))
new_content.append(make_bold_list("Zero-Configuration Demonstration: All AI pipelines include comprehensive mock fallback data with professionally curated sample outputs. This enables complete platform demonstration without API key configuration or external service dependencies \u2014 designed for evaluator convenience and immediate value assessment."))

# Insert all new content after the heading
last_inserted = heading_nodes[-1] if isinstance(heading_nodes, list) else heading_nodes

for i, content_xml in enumerate(new_content):
    try:
        result = doc["word/document.xml"].add_after(last_inserted, content_xml)
        if isinstance(result, list):
            last_inserted = result[-1]
        else:
            last_inserted = result
    except Exception as e:
        print(f"ERROR inserting paragraph {i}: {e}")
        print(f"Content starts: {content_xml[:200]}")
        raise

print(f"Inserted {len(new_content)} new paragraphs")

# ============================================================
# STEP 5: ADJUST SECTION 2.2 - REPLACE TECHNICAL PIPELINE DESCRIPTIONS
# ============================================================

# Replace the intro paragraph for 2.2
pipeline_intro = doc["word/document.xml"].locate_element(
    tag="w:p", contains="YAML template loading")
pPr_xml = pipeline_intro.getElementsByTagName("w:pPr")[0].toxml() if pipeline_intro.getElementsByTagName("w:pPr") else '<w:pPr><w:spacing w:after="120"/></w:pPr>'
doc["word/document.xml"].swap_element(pipeline_intro,
    f'<w:p w14:paraId="NEWPIP01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{pPr_xml}<w:r><w:t>{esc("LuminFlow\u2019s AI capabilities are organized into four purpose-built engines, each addressing a distinct audit challenge. All engines use structured prompt templates with schema-validated outputs to ensure consistency and reliability. A graceful mock fallback system enables complete platform demonstrations without API key configuration.")}</w:t></w:r></w:p>')
print("Pipeline intro replaced")

# Replace Risk Analyzer
ra_node = doc["word/document.xml"].locate_element(tag="w:p", contains="Risk Analyzer")
ra_pPr = ra_node.getElementsByTagName("w:pPr")[0].toxml() if ra_node.getElementsByTagName("w:pPr") else '<w:pPr><w:pStyle w:val="a4"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="4"/></w:numPr></w:pPr>'
doc["word/document.xml"].swap_element(ra_node,
    f'<w:p w14:paraId="NEWRA001" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{ra_pPr}<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{esc("Risk Analyzer: ")}</w:t></w:r><w:r><w:t>{esc("Provides COSO-based risk assessment with residual risk scoring across all five framework dimensions. Designed to give both engagement teams and clients a shared, visual understanding of where risk concentrates \u2014 replacing opaque risk matrices with interactive, factor-level heatmaps. Rationale: clients cannot meaningfully engage with audit risk assessment unless they can see and explore it themselves.")}</w:t></w:r></w:p>')
print("Risk Analyzer replaced")

# Replace Sample Recommender
sr_node = doc["word/document.xml"].locate_element(tag="w:p", contains="Sample Recommender")
sr_pPr = sr_node.getElementsByTagName("w:pPr")[0].toxml() if sr_node.getElementsByTagName("w:pPr") else '<w:pPr><w:pStyle w:val="a4"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="4"/></w:numPr></w:pPr>'
doc["word/document.xml"].swap_element(sr_node,
    f'<w:p w14:paraId="NEWSR001" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{sr_pPr}<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{esc("Sample Recommender: ")}</w:t></w:r><w:r><w:t>{esc("Intelligently determines sample size ranges based on control frequency, operating characteristics, historical deficiencies, and risk scoring. The key innovation is exposing the recommendation logic BEFORE selection \u2014 clients see not just what samples are needed, but why those samples and how many. Rationale: sampling transparency is the single highest-impact intervention for reducing client-auditor friction during the execution phase.")}</w:t></w:r></w:p>')
print("Sample Recommender replaced")

# Replace Impact Simulator
is_node = doc["word/document.xml"].locate_element(tag="w:p", contains="Impact Simulator")
is_pPr = is_node.getElementsByTagName("w:pPr")[0].toxml() if is_node.getElementsByTagName("w:pPr") else '<w:pPr><w:pStyle w:val="a4"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="4"/></w:numPr></w:pPr>'
doc["word/document.xml"].swap_element(is_node,
    f'<w:p w14:paraId="NEWIS001" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{is_pPr}<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{esc("Impact Simulator: ")}</w:t></w:r><w:r><w:t>{esc("Models the cascading consequences of audit delays, scope changes, or control deficiencies across the COSO dependency graph. Visualizes how a delay in one area propagates to related objectives, risks, and controls \u2014 with before/after comparisons and mitigation strategy options. Rationale: clients tolerate delays better when they understand the systemic impact and see a clear mitigation path. Proactive simulation transforms delay notification from bad news into collaborative problem-solving.")}</w:t></w:r></w:p>')
print("Impact Simulator replaced")

# Replace Narrative Generator
ng_node = doc["word/document.xml"].locate_element(tag="w:p", contains="Narrative Generator")
ng_pPr = ng_node.getElementsByTagName("w:pPr")[0].toxml() if ng_node.getElementsByTagName("w:pPr") else '<w:pPr><w:pStyle w:val="a4"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="4"/></w:numPr></w:pPr>'
doc["word/document.xml"].swap_element(ng_node,
    f'<w:p w14:paraId="NEWNG001" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{ng_pPr}<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{esc("Narrative Generator: ")}</w:t></w:r><w:r><w:t>{esc("Produces audience-adapted communications from the same underlying audit data \u2014 financial impact narratives for CFOs, control effectiveness analysis for internal audit, and system dependency summaries for IT stakeholders. Rationale: the biggest communication failure in audit is not lack of information but lack of relevance. By adapting tone, detail level, and focus area for each audience, LuminFlow ensures every stakeholder receives information they can act on.")}</w:t></w:r></w:p>')
print("Narrative Generator replaced")

# ============================================================
# STEP 6: MINOR WORDING ADJUSTMENTS IN SECTIONS 1-3
# ============================================================

# 1.1 - Add emphasis on client expectation shift
challenge_intro = doc["word/document.xml"].locate_element(
    tag="w:p", contains="Clients increasingly expect")
cpPr = challenge_intro.getElementsByTagName("w:pPr")[0].toxml() if challenge_intro.getElementsByTagName("w:pPr") else '<w:pPr><w:spacing w:after="120"/></w:pPr>'
doc["word/document.xml"].swap_element(challenge_intro,
    f'<w:p w14:paraId="NEWCH01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{cpPr}<w:r><w:t>{esc("Clients increasingly expect clear, timely, and meaningful visibility into how audit requests, data submissions, and sampling activities are linked to audit objectives and outcomes. This expectation reflects a fundamental shift from passive compliance to active partnership. The current audit communication experience, however, remains fragmented:")}</w:t></w:r></w:p>')
print("Challenge intro updated")

# 1.2 - Solution description
sol_intro = doc["word/document.xml"].locate_element(
    tag="w:p", contains="LuminFlow is an intelligent audit transparency")
spPr = sol_intro.getElementsByTagName("w:pPr")[0].toxml() if sol_intro.getElementsByTagName("w:pPr") else '<w:pPr><w:spacing w:after="120"/></w:pPr>'
doc["word/document.xml"].swap_element(sol_intro,
    f'<w:p w14:paraId="NEWSOL01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{spPr}<w:r><w:t>{esc("LuminFlow is an intelligent audit transparency platform that addresses all six Challenge 2 priorities through an integrated, AI-enhanced experience designed for both engagement teams and their clients:")}</w:t></w:r></w:p>')
print("Solution intro updated")

# Update Integrated Visualization Framework description
ivf = doc["word/document.xml"].locate_element(
    tag="w:p", contains="Integrated Visualization Framework:")
ivf_pPr = ivf.getElementsByTagName("w:pPr")[0].toxml() if ivf.getElementsByTagName("w:pPr") else '<w:pPr><w:pStyle w:val="a4"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>'
doc["word/document.xml"].swap_element(ivf,
    f'<w:p w14:paraId="NEWIVF01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{ivf_pPr}<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{esc("Integrated Visualization Framework: ")}</w:t></w:r><w:r><w:t>{esc("Connects all audit dimensions \u2014 risk assessment, controls, substantive testing, and reporting \u2014 to specific audit objectives through interactive visualizations that both engagement teams and clients can explore. This creates a shared understanding of audit scope and progress, replacing static status reports with dynamic, drillable views.")}</w:t></w:r></w:p>')
print("IVF updated")

# Update Impact Analysis Engine
iae = doc["word/document.xml"].locate_element(
    tag="w:p", contains="Impact Analysis Engine:")
iae_pPr = iae.getElementsByTagName("w:pPr")[0].toxml() if iae.getElementsByTagName("w:pPr") else '<w:pPr><w:pStyle w:val="a4"/><w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr></w:pPr>'
doc["word/document.xml"].swap_element(iae,
    f'<w:p w14:paraId="NEWIAE01" w14:textId="77777777" w:rsidR="002359D6" w:rsidRDefault="00000000">{iae_pPr}<w:r><w:rPr><w:b/><w:bCs/></w:rPr><w:t xml:space="preserve">{esc("Impact Analysis Engine: ")}</w:t></w:r><w:r><w:t>{esc("ImpactSimulator quantifies the ripple effect of audit changes or delays across the connected COSO framework, providing AI-recommended next steps and mitigation strategies. This enables engagement teams to proactively address client concerns rather than reactively explaining problems after they escalate.")}</w:t></w:r></w:p>')
print("IAE updated")

# ============================================================
# STEP 7: SAVE
# ============================================================
doc.persist(validate=False)
print("\nDocument saved successfully!")
print("All modifications complete.")

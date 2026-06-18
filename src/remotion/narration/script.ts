/**
 * LuminFlow Demo V3 — English Narration Script
 *
 * Pacing target: ~150 WPM, ~440 words across 180 seconds.
 * Every segment maps 1-to-1 to a storyboard module and is later
 * broken into 2-5 second SRT cues in `LuminFlowDemoV3.srt`.
 */

export interface NarrationSegment {
  /** Stable identifier matching the storyboard timeline. */
  id: string;
  /** Inclusive start time in seconds on the master timeline. */
  startSeconds: number;
  /** Exclusive end time in seconds on the master timeline. */
  endSeconds: number;
  /** Full English narration text spoken during this segment. */
  text: string;
  /** Human-readable module label used by the on-screen scene. */
  module: string;
}

export const narrationScript: NarrationSegment[] = [
  {
    id: 'brand-intro',
    startSeconds: 0,
    endSeconds: 6,
    module: 'Brand Opening',
    text:
      'Welcome to LuminFlow. An AI-powered audit transparency platform ' +
      'built on the COSO 2013 framework.',
  },
  {
    id: 'dashboard',
    startSeconds: 6,
    endSeconds: 25,
    module: 'Dashboard',
    text:
      'The Dashboard delivers real-time visibility into audit progress and ' +
      'control coverage. Track PBC completion and aggregated risk scores ' +
      'across the engagement. Role-based views adapt instantly for Auditors, ' +
      'Partners, and CFOs. A live heatmap, audit stepper, and activity ' +
      'timeline keep every stakeholder aligned around current execution status.',
  },
  {
    id: 'tracemap-objectives',
    startSeconds: 25,
    endSeconds: 43,
    module: 'TraceMap / Objectives',
    text:
      'TraceMap visualizes the COSO 2013 three-level objective hierarchy as ' +
      'an interactive audit tree connecting objectives, risks, and controls. ' +
      'AI Insight decomposes strategic goals into testable, traceable ' +
      'controls, while a radar chart benchmarks coverage across multiple ' +
      'audit dimensions.',
  },
  {
    id: 'heatlens',
    startSeconds: 43,
    endSeconds: 58,
    module: 'HeatLens',
    text:
      'HeatLens unifies the full risk landscape with the Risk Control Matrix. ' +
      'Tune weights for inherent risk and control effectiveness in real time. ' +
      'Multi-factor scoring captures the true residual exposure that no ' +
      'single metric can.',
  },
  {
    id: 'samplelens',
    startSeconds: 58,
    endSeconds: 76,
    module: 'SampleLens',
    text:
      'SampleLens recommends optimal sample sizes through AI-driven analysis, ' +
      'supporting monetary unit and attribute sampling methodologies. Tune ' +
      'confidence, tolerable, and expected deviation rates with full ' +
      'transparency. Event-driven reinforcement automatically expands samples ' +
      'when control risk rises.',
  },
  {
    id: 'pbcview',
    startSeconds: 76,
    endSeconds: 93,
    module: 'PBCView',
    text:
      'PBCView centralizes Provided-By-Client document management end to end. ' +
      'AI auto-generates tailored PBC lists by industry and audit process. ' +
      'Overdue alerts and reminder emails accelerate every client response, ' +
      'while progress tracked by control area streamlines the auditor-client ' +
      'exchange.',
  },
  {
    id: 'narrativelens',
    startSeconds: 93,
    endSeconds: 110,
    module: 'NarrativeLens',
    text:
      'NarrativeLens turns raw findings into structured audit narratives via ' +
      'generative AI. Key points are extracted automatically and prepared ' +
      'for review. A three-step flow routes drafts through Submit, Manager ' +
      'Review, and Partner Sign-off, so human-AI collaboration safeguards ' +
      "every narrative's audit quality.",
  },
  {
    id: 'impact-simulator',
    startSeconds: 110,
    endSeconds: 128,
    module: 'ImpactSimulator',
    text:
      'ImpactSimulator models the outcome of any control deficiency. A ' +
      'force-directed graph traces how risk propagates through connected ' +
      'control nodes. Quantify potential financial loss and regulatory ' +
      'penalty exposure, while AI ranks remediation priority by projected ' +
      'business impact.',
  },
  {
    id: 'team-ai',
    startSeconds: 128,
    endSeconds: 148,
    module: 'TeamPanel + AI',
    text:
      'TeamPanel governs a multi-role permission matrix for the engagement. ' +
      'From Audit Manager to Client Liaison, visibility is scoped per module ' +
      'and dataset. The AI assistant answers natural-language audit queries ' +
      'instantly — analyze risks, generate sampling plans, or explain COSO ' +
      'principles on demand. API data integrations are managed from one ' +
      'unified console.',
  },
  {
    id: 'integration',
    startSeconds: 148,
    endSeconds: 162,
    module: 'Platform Integration',
    text:
      'Every module connects into one continuous, end-to-end workflow. Data ' +
      'flows across planning, execution, and assessment without friction. ' +
      'RESTful APIs open LuminFlow to ERP, GRC, and external audit systems.',
  },
  {
    id: 'closing',
    startSeconds: 162,
    endSeconds: 180,
    module: 'Closing',
    text:
      'From planning to sign-off, LuminFlow unifies every audit signal. ' +
      'Faster cycles, sharper insight, and defensible evidence at every step. ' +
      'Audit transparency, redefined. Step into LuminFlow and discover ' +
      'intelligent assurance in action.',
  },
];

/** Total runtime of the narration in seconds. */
export const narrationTotalSeconds: number =
  narrationScript[narrationScript.length - 1].endSeconds;

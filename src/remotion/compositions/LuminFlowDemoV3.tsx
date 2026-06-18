import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  interpolate,
  spring,
} from "remotion";

// Reused base components
import { KpiCard } from "../components/KpiCard";
import { ChatBubbleStack } from "../components/ChatBubble";
import { GlowBorder } from "../components/GlowBorder";
import { DataFlowDiagram } from "../components/DataFlowDiagram";
import { ProgressRing } from "../components/ProgressRing";

// V3 components
import { SectionTitle } from "../components/v3/SectionTitle";
import { HeatmapGrid } from "../components/v3/HeatmapGrid";
import { TableReveal } from "../components/v3/TableReveal";
import { ApprovalFlow } from "../components/v3/ApprovalFlow";
import { FeatureCallout } from "../components/v3/FeatureCallout";
import { NarrativeTyping } from "../components/v3/NarrativeTyping";
import { ForceGraphAnim } from "../components/v3/ForceGraphAnim";
import { RoleCard } from "../components/v3/RoleCard";

// Audio track (default disabled until narration mp3s land)
import { AudioTrack } from "../audio/AudioTrack";

/**
 * LuminFlowDemoV3 — full English platform demonstration video.
 *
 * Duration: 180s = 5400 frames @ 30fps, 1920x1080.
 *
 * Storyboard timeline:
 *   0-6s     Brand Opening
 *   6-25s    Audit Portal / Dashboard
 *   25-43s   TraceMap – Audit Objectives
 *   43-58s   HeatLens – Risk Heatmap
 *   58-76s   SampleLens – Smart Sampling
 *   76-93s   PBCView – Document Management
 *   93-110s  NarrativeLens – Narrative Generator
 *   110-128s ImpactSimulator – Risk Propagation
 *   128-148s TeamPanel + AI Assistant
 *   148-162s End-to-End Platform Integration
 *   162-180s Closing
 */
export const LuminFlowDemoV3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const sectionRanges: { id: string; start: number; end: number; theme: "blue" | "purple" | "amber" | "green" }[] = [
    { id: "dashboard", start: 6, end: 25, theme: "blue" },
    { id: "tracemap", start: 25, end: 43, theme: "blue" },
    { id: "heatlens", start: 43, end: 58, theme: "amber" },
    { id: "samplelens", start: 58, end: 76, theme: "purple" },
    { id: "pbcview", start: 76, end: 93, theme: "green" },
    { id: "narrative", start: 93, end: 110, theme: "blue" },
    { id: "impact", start: 110, end: 128, theme: "amber" },
    { id: "team", start: 128, end: 148, theme: "purple" },
    { id: "integration", start: 148, end: 162, theme: "blue" },
  ];

  const themeAccent: Record<string, string> = {
    blue: "#1E49E2",
    purple: "#a855f7",
    amber: "#f59e0b",
    green: "#22c55e",
  };

  return (
    <AbsoluteFill style={{ backgroundColor: "#060b1a" }}>
      {/* Ambient background dots */}
      <AmbientBg frame={frame} />

      {/* SECTION 0 — Brand Opening (0-6s) */}
      <Sequence from={0} durationInFrames={fps * 6}>
        <BrandOpening frame={frame} fps={fps} />
      </Sequence>

      {/* SECTION 1 — Dashboard (6-25s) */}
      <Sequence from={fps * 6} durationInFrames={fps * 19}>
        <DashboardSection startFrame={frame - fps * 6} fps={fps} />
      </Sequence>

      {/* SECTION 2 — TraceMap (25-43s) */}
      <Sequence from={fps * 25} durationInFrames={fps * 18}>
        <TraceMapSection startFrame={frame - fps * 25} fps={fps} />
      </Sequence>

      {/* SECTION 3 — HeatLens (43-58s) */}
      <Sequence from={fps * 43} durationInFrames={fps * 15}>
        <HeatLensSection startFrame={frame - fps * 43} fps={fps} />
      </Sequence>

      {/* SECTION 4 — SampleLens (58-76s) */}
      <Sequence from={fps * 58} durationInFrames={fps * 18}>
        <SampleLensSection startFrame={frame - fps * 58} fps={fps} />
      </Sequence>

      {/* SECTION 5 — PBCView (76-93s) */}
      <Sequence from={fps * 76} durationInFrames={fps * 17}>
        <PBCViewSection startFrame={frame - fps * 76} fps={fps} />
      </Sequence>

      {/* SECTION 6 — NarrativeLens (93-110s) */}
      <Sequence from={fps * 93} durationInFrames={fps * 17}>
        <NarrativeSection startFrame={frame - fps * 93} fps={fps} />
      </Sequence>

      {/* SECTION 7 — ImpactSimulator (110-128s) */}
      <Sequence from={fps * 110} durationInFrames={fps * 18}>
        <ImpactSection startFrame={frame - fps * 110} fps={fps} />
      </Sequence>

      {/* SECTION 8 — TeamPanel + AI (128-148s) */}
      <Sequence from={fps * 128} durationInFrames={fps * 20}>
        <TeamSection startFrame={frame - fps * 128} fps={fps} />
      </Sequence>

      {/* SECTION 9 — Platform Integration (148-162s) */}
      <Sequence from={fps * 148} durationInFrames={fps * 14}>
        <IntegrationSection startFrame={frame - fps * 148} fps={fps} />
      </Sequence>

      {/* SECTION 10 — Closing (162-180s) */}
      <Sequence from={fps * 162} durationInFrames={fps * 18}>
        <ClosingSection startFrame={frame - fps * 162} fps={fps} />
      </Sequence>

      {/* Bottom progress indicators (9 sections) */}
      <BottomProgress
        frame={frame}
        fps={fps}
        ranges={sectionRanges}
        themeAccent={themeAccent}
      />

      {/* Narration track (disabled by default) */}
      <AudioTrack enabled={true} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// AMBIENT BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════

const AmbientBg: React.FC<{ frame: number }> = ({ frame }) => {
  const dots = React.useMemo(
    () =>
      Array.from({ length: 42 }, (_, i) => ({
        x: (i * 137 + 50) % 1920,
        y: (i * 97 + 80) % 1080,
        size: 2 + (i % 3),
        phase: i * 0.7,
      })),
    []
  );
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
      {dots.map((dot, i) => {
        const alpha = 0.3 + 0.35 * Math.sin(frame * 0.02 + dot.phase);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: dot.x,
              top: dot.y,
              width: dot.size,
              height: dot.size,
              borderRadius: "50%",
              background: `rgba(96,165,250,${alpha})`,
              boxShadow: `0 0 6px rgba(96,165,250,${alpha * 0.6})`,
            }}
          />
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 0 — BRAND OPENING
// ═══════════════════════════════════════════════════════════════════════════════

const BrandOpening: React.FC<{ frame: number; fps: number }> = ({ frame }) => {
  const titleSpring = spring({
    frame,
    fps: 30,
    config: { damping: 15, stiffness: 80 },
    durationInFrames: 28,
  });
  const subtitleOpacity = interpolate(frame, [22, 45], [0, 1], {
    extrapolateRight: "clamp",
  });
  const taglineOpacity = interpolate(frame, [45, 68], [0, 1], {
    extrapolateRight: "clamp",
  });
  const lineWidth = interpolate(frame, [0, 36], [0, 240], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(titleSpring, [0, 1], [0.92, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #060b1a 0%, #0f1d3d 50%, #060b1a 100%)",
        fontFamily: '"Inter", "system-ui", sans-serif',
      }}
    >
      <div
        style={{
          width: lineWidth,
          height: 2,
          background:
            "linear-gradient(90deg, transparent, #60a5fa, transparent)",
          marginBottom: 44,
          borderRadius: 1,
          boxShadow: "0 0 16px rgba(96,165,250,0.6)",
        }}
      />
      <div
        style={{
          opacity: titleSpring,
          transform: `scale(${scale})`,
          fontSize: 96,
          fontWeight: 900,
          color: "#ffffff",
          letterSpacing: "-3px",
          lineHeight: 1,
        }}
      >
        Lumi<span style={{ color: "#60a5fa" }}>Flow</span>
      </div>
      <div
        style={{
          opacity: subtitleOpacity,
          marginTop: 28,
          fontSize: 30,
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          letterSpacing: "0.01em",
        }}
      >
        AI-Powered Audit Transparency Platform
      </div>
      <div
        style={{
          opacity: taglineOpacity,
          marginTop: 18,
          fontSize: 14,
          fontWeight: 500,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        Built on COSO 2013 Framework
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1 — DASHBOARD / AUDIT PORTAL
// ═══════════════════════════════════════════════════════════════════════════════

const DashboardSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const sectionOpacity = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 12,
  });

  const kpis: {
    label: string;
    value: number;
    unit: string;
    trend: "up" | "down" | "stable";
    status: "good" | "warning" | "danger";
  }[] = [
    { label: "Audit Progress", value: 78, unit: "%", trend: "up", status: "good" },
    { label: "Control Coverage", value: 92, unit: "%", trend: "stable", status: "good" },
    { label: "PBC Completion", value: 68, unit: "%", trend: "up", status: "warning" },
    { label: "Findings", value: 4, unit: "", trend: "stable", status: "warning" },
    { label: "Risk Score", value: 6.2, unit: "/10", trend: "down", status: "warning" },
    { label: "Samples Tested", value: 198, unit: "", trend: "up", status: "good" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sectionOpacity,
        padding: "60px 80px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 36,
      }}
    >
      <SectionTitle
        title="Audit Portal"
        subtitle="Real-time KPI monitoring with role-based intelligent views"
        icon="📊"
        startFrame={0}
        theme="blue"
      />

      <div style={{ display: "flex", gap: 36, alignItems: "stretch", flex: 1 }}>
        {/* Left: KPI grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            flex: 1.4,
          }}
        >
          {kpis.map((kpi, i) => (
            <KpiCard key={i} {...kpi} startFrame={20} index={i} />
          ))}
        </div>

        {/* Right: Progress rings */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GlowBorder>
            <div
              style={{
                padding: "30px 38px",
                display: "flex",
                gap: 36,
                alignItems: "center",
              }}
            >
              <ProgressRing
                progress={78}
                size={120}
                color="#3b82f6"
                label="Audit Progress"
                startFrame={28}
              />
              <ProgressRing
                progress={68}
                size={120}
                color="#f59e0b"
                label="PBC Complete"
                startFrame={36}
              />
              <ProgressRing
                progress={92}
                size={120}
                color="#22c55e"
                label="Control Coverage"
                startFrame={44}
              />
            </div>
          </GlowBorder>
        </div>
      </div>

      <FeatureCallout
        type="rationale"
        title="Why role-based dashboards"
        description="Role-based dashboards ensure each stakeholder sees only relevant metrics, reducing information overload."
        position={{ x: 110, y: 760 }}
        startFrame={150}
        side="right"
        maxWidth={420}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2 — TRACEMAP / OBJECTIVES
// ═══════════════════════════════════════════════════════════════════════════════

const TraceMapSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const sectionOpacity = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 12,
  });

  const nodes = [
    { id: "root", label: "Personal Loan Process Control Testing", x: 540, y: 50, status: "active" as const },
    { id: "ra1", label: "Credit Approval Control", x: 220, y: 170, status: "warning" as const },
    { id: "ra2", label: "Fund Usage Verification", x: 540, y: 170, status: "active" as const },
    { id: "ra3", label: "Post-Loan Monitoring", x: 860, y: 170, status: "active" as const },
    { id: "c1", label: "Credit Score ✓", x: 110, y: 300, status: "completed" as const },
    { id: "c2", label: "Income Proof ✗", x: 320, y: 300, status: "warning" as const },
    { id: "c3", label: "Usage Review ✓", x: 440, y: 300, status: "completed" as const },
    { id: "c4", label: "Fund Flow ✓", x: 640, y: 300, status: "completed" as const },
    { id: "c5", label: "Follow-up ✓", x: 760, y: 300, status: "completed" as const },
    { id: "c6", label: "Overdue Alert ✓", x: 970, y: 300, status: "completed" as const },
  ];

  const edges = [
    { from: "root", to: "ra1" },
    { from: "root", to: "ra2" },
    { from: "root", to: "ra3" },
    { from: "ra1", to: "c1" },
    { from: "ra1", to: "c2" },
    { from: "ra2", to: "c3" },
    { from: "ra2", to: "c4" },
    { from: "ra3", to: "c5" },
    { from: "ra3", to: "c6" },
  ];

  const cosoBadges = [
    "Control Environment",
    "Risk Assessment",
    "Control Activities",
    "Info & Communication",
    "Monitoring",
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sectionOpacity,
        padding: "60px 80px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <SectionTitle
        title="TraceMap – Audit Objectives"
        subtitle="COSO 2013 three-level hierarchy with AI-powered decomposition"
        icon="🎯"
        startFrame={0}
        theme="blue"
      />

      <GlowBorder>
        <div style={{ padding: 24 }}>
          <DataFlowDiagram
            nodes={nodes}
            edges={edges}
            width={1080}
            height={360}
            startFrame={20}
            nodeDelay={6}
          />
        </div>
      </GlowBorder>

      {/* COSO badges */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {cosoBadges.map((b, i) => {
          const opacity = interpolate(
            startFrame,
            [80 + i * 8, 96 + i * 8],
            [0, 1],
            { extrapolateRight: "clamp" }
          );
          const y = interpolate(
            startFrame,
            [80 + i * 8, 96 + i * 8],
            [10, 0],
            { extrapolateRight: "clamp" }
          );
          return (
            <span
              key={b}
              style={{
                opacity,
                transform: `translateY(${y}px)`,
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(30,73,226,0.14)",
                border: "1px solid rgba(30,73,226,0.45)",
                fontSize: 13,
                fontWeight: 600,
                color: "#93c5fd",
                letterSpacing: "0.04em",
                fontFamily: '"Inter", system-ui, sans-serif',
                boxShadow: "0 0 16px rgba(30,73,226,0.18)",
              }}
            >
              {b}
            </span>
          );
        })}
      </div>

      <FeatureCallout
        type="assumption"
        title="Hierarchical decomposition"
        description="Hierarchical decomposition ensures no control objective is missed during audit planning."
        position={{ x: 1380, y: 540 }}
        startFrame={180}
        side="left"
        maxWidth={380}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3 — HEATLENS / RISK HEATMAP
// ═══════════════════════════════════════════════════════════════════════════════

const HeatLensSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const sectionOpacity = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 12,
  });

  const rows = ["Revenue", "Procurement", "Payroll", "Fixed Assets", "Inventory"];
  const cols = [
    "Inherent Risk",
    "Control Design",
    "Operating Effect.",
    "Detection Risk",
    "Residual Risk",
  ];

  // Values 0..1 (rendered as 0-100)
  const rawData: Record<string, number[]> = {
    Revenue: [0.86, 0.62, 0.55, 0.48, 0.78],
    Procurement: [0.72, 0.55, 0.42, 0.5, 0.68],
    Payroll: [0.34, 0.28, 0.22, 0.3, 0.31],
    "Fixed Assets": [0.58, 0.46, 0.51, 0.42, 0.55],
    Inventory: [0.82, 0.71, 0.66, 0.6, 0.85],
  };

  const data: { row: string; col: string; value: number }[] = [];
  rows.forEach((r) => {
    cols.forEach((c, ci) => {
      data.push({ row: r, col: c, value: rawData[r][ci] });
    });
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sectionOpacity,
        padding: "60px 80px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <SectionTitle
        title="HeatLens – Risk Heatmap"
        subtitle="Multi-factor weighted risk scoring with interactive analysis"
        icon="🔥"
        startFrame={0}
        theme="amber"
      />

      <div style={{ display: "flex", gap: 36, alignItems: "flex-start" }}>
        <GlowBorder color="#f59e0b">
          <div style={{ padding: 28 }}>
            <HeatmapGrid
              data={data}
              rows={rows}
              cols={cols}
              startFrame={24}
              cellSize={80}
              highlightThreshold={0.75}
            />
          </div>
        </GlowBorder>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            paddingTop: 32,
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "#fbbf24",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            Risk Legend
          </div>
          {[
            { c: "#22c55e", label: "Low (0–40)" },
            { c: "#f59e0b", label: "Moderate (40–70)" },
            { c: "#D32F2F", label: "High (70–100)" },
          ].map((l, i) => {
            const opacity = interpolate(
              startFrame,
              [80 + i * 10, 96 + i * 10],
              [0, 1],
              { extrapolateRight: "clamp" }
            );
            return (
              <div
                key={l.label}
                style={{
                  opacity,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  fontSize: 14,
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    background: l.c,
                    boxShadow: `0 0 10px ${l.c}88`,
                  }}
                />
                {l.label}
              </div>
            );
          })}

          <div
            style={{
              marginTop: 24,
              padding: "16px 20px",
              borderRadius: 12,
              background: "rgba(245,158,11,0.08)",
              border: "1px solid rgba(245,158,11,0.32)",
              opacity: interpolate(startFrame, [120, 145], [0, 1], {
                extrapolateRight: "clamp",
              }),
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#fbbf24",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Top Residual Exposure
            </div>
            <div style={{ fontSize: 15, color: "#ffffff", fontWeight: 600 }}>
              Inventory · Revenue
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.6)",
                marginTop: 4,
              }}
            >
              Recommend prioritized substantive testing.
            </div>
          </div>
        </div>
      </div>

      <FeatureCallout
        type="assumption"
        title="Why multi-factor scoring"
        description="Multi-factor scoring captures true residual exposure that no single metric can reveal."
        position={{ x: 720, y: 880 }}
        startFrame={220}
        side="right"
        maxWidth={460}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4 — SAMPLELENS / SMART SAMPLING
// ═══════════════════════════════════════════════════════════════════════════════

const SampleLensSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const sectionOpacity = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 12,
  });

  const aiCardOpacity = interpolate(startFrame, [120, 150], [0, 1], {
    extrapolateRight: "clamp",
  });
  const aiCardScale = spring({
    frame: Math.max(0, startFrame - 120),
    fps: 30,
    config: { damping: 12, stiffness: 140 },
    durationInFrames: 22,
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sectionOpacity,
        padding: "60px 80px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <SectionTitle
        title="SampleLens – Smart Sampling"
        subtitle="AI-driven sample recommendation with statistical rigor"
        icon="🎲"
        startFrame={0}
        theme="purple"
      />

      <div style={{ display: "flex", gap: 36, alignItems: "stretch" }}>
        {/* Left: parameters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            flex: 1,
          }}
        >
          <KpiCard
            label="Confidence Level"
            value={95}
            unit="%"
            trend="stable"
            status="good"
            startFrame={20}
            index={0}
          />
          <KpiCard
            label="Tolerable Deviation"
            value={5}
            unit="%"
            trend="stable"
            status="warning"
            startFrame={20}
            index={1}
          />
          <KpiCard
            label="Expected Deviation"
            value={2}
            unit="%"
            trend="down"
            status="good"
            startFrame={20}
            index={2}
          />
          <KpiCard
            label="Population Size"
            value={1250}
            unit=""
            trend="stable"
            status="good"
            startFrame={20}
            index={3}
          />
        </div>

        {/* Right: AI recommendation */}
        <div style={{ flex: 1 }}>
          <GlowBorder color="#a855f7">
            <div
              style={{
                opacity: aiCardOpacity,
                transform: `scale(${aiCardScale})`,
                padding: "40px 36px",
                textAlign: "center",
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#c4b5fd",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: 18,
                }}
              >
                🤖 AI Recommendation
              </div>
              <div
                style={{
                  fontSize: 76,
                  fontWeight: 900,
                  color: "#ffffff",
                  lineHeight: 1,
                  letterSpacing: "-2px",
                }}
              >
                57
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 16,
                  color: "rgba(255,255,255,0.62)",
                  marginBottom: 24,
                }}
              >
                Recommended Sample Size
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Method", value: "MUS" },
                  { label: "Sampling Risk", value: "5%" },
                  { label: "Confidence Interval", value: "±2.3%" },
                ].map((it, i) => {
                  const op = interpolate(
                    startFrame,
                    [150 + i * 10, 168 + i * 10],
                    [0, 1],
                    { extrapolateRight: "clamp" }
                  );
                  return (
                    <div
                      key={it.label}
                      style={{
                        opacity: op,
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 14,
                        color: "rgba(255,255,255,0.6)",
                        padding: "6px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span>{it.label}</span>
                      <span style={{ color: "#c4b5fd", fontWeight: 700 }}>
                        {it.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlowBorder>
        </div>
      </div>

      <FeatureCallout
        type="rationale"
        title="Defensible audit conclusions"
        description="Statistical sampling ensures audit conclusions are defensible with quantified confidence levels."
        position={{ x: 110, y: 880 }}
        startFrame={210}
        side="right"
        maxWidth={460}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5 — PBCVIEW / DOCUMENT MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

const PBCViewSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const sectionOpacity = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 12,
  });

  const headers = ["#", "Document", "Control Area", "Status", "Due Date"];
  const rows: string[][] = [
    ["01", "Trial Balance FY24", "Financial Reporting", "✓ Submitted", "Mar 12"],
    ["02", "Bank Reconciliations", "Cash & Treasury", "✓ Submitted", "Mar 14"],
    ["03", "AR Aging Report", "Revenue", "⏳ Pending", "Mar 18"],
    ["04", "Fixed Asset Register", "Asset Mgmt", "⏳ Pending", "Mar 20"],
    ["05", "Inventory Count Sheets", "Inventory", "⚠ Overdue", "Mar 09"],
    ["06", "Payroll Journal Q1", "Payroll", "✓ Submitted", "Mar 11"],
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sectionOpacity,
        padding: "60px 80px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 32,
      }}
    >
      <SectionTitle
        title="PBCView – Document Management"
        subtitle="AI-powered PBC list generation and tracking"
        icon="📑"
        startFrame={0}
        theme="green"
      />

      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        <div style={{ flex: 1.6 }}>
          <TableReveal
            headers={headers}
            rows={rows}
            startFrame={22}
            rowDelay={8}
            columnWidths={[70, 280, 220, 200, 160]}
            highlightColumns={[3]}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          {[
            { label: "Total Items", value: "32", color: "#22c55e" },
            { label: "Submitted", value: "21", color: "#22c55e" },
            { label: "Pending", value: "8", color: "#f59e0b" },
            { label: "Overdue", value: "3", color: "#D32F2F" },
          ].map((stat, i) => {
            const op = interpolate(
              startFrame,
              [60 + i * 12, 78 + i * 12],
              [0, 1],
              { extrapolateRight: "clamp" }
            );
            const y = interpolate(
              startFrame,
              [60 + i * 12, 78 + i * 12],
              [12, 0],
              { extrapolateRight: "clamp" }
            );
            return (
              <div
                key={stat.label}
                style={{
                  opacity: op,
                  transform: `translateY(${y}px)`,
                  padding: "16px 20px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${stat.color}40`,
                  borderLeft: `3px solid ${stat.color}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {stat.label}
                </span>
                <span
                  style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: stat.color,
                  }}
                >
                  {stat.value}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <FeatureCallout
        type="feature"
        title="Auto-generation & reminders"
        description="Auto-generates PBC requirements based on industry and process selection, drafts reminder emails for overdue items."
        position={{ x: 110, y: 880 }}
        startFrame={170}
        side="right"
        maxWidth={520}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6 — NARRATIVELENS / NARRATIVE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

const NarrativeSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const sectionOpacity = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 12,
  });

  const narrative =
    "Based on our testing of 57 samples across the revenue\n" +
    "recognition process, we identified 3 control deficiencies\n" +
    "with quantified deviation rates of 5.3%, 8.1% and 2.4%.\n" +
    "Recommend management remediation by next quarter end.";

  const steps: { label: string; status: "completed" | "active" | "pending" }[] = [
    { label: "Draft Submitted", status: "completed" },
    { label: "Manager Review", status: "active" },
    { label: "Partner Sign-off", status: "pending" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sectionOpacity,
        padding: "60px 80px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 28,
      }}
    >
      <SectionTitle
        title="NarrativeLens – Narrative Generator"
        subtitle="AI-powered audit narrative with structured approval workflow"
        icon="✍️"
        startFrame={0}
        theme="blue"
      />

      {/* Narrative + workflow */}
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        <div style={{ flex: 1.4 }}>
          <GlowBorder>
            <div
              style={{
                padding: "30px 36px",
                minHeight: 240,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#60a5fa",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  marginBottom: 14,
                }}
              >
                ▍ AI Generated Audit Narrative
              </div>
              <NarrativeTyping
                text={narrative}
                startFrame={28}
                charsPerFrame={1.4}
                cursorColor="#60a5fa"
                fontSize={20}
                maxWidth={760}
              />
            </div>
          </GlowBorder>
        </div>

        <div
          style={{
            flex: 1,
            padding: "24px 12px",
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 26,
              textAlign: "center",
            }}
          >
            Approval Workflow
          </div>
          <ApprovalFlow steps={steps} startFrame={140} stepDelay={22} />
        </div>
      </div>

      <FeatureCallout
        type="rationale"
        title="Human-AI collaboration"
        description="Human-AI collaboration ensures narrative quality while maintaining audit professional judgment."
        position={{ x: 720, y: 870 }}
        startFrame={260}
        side="right"
        maxWidth={500}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7 — IMPACTSIMULATOR / RISK PROPAGATION
// ═══════════════════════════════════════════════════════════════════════════════

const ImpactSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const sectionOpacity = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 12,
  });

  const nodes = [
    { id: "defect", label: "Control Defect", group: "risk", size: 30 },
    { id: "fin", label: "Financial", group: "control", size: 24 },
    { id: "comp", label: "Compliance", group: "control", size: 24 },
    { id: "ops", label: "Operations", group: "control", size: 20 },
    { id: "loss", label: "¥2.3M Loss", group: "risk", size: 20 },
    { id: "penalty", label: "Regulatory", group: "risk", size: 20 },
    { id: "mitigate", label: "Remediation", group: "output", size: 24 },
  ];

  const links = [
    { source: "defect", target: "fin", strength: 0.9 },
    { source: "defect", target: "comp", strength: 0.85 },
    { source: "defect", target: "ops", strength: 0.7 },
    { source: "fin", target: "loss", strength: 0.8 },
    { source: "comp", target: "penalty", strength: 0.78 },
    { source: "loss", target: "mitigate", strength: 0.6 },
    { source: "penalty", target: "mitigate", strength: 0.6 },
  ];

  const metrics = [
    { label: "Impact Scope", value: "3 Domains", color: "#f59e0b" },
    { label: "Risk Level", value: "High", color: "#D32F2F" },
    { label: "Financial Exposure", value: "¥2.3M", color: "#f59e0b" },
    { label: "Required Samples", value: "57", color: "#60a5fa" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sectionOpacity,
        padding: "60px 80px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <SectionTitle
        title="ImpactSimulator – Risk Propagation"
        subtitle="Quantified impact analysis with AI-driven remediation priorities"
        icon="⚡"
        startFrame={0}
        theme="amber"
      />

      <GlowBorder color="#f59e0b">
        <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
          <ForceGraphAnim
            nodes={nodes}
            links={links}
            startFrame={20}
            width={1100}
            height={420}
            nodeDelay={6}
          />
        </div>
      </GlowBorder>

      {/* Metrics row */}
      <div style={{ display: "flex", gap: 16 }}>
        {metrics.map((m, i) => {
          const op = interpolate(
            startFrame,
            [180 + i * 12, 200 + i * 12],
            [0, 1],
            { extrapolateRight: "clamp" }
          );
          const y = interpolate(
            startFrame,
            [180 + i * 12, 200 + i * 12],
            [14, 0],
            { extrapolateRight: "clamp" }
          );
          return (
            <div
              key={m.label}
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                flex: 1,
                padding: "18px 22px",
                borderRadius: 12,
                background: "rgba(245,158,11,0.06)",
                border: `1px solid ${m.color}40`,
                borderTop: `2px solid ${m.color}`,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.55)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  marginBottom: 6,
                }}
              >
                {m.label}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: m.color,
                }}
              >
                {m.value}
              </div>
            </div>
          );
        })}
      </div>

      <FeatureCallout
        type="assumption"
        title="Why risk propagates"
        description="Risk propagates through connected control nodes — a single deficiency can cascade across multiple domains."
        position={{ x: 120, y: 880 }}
        startFrame={260}
        side="right"
        maxWidth={520}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8 — TEAMPANEL + AI ASSISTANT
// ═══════════════════════════════════════════════════════════════════════════════

const TeamSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const sectionOpacity = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 12,
  });

  const roles = [
    {
      role: "Audit Manager",
      permissions: ["Full Access", "Approve", "Configure"],
      color: "#3b82f6",
      avatar: "M",
    },
    {
      role: "Senior Auditor",
      permissions: ["Test", "Review", "Report"],
      color: "#22c55e",
      avatar: "S",
    },
    {
      role: "Auditor",
      permissions: ["Execute Tests", "Document"],
      color: "#f59e0b",
      avatar: "A",
    },
    {
      role: "Client Liaison",
      permissions: ["Submit PBC", "View Reports"],
      color: "#a855f7",
      avatar: "C",
    },
  ];

  const chat: { role: "user" | "assistant"; text: string }[] = [
    {
      role: "user",
      text: "Analyze the impact of income verification deficiency.",
    },
    {
      role: "assistant",
      text:
        "Analysis complete. The control covers credit approval risk domain with 20% deviation rate. Impact spans loan amount determination and credit inquiry authorization. Recommend prioritizing these 5 samples for credit score review.",
    },
    { role: "user", text: "Generate a deficiency impact report." },
    {
      role: "assistant",
      text:
        "✅ Report generated. Includes: deficiency description, quantified impact analysis, related node network, and prioritized remediation steps. Export as DOCX?",
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sectionOpacity,
        padding: "60px 80px 100px",
        display: "flex",
        flexDirection: "column",
        gap: 26,
      }}
    >
      <SectionTitle
        title="TeamPanel & AI Assistant"
        subtitle="Multi-role collaboration with intelligent audit copilot"
        icon="👥"
        startFrame={0}
        theme="purple"
      />

      {/* Role cards row */}
      <div style={{ display: "flex", gap: 16 }}>
        {roles.map((r, i) => (
          <div key={r.role} style={{ flex: 1 }}>
            <RoleCard
              role={r.role}
              permissions={r.permissions}
              color={r.color}
              avatar={r.avatar}
              startFrame={20}
              index={i}
            />
          </div>
        ))}
      </div>

      {/* AI chat */}
      <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
        <div style={{ flex: 1.6 }}>
          <GlowBorder color="#a855f7">
            <div style={{ padding: "8px 0" }}>
              <ChatBubbleStack
                messages={chat}
                startFrame={120}
                messageDelay={50}
              />
            </div>
          </GlowBorder>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontFamily: '"Inter", system-ui, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Suggested Prompts
          </div>
          {[
            "Summarize today's audit risk hotspots",
            "Generate sampling plan for Procurement",
            "Explain COSO control activities",
            "Draft management response template",
          ].map((p, i) => {
            const op = interpolate(
              startFrame,
              [180 + i * 14, 200 + i * 14],
              [0, 1],
              { extrapolateRight: "clamp" }
            );
            return (
              <div
                key={p}
                style={{
                  opacity: op,
                  padding: "12px 16px",
                  borderRadius: 10,
                  background: "rgba(168,85,247,0.08)",
                  border: "1px solid rgba(168,85,247,0.32)",
                  fontSize: 13,
                  color: "#c4b5fd",
                  fontWeight: 500,
                }}
              >
                ↗ {p}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 9 — PLATFORM INTEGRATION
// ═══════════════════════════════════════════════════════════════════════════════

const IntegrationSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const sectionOpacity = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 20, stiffness: 100 },
    durationInFrames: 12,
  });

  const modules = [
    { icon: "📊", name: "Dashboard" },
    { icon: "🎯", name: "TraceMap" },
    { icon: "🔥", name: "HeatLens" },
    { icon: "🎲", name: "SampleLens" },
    { icon: "📑", name: "PBCView" },
    { icon: "✍️", name: "NarrativeLens" },
    { icon: "⚡", name: "ImpactSimulator" },
    { icon: "👥", name: "TeamPanel" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: sectionOpacity,
        padding: "60px 80px 100px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
      }}
    >
      <SectionTitle
        title="End-to-End Platform Integration"
        subtitle="Seamless data flow across planning, execution, and assessment phases"
        icon="🔗"
        startFrame={0}
        theme="blue"
      />

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          maxWidth: 1500,
          fontFamily: '"Inter", system-ui, sans-serif',
        }}
      >
        {modules.map((m, i) => {
          const sp = spring({
            frame: Math.max(0, startFrame - 20 - i * 10),
            fps: 30,
            config: { damping: 16, stiffness: 130 },
            durationInFrames: 16,
          });
          const arrowOp = interpolate(
            startFrame,
            [30 + i * 10, 46 + i * 10],
            [0, 1],
            { extrapolateRight: "clamp" }
          );
          return (
            <React.Fragment key={m.name}>
              <div
                style={{
                  opacity: sp,
                  transform: `translateY(${interpolate(sp, [0, 1], [16, 0])}px) scale(${0.85 + 0.15 * sp})`,
                  padding: "20px 24px",
                  borderRadius: 16,
                  background: "rgba(30,73,226,0.10)",
                  border: "1px solid rgba(30,73,226,0.45)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  minWidth: 140,
                  boxShadow: "0 8px 22px rgba(0,0,0,0.4), 0 0 18px rgba(30,73,226,0.18)",
                }}
              >
                <span style={{ fontSize: 30 }}>{m.icon}</span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#ffffff",
                  }}
                >
                  {m.name}
                </span>
              </div>
              {i < modules.length - 1 ? (
                <div
                  style={{
                    opacity: arrowOp,
                    fontSize: 22,
                    color: "#60a5fa",
                    fontWeight: 700,
                    letterSpacing: "-2px",
                  }}
                >
                  →
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>

      <div
        style={{
          opacity: interpolate(startFrame, [200, 240], [0, 1], {
            extrapolateRight: "clamp",
          }),
          fontSize: 16,
          fontWeight: 500,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: "0.04em",
          fontFamily: '"Inter", system-ui, sans-serif',
        }}
      >
        RESTful API integration · Real-time data synchronization · Export to DOCX/PDF
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 10 — CLOSING
// ═══════════════════════════════════════════════════════════════════════════════

const ClosingSection: React.FC<{ startFrame: number; fps: number }> = ({
  startFrame,
}) => {
  const opacity = interpolate(startFrame, [0, 30], [0, 1], {
    extrapolateRight: "clamp",
  });
  const titleSpring = spring({
    frame: startFrame,
    fps: 30,
    config: { damping: 16, stiffness: 90 },
    durationInFrames: 26,
  });
  const subtitleOp = interpolate(startFrame, [40, 70], [0, 1], {
    extrapolateRight: "clamp",
  });
  const statsOp = interpolate(startFrame, [80, 110], [0, 1], {
    extrapolateRight: "clamp",
  });
  const urlOp = interpolate(startFrame, [120, 150], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(titleSpring, [0, 1], [0.9, 1]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        background:
          "linear-gradient(135deg, #060b1a 0%, #0f1d3d 50%, #060b1a 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      <div
        style={{
          opacity: titleSpring,
          transform: `scale(${scale})`,
          fontSize: 100,
          fontWeight: 900,
          color: "#ffffff",
          letterSpacing: "-3px",
          lineHeight: 1,
        }}
      >
        Lumi<span style={{ color: "#60a5fa" }}>Flow</span>
      </div>
      <div
        style={{
          opacity: subtitleOp,
          marginTop: 24,
          fontSize: 32,
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
        }}
      >
        Audit Transparency, Redefined.
      </div>
      <div
        style={{
          opacity: statsOp,
          marginTop: 38,
          fontSize: 14,
          fontWeight: 500,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: "3px",
          textTransform: "uppercase",
        }}
      >
        9 Modules · AI-Powered · COSO 2013 · Multi-Role
      </div>
      <div
        style={{
          opacity: urlOp,
          marginTop: 60,
          fontSize: 13,
          fontWeight: 500,
          color: "rgba(255,255,255,0.32)",
          letterSpacing: "0.12em",
        }}
      >
        luminflow.dev
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// BOTTOM PROGRESS INDICATORS
// ═══════════════════════════════════════════════════════════════════════════════

const BottomProgress: React.FC<{
  frame: number;
  fps: number;
  ranges: { id: string; start: number; end: number; theme: string }[];
  themeAccent: Record<string, string>;
}> = ({ frame, fps, ranges, themeAccent }) => {
  const sectionWidth = 64;
  const gap = 12;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap,
        zIndex: 100,
        fontFamily: '"Inter", system-ui, sans-serif',
      }}
    >
      {ranges.map((r) => {
        const startFrame = r.start * fps;
        const endFrame = r.end * fps;
        const progress = interpolate(
          frame,
          [startFrame, endFrame],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        const accent = themeAccent[r.theme] ?? "#3b82f6";
        const isActive = frame >= startFrame && frame < endFrame;
        return (
          <div
            key={r.id}
            style={{
              width: sectionWidth,
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.10)",
              overflow: "hidden",
              boxShadow: isActive ? `0 0 10px ${accent}66` : "none",
            }}
          >
            <div
              style={{
                width: `${progress * 100}%`,
                height: "100%",
                background: accent,
                borderRadius: 2,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

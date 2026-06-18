import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  interpolate,
  staticFile,
} from "remotion";
import { ScreenSlide } from "../components/ScreenSlide";
import { TitleOverlay } from "../components/TitleOverlay";

/**
 * Full LuminFlow platform demo video (~60 seconds).
 *
 * Structure:
 *   0-4s   : Brand intro title card
 *   4-14s  : Dashboard overview
 *   14-24s : Audit Objective setting
 *   24-34s : Intelligent Sampling configuration
 *   34-44s : Impact Analysis results
 *   44-54s : AI Assistant & Team Management
 *   54-60s : Closing brand card
 */
export const LuminFlowDemo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Closing card fade-in
  const closingOpacity = interpolate(frame, [fps * 54, fps * 57], [0, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0e27" }}>
      {/* ── Segment 0: Brand Intro (0-4s) ── */}
      <Sequence from={0} durationInFrames={fps * 4}>
        <TitleOverlay
          title="LuminFlow"
          subtitle="智能审计 · 透明协作"
          theme="blue"
        />
      </Sequence>

      {/* ── Segment 1: Dashboard (4-14s) ── */}
      <Sequence from={fps * 4} durationInFrames={fps * 10}>
        <ScreenSlide
          src={staticFile("screenshots/luminflow-dashboard-zh.png")}
          title="审计工作台"
          subtitle="一站式仪表盘，实时掌握审计进度、风险概览与团队动态"
          startFrame={0}
        />
      </Sequence>

      {/* ── Segment 2: Audit Objective (14-24s) ── */}
      <Sequence from={fps * 14} durationInFrames={fps * 10}>
        <ScreenSlide
          src={staticFile("screenshots/luminflow-objective-zh.png")}
          title="审计目标设定"
          subtitle="基于COSO 2013框架，灵活定义审计范围、周期与关键控制点"
          startFrame={0}
        />
      </Sequence>

      {/* ── Segment 3: Sampling Config (24-34s) ── */}
      <Sequence from={fps * 24} durationInFrames={fps * 10}>
        <ScreenSlide
          src={staticFile("screenshots/luminflow-sampling-zh.png")}
          title="智能抽样配置"
          subtitle="AI驱动的样本推荐引擎，自动计算统计抽样与属性抽样方案"
          startFrame={0}
        />
      </Sequence>

      {/* ── Segment 4: Impact Analysis (34-44s) ── */}
      <Sequence from={fps * 34} durationInFrames={fps * 10}>
        <ScreenSlide
          src={staticFile("screenshots/luminflow-impact-result-zh.png")}
          title="影响分析引擎"
          subtitle="实时模拟控制缺陷影响范围，量化财务与合规风险敞口"
          startFrame={0}
        />
      </Sequence>

      {/* ── Segment 5: AI Assistant & Team (44-54s) ── */}
      <Sequence from={fps * 44} durationInFrames={fps * 10}>
        <ScreenSlide
          src={staticFile("screenshots/luminflow-ai-drawer-zh.png")}
          title="AI 审计助手 & 团队协作"
          subtitle="自然语言交互式审计问答，多角色权限管理与实时协作"
          startFrame={0}
        />
      </Sequence>

      {/* ── Segment 6: Closing (54-60s) ── */}
      <Sequence from={fps * 54} durationInFrames={fps * 6}>
        <ClosingCard opacity={closingOpacity} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ── Sub-components ──────────────────────────────────────────────────────────

const ClosingCard: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
        opacity,
      }}
    >
      <div
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "#60a5fa",
          fontFamily: "system-ui, -apple-system, sans-serif",
          letterSpacing: "-2px",
        }}
      >
        LuminFlow
      </div>
      <div
        style={{
          marginTop: 16,
          fontSize: 24,
          fontWeight: 400,
          color: "rgba(255,255,255,0.7)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        Audit Transparency, Redefined.
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 16,
          color: "rgba(255,255,255,0.4)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        luminflow.dev
      </div>
    </div>
  );
};

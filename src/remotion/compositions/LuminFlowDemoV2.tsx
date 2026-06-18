import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  interpolate,
  spring,
  staticFile,
  Img,
} from "remotion";
import { ScreenSlide } from "../components/ScreenSlide";
import { TitleOverlay } from "../components/TitleOverlay";
import { KpiCard } from "../components/KpiCard";
import { ProgressRing } from "../components/ProgressRing";
import { ChatBubbleStack } from "../components/ChatBubble";
import { DataFlowDiagram } from "../components/DataFlowDiagram";
import { GlowBorder } from "../components/GlowBorder";

/**
 * LuminFlow 全功能演示视频 v2
 * 总时长: 3分钟 (180s = 5400帧 @30fps)
 *
 * 分镜:
 *   0-5s    品牌开场
 *   5-30s   仪表盘 Dashboard
 *   30-55s  审计目标 Objectives
 *   55-80s  智能抽样 Sampling
 *   80-105s 影响分析 Impact Analysis
 *   105-130s AI助手 AI Assistant
 *   130-155s 团队协作 Team
 *   155-170s 平台集成 Integration
 *   170-180s 收尾 Closing
 */
export const LuminFlowDemoV2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Closing card fade-in
  const closingOpacity = interpolate(frame, [fps * 170, fps * 174], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Section divider indicators
  const totalSections = 7;
  const sectionWidth = 60;
  const gap = 12;
  const totalWidth = totalSections * sectionWidth + (totalSections - 1) * gap;

  return (
    <AbsoluteFill style={{ backgroundColor: "#060b1a" }}>
      {/* ── Background ambient particles effect ── */}
      <AmbientBg frame={frame} />

      {/* ── SECTION 0: Brand Intro (0-5s) ── */}
      <Sequence from={0} durationInFrames={fps * 5}>
        <BrandIntro frame={frame} fps={fps} />
      </Sequence>

      {/* ── SECTION 1: Dashboard (5-30s) ── */}
      <Sequence from={fps * 5} durationInFrames={fps * 25}>
        <DashboardSection startFrame={frame - fps * 5} fps={fps} />
      </Sequence>

      {/* ── SECTION 2: Audit Objectives (30-55s) ── */}
      <Sequence from={fps * 30} durationInFrames={fps * 25}>
        <ObjectivesSection startFrame={frame - fps * 30} fps={fps} />
      </Sequence>

      {/* ── SECTION 3: Sampling (55-80s) ── */}
      <Sequence from={fps * 55} durationInFrames={fps * 25}>
        <SamplingSection startFrame={frame - fps * 55} fps={fps} />
      </Sequence>

      {/* ── SECTION 4: Impact Analysis (80-105s) ── */}
      <Sequence from={fps * 80} durationInFrames={fps * 25}>
        <ImpactSection startFrame={frame - fps * 80} fps={fps} />
      </Sequence>

      {/* ── SECTION 5: AI Assistant (105-130s) ── */}
      <Sequence from={fps * 105} durationInFrames={fps * 25}>
        <AISection startFrame={frame - fps * 105} fps={fps} />
      </Sequence>

      {/* ── SECTION 6: Team (130-155s) ── */}
      <Sequence from={fps * 130} durationInFrames={fps * 25}>
        <TeamSection startFrame={frame - fps * 130} fps={fps} />
      </Sequence>

      {/* ── SECTION 7: Integration Preview (155-170s) ── */}
      <Sequence from={fps * 155} durationInFrames={fps * 15}>
        <IntegrationSection startFrame={frame - fps * 155} fps={fps} />
      </Sequence>

      {/* ── SECTION 8: Closing (170-180s) ── */}
      <Sequence from={fps * 170} durationInFrames={fps * 10}>
        <ClosingCard opacity={closingOpacity} />
      </Sequence>

      {/* ── Progress bar at bottom ── */}
      <div
        style={{
          position: "absolute",
          bottom: 16,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap,
          zIndex: 100,
        }}
      >
        {Array.from({ length: totalSections }).map((_, i) => {
          const sectionStart = i * fps * 25 + (i >= 7 ? fps * 5 : 0);
          const sectionEnd = sectionStart + fps * 25;
          const progress = interpolate(
            frame,
            [sectionStart, sectionStart + fps * 5],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          return (
            <div
              key={i}
              style={{
                width: sectionWidth,
                height: 3,
                borderRadius: 2,
                background: "rgba(255,255,255,0.1)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress * 100}%`,
                  height: "100%",
                  background: i === 7 ? "#f59e0b" : "#3b82f6",
                  borderRadius: 2,
                  transition: "width 0.05s linear",
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Subtle animated background dots */
const AmbientBg: React.FC<{ frame: number }> = ({ frame }) => {
  const dots = Array.from({ length: 30 }, (_, i) => ({
    x: (i * 137 + 50) % 1920,
    y: (i * 97 + 80) % 1080,
    size: 2 + (i % 3),
    phase: i * 0.7,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 0.15 }}>
      {dots.map((dot, i) => {
        const alpha = 0.3 + 0.3 * Math.sin((frame * 0.02 + dot.phase));
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
            }}
          />
        );
      })}
    </div>
  );
};

/** Brand intro with animated text reveal */
const BrandIntro: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleOpacity = spring({ frame, fps: 30, config: { damping: 15, stiffness: 80 }, durationInFrames: 25 });
  const subtitleOpacity = interpolate(frame, [20, 40], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const lineWidth = interpolate(frame, [0, 30], [0, 200], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #060b1a 0%, #0f1d3d 50%, #060b1a 100%)",
      }}
    >
      {/* Accent line */}
      <div style={{ width: lineWidth, height: 2, background: "linear-gradient(90deg, transparent, #60a5fa, transparent)", marginBottom: 40, borderRadius: 1 }} />
      {/* Brand name */}
      <div style={{ opacity: titleOpacity, fontSize: 72, fontWeight: 900, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "-3px" }}>
        Lumi<span style={{ color: "#60a5fa" }}>Flow</span>
      </div>
      {/* Chinese tagline */}
      <div style={{ opacity: subtitleOpacity, marginTop: 20, fontSize: 28, fontWeight: 500, color: "rgba(255,255,255,0.8)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        智能审计 · 透明协作
      </div>
      {/* English sub-tagline */}
      <div style={{ opacity: taglineOpacity, marginTop: 12, fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.45)", fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "2px" }}>
        COSO 2013 FRAMEWORK · AI-POWERED AUDIT PLATFORM
      </div>
    </div>
  );
};

/** Dashboard section: KPI cards + progress rings */
const DashboardSection: React.FC<{ startFrame: number; fps: number }> = ({ startFrame, fps }) => {
  const sectionOpacity = spring({ frame: startFrame, fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 10 });

  const kpis = [
    { label: "审计整体进度", value: 78, unit: "%", trend: "up" as const, status: "good" as const },
    { label: "控制覆盖率", value: 92, unit: "%", trend: "stable" as const, status: "good" as const },
    { label: "PBC完成率", value: 68, unit: "%", trend: "up" as const, status: "warning" as const },
    { label: "缺陷发现数", value: 4, unit: "项", trend: "stable" as const, status: "warning" as const },
    { label: "风险综合评分", value: 6.2, unit: "/10", trend: "down" as const, status: "warning" as const },
    { label: "样本测试完成", value: 198, unit: "笔", trend: "up" as const, status: "good" as const },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sectionOpacity, display: "flex", flexDirection: "column", padding: "60px 80px" }}>
      {/* Section title */}
      <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8 }}>
        📊 审计工作台
      </div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 40 }}>
        一站式仪表盘 · 实时关键指标监控
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        {/* Left: KPI Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, flex: 1 }}>
          {kpis.map((kpi, i) => (
            <KpiCard key={i} {...kpi} startFrame={startFrame + 10} index={i} />
          ))}
        </div>

        {/* Right: Progress Rings */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24, alignItems: "center", justifyContent: "center" }}>
          <GlowBorder>
            <div style={{ padding: "24px 32px", display: "flex", gap: 32, alignItems: "center" }}>
              <ProgressRing progress={78} size={100} color="#3b82f6" label="审计进度" startFrame={startFrame + 15} />
              <ProgressRing progress={68} size={100} color="#f59e0b" label="PBC完成" startFrame={startFrame + 20} />
              <ProgressRing progress={92} size={100} color="#22c55e" label="控制覆盖" startFrame={startFrame + 25} />
            </div>
          </GlowBorder>

          {/* Status legend */}
          <div style={{ display: "flex", gap: 24, fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
            <span>🟢 正常</span>
            <span>🟡 关注</span>
            <span>🔴 风险</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Objectives section: tree diagram + COSO overlay */
const ObjectivesSection: React.FC<{ startFrame: number; fps: number }> = ({ startFrame, fps }) => {
  const sectionOpacity = spring({ frame: startFrame, fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 10 });

  const nodes = [
    { id: "root", label: "个人贷款流程控制测试", x: 480, y: 50, status: "active" as const },
    { id: "ra1", label: "信用审批控制", x: 200, y: 160, status: "warning" as const },
    { id: "ra2", label: "资金用途验证", x: 480, y: 160, status: "active" as const },
    { id: "ra3", label: "贷后管理监控", x: 760, y: 160, status: "active" as const },
    { id: "c1", label: "信用评分验证 ✓", x: 100, y: 280, status: "completed" as const },
    { id: "c2", label: "收入证明审核 ✗", x: 300, y: 280, status: "warning" as const },
    { id: "c3", label: "用途声明审核 ✓", x: 400, y: 280, status: "completed" as const },
    { id: "c4", label: "资金流向监控 ✓", x: 560, y: 280, status: "completed" as const },
    { id: "c5", label: "定期回访检查 ✓", x: 660, y: 280, status: "completed" as const },
    { id: "c6", label: "逾期预警监控 ✓", x: 860, y: 280, status: "completed" as const },
  ];

  const edges = [
    { from: "root", to: "ra1" }, { from: "root", to: "ra2" }, { from: "root", to: "ra3" },
    { from: "ra1", to: "c1" }, { from: "ra1", to: "c2" },
    { from: "ra2", to: "c3" }, { from: "ra2", to: "c4" },
    { from: "ra3", to: "c5" }, { from: "ra3", to: "c6" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sectionOpacity, display: "flex", flexDirection: "column", padding: "60px 80px" }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8 }}>
        🎯 审计目标设定
      </div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 30 }}>
        COSO 2013 框架 · 三级目标层级结构
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        <GlowBorder>
          <div style={{ padding: 20 }}>
            <DataFlowDiagram nodes={nodes} edges={edges} width={960} height={360} startFrame={startFrame + 15} />
          </div>
        </GlowBorder>
      </div>

      {/* COSO component badges */}
      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        {["控制环境", "风险评估", "控制活动", "信息沟通", "监控活动"].map((comp, i) => {
          const badgeOpacity = interpolate(startFrame, [60 + i * 8, 76 + i * 8], [0, 1], { extrapolateRight: "clamp" });
          return (
            <span key={comp} style={{ opacity: badgeOpacity, padding: "6px 16px", borderRadius: 16, background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", fontSize: 13, fontWeight: 500, color: "#60a5fa", fontFamily: "system-ui, -apple-system, sans-serif" }}>
              {comp}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Sampling section: parameters + AI recommendation */
const SamplingSection: React.FC<{ startFrame: number; fps: number }> = ({ startFrame, fps }) => {
  const sectionOpacity = spring({ frame: startFrame, fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 10 });

  const aiRecOpacity = interpolate(startFrame, [200, 230], [0, 1], { extrapolateRight: "clamp" });
  const aiRecScale = spring({ frame: Math.max(0, startFrame - 200), fps: 30, config: { damping: 10, stiffness: 150 }, durationInFrames: 20 });

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sectionOpacity, display: "flex", flexDirection: "column", padding: "60px 80px" }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8 }}>
        🎲 智能抽样配置
      </div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 40 }}>
        AI 驱动样本推荐 · 统计抽样参数调优
      </div>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* Parameters panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, flex: 1 }}>
          <KpiCard label="置信水平" value={95} unit="%" trend="stable" status="good" startFrame={startFrame + 15} index={0} />
          <KpiCard label="可容忍偏差率" value={5} unit="%" trend="stable" status="warning" startFrame={startFrame + 15} index={1} />
          <KpiCard label="预期偏差率" value={2} unit="%" trend="down" status="good" startFrame={startFrame + 15} index={2} />
          <KpiCard label="总体规模" value={1250} unit="笔" trend="stable" status="good" startFrame={startFrame + 15} index={3} />
        </div>

        {/* AI Recommendation card */}
        <div style={{ flex: 1 }}>
          <GlowBorder color="#8b5cf6">
            <div style={{
              opacity: aiRecOpacity, transform: `scale(${aiRecScale})`,
              padding: "40px 32px", textAlign: "center",
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#a78bfa", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 16, letterSpacing: "2px" }}>
                🤖 AI 推荐方案
              </div>
              <div style={{ fontSize: 56, fontWeight: 900, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8 }}>
                57
              </div>
              <div style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 20 }}>
                推荐样本量
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "统计抽样法", value: "MUS" },
                  { label: "抽样风险", value: "5%" },
                  { label: "置信区间", value: "±2.3%" },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span>{item.label}</span>
                    <span style={{ color: "#a78bfa", fontWeight: 600 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlowBorder>
        </div>
      </div>
    </div>
  );
};

/** Impact Analysis: force graph simulation */
const ImpactSection: React.FC<{ startFrame: number; fps: number }> = ({ startFrame, fps }) => {
  const sectionOpacity = spring({ frame: startFrame, fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 10 });

  const nodes = [
    { id: "defect", label: "控制缺陷", x: 480, y: 30, status: "warning" as const },
    { id: "fin", label: "财务影响", x: 200, y: 140, status: "warning" as const },
    { id: "comp", label: "合规风险", x: 480, y: 140, status: "warning" as const },
    { id: "ops", label: "运营效率", x: 760, y: 140, status: "active" as const },
    { id: "loss", label: "潜在损失 ¥2.3M", x: 100, y: 260, status: "warning" as const },
    { id: "penalty", label: "监管处罚风险", x: 300, y: 260, status: "warning" as const },
    { id: "reputation", label: "声誉影响", x: 520, y: 260, status: "active" as const },
    { id: "delay", label: "流程延迟", x: 720, y: 260, status: "active" as const },
    { id: "mitigation", label: "缓释措施 ✓", x: 900, y: 260, status: "completed" as const },
  ];

  const edges = [
    { from: "defect", to: "fin" }, { from: "defect", to: "comp" }, { from: "defect", to: "ops" },
    { from: "fin", to: "loss" }, { from: "fin", to: "penalty" },
    { from: "comp", to: "penalty" }, { from: "comp", to: "reputation" },
    { from: "ops", to: "delay" },
    { from: "penalty", to: "mitigation" }, { from: "loss", to: "mitigation" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sectionOpacity, display: "flex", flexDirection: "column", padding: "60px 80px" }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8 }}>
        ⚡ 影响分析引擎
      </div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 30 }}>
        控制缺陷影响网络 · 实时风险传导模拟
      </div>

      <div style={{ display: "flex", gap: 40 }}>
        <GlowBorder color="#f59e0b">
          <div style={{ padding: 20 }}>
            <DataFlowDiagram nodes={nodes} edges={edges} width={1000} height={340} startFrame={startFrame + 15} nodeDelay={10} />
          </div>
        </GlowBorder>
      </div>

      {/* Impact metrics */}
      <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
        {[
          { label: "影响范围", value: "3个业务域" },
          { label: "风险等级", value: "高" },
          { label: "财务敞口", value: "¥2.3M" },
          { label: "所需样本", value: "57笔" },
        ].map((m, i) => {
          const mOpacity = interpolate(startFrame, [150 + i * 10, 170 + i * 10], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={m.label} style={{
              opacity: mOpacity,
              flex: 1, padding: "12px 20px", borderRadius: 10,
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#f59e0b", fontFamily: "system-ui, -apple-system, sans-serif" }}>{m.value}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** AI Assistant: chat conversation */
const AISection: React.FC<{ startFrame: number; fps: number }> = ({ startFrame, fps }) => {
  const sectionOpacity = spring({ frame: startFrame, fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 10 });

  const chatMessages = [
    { role: "user" as const, text: "收入证明审核发现了5笔偏差，帮我分析影响范围" },
    { role: "assistant" as const, text: "已分析收入证明审核控制缺陷。该控制覆盖信用审批风险域，偏差率20%。影响范围包括: 贷款额度核定、征信查询授权两个关联控制节点。建议优先复核这5笔样本的信用评分和额度核定流程。" },
    { role: "user" as const, text: "生成一份缺陷影响分析报告" },
    { role: "assistant" as const, text: "✅ 报告已生成。包含: 控制缺陷描述、影响量化分析、关联节点网络图、整改建议优先级排序。是否导出为DOCX？" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sectionOpacity, display: "flex", flexDirection: "column", padding: "60px 80px" }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8 }}>
        💬 AI 审计助手
      </div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 30 }}>
        自然语言交互 · 智能审计问答与内容生成
      </div>

      <div style={{ display: "flex", gap: 40, alignItems: "flex-start" }}>
        {/* Chat panel */}
        <div style={{ flex: 1.5 }}>
          <GlowBorder color="#8b5cf6">
            <div style={{ padding: 0, maxHeight: 420 }}>
              <ChatBubbleStack messages={chatMessages} startFrame={startFrame + 15} messageDelay={45} />
            </div>
          </GlowBorder>
        </div>

        {/* Quick prompts panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8 }}>
            ⚡ 快速提示
          </div>
          {[
            "分析当前审计风险点",
            "生成抽样方案建议",
            "解释COSO控制原则",
            "导出工作底稿模板",
            "查询历史审计发现",
          ].map((prompt, i) => {
            const pOpacity = interpolate(startFrame, [80 + i * 12, 100 + i * 12], [0, 1], { extrapolateRight: "clamp" });
            return (
              <div key={i} style={{
                opacity: pOpacity,
                padding: "12px 18px", borderRadius: 10,
                background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)",
                fontSize: 14, color: "#a78bfa", fontFamily: "system-ui, -apple-system, sans-serif",
                cursor: "default",
              }}>
                {prompt}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/** Team section: roles + approval flow */
const TeamSection: React.FC<{ startFrame: number; fps: number }> = ({ startFrame, fps }) => {
  const sectionOpacity = spring({ frame: startFrame, fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 10 });

  const roles = [
    { name: "审计经理", permissions: "全部权限", color: "#3b82f6" },
    { name: "高级审计员", permissions: "测试+复核", color: "#22c55e" },
    { name: "审计员", permissions: "执行测试", color: "#f59e0b" },
    { name: "客户联络人", permissions: "PBC提交+查看", color: "#8b5cf6" },
  ];

  const workflowNodes = [
    { id: "s1", label: "审计员执行测试", x: 100, y: 50, status: "completed" as const },
    { id: "s2", label: "高级审计员复核", x: 350, y: 50, status: "active" as const },
    { id: "s3", label: "经理审阅", x: 600, y: 50, status: "pending" as const },
    { id: "s4", label: "合伙人批准", x: 850, y: 50, status: "pending" as const },
  ];

  const workflowEdges = [
    { from: "s1", to: "s2" }, { from: "s2", to: "s3" }, { from: "s3", to: "s4" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sectionOpacity, display: "flex", flexDirection: "column", padding: "60px 80px" }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8 }}>
        👥 团队协作管理
      </div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 30 }}>
        多角色权限控制 · 审批工作流 · 实时协作
      </div>

      {/* Role cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 30 }}>
        {roles.map((role, i) => {
          const cardOpacity = spring({ frame: Math.max(0, startFrame - i * 6), fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 12 });
          return (
            <div key={role.name} style={{
              opacity: cardOpacity, flex: 1,
              padding: "20px", borderRadius: 12,
              background: "rgba(255,255,255,0.04)", border: `1.5px solid ${role.color}33`,
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8 }}>{role.name}</div>
              <div style={{ fontSize: 13, color: role.color, fontFamily: "system-ui, -apple-system, sans-serif", fontWeight: 500 }}>{role.permissions}</div>
            </div>
          );
        })}
      </div>

      {/* Workflow diagram */}
      <GlowBorder>
        <div style={{ padding: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 8, marginLeft: 12 }}>
            📋 审批工作流
          </div>
          <DataFlowDiagram nodes={workflowNodes} edges={workflowEdges} width={960} height={100} startFrame={startFrame + 60} nodeDelay={12} />
        </div>
      </GlowBorder>
    </div>
  );
};

/** Integration: all modules connected */
const IntegrationSection: React.FC<{ startFrame: number; fps: number }> = ({ startFrame, fps }) => {
  const sectionOpacity = spring({ frame: startFrame, fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 10 });

  const modules = [
    { icon: "📊", name: "仪表盘" },
    { icon: "🎯", name: "审计目标" },
    { icon: "🎲", name: "智能抽样" },
    { icon: "⚡", name: "影响分析" },
    { icon: "💬", name: "AI助手" },
    { icon: "👥", name: "团队协作" },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, opacity: sectionOpacity, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 80px" }}>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 12, textAlign: "center" }}>
        🔗 平台全流程集成
      </div>
      <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, -apple-system, sans-serif", marginBottom: 50, textAlign: "center" }}>
        六大模块无缝协作 · 端到端审计工作流
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {modules.map((mod, i) => {
          const modOpacity = spring({ frame: Math.max(0, startFrame - i * 10), fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 12 });
          return (
            <React.Fragment key={mod.name}>
              <div style={{
                opacity: modOpacity,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                padding: "24px 28px", borderRadius: 16,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(59,130,246,0.2)",
              }}>
                <span style={{ fontSize: 32 }}>{mod.icon}</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif" }}>{mod.name}</span>
              </div>
              {i < modules.length - 1 && (
                <div style={{
                  opacity: spring({ frame: Math.max(0, startFrame - i * 10 - 5), fps: 30, config: { damping: 20, stiffness: 100 }, durationInFrames: 12 }),
                  fontSize: 20, color: "#3b82f6",
                }}>
                  →
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

/** Closing brand card */
const ClosingCard: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <div
      style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg, #060b1a 0%, #0f1d3d 50%, #060b1a 100%)",
        opacity,
      }}
    >
      <div style={{ fontSize: 60, fontWeight: 900, color: "#ffffff", fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "-2px" }}>
        Lumi<span style={{ color: "#60a5fa" }}>Flow</span>
      </div>
      <div style={{ marginTop: 16, fontSize: 24, fontWeight: 400, color: "rgba(255,255,255,0.7)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        Audit Transparency, Redefined.
      </div>
      <div style={{ marginTop: 8, fontSize: 16, fontWeight: 400, color: "rgba(255,255,255,0.4)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        智能审计 · 透明协作
      </div>
      <div style={{ marginTop: 40, fontSize: 14, color: "rgba(255,255,255,0.25)", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        luminflow.dev
      </div>
    </div>
  );
};

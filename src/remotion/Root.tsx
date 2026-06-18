import { Composition } from "remotion";
import { LuminFlowDemo } from "./compositions/LuminFlowDemo";
import { LuminFlowDemoV2 } from "./compositions/LuminFlowDemoV2";
import { LuminFlowDemoV3 } from "./compositions/LuminFlowDemoV3";
import { FeatureHighlight, type FeatureHighlightProps } from "./compositions/FeatureHighlight";

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="LuminFlowDemo"
        component={LuminFlowDemo}
        durationInFrames={30 * 60}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LuminFlowDemoV2"
        component={LuminFlowDemoV2}
        durationInFrames={30 * 180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="LuminFlowDemoV3"
        component={LuminFlowDemoV3}
        durationInFrames={30 * 180}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="FeatureHighlight"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        component={FeatureHighlight as any}
        durationInFrames={30 * 15}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "审计工作台",
          description: "一站式仪表盘，实时掌握审计进度、风险概览与团队动态",
          screenshotFile: "luminflow-dashboard-zh.png",
        }}
      />
    </>
  );
};

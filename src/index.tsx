// 兼容旧版的 ThinkingData 分析 API 汇总导出（传统桥接）
// 旧模块依赖 NativeModules.RNThinkingAnalyticsModule；此包装保持 RN 0.83+ 的相同接口
// @ts-ignore 兼容旧版 JS 入口
import TDAnalytics from './TDAnalytics';

export default TDAnalytics;
// 若需要 TS 常量，向外暴露
export * from './TDAnalytics';

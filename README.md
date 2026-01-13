# react-native-thinkingdata-analytics

数数埋点 React Native SDK（TurboModule + 传统桥接）

## 安装

```sh
npm install react-native-thinkingdata-analytics
```

## 快速开始

```js
import TDAnalytics, {
  TDMode,
  TDAutoTrackEventType,
  TDTrackStatus,
  TDThirdPartyType,
} from 'react-native-thinkingdata-analytics';

// 初始化（单实例）
TDAnalytics.init({
  appId: 'your-app-id',
  serverUrl: 'https://xxx/thinkingdata',
  mode: TDMode.NORMAL, // 可选：DEBUG / DEBUG_ONLY
  enableLog: true,
});

// 上报事件
TDAnalytics.track({ eventName: 'Purchase', properties: { price: 99 } });

// 设置账号/访客
TDAnalytics.login('user-123');
TDAnalytics.setDistinctId('visitor-456');

// 公共属性
TDAnalytics.setSuperProperties({ channel: 'AppStore' });

// 自动采集（启动+结束+页面+点击）
TDAnalytics.enableAutoTrackWithProperties({
  autoTrackTypes:
    TDAutoTrackEventType.APP_START |
    TDAutoTrackEventType.APP_END |
    TDAutoTrackEventType.APP_VIEW_SCREEN |
    TDAutoTrackEventType.APP_CLICK,
  properties: { app_version: '1.0.0' },
});

// 多实例：先 TDAnalytics.init(appId, serverUrl) 或 TDAnalytics.init({ appId, serverUrl })
TDAnalytics.init('second-app', 'https://second.server');
TDAnalytics.track({ eventName: 'EventB' }, 'second-app');
```

## API 概览

### 常量
- `TDMode`: `NORMAL` / `DEBUG` / `DEBUG_ONLY`
- `TDAutoTrackEventType`（位掩码）：`APP_START`、`APP_END`、`APP_CLICK`、`APP_VIEW_SCREEN`、`APP_CRASH`、`APP_INSTALL`
- `TDTrackStatus`: `NORMAL` / `PAUSE` / `STOP` / `SAVE_ONLY`
- `TDThirdPartyType`: `APPS_FLYER`、`IRON_SOURCE`、`ADJUST`、`BRANCH`、`TOP_ON`、`TRACKING`、`TRAD_PLUS`

### 初始化
- `init(appId, serverUrl)` 或 `init(config)`：初始化 SDK，未调用前不可埋点。`config` 支持 `appId`/`appid`、`serverUrl`、`mode`、`timeZone`（数字时区偏移）、`enableEncrypt` + `secretKey`、`enableLog`。
- `enableLog(enable)`：仅 JS 侧日志开关。

### 事件上报
- `track({ eventName, properties?, time?, timeZone? }, appId?)`
- `trackFirst({ eventName, properties?, eventId?, time?, timeZone? }, appId?)`
- `trackUpdate({ eventName, properties?, eventId?, time?, timeZone? }, appId?)`
- `trackOverwrite({ eventName, properties?, eventId?, time?, timeZone? }, appId?)`
- `timeEvent(eventName, appId?)`：开始计时，下一次同名事件会附带 `#duration`（秒）。
- `flush(appId?)`：立即尝试上报缓存。

### 自动采集
- `enableAutoTrack(autoTrackTypeMask, properties?, appId?)`：`autoTrackTypeMask` 传位掩码。
- `enableAutoTrackWithProperties({ autoTrackTypes, properties?, appId? })`：等效，便于传对象。
- `setAutoTrackProperties(types, properties)`：为自动采集事件附加属性（原生未实现时无效）。

### 用户属性
- `userSet(properties, appId?)`
- `userSetOnce(properties, appId?)`
- `userUnset(property, appId?)`
- `userAdd(properties, appId?)`：数值累加
- `userAppend(properties, appId?)`
- `userUniqAppend(properties, appId?)`：追加且去重
- `userDelete(appId?)`

### 公共属性
- `setSuperProperties(properties, appId?)`
- `unsetSuperProperty(property, appId?)`
- `clearSuperProperties(appId?)`
- `getSuperProperties(appId?)`
- `setDynamicSuperProperties(fn, appId?)`：每次事件上报前调用 `fn` 获取动态公共属性。
- `getPresetProperties(appId?)`：获取 SDK 预置属性。

### 身份与设备
- `login(loginId, appId?)` / `logout(appId?)`
- `setDistinctId(distinctId, appId?)` / `getDistinctId(appId?)`
- `getAccountId(appId?)`
- `getDeviceId(appId?)`

### 其他控制
- `setTrackStatus(status, appId?)`：切换上报状态。
- `enableThirdPartySharing({ types, params? }, appId?)`：三方数据同步。
- `calibrateTime(timestampMillis)` / `calibrateTimeWithNtp(ntpServer)`

### H5 事件
- `h5ClickHandler(eventData)`：处理埋点 JS SDK 的 H5 事件透传数据。

## 注意事项
- 多实例：若传 `appId` 参数，需先用对应 `appId` 调用 `init`/`init(config)`。
- 自动采集属性：`setAutoTrackProperties` 需要原生实现，目前默认静默忽略。
- TypeScript 类型定义位于 `src/TDAnalytics.d.ts`。

## Contributing

- [Development workflow](CONTRIBUTING.md#development-workflow)
- [Sending a pull request](CONTRIBUTING.md#sending-a-pull-request)
- [Code of conduct](CODE_OF_CONDUCT.md)

## License

MIT

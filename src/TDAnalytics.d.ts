export default TDAnalytics;
export namespace TDMode {
    let NORMAL: string;
    let DEBUG: string;
    let DEBUG_ONLY: string;
}
export namespace TDAutoTrackEventType {
    let APP_START: number;
    let APP_END: number;
    let APP_CLICK:number;
    let APP_VIEW_SCREEN:number;
    let APP_CRASH: number;
    let APP_INSTALL: number;
}
export namespace TDTrackStatus {
    let PAUSE: string;
    let STOP: string;
    let SAVE_ONLY: string;
    let NORMAL: string;
}
export namespace TDThirdPartyType {
    let APPS_FLYER: number;
    let IRON_SOURCE: number;
    let ADJUST: number;
    let BRANCH: number;
    let TOP_ON: number;
    let TRACKING: number;
    let TRAD_PLUS: number;
}

type TDModeType = typeof TDMode.NORMAL | typeof TDMode.DEBUG | typeof TDMode.DEBUG_ONLY;
type TDThirdPartyMode = number; // 位掩码组合

type TDAutoTrackEventMode = number; // 位掩码组合
type TDTrackStatusMode = typeof TDTrackStatus.NORMAL | typeof TDTrackStatus.STOP | typeof TDTrackStatus.SAVE_ONLY | typeof TDTrackStatus.PAUSE

interface TDConfig {
    appId: string;
    serverUrl: string;
    mode?: TDModeType,
    enableEncrypt?: boolean;
    secretKey?: {
        publicKey: string;
        version: number;
    };
    enableLog?: boolean;
    timeZone?: number;
}

interface TDEvent {
    eventName: string;
    properties?: object;
    time?: Date;
    timeZone?: number;
}

interface TDSpecialEvent {
    eventName: string;
    properties?: object;
    time?: Date;
    timeZone?: number;
    eventId?: string
}

interface TDThirdPartyPramas {
    types: TDThirdPartyMode;
    params?: object;
}

/**
 * @class 分析 SDK 的 TS 声明
 */
declare class TDAnalytics {
    static instances: {};
    /**
     * 时间校准（时间戳，毫秒）
     */
    static calibrateTime(time: number): void;
    /**
     * 时间校准（NTP）
     */
    static calibrateTimeWithNtp(ntp_server: string): void;
    /**
     * 初始化 SDK（未初始化无法埋点）
     * @param {String} appId 应用 ID，必填
     * @param {String} serverUrl 上报地址，必填
     */
    static init(appId: string, serverUrl: string): void;
    /**
     * 通过配置初始化 SDK
     */
    static init(config: TDConfig): void;
    /**
     * 上报普通事件（含预置、公共属性）
     */
    static track(options: TDEvent, appId?: string): void;
    /**
     * 上报首次事件（指定 firstCheckId）
     */
    static trackFirst(options: TDSpecialEvent, appId?: string): void;
    /**
     * 上报可更新事件（需要事件 ID）
     */
    static trackUpdate(options: TDSpecialEvent, appId?: string): void;
    /**
     * 上报可覆盖事件（需要事件 ID）
     */
    static trackOverwrite(options: TDSpecialEvent, appId?: string): void;
    /**
     * 记录事件时长，上传目标事件时附加 #duration（秒）
     */
    static timeEvent(eventName: string, appId?: string): void;
    /**
     * 开启自动采集
     */
    static enableAutoTrack(autoTrackEventType: TDAutoTrackEventMode, properties?: object, appId?: string): void;
    /**
     * 开启自动采集并附加属性
     */
    static enableAutoTrackWithProperties(options: { autoTrackTypes: TDAutoTrackEventMode; properties?: object; appId?: string }): void;
    /**
     * 设置用户属性（覆盖）
     */
    static userSet(properties: object, appId?: string): void;
    /**
     * 仅在不存在时设置用户属性
     */
    static userSetOnce(properties: object, appId?: string): void;
    /**
     * 删除用户属性
     */
    static userUnset(property: string, appId?: string): void;
    /**
     * Only one attribute is set when the user attributes of a numeric type are added.
     * @param {object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userAdd(properties: object, appId?: string): void;
    /**
     * Append a user attribute of the List type.
     * @param {Object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userAppend(properties: object, appId?: string): void;
    /**
     * The element appended to the library needs to be done to remove the processing, remove the support, and then import.
     * @param {Object} properties user properties,required
     * @param {String} appId app id,optional
     */
    static userUniqAppend(properties: object, appId?: string): void;
    /**
     * Delete the user attributes, but retain the uploaded event data. This operation is not reversible and should be performed with caution.
     * @param {String} appId app id,optional
     */
    static userDelete(appId?: string): void;
    /**
     * Set the public event attribute, which will be included in every event uploaded after that. The public event properties are saved without setting them each time.
     * @param {Object} properties super properties,required
     * @param {String} appId app id,optional
     */
    static setSuperProperties(properties: object, appId?: string): void;
    /**
     * Clears a public event attribute.
     * @param {String} property public event attribute key to clear,required
     * @param {String} appId app id,optional
     */
    static unsetSuperProperty(property: string, appId?: string): void;
    /**
     * Clear all public event attributes.
     * @param {String} appId app id,optional
     */
    static clearSuperProperties(appId?: string): void;
    /**
     * Gets the public event properties that have been set.
     * @param {String} appId app id,optional
     * @returns Public event properties that have been set
     */
    static getSuperProperties(appId?: string): Promise<object>;
    /**
     * Set dynamic public properties. Each event uploaded after that will contain a public event attribute.
     * @param {Object} dynamicProperties dynamic public properties,required
     * @param {String} appId app id,optional
     */
    static setDynamicSuperProperties(dynamicProperties: Function, appId?: string): void;
    /**
     * Gets prefabricated properties for all events.
     * @param {String} appId app id,optional
     * @returns preset properties
     */
    static getPresetProperties(appId?: string): Promise<object>;
    /**
     * 设置账号 ID（覆盖，不触发登录事件）
     */
    static login(loginId: string, appId?: string): void;
    /**
     * 清空账号 ID（不触发登出事件）
     */
    static logout(appId?: string): void;
    /**
     * 设置访客 ID，替换默认 UUID
     */
    static setDistinctId(distinctId: string, appId?: string): void;
    /**
     * 获取访客 ID（#distinct_id）
     */
    static getDistinctId(appId?: string): Promise<string>;

    static getAccountId(appId?: string): Promise<string>;
    /**
     * 获取设备 ID
     */
    static getDeviceId(appId?: string): Promise<string>;
    /**
     * 立即上报缓存队列，成功则清理
     */
    static flush(appId?: string): void;
    /**
     * 切换上报状态
     */
    static setTrackStatus(status: TDTrackStatusMode, appId?: string): void;
    /**
     * 开启三方数据同步
     */
    static enableThirdPartySharing(options: TDThirdPartyPramas, appId?: string): void;

    /**
     * H5 事件处理器 
     */
    static h5ClickHandler(eventData: string): void;
}

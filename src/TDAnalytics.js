
import thinkingdata, { AutoTrackEventType, TAThirdPartyShareType, TATrackStatus } from "./ThinkingAnalyticsAPI";

const TDMode = {
    NORMAL: 'normal',
    DEBUG: 'debug',
    DEBUG_ONLY: 'debugOnly'
}

const TDAutoTrackEventType = {
    APP_START: 1,
    APP_END: 1 << 1,
    APP_CLICK : 1 << 2,
    APP_VIEW_SCREEN : 1 << 3,
    APP_CRASH: 1 << 4,
    APP_INSTALL: 1 << 5
}
const TDTrackStatus = {
    PAUSE: 'pause',
    STOP: 'stop',
    SAVE_ONLY: 'saveOnly',
    NORMAL: 'normal'
}
const TDThirdPartyType = {
    APPS_FLYER: 1,
    IRON_SOURCE: 1 << 1,
    ADJUST: 1 << 2,
    BRANCH: 1 << 3,
    TOP_ON: 1 << 4,
    TRACKING: 1 << 5,
    TRAD_PLUS: 1 << 6
}

const TDEventType = {
    Track: "track",
    TrackFirst: "track_first",
    TrackUpdate: "track_update",
    TrackOverwrite: "track_overwrite",
    UserDel: "user_del",
    UserAdd: "user_add",
    UserSet: "user_set",
    UserSetOnce: "user_setOnce",
    UserUnset: "user_unset",
    UserAppend: "user_append",
    UserUniqAppend: "user_uniq_append",
};

/**
 * @class 分析 SDK 的 JS 封装
 */
class TDAnalytics {
    static instances = {};
    /**
     * 按时间戳校准时间
     * @param {long} time 时间戳（毫秒）
     */
    static calibrateTime(time) {
        thinkingdata.calibrateTime(time);
    }

    /**
     * 通过 NTP 校准时间
     * @param {String} ntp_server  NTP 服务器地址
     */
    static calibrateTimeWithNtp(ntp_server) {
        thinkingdata.calibrateTimeWithNtp(ntp_server);
    }

    /**
     * 初始化 SDK，未调用前不可埋点
     * @param {String} appId 必填，应用 ID
     * @param {String} serverUrl 必填，采集地址
     */
    static init(appId, serverUrl) {
        var config = {
            appId: appId,
            serverUrl: serverUrl
        }
        if (Object.keys(this.instances).length == 0) {
            thinkingdata.init(config);
            this.instances[appId] = thinkingdata;
        } else {
            var instance = thinkingdata.initInstance(config);
            this.instances[appId] = instance;
        }
    }

    /**
     * 通过配置初始化 SDK，未调用前不可埋点
     * @param {Object} config 初始化配置
     * 
     * @property {String} appId 必填，应用 ID（兼容 appid）
     * @property {String} serverUrl 必填，采集地址
     * @property {boolean} enableEncrypt 可选，是否开启加密
     * @property {Object} secretKey 可选，加密密钥
     * @property {boolean} enableLog 可选，是否打印日志
     * @property {String} timeZone 可选，默认时区
     */
    static init(config = {}) {
        if (config['appid']) {
            config['appId'] = config['appid'];
        }
        if (Object.keys(this.instances).length == 0) {
            thinkingdata.init(config);
            this.instances[config.appId] = thinkingdata;
        } else {
            var instance = thinkingdata.initInstance(config);
            this.instances[config.appId] = instance;
        }
    }

    /**
     * 上报单个事件（含预置和公共属性）
     * @param {Object} options 事件参数
     * 
     * @property {String} eventName 必填，事件名
     * @property {Object} properties 可选，事件属性
     * @property {long} time  可选，事件时间戳
     * @property {String} timeZone  可选，事件时区
     * @property {String} appId 可选，多实例 ID
     */
    static track(options = {},appId) {
        if (appId) {
            this.instances[appId].track(options['eventName'], options['properties'], options['time'], options['timeZone']);
        } else {
            thinkingdata.track(options['eventName'], options['properties'], options['time'], options['timeZone']);
        }
    }

    /**
     * 发送「首次」事件
     * @param {Object} options 事件参数
     * 
     * @property {String} eventName 必填，事件名
     * @property {Object} properties  可选，事件属性
     * @property {String} eventId  可选，事件唯一 ID
     * @property {long} time  可选，事件时间戳
     * @property {String} timeZone  可选，事件时区
     * @property {String} appId 可选，多实例 ID
     */
    static trackFirst(options = {},appId) {
        if (appId) {
            this.instances[appId].trackFirstEvent(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        } else {
            thinkingdata.trackFirstEvent(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        }
    }

    /**
     * 发送「可更新」事件
     * @param {Object} options 事件参数
     * 
     * @property {String} eventName 必填，事件名
     * @property {Object} properties  可选，事件属性
     * @property {String} eventId  可选，事件 ID，用于标识可更新事件
     * @property {long} time  可选，事件时间戳
     * @property {String} timeZone  可选，事件时区
     * @property {String} appId 可选，多实例 ID
     */
    static trackUpdate(options = {},appId) {
        if (appId) {
            this.instances[appId].trackUpdate(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        } else {
            thinkingdata.trackUpdate(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        }
    }

    /**
     * 发送「可覆盖」事件
     * @param {Object} options 事件参数
     * 
     * @property {String} eventName 必填，事件名
     * @property {Object} properties  可选，事件属性
     * @property {String} eventId  可选，事件 ID，用于标识可覆盖事件
     * @property {long} time  可选，事件时间戳
     * @property {String} timeZone  可选，事件时区
     * @property {String} appId 可选，多实例 ID
     */
    static trackOverwrite(options = {},appId) {
        if (appId) {
            this.instances[appId].trackOverwrite(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        } else {
            thinkingdata.trackOverwrite(options['eventName'], options['properties'], options['eventId'], options['time'], options['timeZone']);
        }
    }

    /**
     * 记录事件时长，开始计时，上传目标事件时附加 #duration（秒）
     * @param {String} eventName 必填，事件名
     * @param {String} appId 可选，多实例 ID
     */
    static timeEvent(eventName, appId) {
        if (appId) {
            this.instances[appId].timeEvent(eventName);
        } else {
            thinkingdata.timeEvent(eventName);
        }
    }

    /**
     * 启用自动采集
     * @param {TDAutoTrackEventType} autoTrackEventType 需要开启的自动采集类型
     * @param {String} appId 可选，多实例 ID
     */
    static enableAutoTrack(autoTrackEventType, properties,appId) {
        if (appId) {
            this.instances[appId].enableAutoTrack(autoTrackEventType,properties);
        } else {
            thinkingdata.enableAutoTrack(autoTrackEventType,properties);
        }
    }

    /**
     * 启用自动采集并附加属性
     * @param {Object} options  自动采集配置
     * 
     * @property {TDAutoTrackEventType}autoTrackTypes 必填，自动采集事件类型（位掩码）
     * @property {Object} properties 可选，附加属性
     * @property {String} appId 可选，多实例 ID
     */
    static enableAutoTrackWithProperties(options = {}) {
        const appId = options['appId'];
        const autoTrackTypes = options['autoTrackTypes'] ?? 0;
        const properties = options['properties'];
        if (appId && this.instances[appId]) {
            this.instances[appId].enableAutoTrack(autoTrackTypes, properties);
            return;
        }
        thinkingdata.enableAutoTrack(autoTrackTypes, properties);
    }

    /**
     * 设置用户属性，已存在则覆盖
     * @param {Object} properties 必填，用户属性
     * @param {String} appId 可选，多实例 ID
     */
    static userSet(properties, appId) {
        if (appId) {
            this.instances[appId].userSet(properties);
        } else {
            thinkingdata.userSet(properties);
        }
    }

    /**
     * 仅在不存在时设置用户属性
     * @param {Object} properties 必填，用户属性
     * @param {String} appId 可选，多实例 ID
     */
    static userSetOnce(properties, appId) {
        if (appId) {
            this.instances[appId].userSetOnce(properties);
        } else {
            thinkingdata.userSetOnce(properties);
        }
    }

    /**
     * 清除单个用户属性
     * @param {String} property 必填，属性名
     * @param {String} appId 可选，多实例 ID
     */
    static userUnset(property, appId) {
        if (appId) {
            this.instances[appId].userUnset(property);
        } else {
            thinkingdata.userUnset(property);
        }
    }

    /**
     * 数值类型属性累加
     * @param {object} properties 必填，用户属性
     * @param {String} appId 可选，多实例 ID
     */
    static userAdd(properties, appId) {
        if (appId) {
            this.instances[appId].userAdd(properties);
        } else {
            thinkingdata.userAdd(properties);
        }
    }

    /**
     * 向 List 类型属性追加
     * @param {Object} properties 必填，用户属性
     * @param {String} appId 可选，多实例 ID
     */
    static userAppend(properties, appId) {
        if (appId) {
            this.instances[appId].userAppend(properties);
        } else {
            thinkingdata.userAppend(properties);
        }
    }

    /**
     * 向 List 类型属性追加去重后的元素
     * @param {Object} properties 必填，用户属性
     * @param {String} appId 可选，多实例 ID
     */
    static userUniqAppend(properties, appId) {
        if (appId) {
            this.instances[appId].userUniqAppend(properties);
        } else {
            thinkingdata.userUniqAppend(properties);
        }
    }

    /**
     * 删除用户属性（不可逆，事件数据保留）
     * @param {String} appId 可选，多实例 ID
     */
    static userDelete(appId) {
        if (appId) {
            this.instances[appId].userDel();
        } else {
            thinkingdata.userDel();
        }
    }

    /**
     * 设置事件公共属性（后续事件都会携带）
     * @param {Object} properties 必填，公共属性
     * @param {String} appId 可选，多实例 ID
     */
    static setSuperProperties(properties, appId) {
        if (appId) {
            this.instances[appId].setSuperProperties(properties);
        } else {
            thinkingdata.setSuperProperties(properties);
        }
    }

    /**
     * 清除单个公共属性
     * @param {String} property 必填，属性名
     * @param {String} appId 可选，多实例 ID
     */
    static unsetSuperProperty(property, appId) {
        if (appId) {
            this.instances[appId].unsetSuperProperty(property);
        } else {
            thinkingdata.unsetSuperProperty(property);
        }
    }

    /**
     * 清除全部公共属性
     * @param {String} appId 可选，多实例 ID
     */
    static clearSuperProperties(appId) {
        if (appId) {
            this.instances[appId].clearSuperProperties();
        } else {
            thinkingdata.clearSuperProperties();
        }
    }

    /**
     * 获取已设置的公共属性
     * @param {String} appId 可选，多实例 ID
     * @returns 已设置的公共属性
     */
    static async getSuperProperties(appId) {
        if (appId) {
            return await this.instances[appId].getSuperProperties();
        } else {
            return await thinkingdata.getSuperProperties();
        }
    }

    /**
     * 设置动态公共属性（每次事件都会调用）
     * @param {Object} dynamicProperties 必填，动态公共属性函数
     * @param {String} appId 可选，多实例 ID
     */
    static setDynamicSuperProperties(dynamicProperties, appId) {
        if (appId) {
            this.instances[appId].setDynamicSuperProperties(dynamicProperties);
        } else {
            thinkingdata.setDynamicSuperProperties(dynamicProperties)
        }
    }

    /**
     * 获取预置属性
     * @param {String} appId 可选，多实例 ID
     * @returns 预置属性
     */
    static async getPresetProperties(appId) {
        if (appId) {
            return await this.instances[appId].getPresetProperties();
        } else {
            return await thinkingdata.getPresetProperties();
        }
    }

    /**
     * 设置账号 ID（覆盖上一次，且不发送登录事件）
     * @param {String} loginId 必填，账号 ID
     * @param {String} appId 可选，多实例 ID
     */
    static login(loginId, appId) {
        if (appId) {
            this.instances[appId].login(loginId);
        } else {
            thinkingdata.login(loginId);
        }
    }

    /**
     * 清空账号 ID（不发送登出事件）
     * @param {String} appId 可选，多实例 ID
     */
    static logout(appId) {
        if (appId) {
            this.instances[appId].logout();
        } else {
            thinkingdata.logout();
        }
    }

    /**
     * 设置访客 ID，替换默认 UUID
     * @param {String} distinctId 必填，访客 ID
     * @param {String} appId 可选，多实例 ID
     */
    static setDistinctId(distinctId, appId) {
        if (appId) {
            this.instances[appId].identify(distinctId);
        } else {
            thinkingdata.identify(distinctId);
        }
    }

    /**
     * 获取访客 ID（上报数据中的 #distinct_id）
     * @param {String} appId 可选，多实例 ID
     * @returns 访客 ID
     */
    static async getDistinctId(appId) {
        if (appId) {
            return await this.instances[appId].getDistinctId();
        } else {
            return await thinkingdata.getDistinctId();
        }
    }

    static async getAccountId(appId){
        if (appId) {
            return await this.instances[appId].getAccountId();
        } else {
            return await thinkingdata.getAccountId();
        }
    }

    /**
     * 获取设备 ID
     * @param {String} appId 可选，多实例 ID
     * @returns 设备 ID
     */
    static async getDeviceId(appId) {
        if (appId) {
            return await this.instances[appId].getDeviceId();
        } else {
            return await thinkingdata.getDeviceId();
        }
    }

    /**
     * 立即尝试上报缓存队列（成功则清理本地）
     * @param {String} appId 可选，多实例 ID
     */
    static flush(appId) {
        if (appId) {
            this.instances[appId].flush();
        } else {
            thinkingdata.flush();
        }
    }

    /**
     * 切换上报状态
     * @param {TDTrackStatus} status 必填，上报状态
     * @param {String} appId 可选，多实例 ID
     */
    static setTrackStatus(status, appId) {
        var s = TATrackStatus.NORMAL;
        if (status == TDTrackStatus.PAUSE) {
            s = TATrackStatus.PAUSE;
        } else if (status == TDTrackStatus.STOP) {
            s = TATrackStatus.STOP;
        } else if (status == TDTrackStatus.SAVE_ONLY) {
            s = TATrackStatus.SAVE_ONLY;
        }
        if (appId) {
            this.instances[appId].setTrackStatus(s);
        } else {
            thinkingdata.setTrackStatus(s);
        }
    }

    /**
     * 开启三方数据同步
     * @param {Object} options 三方配置
     * 
     * @property {TDThirdPartyType} types 必填，三方类型
     * @property {Object} params 可选，扩展参数
     * @property {String} appId 可选，多实例 ID
     */
    static enableThirdPartySharing(options = {},appId) {
        let types = options['types'];
        let params = options['params'];
        if (appId) {
            this.instances[appId].enableThirdPartySharing(types, params);
        } else {
            thinkingdata.enableThirdPartySharing(types, params);
        }
    }

    /**
     * H5 事件处理器
     * @param {String} eventData 必填，事件数据
     */
    static h5ClickHandler(eventData) {
        if (!eventData) return;
        const eventMap = JSON.parse(eventData);
        const dataArr = eventMap['data'];

        if (!Array.isArray(dataArr) || dataArr.length === 0) {
            return;
        }

        const dataInfo = dataArr[0];
        if (!dataInfo) {
            return;
        }

        let type = dataInfo['#type'];
        const eventName = dataInfo['#event_name'];
        const time = dataInfo['#time'];
        let properties = dataInfo['properties'];

        let extraID;
        if (type === TDEventType.Track) {
            extraID = dataInfo['#first_check_id'];
            if (extraID) {
                type = TDEventType.TrackFirst;
            }
        } else {
            extraID = dataInfo['#event_id'];
        }

        properties = this._cleanProperties(properties);
        this._h5track(eventName, extraID, properties, type, time);
    }

    static _h5track(eventName, extraID, properties, type, time) {
        if (this._isTrackEvent(type)) {
            const dateTime = new Date(time);
            let timeZone;
            if (properties['#zone_offset']) {
                const zoneOffset = properties['#zone_offset'];
                const diffHours = -dateTime.getTimezoneOffset() / 60 - zoneOffset;
                const hours = Math.floor(diffHours);
                const minutes = Math.floor((diffHours - hours) * 60);
                dateTime.setHours(dateTime.getHours() + hours);
                dateTime.setMinutes(dateTime.getMinutes() + minutes);
                timeZone = this._formatTimeZone(zoneOffset);
            }
            if (type === TDEventType.Track) {
                this.track({
                    eventName,
                    properties,
                    time: dateTime.getTime(),
                    timeZone
                });
                return;
            }
            const eventModel = {
                eventName,
                properties,
                eventId: extraID || "",
                time: dateTime.getTime(),
                timeZone
            };
            switch (type) {
                case TDEventType.TrackFirst:
                    this.trackFirst(eventModel);
                    break;
                case TDEventType.TrackUpdate:
                    this.trackUpdate(eventModel);
                    break;
                case TDEventType.TrackOverwrite:
                    this.trackOverwrite(eventModel);
                    break;
                default:
                    throw new Error(`Invalid event type: ${type}`);
            }
        } else {
            this._handleUserEvent(type, properties);
        }
    }

    static _handleUserEvent(type, properties) {
        switch (type) {
            case TDEventType.UserDel:
                this.userDelete();
                break;
            case TDEventType.UserAdd:
                this.userAdd(properties);
                break;
            case TDEventType.UserSet:
                this.userSet(properties);
                break;
            case TDEventType.UserSetOnce:
                this.userSetOnce(properties);
                break;
            case TDEventType.UserUnset:
                this.userUnset(Object.keys(properties)[0]);
                break;
            case TDEventType.UserAppend:
                this.userAppend(properties);
                break;
            case TDEventType.UserUniqAppend:
                this.userUniqAppend(properties);
                break;
        }
    }

    static _formatTimeZone(hours) {
        const sign = hours >= 0 ? '+' : '-';
        const hourAbs = Math.abs(hours);
        const minutes = Math.floor((hourAbs - Math.floor(hourAbs)) * 60);
        const hourPart = `${Math.floor(hourAbs).toString().padStart(2, '0')}`;
        const minutePart = `${minutes.toString().padStart(2, '0')}`;

        return `GMT${sign}${hourPart}:${minutePart}`;
    }

    static _isTrackEvent(eventType) {
        return [
            TDEventType.Track,
            TDEventType.TrackFirst,
            TDEventType.TrackUpdate,
            TDEventType.TrackOverwrite,
        ].includes(eventType);
    }

    static _cleanProperties(properties) {
        const keysToRemove = ['#account_id', '#distinct_id', '#device_id', '#lib', '#lib_version', '#screen_height', '#screen_width'];
        keysToRemove.forEach(key => delete properties[key]);
        return properties;
    }
}

export { TDAutoTrackEventType, TDTrackStatus, TDThirdPartyType, TDMode };
export default TDAnalytics

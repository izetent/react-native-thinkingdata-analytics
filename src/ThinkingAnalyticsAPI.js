import { Platform } from 'react-native';

import RNThinkingAnalyticsModule from './NativeThinkingAnalyticsModule';

const TESDKVERSION = '3.2.0';

const AutoTrackEventType = {
    APP_START: 'appStart',
    APP_END: 'appEnd',
    APP_CRASH: 'appViewCrash',
    APP_INSTALL: 'appInstall'
}

const TAThirdPartyShareType = {
    TA_APPS_FLYER: 'AppsFlyer',
    TA_IRON_SOURCE: 'IronSource',
    TA_ADJUST: 'Adjust',
    TA_BRANCH: 'Branch',
    TA_TOP_ON: 'TopOn',
    TA_TRACKING: 'Tracking',
    TA_TRAD_PLUS: 'TradPlus'
}

const TATrackStatus = {
    PAUSE: 'pause',
    STOP: 'stop',
    SAVE_ONLY: 'saveOnly',
    NORMAL: 'normal'
}

var ThinkingAnalyticsAPI = function () { };

var teEnableShowLog = false;

const taStorageCache = {};

async function taGetStorageItem(key) {
    if (key === null || key === undefined) {
        return null;
    }
    if (Object.prototype.hasOwnProperty.call(taStorageCache, key)) {
        return taStorageCache[key];
    }
    if (RNThinkingAnalyticsModule && typeof RNThinkingAnalyticsModule.getStorageItem === 'function') {
        try {
            const value = await RNThinkingAnalyticsModule.getStorageItem(key);
            taStorageCache[key] = value;
            return value;
        } catch (error) {
            if (teEnableShowLog) {
                console.log("[THINKING] getStorageItem error: " + error);
            }
        }
    }
    return taStorageCache[key] === undefined ? null : taStorageCache[key];
}

async function taSetStorageItem(key, value) {
    if (key === null || key === undefined) {
        return;
    }
    taStorageCache[key] = value === undefined ? null : value;
    if (RNThinkingAnalyticsModule && typeof RNThinkingAnalyticsModule.setStorageItem === 'function') {
        try {
            await RNThinkingAnalyticsModule.setStorageItem(key, value);
        } catch (error) {
            if (teEnableShowLog) {
                console.log("[THINKING] setStorageItem error: " + error);
            }
        }
    }
}


ThinkingAnalyticsAPI.prototype.ta_UUIDv4 = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            // eslint-disable-next-line eqeqeq 禁用弱等号告警
            v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
};

ThinkingAnalyticsAPI.prototype.ta_utf8Encode = function (string) {
    string = (string + '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var utftext = '';
    var start, end;
    var stringl = 0;
    var n;
    start = end = 0;
    stringl = string.length;
    for (n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;
        if (c1 < 128) {
            end++;
        } else if ((c1 > 127) && (c1 < 2048)) {
            enc = String.fromCharCode((c1 >> 6) | 192, (c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224, ((c1 >> 6) & 63) | 128, (c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.substring(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }
    if (end > start) {
        utftext += string.substring(start, string.length);
    }
    return utftext;
};

ThinkingAnalyticsAPI.prototype.ta_base64Encode = function (data) {
    var b64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    var o1, o2, o3, h1, h2, h3, h4, bits;
    var i = 0, ac = 0, enc = '', tmpArr = [];

    if (!data) {
        return data;
    }

    data = this.ta_utf8Encode(data);
    do {
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);
        bits = o1 << 16 | o2 << 8 | o3;
        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
        tmpArr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmpArr.join('');
    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
            break;
        case 2:
            enc = enc.slice(0, -1) + '=';
            break;
    }
    return enc;
};

ThinkingAnalyticsAPI.prototype.ta_formatDate = function (d) {
    function pad(n) {
        return n < 10 ? '0' + n : n;
    }
    function padMilliseconds(n) {
        if (n < 10) {
            return '00' + n;
        } else if (n < 100) {
            return '0' + n;
        } else {
            return n;
        }
    }
    return d.getFullYear() + '-' +
        pad(d.getMonth() + 1) + '-' +
        pad(d.getDate()) + ' ' +
        pad(d.getHours()) + ':' +
        pad(d.getMinutes()) + ':' +
        pad(d.getSeconds()) + '.' +
        padMilliseconds(d.getMilliseconds());
};

ThinkingAnalyticsAPI.prototype.ta_formatTimeZone = function (d, i) {
    if (typeof i !== 'number') return d;
    var len = d.getTime();
    var offset = d.getTimezoneOffset() * 60000;
    var utcTime = len + offset;
    return new Date(utcTime + 3600000 * i);
};

ThinkingAnalyticsAPI.prototype.ta_hashCode = function (str) {
    if (typeof str !== 'string') {
        return 0;
    }
    var hash = 0;
    var char = null;
    if (str.length === 0) {
        return hash;
    }
    for (var i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
};

ThinkingAnalyticsAPI.prototype.ta_encodeURIComponent = function (val) {
    var result = '';
    try {
        result = encodeURIComponent(val);
    } catch (e) {
        result = val;
    }
    return result;
};

const taFlushDataQueue = [];
var taIsClearingForDataQueue = false;

ThinkingAnalyticsAPI.prototype.executeGetDataQueue = async function () {
    if (taIsClearingForDataQueue === true) {
        return;
    }
    taIsClearingForDataQueue = true;
    if (taFlushDataQueue.length > 0) {
        const eventParams = taFlushDataQueue.shift();
        try {
            await this._httpRequest_(eventParams);
            taIsClearingForDataQueue = false;
        } catch (error) {
            console.error(error);
            taIsClearingForDataQueue = false;
        }
        await this.executeGetDataQueue();
    } else {
        taIsClearingForDataQueue = false;
    }
}



ThinkingAnalyticsAPI.prototype._httpRequest_ = async function (eventData) {

    if (this['ThinkingAnalyticsSource']['trackStatus'] !== 'normal') return;
    var distinctId;
    var loginId;
    var deviceId;
    var superProperties;
    var dyldSuperProperties;

    try {
        // distinctId 访客 ID
        distinctId = this['ThinkingAnalyticsSource']['distinct_id'];
        if (distinctId === null || distinctId === undefined || typeof distinctId !== 'string' || distinctId === "") {
            distinctId = await taGetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id');
            this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
            if (distinctId === null || distinctId === undefined || typeof distinctId !== 'string' || distinctId === "") {
                distinctId = this.ta_UUIDv4()
                this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
                await taSetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id', distinctId);
            }
        }

        // loginId 账号 ID
        loginId = this['ThinkingAnalyticsSource']['login_id'];
        if (loginId === null || loginId === undefined || typeof loginId !== 'string' || loginId === "") {
            loginId = await taGetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_login_id');
            this['ThinkingAnalyticsSource']['login_id'] = loginId;
        }
        if (loginId === null || loginId === undefined || typeof loginId !== 'string' || loginId === "") {
            loginId = "";
            this['ThinkingAnalyticsSource']['login_id'] = loginId;
        }

        // deviceId 设备 ID
        deviceId = this['ThinkingAnalyticsSource']['device_id'];
        if (deviceId === null || deviceId === undefined || typeof deviceId !== 'string' || deviceId === "") {
            deviceId = await taGetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_device_id');
            this['ThinkingAnalyticsSource']['device_id'] = deviceId;
        }
        if (deviceId === null || deviceId === undefined || typeof deviceId !== 'string' || deviceId === "") {
            deviceId = this.ta_UUIDv4();
            await taSetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_device_id', deviceId);
            this['ThinkingAnalyticsSource']['device_id'] = deviceId;
        }
    } catch (error) {
        // 读取缓存失败兜底
        console.error(error);
    }

    var preetylog;
    var appid = this['ThinkingAnalyticsSource']['appid'];
    var urlData;
    var time = new Date();
    var mydata = {
        '#type': eventData.type,
        '#time': this.ta_formatDate(this.ta_formatTimeZone(time, this['ThinkingAnalyticsSource']['zoneOffset']))
    };
    var data = {
        data: [mydata]
    };

    if (loginId !== null && loginId !== undefined && typeof loginId === 'string' && loginId !== "") {
        mydata['#account_id'] = loginId;
    }

    if (distinctId !== null && distinctId !== undefined && typeof distinctId === 'string') {
        mydata['#distinct_id'] = distinctId;
    }

    if (eventData.type === 'track' || eventData.type === 'track_update' || eventData.type === 'track_overwrite') {
        mydata['#event_name'] = eventData.event;
        if (eventData.type === 'track_update' || eventData.type === 'track_overwrite') {
            mydata['#event_id'] = eventData.extraId;
        } else if (eventData.isFirstEvent === true) {
            if (eventData.firstCheckId === null || eventData.firstCheckId === undefined || typeof eventData.firstCheckId !== 'string' || eventData.firstCheckId === "") {
                eventData.firstCheckId = deviceId;
            }
            mydata['#first_check_id'] = eventData.firstCheckId;
        }
        let zoneOffset = 0 - (time.getTimezoneOffset() / 60.0);
        if (this['ThinkingAnalyticsSource']['zoneOffset']) {
            zoneOffset = this['ThinkingAnalyticsSource']['zoneOffset'];
        }

        var sdkos = Platform.OS;
        if (sdkos === 'ios') {
            sdkos = 'iOS';
        } else if (sdkos === 'android') {
            sdkos = 'Android';
        }

        mydata['properties'] = {
            '#os': sdkos,
            '#lib_version': TESDKVERSION,
            '#lib': 'ReactNative',
            '#zone_offset': zoneOffset,
            '#device_id': deviceId
        }

        // superProperties 公共属性
        superProperties = this['ThinkingAnalyticsSource']['super_properties'];
        if (superProperties !== null && superProperties !== undefined && typeof superProperties === 'object') {
            for (var prop in superProperties) {
                if (superProperties[prop] !== null && superProperties[prop] !== undefined) {
                    mydata['properties'][prop] = superProperties[prop];
                }
            }
        }

        // dynamicProperties 动态公共属性
        if (this['ThinkingAnalyticsSource']['dynamicProperties'] !== null && this['ThinkingAnalyticsSource']['dynamicProperties'] !== undefined && typeof this['ThinkingAnalyticsSource']['dynamicProperties'] === 'function') {
            dyldSuperProperties = this['ThinkingAnalyticsSource']['dynamicProperties']();
            if (dyldSuperProperties !== null && dyldSuperProperties !== undefined && typeof dyldSuperProperties === 'object') {
                for (var prop in dyldSuperProperties) {
                    if (dyldSuperProperties[prop] !== void 0) {
                        mydata['properties'][prop] = dyldSuperProperties[prop];
                    }
                }
            }
        }

        // 合并事件自定义属性
        if (eventData.properties !== null && eventData.properties !== undefined && typeof eventData.properties === 'object') {
            for (var prop in eventData.properties) {
                if (eventData.properties[prop] !== void 0) {
                    mydata['properties'][prop] = eventData.properties[prop];
                }
            }
        }

        // duration 事件时长
        var event_timers = this['ThinkingAnalyticsSource']['event_timers'];
        if (event_timers === null || event_timers === undefined || typeof event_timers !== "object") {
            event_timers = {};
        }

        if (event_timers.hasOwnProperty(eventData.event) === true) {
            var startTimestamp = event_timers[eventData.event];
            var durationMillisecond = new Date().getTime() - startTimestamp;
            var d = parseFloat((durationMillisecond / 1000).toFixed(3));
            if (d > 24 * 60 * 60) {
                d = 24 * 60 * 60;
            }
            mydata['properties']['#duration'] = d;
            delete event_timers[eventData.event];
            this['ThinkingAnalyticsSource']['event_timers'] = event_timers;
        }

        // check date type 日期属性格式化
        for (var prop in mydata['properties']) {
            if (mydata['properties'][prop] !== void 0 && mydata['properties'][prop] instanceof Date) {
                mydata['properties'][prop] = this.ta_formatDate(this.ta_formatTimeZone(mydata['properties'][prop], this['ThinkingAnalyticsSource']['zoneOffset']));
            } else if (mydata['properties'][prop] !== void 0 && mydata['properties'][prop] instanceof Array) {
                var that = this;
                mydata['properties'][prop].forEach(function (item) {
                    if (item !== void 0 && (typeof item === "object")) {
                        for (var prop1 in item) {
                            if (item[prop1] !== void 0 && item[prop1] instanceof Date) {
                                item[prop1] = that.ta_formatDate(that.ta_formatTimeZone(item[prop1], that['ThinkingAnalyticsSource']['zoneOffset']));
                            }
                        }
                    }
                });
            } else if (mydata['properties'][prop] !== void 0 && (typeof mydata['properties'][prop] === "object")) {
                for (var prop1 in mydata['properties'][prop]) {
                    if (mydata['properties'][prop][prop1] !== void 0 && mydata['properties'][prop][prop1] instanceof Date) {
                        mydata['properties'][prop][prop1] = this.ta_formatDate(this.ta_formatTimeZone(mydata['properties'][prop][prop1], this['ThinkingAnalyticsSource']['zoneOffset']));
                    }
                }
            }
        }

        // 出站包装
        data['#app_id'] = appid;
        data['#flush_time'] = this.ta_formatTimeZone(new Date(), this['ThinkingAnalyticsSource']['zoneOffset']).getTime();
        mydata['#uuid'] = this.ta_UUIDv4();
        preetylog = JSON.stringify(data, null, '\t');
        data = JSON.stringify(data);

    } else {
        mydata['properties'] = {};
        if (eventData.properties !== null && eventData.properties !== undefined && typeof eventData.properties === "object") {
            for (var prop in eventData.properties) {
                if (eventData.properties[prop] !== void 0) {
                    mydata['properties'][prop] = eventData.properties[prop];
                }
            }
        }

        for (var prop in mydata['properties']) {
            if (mydata['properties'][prop] !== void 0 && mydata['properties'][prop] instanceof Date) {
                mydata['properties'][prop] = this.ta_formatDate(this.ta_formatTimeZone(mydata['properties'][prop], this['ThinkingAnalyticsSource']['zoneOffset']));
            }
        }

        data['#app_id'] = appid;
        data['#flush_time'] = this.ta_formatTimeZone(new Date(), this['ThinkingAnalyticsSource']['zoneOffset']).getTime();
        mydata['#uuid'] = this.ta_UUIDv4();
        preetylog = JSON.stringify(data, null, '\t');
        data = JSON.stringify(data);

    }

    var base64Data = this.ta_base64Encode(data);
    var crc = 'crc=' + this.ta_hashCode(base64Data);
    urlData = this['ThinkingAnalyticsSource']['serverURL'] + "/sync_js?" + 'data=' + this.ta_encodeURIComponent(base64Data) + '&ext=' + this.ta_encodeURIComponent(crc) + '&version=' + TESDKVERSION;

    return fetch(urlData).then(res => res.json()).then(res => {

        if (res['code'] === 0) {
            if (teEnableShowLog) {
                console.log(" [THINKING] flush success sendContent---->" + preetylog);
                console.log(" [THINKING] flush success responseData---->" + JSON.stringify(res));
            }
        } else {
            if (teEnableShowLog) {
                console.log(JSON.stringify(res));
            }
        }
    }).catch((error) => {
        if (teEnableShowLog) {
            console.error(error);
        }
    });
}

ThinkingAnalyticsAPI.prototype.httpRequest = function (eventData) {
    taFlushDataQueue.push(eventData);
    this.executeGetDataQueue();
}



/**
 * 开启/关闭日志输出
 * @param {*} enable 是否打印日志
 */
ThinkingAnalyticsAPI.prototype.enableLog = function (enable) {
    teEnableShowLog = enable;
}

/**
 * SDK 初始化配置
 *
 * @param config 初始化参数
 * @return SDK 实例
 */
ThinkingAnalyticsAPI.prototype.init = function (config) {

    const appId = config['appId'] ?? config['appid'];

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        teEnableShowLog = config['enableLog'];
        if (teEnableShowLog === true) {
            console.log("[THINKING] ThinkingAnalyticsAPI Initialize. appid: " + appId + ", serverUrl: " + config['serverUrl']);
        }
        this['ThinkingAnalyticsSource'] = {};
        this['ThinkingAnalyticsSource']['appid'] = appId;
        this['ThinkingAnalyticsSource']['serverURL'] = config['serverUrl'];
        this['ThinkingAnalyticsSource']['zoneOffset'] = config['zoneOffset'];
        this['ThinkingAnalyticsSource']['trackStatus'] = 'normal';
        return;
    }

    this['ThinkingAnalyticsSource'] = {};
    this['ThinkingAnalyticsSource']['appid'] = appId;
    this['ThinkingAnalyticsSource']['serverURL'] = config['serverUrl'];
    this['ThinkingAnalyticsSource']['zoneOffset'] = config['zoneOffset'];
    this['ThinkingAnalyticsSource']['trackStatus'] = 'normal';

    this.appId = appId;
    RNThinkingAnalyticsModule.init({ ...config, appId }, TESDKVERSION);
}

ThinkingAnalyticsAPI.prototype.formatPropertiesTimeZone = function (properties) {

    if (properties === null || properties === undefined || typeof properties !== 'object') {
        return properties;
    }

    // 日期字段格式化
    for (var prop in properties) {
        if (properties[prop] !== void 0 && properties[prop] instanceof Date) {
            properties[prop] = this.ta_formatDate(this.ta_formatTimeZone(properties[prop], this['ThinkingAnalyticsSource']['zoneOffset']));
        } else if (properties[prop] !== void 0 && properties[prop] instanceof Array) {
            var that = this;
            properties[prop].forEach(function (item) {
                if (item !== void 0 && (typeof item === "object")) {
                    for (var prop1 in item) {
                        if (item[prop1] !== void 0 && item[prop1] instanceof Date) {
                            item[prop1] = that.ta_formatDate(that.ta_formatTimeZone(item[prop1], that['ThinkingAnalyticsSource']['zoneOffset']));
                        }
                    }
                }
            });
        } else if (properties[prop] !== void 0 && (typeof properties[prop] === "object")) {
            for (var prop1 in properties[prop]) {
                if (properties[prop][prop1] !== void 0 && properties[prop][prop1] instanceof Date) {
                    properties[prop][prop1] = this.ta_formatDate(this.ta_formatTimeZone(properties[prop][prop1], this['ThinkingAnalyticsSource']['zoneOffset']));
                }
            }
        }
    }
    return properties;
}
ThinkingAnalyticsAPI.prototype.getTimeStamp = function (time) {
    if (time !== undefined && time instanceof Date) return time.getTime();
    return 0;
}
/**
 * 上报普通事件
 *
 * @param eventName 事件名
 * @param properties 事件属性
 */
ThinkingAnalyticsAPI.prototype.track = function (eventName, properties, time, timeZone) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'track',
            event: eventName,
            properties: properties
        });
        return;
    }

    if (properties === null || properties === undefined) {
        properties = {};
    }

    if (this.dynamicProperties) {
        var dProperties = this.dynamicProperties()
        if (typeof dProperties === "object") {
            for (var key in dProperties) {
                properties[key] = dProperties[key];
            }
        }
    }

    var obj = {
        appId: this.appId,
        eventName: eventName,
        properties: this.formatPropertiesTimeZone(properties),
        time: this.getTimeStamp(time),
        timeZone: timeZone,
    };
    RNThinkingAnalyticsModule.track(obj);
}

/**
* 上报首次事件（同一 ID 只记录一次）
* @param eventName 事件名
* @param properties 事件属性
* @param eventId 首次校验 ID
*/
ThinkingAnalyticsAPI.prototype.trackFirstEvent = function (eventName, properties, eventId, time, timeZone) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'track',
            event: eventName,
            properties: properties,
            firstCheckId: eventId,
            isFirstEvent: true,
        });
        return;
    }

    // 拼接动态公共属性
    if (properties === null || properties === undefined) {
        properties = {};
    }

    if (this.dynamicProperties) {
        var dProperties = this.dynamicProperties()
        for (var key in dProperties) {
            properties[key] = dProperties[key];
        }
    }
    var obj = {
        appId: this.appId,
        eventName: eventName,
        properties: this.formatPropertiesTimeZone(properties),
        eventId: eventId,
        time: this.getTimeStamp(time),
        timeZone: timeZone
    };
    RNThinkingAnalyticsModule.trackFirstEvent(obj);
}

/**
* 上报可更新事件（需提供事件 ID）
* @param eventName 事件名
* @param properties 事件属性
* @param eventId 事件 ID
*/
ThinkingAnalyticsAPI.prototype.trackUpdate = function (eventName, properties, eventId, time, timeZone) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] queueing data, updateEventName: " + eventName + ", properties: " + JSON.stringify(properties) + ", eventId: " + eventId);
        }
        this.httpRequest({
            type: 'track_update',
            event: eventName,
            properties: properties,
            extraId: eventId
        });
        return;
    }

    if (properties === null || properties === undefined) {
        properties = {};
    }

    if (this.dynamicProperties) {
        var dProperties = this.dynamicProperties()
        for (var key in dProperties) {
            properties[key] = dProperties[key];
        }
    }
    var obj = {
        appId: this.appId,
        eventName: eventName,
        properties: this.formatPropertiesTimeZone(properties),
        eventId: eventId,
        time: this.getTimeStamp(time),
        timeZone: timeZone
    };
    RNThinkingAnalyticsModule.trackUpdate(obj);
}

/**
* 上报可覆盖事件（以最新数据覆盖历史）
* @param eventName 事件名
* @param properties 事件属性
* @param eventId 事件 ID
*/
ThinkingAnalyticsAPI.prototype.trackOverwrite = function (eventName, properties, eventId, time, timeZone) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] queueing data, overwriteEventName: " + eventName + ", properties: " + JSON.stringify(properties) + ", eventId: " + eventId);
        }
        this.httpRequest({
            type: 'track_overwrite',
            event: eventName,
            properties: properties,
            extraId: eventId
        });
        return;
    }

    if (properties === null || properties === undefined) {
        properties = {};
    }

    if (this.dynamicProperties) {
        var dProperties = this.dynamicProperties()
        for (var key in dProperties) {
            properties[key] = dProperties[key];
        }
    }
    var obj = {
        appId: this.appId,
        eventName: eventName,
        properties: this.formatPropertiesTimeZone(properties),
        eventId: eventId,
        time: this.getTimeStamp(time),
        timeZone: timeZone
    };
    RNThinkingAnalyticsModule.trackOverwrite(obj);
}

/**
 * 记录事件时长，上传目标事件时附加 #duration（秒）
 *
 * @param eventName 目标事件名
 */
ThinkingAnalyticsAPI.prototype.timeEvent = function (eventName) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] timeEvent: " + eventName);
        }
        var event_timers = this['ThinkingAnalyticsSource']['event_timers'];
        if (event_timers === null || event_timers === undefined || typeof event_timers !== "object") {
            event_timers = {};
        }
        event_timers[eventName] = new Date().getTime();
        this['ThinkingAnalyticsSource']['event_timers'] = event_timers;
        return;
    }


    var obj = {
        appId: this.appId,
        eventName: eventName
    };
    RNThinkingAnalyticsModule.timeEvent(obj);
}

/**
 * 设置账号 ID（覆盖旧值，不会触发登录事件）
 *
 * @param loginId 账号 ID
 */
ThinkingAnalyticsAPI.prototype.login = function (loginId) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] login: " + loginId);
        }
        this['ThinkingAnalyticsSource']['login_id'] = loginId;
        taSetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_login_id', loginId);
        return;
    }

    var obj = {
        appId: this.appId,
        loginId: loginId
    };
    RNThinkingAnalyticsModule.login(obj);
}

/**
 * 清空账号 ID（不触发登出事件）
 */
ThinkingAnalyticsAPI.prototype.logout = function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] logout");
        }
        this['ThinkingAnalyticsSource']['login_id'] = null;
        taSetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_login_id', "");
        return;
    }

    var obj = {
        appId: this.appId,
    };
    RNThinkingAnalyticsModule.logout(obj);
}

/**
 * 设置用户属性，存在则覆盖
 *
 * @param properties 用户属性
 */
ThinkingAnalyticsAPI.prototype.userSet = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_set',
            properties: properties,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.userSet(obj);
}

/**
 * 删除用户属性
 *
 * @param properties 用户属性
 */
ThinkingAnalyticsAPI.prototype.userUnset = function (property) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        var dic = {};
        if (property === null || property === undefined || typeof property !== 'string' || property === "") {
            dic = {};
        } else {
            dic[property] = 0;
        }
        this.httpRequest({
            type: 'user_unset',
            properties: dic,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        property: this.formatPropertiesTimeZone(property)
    };
    RNThinkingAnalyticsModule.userUnset(obj);
}

/**
 * 仅在属性不存在时设置用户属性
 *
 * @param property 用户属性
 */
ThinkingAnalyticsAPI.prototype.userSetOnce = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_setOnce',
            properties: properties,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.userSetOnce(obj);
}

/**
 * 数值属性累加
 *
 * @param property 用户属性
 */
ThinkingAnalyticsAPI.prototype.userAdd = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_add',
            properties: this.formatPropertiesTimeZone(properties)
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: properties
    };
    RNThinkingAnalyticsModule.userAdd(obj);
}

/**
 * 删除用户（不可恢复，谨慎调用）
 */
ThinkingAnalyticsAPI.prototype.userDel = function () {


    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_del'
        });
        return;
    }

    var obj = {
        appId: this.appId
    };
    RNThinkingAnalyticsModule.userDel(obj);
}

/**
 * 向 List 类型属性追加
 *
 * @param properties 用户属性
 */
ThinkingAnalyticsAPI.prototype.userAppend = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_append',
            properties: properties,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.userAppend(obj);
}

/**
 * 向 List 类型属性追加（去重）
 *
 * @param property 用户属性
 */
ThinkingAnalyticsAPI.prototype.userUniqAppend = function (properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        this.httpRequest({
            type: 'user_uniq_append',
            properties: properties,
        });
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.userUniqAppend(obj);
}

/**
 * 设置公共属性，后续事件自动携带
 *
 * @param properties 公共属性
 */
ThinkingAnalyticsAPI.prototype.setSuperProperties = function (properties) {
    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (properties === null || properties === undefined || typeof properties !== 'object') {
            return;
        }
        this['ThinkingAnalyticsSource']['super_properties'] = properties;
        return;
    }

    var obj = {
        appId: this.appId,
        properties: this.formatPropertiesTimeZone(properties)
    };
    RNThinkingAnalyticsModule.setSuperProperties(obj);
}

/**
 * 清除单个公共属性
 *
 * @param property 需要清除的属性名
 */
ThinkingAnalyticsAPI.prototype.unsetSuperProperty = function (property) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] unsetSuperProperty: " + property);
        }
        var properties = this['ThinkingAnalyticsSource']['super_properties'];
        if (properties === null || properties === undefined || typeof properties !== 'object') {
            return;
        }
        if (property === null || property === undefined || typeof property !== 'string') {
            return;
        }
        if (properties.hasOwnProperty(property) === true) {
            delete properties[property];
        }
        return;
    }

    var obj = {
        appId: this.appId,
        property: property
    };
    RNThinkingAnalyticsModule.unsetSuperProperty(obj);
}

/**
 * 清除全部公共属性
 */
ThinkingAnalyticsAPI.prototype.clearSuperProperties = function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] clearSuperProperties");
        }
        this['ThinkingAnalyticsSource']['super_properties'] = {};
        return;
    }

    var obj = {
        appId: this.appId
    };
    RNThinkingAnalyticsModule.clearSuperProperties(obj);
}

/**
 * 设置访客 ID，替换默认 UUID
 *
 * @param distinctId 访客 ID
 */
ThinkingAnalyticsAPI.prototype.identify = function (distinctId) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] identify: " + distinctId);
        }
        this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
        taSetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id', distinctId);
        return;
    }

    var obj = {
        appId: this.appId,
        distinctId: distinctId
    };
    RNThinkingAnalyticsModule.identify(obj);
}

/**
 * 立即尝试上报缓存队列，成功则清除缓存
 */
ThinkingAnalyticsAPI.prototype.flush = function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] flush ");
        }
        return;
    }

    var obj = {
        appId: this.appId
    };
    RNThinkingAnalyticsModule.flush(obj);
}

/**
 * 启用自动采集
 * @param {*} autoList 自动采集类型
 */
ThinkingAnalyticsAPI.prototype.enableAutoTrack = function (autoList,properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            var autoListString = "";
            if (Array.isArray(autoList)) {
                autoList.forEach(element => {
                    if (element === AutoTrackEventType.APP_START) {
                        autoListString += " APP_START"
                    } else if (element === AutoTrackEventType.APP_END) {
                        autoListString += " APP_END"
                    } else if (element === AutoTrackEventType.APP_CRASH) {
                        autoListString += " APP_CRASH"
                    } else if (element === AutoTrackEventType.APP_INSTALL) {
                        autoListString += " APP_INSTALL"
                    }
                });
            } else {
                autoListString = autoList;
            }

            console.log("[THINKING] enableAutoTrack: " + autoListString);
        }
        return;
    }

    var obj = {
        appId: this.appId,
        autoTrackType: autoList,
        properties:properties
    };
    RNThinkingAnalyticsModule.enableAutoTrack(obj);
    
}

/**
 * 时间校准（时间戳）
 * @param {*} time 毫秒时间戳
 */
ThinkingAnalyticsAPI.prototype.calibrateTime = function (time) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] calibrateTime: " + time);
        }
        return;
    }

    var obj = {
        timeStampMillis: time
    }
    RNThinkingAnalyticsModule.calibrateTime(obj);
}

/**
 * 时间校准（NTP）
 * @param {*} ntp_server NTP 服务器
 */
ThinkingAnalyticsAPI.prototype.calibrateTimeWithNtp = function (ntp_server) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] calibrateTimeWithNtp: " + ntp_server);
        }
        return;
    }

    var obj = {
        ntp_server: ntp_server
    }
    RNThinkingAnalyticsModule.calibrateTimeWithNtp(obj);
}

/**
 * 三方数据同步
 * @param {*} thirdList 三方列表
 */
ThinkingAnalyticsAPI.prototype.enableThirdPartySharing = function (types, params) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] enableThirdPartySharing");
        }
        return;
    }

    var obj = {
        appId: this.appId,
        types: types,
        params: params
    };
    RNThinkingAnalyticsModule.enableThirdPartySharing(obj);
}

/**
 * 切换上报状态 
 *
 * @param status 上报状态
 */
ThinkingAnalyticsAPI.prototype.setTrackStatus = function (status) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (teEnableShowLog) {
            console.log("[THINKING] setTrackStatus: " + status);
        }
        this['ThinkingAnalyticsSource']['trackStatus'] = status;
        return;
    }

    var obj = {
        appId: this.appId,
        status: status
    };
    RNThinkingAnalyticsModule.setTrackStatus(obj);
}

/**
 * 获取预置属性
 */
ThinkingAnalyticsAPI.prototype.getPresetProperties = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        var time = new Date();
        let zoneOffset = 0 - (time.getTimezoneOffset() / 60.0);
        if (this['ThinkingAnalyticsSource']['zoneOffset']) {
            zoneOffset = this['ThinkingAnalyticsSource']['zoneOffset'];
        }
        var sdkos = Platform.OS;
        if (sdkos === 'ios') {
            sdkos = 'iOS';
        } else if (sdkos === 'android') {
            sdkos = 'Android';
        }
        return {
            '#os': sdkos,
            '#lib_version': TESDKVERSION,
            '#lib': 'ReactNative',
            '#zone_offset': zoneOffset,
        };
    }

    var obj = {
        appId: this.appId
    };
    return await RNThinkingAnalyticsModule.getPresetProperties(obj);
}
/**
 * 获取静态公共属性
 */
ThinkingAnalyticsAPI.prototype.getSuperProperties = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {

        return this['ThinkingAnalyticsSource']['super_properties'];
    }

    var obj = {
        appId: this.appId
    };
    return await RNThinkingAnalyticsModule.getSuperProperties(obj);
}

/**
 * 获取访客 ID
 * @returns distinctId
 */
ThinkingAnalyticsAPI.prototype.getDistinctId = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        var distinctId = this['ThinkingAnalyticsSource']['distinct_id'];
        if (distinctId === null || distinctId === undefined || typeof distinctId !== 'string' || distinctId === "") {
            distinctId = await taGetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id');
            this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
            if (distinctId === null || distinctId === undefined || typeof distinctId !== 'string' || distinctId === "") {
                distinctId = this.ta_UUIDv4()
                this['ThinkingAnalyticsSource']['distinct_id'] = distinctId;
                await taSetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_distinct_id', distinctId);
            }
        }
        return distinctId;
    }

    var obj = {
        appId: this.appId
    };
    return await RNThinkingAnalyticsModule.getDistinctId(obj);
}

ThinkingAnalyticsAPI.prototype.getAccountId = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        return "";
    }

    var obj = {
        appId: this.appId
    };
    return await RNThinkingAnalyticsModule.getAccountId(obj);
}

/**
 * 获取设备 ID
 * @returns deviceId
 */
ThinkingAnalyticsAPI.prototype.getDeviceId = async function () {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        var deviceId = this['ThinkingAnalyticsSource']['device_id'];
        if (deviceId === null || deviceId === undefined || typeof deviceId !== 'string' || deviceId === "") {
            deviceId = await taGetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_device_id');
            this['ThinkingAnalyticsSource']['device_id'] = deviceId;
        }
        if (deviceId === null || deviceId === undefined || typeof deviceId !== 'string' || deviceId === "") {
            deviceId = this.ta_UUIDv4();
            await taSetStorageItem(this['ThinkingAnalyticsSource']['appid'] + '_device_id', deviceId);
            this['ThinkingAnalyticsSource']['device_id'] = deviceId;
        }
        return deviceId;
    }

    var obj = {
        appId: this.appId
    };
    return await RNThinkingAnalyticsModule.getDeviceId(obj);
}

/**
 * 设置自动采集事件的附加属性
 */
ThinkingAnalyticsAPI.prototype.setAutoTrackProperties = function (types, properties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null || typeof RNThinkingAnalyticsModule.setAutoTrackProperties !== 'function') {
        if (teEnableShowLog) {
            console.log("[THINKING] setAutoTrackProperties: " + JSON.stringify(properties));
        }
        return;
    }

    var obj = {
        appId: this.appId,
        types: types,
        properties: properties
    };
    RNThinkingAnalyticsModule.setAutoTrackProperties(obj);
}

/**
 * 设置动态公共属性（每次事件都会调用）
 *
 * @param dynamicProperties 动态公共属性函数
 */
ThinkingAnalyticsAPI.prototype.setDynamicSuperProperties = function (dynamicProperties) {

    if (RNThinkingAnalyticsModule === undefined || RNThinkingAnalyticsModule === null) {
        if (typeof dynamicProperties === 'function') {
            this.dynamicProperties = dynamicProperties;
            this['ThinkingAnalyticsSource']['dynamicProperties'] = dynamicProperties;
        }
        return;
    }

    if (typeof dynamicProperties === 'function') {
        this.dynamicProperties = dynamicProperties;
    }
}

/**
 * 创建新实例
 * @param {*} config 初始化参数
 * @returns 新实例
 */
ThinkingAnalyticsAPI.prototype.initInstance = function (config) {
    var instance = new ThinkingAnalyticsAPI();
    instance.init(config);
    return instance;
}

var thinkingdata = new ThinkingAnalyticsAPI();

export { AutoTrackEventType, TAThirdPartyShareType, TATrackStatus };

export default thinkingdata;

package com.thinkingdataanalytics

import android.content.Context
import android.content.SharedPreferences
import android.text.TextUtils
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableMapKeySetIterator
import com.facebook.react.bridge.ReadableType
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import cn.thinkingdata.analytics.TDAnalytics
import cn.thinkingdata.analytics.TDAnalyticsAPI
import cn.thinkingdata.analytics.TDConfig
import cn.thinkingdata.analytics.TDPresetProperties
import cn.thinkingdata.analytics.model.TDFirstEventModel
import cn.thinkingdata.analytics.model.TDOverWritableEventModel
import cn.thinkingdata.analytics.model.TDUpdatableEventModel
import org.json.JSONArray
import org.json.JSONObject
import java.util.Date
import java.util.Locale
import java.util.TimeZone

@ReactModule(name = RNThinkingAnalyticsModule.MODULE_NAME)
class RNThinkingAnalyticsModule(private val reactCtx: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactCtx) {

    companion object {
        const val MODULE_NAME = "RNThinkingAnalyticsModule"
        private const val STORAGE_NAME = "thinkingdata_rn_storage"
    }

    private var isEnableAutoTrack = false
    private var isEnablePageView = false
    private var isEnableViewClick = false
    private val previewPageViewList = mutableListOf<JSONObject>()
    private var lastScreenName: String? = null
    private var mCurrentScreenName: String? = null
    private var mCurrentTitle: String? = null
    private val viewPropertiesMap: MutableMap<Int, TDViewProperties> = HashMap()

    override fun getName(): String = MODULE_NAME

    private fun getStorage(): SharedPreferences =
        reactCtx.getSharedPreferences(STORAGE_NAME, Context.MODE_PRIVATE)

    private fun convertToJSONObject(properties: ReadableMap?): JSONObject? {
        if (properties == null) return null
        var json = JSONObject()
        try {
            json = JSONObject(properties.toString()).getJSONObject("NativeMap")
        } catch (e: Exception) {
            try {
                json = JSONObject(properties.toString())
            } catch (_: Exception) {
            }
        }
        return json
    }

    private fun getTimeZone(timeZoneOffset: Double): TimeZone {
        if (timeZoneOffset < -12 || timeZoneOffset > 14) {
            return TimeZone.getDefault()
        }
        var hour = timeZoneOffset.toInt()
        var minute = Math.round((timeZoneOffset - hour) * 60).toInt()
        if (minute >= 60) {
            hour += 1
            minute -= 60
        } else if (minute <= -60) {
            hour -= 1
            minute += 60
        }
        val timeZoneId = String.format(
            Locale.ROOT,
            if (hour >= 0) "GMT+%02d:%02d" else "GMT%02d:%02d",
            hour,
            Math.abs(minute)
        )
        return TimeZone.getTimeZone(timeZoneId)
    }

    @ReactMethod
    fun init(readableMap: ReadableMap, libVersion: String) {
        try {
            val appId = readableMap.getString("appId")
            val serverUrl = readableMap.getString("serverUrl")
            if (appId.isNullOrEmpty() || serverUrl.isNullOrEmpty()) return
            val config = TDConfig.getInstance(reactCtx, appId, serverUrl)
            if (readableMap.hasKey("timeZone")) {
                val timeZone = readableMap.getDouble("timeZone")
                config.defaultTimeZone = getTimeZone(timeZone)
            }
            if (readableMap.hasKey("mode")) {
                when (val mode = readableMap.getString("mode")) {
                    "debug" -> config.mode = TDConfig.TDMode.DEBUG
                    "debugOnly" -> config.mode = TDConfig.TDMode.DEBUG_ONLY
                }
            }
            if (readableMap.hasKey("enableEncrypt") && readableMap.hasKey("secretKey")) {
                val enableEncrypt = readableMap.getBoolean("enableEncrypt")
                if (enableEncrypt) {
                    readableMap.getMap("secretKey")?.let { secretKey ->
                        config.enableEncrypt(secretKey.getInt("version"), secretKey.getString("publicKey"))
                    }
                }
            }
            if (readableMap.hasKey("enableLog")) {
                val enableLog = readableMap.getBoolean("enableLog")
                TDAnalytics.enableLog(enableLog)
            }
            TDAnalytics.setCustomerLibInfo("ReactNative", libVersion)
            TDAnalytics.init(config)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun track(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val eventName = readableMap.getString("eventName")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            var date: Date? = null
            var timeZone: TimeZone? = null
            if (readableMap.hasKey("time")) {
                val time = readableMap.getDouble("time").toLong()
                if (time > 0) {
                    date = Date(time)
                }
            }
            if (readableMap.hasKey("timeZone")) {
                val zoneOffset = readableMap.getDouble("timeZone")
                timeZone = getTimeZone(zoneOffset)
            }
            if (date != null && timeZone != null) {
                TDAnalyticsAPI.track(eventName, properties, date, timeZone, appId)
            } else {
                TDAnalyticsAPI.track(eventName, properties, appId)
            }
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun trackUpdate(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val eventName = readableMap.getString("eventName")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            val eventId = readableMap.getString("eventId")
            var date: Date? = null
            var timeZone: TimeZone? = null
            if (readableMap.hasKey("time")) {
                val time = readableMap.getDouble("time").toLong()
                if (time > 0) {
                    date = Date(time)
                }
            }
            if (readableMap.hasKey("timeZone")) {
                val zoneOffset = readableMap.getDouble("timeZone")
                timeZone = getTimeZone(zoneOffset)
            }
            val model = TDUpdatableEventModel(eventName, properties, eventId)
            if (date != null && timeZone != null) {
                model.setEventTime(date, timeZone)
            }
            TDAnalyticsAPI.track(model, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun trackOverwrite(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val eventName = readableMap.getString("eventName")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            val eventId = readableMap.getString("eventId")
            var date: Date? = null
            var timeZone: TimeZone? = null
            if (readableMap.hasKey("time")) {
                val time = readableMap.getDouble("time").toLong()
                if (time > 0) {
                    date = Date(time)
                }
            }
            if (readableMap.hasKey("timeZone")) {
                val zoneOffset = readableMap.getDouble("timeZone")
                timeZone = getTimeZone(zoneOffset)
            }
            val model = TDOverWritableEventModel(eventName, properties, eventId)
            if (date != null && timeZone != null) {
                model.setEventTime(date, timeZone)
            }
            TDAnalyticsAPI.track(model, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun trackFirstEvent(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val eventName = readableMap.getString("eventName")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            val eventId = readableMap.getString("eventId")
            var date: Date? = null
            var timeZone: TimeZone? = null
            if (readableMap.hasKey("time")) {
                val time = readableMap.getDouble("time").toLong()
                if (time > 0) {
                    date = Date(time)
                }
            }
            if (readableMap.hasKey("timeZone")) {
                val zoneOffset = readableMap.getDouble("timeZone")
                timeZone = getTimeZone(zoneOffset)
            }
            val model = TDFirstEventModel(eventName, properties)
            model.firstCheckId = eventId
            if (date != null && timeZone != null) {
                model.setEventTime(date, timeZone)
            }
            TDAnalyticsAPI.track(model, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun timeEvent(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            if (readableMap.hasKey("eventName")) {
                val eventName = readableMap.getString("eventName")
                TDAnalyticsAPI.timeEvent(eventName, appId)
            }
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun login(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val loginId = readableMap.getString("loginId")
            TDAnalyticsAPI.login(loginId, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun logout(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            TDAnalyticsAPI.logout(appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun userSet(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            TDAnalyticsAPI.userSet(properties, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun userUnset(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val property = readableMap.getString("property")
            TDAnalyticsAPI.userUnset(property, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun userSetOnce(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            TDAnalyticsAPI.userSetOnce(properties, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun userAdd(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            TDAnalyticsAPI.userAdd(properties, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun userDel(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            TDAnalyticsAPI.userDelete(appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun userAppend(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            TDAnalyticsAPI.userAppend(properties, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun setSuperProperties(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            TDAnalyticsAPI.setSuperProperties(properties, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun unsetSuperProperty(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val property = readableMap.getString("property")
            TDAnalyticsAPI.unsetSuperProperty(property, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun clearSuperProperties(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            TDAnalyticsAPI.clearSuperProperties(appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun identify(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val distinctId = readableMap.getString("distinctId")
            TDAnalyticsAPI.setDistinctId(distinctId, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun flush(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            TDAnalyticsAPI.flush(appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun enableAutoTrack(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val types = readableMap.getDouble("autoTrackType").toInt()
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            TDAnalyticsAPI.enableAutoTrack(types, properties, appId)
            isEnableAutoTrack = true
            if (types and TDAnalytics.TDAutoTrackEventType.APP_VIEW_SCREEN > 0) {
                isEnablePageView = true
                previewPageViewList.forEach { TDAnalytics.track("ta_app_view", it) }
                previewPageViewList.clear()
            } else {
                isEnablePageView = false
                previewPageViewList.clear()
            }
            isEnableViewClick = types and TDAnalytics.TDAutoTrackEventType.APP_CLICK > 0
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun calibrateTime(readableMap: ReadableMap) {
        try {
            val timeStampMillis = readableMap.getDouble("timeStampMillis")
            TDAnalytics.calibrateTime(timeStampMillis.toLong())
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun calibrateTimeWithNtp(readableMap: ReadableMap) {
        try {
            val ntpServer = readableMap.getString("ntp_server")
            TDAnalytics.calibrateTimeWithNtp(ntpServer)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun enableThirdPartySharing(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            if (readableMap.hasKey("types")) {
                val types = readableMap.getDouble("types").toInt()
                val maps = readableMap.getMap("params")
                if (maps == null) {
                    TDAnalyticsAPI.enableThirdPartySharing(types, appId)
                } else {
                    TDAnalyticsAPI.enableThirdPartySharing(types, maps.toHashMap(), appId)
                }
            }
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun userUniqAppend(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            val properties = convertToJSONObject(readableMap.getMap("properties"))
            TDAnalyticsAPI.userUniqAppend(properties, appId)
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun setTrackStatus(readableMap: ReadableMap) {
        try {
            val appId = readableMap.getString("appId")
            when (readableMap.getString("status")) {
                "pause" -> TDAnalyticsAPI.setTrackStatus(TDAnalytics.TDTrackStatus.PAUSE, appId)
                "stop" -> TDAnalyticsAPI.setTrackStatus(TDAnalytics.TDTrackStatus.STOP, appId)
                "saveOnly" -> TDAnalyticsAPI.setTrackStatus(TDAnalytics.TDTrackStatus.SAVE_ONLY, appId)
                else -> TDAnalyticsAPI.setTrackStatus(TDAnalytics.TDTrackStatus.NORMAL, appId)
            }
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun getPresetProperties(readableMap: ReadableMap, promise: Promise) {
        try {
            val appId = readableMap.getString("appId")
            val presetProperties = TDAnalyticsAPI.getPresetProperties(appId)
            promise.resolve(convertToMap(presetProperties.toEventPresetProperties()))
        } catch (e: Exception) {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun getSuperProperties(readableMap: ReadableMap, promise: Promise) {
        try {
            val appId = readableMap.getString("appId")
            val superProperties = TDAnalyticsAPI.getSuperProperties(appId)
            promise.resolve(convertToMap(superProperties))
        } catch (_: Exception) {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun getDistinctId(readableMap: ReadableMap, promise: Promise) {
        try {
            val appId = readableMap.getString("appId")
            val distinctId = TDAnalyticsAPI.getDistinctId(appId)
            promise.resolve(distinctId)
        } catch (_: Exception) {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun getAccountId(readableMap: ReadableMap, promise: Promise) {
        try {
            val appId = readableMap.getString("appId")
            val accountId = TDAnalyticsAPI.getAccountId(appId)
            promise.resolve(accountId)
        } catch (_: Exception) {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun getDeviceId(readableMap: ReadableMap, promise: Promise) {
        try {
            val appId = readableMap.getString("appId")
            val deviceId = TDAnalyticsAPI.getDeviceId(appId)
            promise.resolve(deviceId)
        } catch (_: Exception) {
            promise.resolve(null)
        }
    }

    @ReactMethod
    fun trackViewScreen(params: ReadableMap) {
        try {
            val json = convertToJSONObject(params) ?: return
            val tdUrl = json.optString("thinkingdataurl")
            var properties = json.optJSONObject("thinkingdataparams")
            if (properties == null) {
                properties = JSONObject()
            }
            val isIgnore = properties.optBoolean("TDIgnoreViewScreen")
            if (isIgnore) return
            properties.remove("TDIgnoreViewScreen")
            if (!properties.has("#title")) {
                properties.put("#title", tdUrl)
            }
            if (!TextUtils.isEmpty(lastScreenName)) {
                properties.put("#referrer", lastScreenName)
            }
            if (!properties.has("#screen_name")) {
                lastScreenName = tdUrl
                properties.put("#screen_name", tdUrl)
            } else {
                lastScreenName = properties.optString("#screen_name")
            }
            mCurrentTitle = properties.optString("#title")
            mCurrentScreenName = properties.optString("#screen_name")
            if (isEnableAutoTrack) {
                if (isEnablePageView) {
                    TDAnalytics.track("ta_app_view", properties)
                }
            } else {
                if (previewPageViewList.size < 5) {
                    previewPageViewList.add(properties)
                }
            }
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun trackViewClick(viewId: Int) {
        try {
            if (!isEnableViewClick) return
            val viewInfo = viewPropertiesMap[viewId]
            if (viewInfo != null && !viewInfo.isIgnore) {
                if (viewInfo.params == null) {
                    viewInfo.params = JSONObject()
                }
                viewInfo.params?.put("#element_content", viewInfo.elementContent)
                viewInfo.params?.put("#title", mCurrentTitle)
                viewInfo.params?.put("#screen_name", mCurrentScreenName)
                TDAnalytics.track("ta_app_click", viewInfo.params)
            }
        } catch (_: Exception) {
        }
    }

    @ReactMethod
    fun saveViewProperties(viewId: Int, title: String?, viewProperties: ReadableMap?) {
        viewPropertiesMap[viewId] = TDViewProperties(title ?: "", readMapToJson(viewProperties))
    }

    @ReactMethod
    fun getStorageItem(key: String?, promise: Promise) {
        try {
            promise.resolve(getStorage().getString(key, null))
        } catch (e: Exception) {
            promise.reject("TA_STORAGE_GET", e)
        }
    }

    @ReactMethod
    fun setStorageItem(key: String?, value: String?, promise: Promise) {
        try {
            val editor = getStorage().edit()
            if (value == null) {
                editor.remove(key)
            } else {
                editor.putString(key, value)
            }
            editor.apply()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("TA_STORAGE_SET", e)
        }
    }

    private fun readMapToJson(map: ReadableMap?): JSONObject {
        val params = JSONObject()
        if (map == null) return params
        try {
            val iterator: ReadableMapKeySetIterator = map.keySetIterator()
            while (iterator.hasNextKey()) {
                val key = iterator.nextKey()
                when (map.getType(key)) {
                    ReadableType.Map -> {
                        val newMap = map.getMap(key)
                        if (newMap != null) {
                            params.put(key, readMapToJson(newMap))
                        }
                    }

                    ReadableType.String -> params.put(key, map.getString(key))
                    ReadableType.Boolean -> params.put(key, map.getBoolean(key))
                    ReadableType.Number -> params.put(key, map.getDouble(key))
                    ReadableType.Array -> {
                        val newArray = map.getArray(key)
                        if (newArray != null) {
                            params.put(key, readArrayToJsonArray(newArray))
                        }
                    }

                    else -> {}
                }
            }
        } catch (_: Exception) {
        }
        return params
    }

    private fun readArrayToJsonArray(array: ReadableArray?): JSONArray {
        val list = JSONArray()
        if (array == null) return list
        try {
            for (i in 0 until array.size()) {
                when (array.getType(i)) {
                    ReadableType.Map -> list.put(readMapToJson(array.getMap(i)))
                    ReadableType.String -> list.put(array.getString(i))
                    ReadableType.Boolean -> list.put(array.getBoolean(i))
                    ReadableType.Number -> list.put(array.getDouble(i))
                    ReadableType.Array -> list.put(readArrayToJsonArray(array.getArray(i)))
                    else -> {}
                }
            }
        } catch (e: Exception) {
            throw RuntimeException(e)
        }
        return list
    }

    private fun convertToMap(json: JSONObject?): WritableMap {
        if (json == null || json.length() == 0) {
            return Arguments.createMap()
        }
        val writableMap = Arguments.createMap()
        val it = json.keys()
        while (it.hasNext()) {
            try {
                val key = it.next()
                writableMap.putString(key, json.optString(key))
            } catch (_: Exception) {
            }
        }
        return writableMap
    }
}

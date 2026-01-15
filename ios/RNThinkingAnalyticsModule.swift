import Foundation
import React
import ThinkingSDK

@objc(RNThinkingAnalyticsModule)
class RNThinkingAnalyticsModule: NSObject, RCTBridgeModule {
    static func moduleName() -> String! {
        return "RNThinkingAnalyticsModule"
    }

    static func requiresMainQueueSetup() -> Bool {
        return false
    }

    private var isEnableAutoTrack: Bool = false
    private var isEnablePageView: Bool = false
    private var isEnableViewClick: Bool = false
    private var previewPageViewList: [NSDictionary] = []
    private var lastScreenName: String = ""
    private var mCurrentScreenName: String = ""
    private var mCurrentTitle: String = ""
    private var viewPropertiesMap: [NSNumber: [String: Any]] = [:]

    private func getTimeZone(_ number: NSNumber?) -> TimeZone {
        guard let number = number else { return TimeZone.current }
        let hoursOffset = number.doubleValue
        let secondsOffset = hoursOffset * 3600
        return TimeZone(secondsFromGMT: Int(secondsOffset)) ?? TimeZone.current
    }

    // MARK: - 初始化
    @objc(init:libVersion:)
    func `init`(_ options: NSDictionary, libVersion: String) {
        do {
            let config = TDConfig()
            config.appid = options["appId"] as? String
            config.serverUrl = options["serverUrl"] as? String
            if let mode = options["mode"] as? String {
                if mode == "debug" {
                    config.mode = TDModeDebug
                } else if mode == "debugOnly" {
                    config.mode = TDModeDebugOnly
                }
            }
            if let tz = options["timeZone"] as? NSNumber {
                config.defaultTimeZone = getTimeZone(tz)
            }
            if let enableEncrypt = options["enableEncrypt"] as? Bool,
               enableEncrypt,
               let secretKey = options["secretKey"] as? NSDictionary,
               let version = secretKey["version"] as? NSNumber,
               let publicKey = secretKey["publicKey"] as? String {
                config.enableEncrypt(withVersion: version.uintValue, publicKey: publicKey)
            }
            if let enableLog = options["enableLog"] as? NSNumber {
                TDAnalytics.enableLog(enableLog.boolValue)
            }
            TDAnalytics.setCustomerLibInfo(withLibName: "ReactNative", libVersion: libVersion)
            TDAnalytics.startAnalytics(with: config)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    // MARK: - 事件埋点
    @objc(track:)
    func track(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            let eventName = options["eventName"] as? String
            let properties = options["properties"] as? [String: Any]
            var date: Date?
            var timeZone: TimeZone?
            if let time = options["time"] as? NSNumber, time.doubleValue > 0 {
                date = Date(timeIntervalSince1970: time.doubleValue / 1000.0)
            }
            if let tz = options["timeZone"] as? NSNumber {
                timeZone = getTimeZone(tz)
            }
            TDAnalytics.track(eventName, properties: properties, time: date, timeZone: timeZone, withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(trackUpdate:)
    func trackUpdate(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            let eventName = options["eventName"] as? String
            let eventId = options["eventId"] as? String
            let model = TDUpdateEventModel(eventName: eventName, eventID: eventId)
            model?.properties = options["properties"] as? [String: Any]
            var date: Date?
            var timeZone: TimeZone?
            if let time = options["time"] as? NSNumber, time.doubleValue > 0 {
                date = Date(timeIntervalSince1970: time.doubleValue / 1000.0)
            }
            if let tz = options["timeZone"] as? NSNumber {
                timeZone = getTimeZone(tz)
            }
            model?.configTime(date, timeZone: timeZone)
            TDAnalytics.track(with: model, withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(trackOverwrite:)
    func trackOverwrite(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            let eventName = options["eventName"] as? String
            let eventId = options["eventId"] as? String
            let model = TDOverwriteEventModel(eventName: eventName, eventID: eventId)
            model?.properties = options["properties"] as? [String: Any]
            var date: Date?
            var timeZone: TimeZone?
            if let time = options["time"] as? NSNumber, time.doubleValue > 0 {
                date = Date(timeIntervalSince1970: time.doubleValue / 1000.0)
            }
            if let tz = options["timeZone"] as? NSNumber {
                timeZone = getTimeZone(tz)
            }
            model?.configTime(date, timeZone: timeZone)
            TDAnalytics.track(with: model, withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(trackFirstEvent:)
    func trackFirstEvent(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            let eventName = options["eventName"] as? String
            let eventId = options["eventId"] as? String
            let model = TDFirstEventModel(eventName: eventName, firstCheckID: eventId)
            model?.properties = options["properties"] as? [String: Any]
            var date: Date?
            var timeZone: TimeZone?
            if let time = options["time"] as? NSNumber, time.doubleValue > 0 {
                date = Date(timeIntervalSince1970: time.doubleValue / 1000.0)
            }
            if let tz = options["timeZone"] as? NSNumber {
                timeZone = getTimeZone(tz)
            }
            model?.configTime(date, timeZone: timeZone)
            TDAnalytics.track(with: model, withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(timeEvent:)
    func timeEvent(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            let eventName = options["eventName"] as? String
            TDAnalytics.timeEvent(eventName, withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(login:)
    func login(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            let loginId = options["loginId"] as? String
            TDAnalytics.login(loginId, withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(logout:)
    func logout(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.logout(withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(userSet:)
    func userSet(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.userSet(options["properties"] as? [String: Any], withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(userUnset:)
    func userUnset(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.userUnset(options["property"] as? String, withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(userSetOnce:)
    func userSetOnce(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.userSetOnce(options["properties"] as? [String: Any], withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(userAdd:)
    func userAdd(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.userAdd(options["properties"] as? [String: Any], withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(userDel:)
    func userDel(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.userDelete(withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(userAppend:)
    func userAppend(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.userAppend(options["properties"] as? [String: Any], withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(userUniqAppend:)
    func userUniqAppend(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.userUniqAppend(options["properties"] as? [String: Any], withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(setSuperProperties:)
    func setSuperProperties(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.setSuperProperties(options["properties"] as? [String: Any], withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(unsetSuperProperty:)
    func unsetSuperProperty(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.unsetSuperProperty(options["property"] as? String, withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(clearSuperProperties:)
    func clearSuperProperties(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.clearSuperProperties(withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(identify:)
    func identify(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            let distinctId = options["distinctId"] as? String
            TDAnalytics.identify(distinctId, withAppId: appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(flush:)
    func flush(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            TDAnalytics.flush(appId)
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(enableAutoTrack:)
    func enableAutoTrack(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            let types = (options["autoTrackType"] as? NSNumber)?.intValue ?? 0
            let properties = options["properties"] as? [String: Any]
            TDAnalytics.enableAutoTrack(types, properties: properties, withAppId: appId)
            isEnableAutoTrack = true
            if types & TDAnalytics.TDAutoTrackEventType.APP_VIEW_SCREEN.rawValue > 0 {
                isEnablePageView = true
                previewPageViewList.prefix(5).forEach { TDAnalytics.track("ta_app_view", properties: $0 as? [String: Any]) }
                previewPageViewList.removeAll()
            } else {
                isEnablePageView = false
                previewPageViewList.removeAll()
            }
            isEnableViewClick = types & TDAnalytics.TDAutoTrackEventType.APP_CLICK.rawValue > 0
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(calibrateTime:)
    func calibrateTime(_ options: NSDictionary) {
        do {
            if let ts = options["timeStampMillis"] as? NSNumber {
                TDAnalytics.calibrateTime(ts.int64Value)
            }
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(calibrateTimeWithNtp:)
    func calibrateTimeWithNtp(_ options: NSDictionary) {
        do {
            if let ntp = options["ntp_server"] as? String {
                TDAnalytics.calibrateTime(withNtp: ntp)
            }
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(enableThirdPartySharing:)
    func enableThirdPartySharing(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            if let types = options["types"] as? NSNumber {
                if let params = options["params"] as? [AnyHashable: Any] {
                    TDAnalytics.enableThirdPartySharing(types.intValue, options: params, withAppId: appId)
                } else {
                    TDAnalytics.enableThirdPartySharing(types.intValue, withAppId: appId)
                }
            }
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(setTrackStatus:)
    func setTrackStatus(_ options: NSDictionary) {
        do {
            let appId = options["appId"] as? String
            guard let status = options["status"] as? String else { return }
            switch status {
            case "pause":
                TDAnalytics.setTrackStatus(.pause, withAppId: appId)
            case "stop":
                TDAnalytics.setTrackStatus(.stop, withAppId: appId)
            case "saveOnly":
                TDAnalytics.setTrackStatus(.saveOnly, withAppId: appId)
            default:
                TDAnalytics.setTrackStatus(.normal, withAppId: appId)
            }
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    // MARK: - 获取属性（Promise）
    @objc(getPresetProperties:resolver:rejecter:)
    func getPresetProperties(_ options: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            let appId = options["appId"] as? String
            let preset = TDAnalytics.getPresetProperties(withAppId: appId)?.toEventPresetProperties()
            resolver(preset)
        } catch {
            resolver(nil)
        }
    }

    @objc(getSuperProperties:resolver:rejecter:)
    func getSuperProperties(_ options: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            let appId = options["appId"] as? String
            resolver(TDAnalytics.getSuperProperties(withAppId: appId))
        } catch {
            resolver(nil)
        }
    }

    @objc(getDistinctId:resolver:rejecter:)
    func getDistinctId(_ options: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            let appId = options["appId"] as? String
            resolver(TDAnalytics.getDistinctId(withAppId: appId))
        } catch {
            resolver(nil)
        }
    }

    @objc(getAccountId:resolver:rejecter:)
    func getAccountId(_ options: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            let appId = options["appId"] as? String
            resolver(TDAnalytics.getAccountId(withAppId: appId))
        } catch {
            resolver(nil)
        }
    }

    @objc(getDeviceId:resolver:rejecter:)
    func getDeviceId(_ options: NSDictionary, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            let appId = options["appId"] as? String
            if let appId = appId, !appId.isEmpty {
                resolver(TDAnalytics.getDeviceId(withAppId: appId))
            } else {
                resolver(TDAnalytics.getDeviceId())
            }
        } catch {
            resolver(nil)
        }
    }

    // MARK: - 页面追踪
    @objc(trackViewScreen:)
    func trackViewScreen(_ options: NSDictionary) {
        do {
            let tdUrl = options["thinkingdataurl"] as? String
            var properties = options["thinkingdataparams"] as? [String: Any] ?? [:]
            let isIgnore = (properties["TDIgnoreViewScreen"] as? Bool) ?? false
            if isIgnore { return }
            properties.removeValue(forKey: "TDIgnoreViewScreen")
            if properties["#title"] == nil, let tdUrl = tdUrl {
                properties["#title"] = tdUrl
            }
            if !lastScreenName.isEmpty {
                properties["#referrer"] = lastScreenName
            }
            if properties["#screen_name"] == nil, let tdUrl = tdUrl {
                lastScreenName = tdUrl
                properties["#screen_name"] = tdUrl
            } else if let screen = properties["#screen_name"] as? String {
                lastScreenName = screen
            }
            mCurrentTitle = (properties["#title"] as? String) ?? ""
            mCurrentScreenName = (properties["#screen_name"] as? String) ?? ""
            if isEnableAutoTrack {
                if isEnablePageView {
                    TDAnalytics.track("ta_app_view", properties: properties)
                }
            } else if previewPageViewList.count < 5 {
                previewPageViewList.append(properties as NSDictionary)
            }
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(trackViewClick:)
    func trackViewClick(_ viewId: NSNumber) {
        do {
            if !isEnableViewClick { return }
            if let dict = viewPropertiesMap[viewId], !(dict["isIgnore"] as? Bool ?? false) {
                var params = dict["params"] as? [String: Any] ?? [:]
                params["#element_content"] = dict["elementContent"]
                params["#title"] = mCurrentTitle
                params["#screen_name"] = mCurrentScreenName
                TDAnalytics.track("ta_app_click", properties: params)
            }
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(saveViewProperties:title:viewProperties:)
    func saveViewProperties(_ viewId: NSNumber, title: String?, viewProperties: NSDictionary?) {
        do {
            var mutableProps = viewProperties as? [String: Any] ?? [:]
            var isIgnore = false
            if let ignore = mutableProps["TDIgnoreViewClick"] as? Bool {
                isIgnore = ignore
                mutableProps.removeValue(forKey: "TDIgnoreViewClick")
            }
            viewPropertiesMap[viewId] = [
                "elementContent": title ?? "",
                "params": mutableProps,
                "isIgnore": isIgnore
            ]
        } catch {
            NSLog("[ThinkingAnalyticsSDK] error:%@", "\(error)")
        }
    }

    @objc(saveRootViewProperties:title:viewProperties:rootTag:)
    func saveRootViewProperties(_ viewId: NSNumber, title: String?, viewProperties: NSDictionary?, rootTag: NSNumber) {
        saveViewProperties(viewId, title: title, viewProperties: viewProperties)
    }

    // MARK: - 存储桥接
    @objc(getStorageItem:resolver:rejecter:)
    func getStorageItem(_ key: String?, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            let value = UserDefaults.standard.string(forKey: key ?? "")
            resolver(value ?? NSNull())
        } catch {
            rejecter("TA_STORAGE_GET", error.localizedDescription, nil)
        }
    }

    @objc(setStorageItem:value:resolver:rejecter:)
    func setStorageItem(_ key: String?, value: String?, resolver: RCTPromiseResolveBlock, rejecter: RCTPromiseRejectBlock) {
        do {
            let defaults = UserDefaults.standard
            if let value = value {
                defaults.set(value, forKey: key ?? "")
            } else {
                defaults.removeObject(forKey: key ?? "")
            }
            defaults.synchronize()
            resolver(true)
        } catch {
            rejecter("TA_STORAGE_SET", error.localizedDescription, nil)
        }
    }
}

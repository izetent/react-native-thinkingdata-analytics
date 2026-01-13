package com.thinkingdataanalytics

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.thinkingdataanalytics.RNThinkingAnalyticsModule
import java.util.HashMap

class ThinkingdataAnalyticsPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      ThinkingdataAnalyticsModule.NAME -> ThinkingdataAnalyticsModule(reactContext)
      RNThinkingAnalyticsModule.MODULE_NAME -> RNThinkingAnalyticsModule(reactContext)
      else -> null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      val moduleInfos: MutableMap<String, ReactModuleInfo> = HashMap()
      moduleInfos[ThinkingdataAnalyticsModule.NAME] = ReactModuleInfo(
        ThinkingdataAnalyticsModule.NAME,
        ThinkingdataAnalyticsModule.NAME,
        false,  // 是否可覆盖已有模块
        false,  // 是否需要提前初始化
        false,  // 是否 C++ 模块
        true // 是否 TurboModule
      )
      moduleInfos[RNThinkingAnalyticsModule.MODULE_NAME] = ReactModuleInfo(
        RNThinkingAnalyticsModule.MODULE_NAME,
        RNThinkingAnalyticsModule.MODULE_NAME,
        false,
        false,
        false,
        false // 传统模块
      )
      moduleInfos
    }
  }
}

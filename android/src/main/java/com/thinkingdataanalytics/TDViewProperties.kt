package com.thinkingdataanalytics

import org.json.JSONObject

class TDViewProperties(var elementContent: String, var params: JSONObject?) {
    var isIgnore: Boolean = false

    init {
        if (params == null) {
            params = JSONObject()
        }
        params?.let {
            if (it.has("TDIgnoreViewClick")) {
                isIgnore = it.optBoolean("TDIgnoreViewClick")
                it.remove("TDIgnoreViewClick")
            }
        }
    }
}

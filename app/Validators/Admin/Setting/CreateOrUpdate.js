'use strict'

class AdminSetting {
    get rules() {
        return {
            key: "required",
            value: "required",
        }
    }

    get sanitizationRules() {
        return {
            key: "trim",
            value: "trim"
        }
    }

    get messages() {
        return {
            "key.required": "Key không được trống",
            "value.required": "Giá trị không được trống",
        }
    }
}

module.exports = AdminSetting

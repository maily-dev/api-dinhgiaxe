'use strict'

class GetCarTypeByCondition {
    get rules() {
        return {
            year: "required|integer",
            model_id: "required|exists:03_02_car_models,id",
        }
    }

    get sanitizationRules() {
        return {
            year: "trim",
            model_id: "trim"
        }
    }

    get messages() {
        return {
            "year.required": "Hãng không được trống",
            "year.integer": "Năm phải kiểu số",
            "model_id.required": "Dòng xe không được trống",
            "model_id.exists": "Dòng xe không tồn tại",
        }
    }
}

module.exports = GetCarTypeByCondition

'use strict'

class CreateOrUpdate {
    get rules() {
        return {
            name: "required",
            model_id: "required|exists:03_02_car_models,id",
            car_type_id: "required|exists:03_03_car_types,id"
        }
    }

    get sanitizationRules() {
        return {
            name: "trim",
        }
    }

    get messages() {
        return {
            "name.required": "Tên không được trống",
            "model_id.required": "ID không được trống",
            "model_id.exists": "ID không đúng",
            "car_type_id.required": "ID không được trống",
            "car_type_id.exists": "ID không đúng",
        }
    }
}

module.exports = CreateOrUpdate

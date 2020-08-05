'use strict'

class CarModel {
    get rules() {
        return {
            brand_id: "required|exists:03_01_car_brands,id",
            name: "required|isExisted:03_02_car_models,name"
        }
    }

    get sanitizationRules() {
        return {
            brand_slug: "trim"
        }
    }

    get messages() {
        return {
            "name.required": "Tên dòng xe không được trống",
            "name.isExisted": "Tên dòng xe đã tồn tại",
            "brand_id.required": "Hãng không được trống",
            "brand_id.exists": "Hãng không tồn tại"
        }
    }
}

module.exports = CarModel

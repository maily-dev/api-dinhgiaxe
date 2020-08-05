'use strict'

class CarModel {
    get rules() {
        return {
            brand_slug: "required|exists:03_01_car_brands,slug"
        }
    }

    get sanitizationRules() {
        return {
            brand_slug: "trim"
        }
    }

    get messages() {
        return {
            "brand_slug.required": "Hãng không được trống",
            "brand_slug.exists": "Hãng không tồn tại",
        }
    }
}

module.exports = CarModel

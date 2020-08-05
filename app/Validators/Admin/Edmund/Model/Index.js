'use strict'

class CarModel {
    get rules() {
        return {
            brand_slug: "required|exists:car_brands,slug"
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
            "brand_slug.exists": "Hãng không tồn tại"
        }
    }
}

module.exports = CarModel

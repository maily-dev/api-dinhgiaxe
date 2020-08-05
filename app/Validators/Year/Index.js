'use strict'

class Index {
    get rules() {
        return {
            brand_slug: "required|exists:03_01_car_brands,slug",
            model_slug: "required|exists:03_02_car_models,slug",
        }
    }

    get sanitizationRules() {
        return {
            model_slug: "trim",
        }
    }

    get messages() {
        return {
            "brand_slug.required": "Hãng xe không được trống",
            "brand_slug.exists": "Hãng xe không tồn tại",
            "model_slug.required": "Dòng xe không được trống",
            "model_slug.exists": "Dòng xe không tồn tại",
        }
    }
}

module.exports = Index

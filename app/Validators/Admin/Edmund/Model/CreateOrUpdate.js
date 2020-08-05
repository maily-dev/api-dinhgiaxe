'use strict'

class CreateOrUpdate {
    get rules() {
        return {
            name: "required",
            brand_slug: "required|exists:car_brands,slug",
        }
    }

    get sanitizationRules() {
        return {
            name: "trim",
            brand_slug: "trim",
        }
    }

    get messages() {
        return {
            "name.required": "Tên không được trống",
            "brand_slug.exists": "Hãng không tồn tại",

        }
    }
}

module.exports = CreateOrUpdate

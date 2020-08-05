'use strict'

class GetCarTypeByCondition {
    get rules() {
        return {
            brand_slug: "required|exists:03_01_car_brands,slug",
            model_slug: "required|exists:03_02_car_models,slug",
            year: "required|integer|above:1970|under:3001",
        }
    }

    get sanitizationRules() {
        return {
            brand_slug: "trim",
            model_slug: "trim",
            year: "trim"
        }
    }

    get messages() {
        return {
            "brand_slug.required": "Hãng không được trống",
            "brand_slug.exists": "Hãng không tồn tại",
            "model_slug.required": "Dòng xe không được trống",
            "model_slug.exists": "Dòng xe không tồn tại",
            "year.required": "Năm không được trống",
            "year.integer": "Năm phải là kiểu số",
            "year.above": "Năm phải lớn hơn 1970",
            "year.under": "Năm lớn nhất 3000",
        }
    }
}

module.exports = GetCarTypeByCondition

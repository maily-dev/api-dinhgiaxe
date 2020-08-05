'use strict'

class CreateOrUpdate {
    get rules() {
        return {
            name: "required",
            image: 'file_ext:png,gif,jpg,jpeg|file_size:2mb|file_types:image,octet-stream',
            brand_slug: "required|exists:car_brands,slug",
            model_slug: "required|exists:car_models,slug",
            car_type_slug: "required|exists:car_types,slug",
            colors: "array",
        }
    }

    get sanitizationRules() {
        return {
            brand_slug: "trim",
            model_slug: "trim",
            car_type_slug: "trim",
        }
    }

    get messages() {
        return {
            "name.required": "Tên không được trống",
            "brand_slug.required": "Hãng không được trống",
            "brand_slug.exists": "Hãng không tồn tại",
            "model_slug.required": "Dòng xe không được trống",
            "model_slug.exists": "Dòng xe không tồn tại",
            "car_type_slug.required": "Kiểu xe không được trống",
            "car_type_slug.exists": "Kiểu xe không tồn tại",
        }
    }
}

module.exports = CreateOrUpdate

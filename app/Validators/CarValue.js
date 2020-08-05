"use strict"

class CarValue {
    get rules() {
        return {
            // brand_slug: "required|exists:03_01_car_brands,slug",
            // model_slug: "required|exists:03_02_car_models,slug",
            // attribute_slug: "required|exists:03_04_car_attributes,slug",
            // car_type_slug: "required|exists:03_03_car_types,slug",
            attribute_id: "required|exists:03_04_car_attributes,id",
            year: "required|number",
            mileage: "required|number|above:0|under:1000000",
            condition: 'required|in:excellent,very_good,good,bad'
        }
    }

    get sanitizationRules() {
        return {
            // brand_slug: "trim",
            // model_slug: "trim",
            // attribute_slug: "trim",
            attribute_id: "trim",
            car_type_slug: "trim",
            year: "trim",
            mileage: "trim",
        }
    }

    get messages() {
        return {
            // "brand_slug.required": "Hãng không được trống",
            // "brand_slug.exists": "Hãng không tồn tại",
            // "model_slug.required": "Dòng không được trống",
            // "model_slug.exists": "Dòng không tồn tại",
            // "car_type_slug.required": "Kiểu xe không được trống",
            "attribute_id.required": "Thuộc tính không được trống",
            "attribute_id.exists": "Thuộc tính không tồn tại",
            "year.required": "Năm không được trống",
            "year.number": "Năm phải là kiểu số",
            "mileage.required": "Số kilomet không được trống",
            "mileage.number": "Kilomet phải là kiểu số",
            "mileage.above": "Kilomet phải lớn hơn 0",
            "mileage.under": "Kilomet tối đa là 999999",
            "condition.required": "Tình trạng xe không được trống",
            "condition.in": "Tình trạng không đúng",
        }
    }
}

module.exports = CarValue

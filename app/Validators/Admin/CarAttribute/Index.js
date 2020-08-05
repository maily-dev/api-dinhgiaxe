'use strict'

class CarAttributeIndex {
    get rules() {
        return {
            brand_id: "exists:03_01_car_brands,id",
            model_id: "exists:03_02_car_models,id",
            car_type_id: "exists:03_03_car_types,id",
            sortBy: 'in:created_at,updated_at,name',
            sort: 'in:desc,asc',
            keyword: 'max:100'
        }
    }

    get sanitizationRules() {
        return {
            brand_id: "trim",
            model_id: "trim",
            car_type_id: "trim",
            sortBy: "trim",
            sort: "trim",
        }
    }

    get messages() {
        return {
            "brandID.exists": "Hãng không tồn tại",
            "modelID.exists": "Dòng xe không tồn tại",
            "carTypeID.exists": "Kiểu xe không tồn tại",
            "sortBy.in": "Sắp xếp theo cột: created_at, updated_at, name",
            "sort.in": "Sắp xếp theo: desc, asc",
            'keyword.max': 'Keyword không quá 100 từ'
        }
    }
}

module.exports = CarAttributeIndex

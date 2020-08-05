'use strict'

class CarModel {
    get rules() {
        return {
            // brandID: "required|exists:03_01_car_brands,id",
            brand_id: "exists:03_01_car_brands,id",
            sortBy: 'in:created_at,updated_at,name',
            sort: 'in:desc,asc',
            keyword: 'max:100'
        }
    }

    get sanitizationRules() {
        return {
            brand_id: "trim",
            sortBy: "trim",
            sort: "trim",
        }
    }

    get messages() {
        return {
            "brand_id.exists": "Hãng không tồn tại",
            "sortBy.in": "Sắp xếp theo cột: created_at, updated_at",
            "sort.in": "Sắp xếp theo: desc, asc",
            'keyword.max': 'Keyword không quá 100 từ'
        }
    }
}

module.exports = CarModel

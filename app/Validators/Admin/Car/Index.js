'use strict'

class CarAttributeIndex {
    get rules() {
        return {
            brandID: "exists:03_01_car_brands,id",
            modelID: "exists:03_02_car_models,id",
            typeID: "exists:03_03_car_types,id",
            sortBy: 'in:created_at,updated_at,name,year',
            sort: 'in:desc,asc',
            keyword: 'max:100',
            year: "integer|above:1970|under:3001",
        }
    }

    get sanitizationRules() {
        return {
            brandID: "trim",
            modelID: "trim",
            typeID: "trim",
            sortBy: "trim",
            sort: "trim",
        }
    }

    get messages() {
        return {
            "brandID.exists": "Hãng không tồn tại",
            "modelSlug.exists": "Dòng xe không tồn tại",
            "carTypeSlug.exists": "Kiểu xe không tồn tại",
            "sortBy.in": "Sắp xếp theo cột: created_at, updated_at, name",
            "sort.in": "Sắp xếp theo: desc, asc",
            'keyword.max': 'Keyword không quá 100 từ',
            "year.integer": "Năm phải là kiểu số",
            "year.above": "Năm phải lớn hơn 1970",
            "year.under": "Năm lớn nhất 3000",
        }
    }
}

module.exports = CarAttributeIndex

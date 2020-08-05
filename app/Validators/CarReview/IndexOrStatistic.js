'use strict'

class CarReviewIndex {
    get rules() {
        return {
            car_slug: "required|exists:03_05_cars,slug",
            sortBy: 'in:created_at,updated_at,rate',
            sort: 'in:desc,asc',
        }
    }

    get sanitizationRules() {
        return {
            car_slug: "trim",
            sortBy: "trim",
            sort: "trim",
        }
    }

    get messages() {
        return {
            "car_slug.required": "Xe không được trống",
            "car_slug.exists": "Xe không tồn tại",
            "sortBy.in": "Sắp xếp theo cột: created_at, updated_at, rate",
            "sort.in": "Sắp xếp theo: desc, asc",
        }
    }
}

module.exports = CarReviewIndex

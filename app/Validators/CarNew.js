'use strict'

class CarNew {
    get rules() {
        return {
            brand_slug: "exists:car_brands,slug",
            // car_type: "in:Sedan,SUV,Hatchback,Coupe,Pickup,Convertible,Hybrid,Roadster,Van,Wagon,Minivan,Offroad",
            price_range: 'array',
            'price_range.*': 'number',
        }
    }

    get sanitizationRules() {
        return {
            brand_slug: "trim"
        }
    }

    get messages() {
        return {
            "brand_slug.exists": "Hãng không tồn tại",
            // "car_type.in": "Loại xe không đúng",
            "price_range.*.number": "Khoảng giá phải là kiểu số"
        }
    }
}

module.exports = CarNew

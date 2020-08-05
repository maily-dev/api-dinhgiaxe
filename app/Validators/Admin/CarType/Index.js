'use strict'
const { COMMENT_STATUS } = use("App/Helpers/Enum")
class CarReviewIndex {
    get rules() {
        return {
            sortBy: 'in:created_at,updated_at,rate',
            sort: 'in:desc,asc',
            keyword: 'max:100',
        }
    }

    get sanitizationRules() {
        return {
            sortBy: "trim",
            sort: "trim",
        }
    }

    get messages() {
        return {
            "sortBy.in": "Sắp xếp theo cột: created_at, updated_at, rate",
            "sort.in": "Sắp xếp theo: desc, asc",
            'keyword.max': 'Keyword không quá 100 từ',
        }
    }
}

module.exports = CarReviewIndex

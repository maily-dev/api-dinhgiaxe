'use strict'

class Index {
    get rules() {
        return {
            sortBy: 'in:created_at,updated_at,name',
            sort: 'in:desc,asc',
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
            "sortBy.in": "Sắp xếp theo cột: created_at, updated_at, name",
            "sort.in": "Sắp xếp theo: desc, asc",
        }
    }
}

module.exports = Index

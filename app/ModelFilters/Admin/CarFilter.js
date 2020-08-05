'use strict'

const ModelFilter = use('ModelFilter')

class CarFilter extends ModelFilter {

    keyword(keyword) {
        return this.where('name', 'LIKE', `%${keyword}%`)
    }

    brandID(id) {
        return this.whereHas('attribute', q => {
            q.whereHas('model', q => {
                q.where({ brand_id: id })
            })
        })
    }

    modelID(id) {
        return this.whereHas('attribute', q => q.where({ model_id: id }))
    }

    typeID(id) {
        return this.whereHas('carType', q => q.where({ car_type_id: id }))
    }

    year(year) {
        return this.where({ year })
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }
}

module.exports = CarFilter

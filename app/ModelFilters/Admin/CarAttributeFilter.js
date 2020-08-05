'use strict'

const ModelFilter = use('ModelFilter')

class CarAttributeFilter extends ModelFilter {

    keyword(keyword) {
        return this.where('name', 'LIKE', `%${keyword}%`)
    }

    brandId(id) {
        return this.whereHas('model', q => q.where('brand_id', id))
    }

    modelId(id) {
        return this.where('model_id', id)
    }

    typeId(id) {
        return this.where('car_type_id', id)
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }
}

module.exports = CarAttributeFilter

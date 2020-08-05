'use strict'

const ModelFilter = use('ModelFilter')

class CarTypeFilter extends ModelFilter {

    keyword(keyword) {
        return this.where('name', 'LIKE', `%${keyword}%`)
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }
}

module.exports = CarTypeFilter

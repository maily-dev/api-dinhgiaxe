'use strict'

const ModelFilter = use('ModelFilter')

class CarResultHistoryFilter extends ModelFilter {

    keyword(keyword) {
        return this.whereHas('car', builder => {
            builder.where('name', 'LIKE', `%${keyword}%`)
        })
    }

    userId(id) {
        return this.where('user_id', id)
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }
}

module.exports = CarResultHistoryFilter

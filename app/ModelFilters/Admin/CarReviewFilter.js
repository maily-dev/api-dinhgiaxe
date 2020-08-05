'use strict'

const ModelFilter = use('ModelFilter')
class CarReviewFilter extends ModelFilter {
    // tìm kiếm theo tên
    keyword(keyword) {
        return this.where('content', 'LIKE', `%${keyword}%`)
            .orWhereHas('by', q => q.where('name', 'LIKE', `%${keyword}%`)
                .orWhere('email', 'LIKE', `%${keyword}%`)
                .orWhere('phone', 'LIKE', `%${keyword}%`))
            .orWhereHas('car', q => q.where('name', 'LIKE', `%${keyword}%`))
    }

    status(status) {
        return this.where('status', status)
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }
}

module.exports = CarReviewFilter

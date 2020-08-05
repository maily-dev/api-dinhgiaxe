'use strict'

const ModelFilter = use('ModelFilter')

class PostCategoryFilter extends ModelFilter {

    keyword(keyword) {
        return this.where('name', 'LIKE', `%${keyword}%`)
    }


    status(status) {
        return this.where('status', status)
    }

    deleted(status) {
        if (status) {
            return this.whereNotNull("deleted_at")
        }
        return this.whereNull("deleted_at")
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }
}

module.exports = PostCategoryFilter

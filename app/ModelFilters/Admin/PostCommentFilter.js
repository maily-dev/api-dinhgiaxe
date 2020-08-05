'use strict'

const ModelFilter = use('ModelFilter')

class PostCommentFilter extends ModelFilter {

    keyword(keyword) {
        return this.where('content', 'LIKE', `%${keyword}%`)
            .orWhereHas('by', q => q.where('name', 'LIKE', `%${keyword}%`))
            .orWhereHas('post', q => q.where('title', 'LIKE', `%${keyword}%`))
    }

    status(status) {
        return this.where('status', status)
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }
}

module.exports = PostCommentFilter

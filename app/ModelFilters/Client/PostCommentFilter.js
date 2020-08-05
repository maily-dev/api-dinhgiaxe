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

    postId(id) {
        return this.where('post_id', id)
    }

    parentId(id) {
        if (id === 'null') {
            return this.whereNull('parent_id')
        }
        return this.where('parent_id', id)
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }
}

module.exports = PostCommentFilter

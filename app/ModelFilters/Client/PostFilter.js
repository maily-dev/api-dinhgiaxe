'use strict'

const ModelFilter = use('ModelFilter')

class PostFilter extends ModelFilter {

    keyword(keyword) {
        return this.where(query => {
            query
                .where('title', 'LIKE', `%${keyword}%`)
        })
    }

    postCategoryId(id) {
        return this.where("post_category_id", id)
    }

    exclude(slug) {
        return this.whereNot("slug", slug)
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

module.exports = PostFilter

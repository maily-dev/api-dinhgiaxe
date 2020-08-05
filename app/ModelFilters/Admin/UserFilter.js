'use strict'

const ModelFilter = use('ModelFilter')

class UserFilter extends ModelFilter {

    keyword(keyword) {
        return this.where(query => {
            query
                .where('title', 'LIKE', `%${keyword}%`)
        })
    }

    role(slug) {
        return this.whereHas("roles", q => q.where("slug", slug))
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

module.exports = UserFilter

'use strict'

const ModelFilter = use('ModelFilter')

class CarCrawlFilter extends ModelFilter {
    // tìm kiếm theo tên
    keyword(keyword) {
        return this.where('name', 'LIKE', `%${keyword}%`)
    }

    brandID(id) {
        return this.whereHas('car', (builder) => {
            builder.whereHas('attribute', builder => {
                builder.whereHas('model', builder => {
                    builder.where({ brand_id: id })
                })
            })
        })
    }

    modelID(id) {
        return this.whereHas('car', (builder) => {
            builder.wherehas('attribute', builder => {
                builder.where({ model_id: id })
            })
        })
    }

    carTypeID(id) {
        return this.whereHas('car', (builder) => {
            builder.wherehas('attribute', builder => {
                builder.where({ car_type_id: id })
            })
        })
    }

    year(year) {
        return this.whereHas('car', (builder) => {
            builder.where({ year })
        })
    }

    condition(condition) {
        return this.where({ condition })
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }

    authorSite(author_site) {
        return this.where({ author_site })
    }
}

module.exports = CarCrawlFilter

'use strict'

const ModelFilter = use('ModelFilter')

class CarModelFilter extends ModelFilter {

    keyword(keyword) {

        if (this.input().brandId) {
            return this.where('brand_id', this.input().brandId)
                .andWhere('name', 'LIKE', `%${keyword}%`)
        } else {
            return this.where('name', 'LIKE', `%${keyword}%`)
                .orWhereHas('brand', q => q.where('name', 'LIKE', `%${keyword}%`))
        }
    }

    brandId(id) {
        if (id && !this.input().keyword)
            return this.where('brand_id', id)
    }

    sortBy(column) {
        return this.$query.orderBy(column, this.input().sort)
    }
}

module.exports = CarModelFilter

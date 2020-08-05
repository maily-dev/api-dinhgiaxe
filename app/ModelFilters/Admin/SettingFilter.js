'use strict'

const ModelFilter = use('ModelFilter')

class SettingFilter extends ModelFilter {
    // tìm kiếm theo tên
    keyword(keyword) {
        return this.where('name', 'LIKE', `%${keyword}%`)
            .orWhere('key', 'LIKE', `%${keyword}%`)
    }
}

module.exports = SettingFilter

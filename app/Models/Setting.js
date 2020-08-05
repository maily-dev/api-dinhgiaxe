'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const SettingFilter = use('App/ModelFilters/Admin/SettingFilter')
class Setting extends Model {
    static get table() {
        return '01_01_settings'
    }
    static boot() {
        super.boot()
        this.addTrait('@provider:Filterable', SettingFilter)
    }
}

module.exports = Setting

'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { underscoreSlug } = use('App/Helpers/Utils')
const uuid = use('uuid')
class CarBrand extends Model {

    static get table() {
        return '03_01_car_brands'
    }

    static boot() {
        super.boot()
        this.addHook('beforeSave', async (modelInstance) => {
            if (!modelInstance.slug) modelInstance.slug = await underscoreSlug(modelInstance.name)
        })

        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })
    }

    static get incrementing() {
        return false
    }


    models() {
        return this.hasMany('App/Models/Admin/CarModel', 'id', 'brand_id')
    }
}

module.exports = CarBrand

'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { slug } = use('App/Helpers/Utils')
const uuid = use('uuid')
class CarType extends Model {

    static get table() {
        return '03_03_car_types'
    }

    static boot() {
        super.boot()
        this.addHook('beforeSave', async (modelInstance) => {
            if (!modelInstance.slug) modelInstance.slug = await slug(modelInstance.name)

        })
        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })
    }

    static get incrementing() {
        return false
    }

    static get hidden() {
        return ['updated_at', 'deleted_at']
    }

    attributes() {
        return this.hasMany('App/Models/CarAttribute', 'id', 'car_type_id') // (model con, khóa chính model hiện tại, khóa ngoại model con)
    }
}

module.exports = CarType

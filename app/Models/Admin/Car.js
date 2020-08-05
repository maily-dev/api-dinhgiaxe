'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const uuid = use('uuid')
const CarFilter = use('App/ModelFilters/Admin/CarFilter')
const { underscoreSlug } = use('App/Helpers/Utils')
class Car extends Model {
    static get table() {
        return '03_05_cars'
    }

    static boot() {
        super.boot()

        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })

        this.addHook('beforeSave', async (modelInstance) => {
            if (!modelInstance.slug) modelInstance.slug = await underscoreSlug(modelInstance.name)
        })

        this.addTrait('@provider:Filterable', CarFilter)

    }

    static get incrementing() {
        return false
    }

    static get hidden() {
        return ['deleted_at', 'updated_at']
    }

    carCrawls() {
        return this.hasMany('App/Models/CarCrawl', 'id', 'car_id')
    }

    carStepPrices() {
        return this.hasMany('App/Models/CarStepPrice', 'id', 'car_id')
    }

    attribute() {
        return this.belongsTo('App/Models/CarAttribute', 'attribute_id', 'id')
    }

}

module.exports = Car

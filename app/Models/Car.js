'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const uuid = use('uuid')
class Car extends Model {
    static get table() {
        return '03_05_cars'
    }

    static boot() {
        super.boot()

        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })

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

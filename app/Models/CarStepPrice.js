'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class CarPriceStep extends Model {
    static get table() {
        return '05_01_car_price_steps'
    }

    attribute() {
        return this.belongsTo('App/Models/CarAttribute', 'attribute_id', 'id')
    }

}

module.exports = CarPriceStep

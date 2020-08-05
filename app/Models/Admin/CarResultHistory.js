'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const uuid = use('uuid')
class CarResultHistories extends Model {

    static boot() {
        super.boot()
        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })
    }

    static get table() {
        return '05_02_car_result_histories'
    }

    static get incrementing() {
        return false
    }
    user() {
        return this.belongsTo("App/Models/Admin/User")
    }

    attribute() {
        return this.belongsTo("App/Models/CarAttribute", 'attribute_id', 'id')
    }
}

module.exports = CarResultHistories

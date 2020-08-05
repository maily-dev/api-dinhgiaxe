'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const uuid = use('uuid')
const CarResultHistoryFilter = use('App/ModelFilters/Client/CarResultHistoryFilter')
class CarResultHistories extends Model {

    static get table() {
        return '05_02_car_result_histories'
    }

    static boot() {
        super.boot()
        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })

        this.addTrait('@provider:Filterable', CarResultHistoryFilter)

        this.addTrait('@provider:Lucid/SoftDeletes')
    }

    static get incrementing() {
        return false
    }
    user() {
        return this.belongsTo("App/Models/User")
    }

    car() {
        return this.belongsTo("App/Models/Car", 'car_id', 'id')
    }
}

module.exports = CarResultHistories

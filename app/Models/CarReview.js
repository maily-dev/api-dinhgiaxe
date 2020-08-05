'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const uuid = use('uuid')
const CarReviewFilter = use('App/ModelFilters/Admin/CarReviewFilter')
class CarReview extends Model {

    static get table() {
        return '05_03_car_reviews'
    }

    static boot() {
        super.boot()
        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })

        this.addTrait('@provider:Filterable', CarReviewFilter)
    }

    static get incrementing() {
        return false
    }

    static get hidden() {
        return ['deleted_at', 'updated_at']
    }

    user() {
        return this.belongsTo("App/Models/User")
    }

    car() {
        return this.belongsTo("App/Models/Car", 'car_id', 'id')
    }

    carResultHistory() {
        return this.belongsTo("App/Models/CarResultHistory", 'car_result_history_id', 'id')
    }
}

module.exports = CarReview

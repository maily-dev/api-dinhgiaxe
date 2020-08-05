'use strict'

const Model = use('Model')
const CarReviewFilter = use('App/ModelFilters/Admin/CarReviewFilter')

class CarReview extends Model {
    static boot() {
        super.boot()

        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })

        this.addTrait('@provider:Filterable', CarReviewFilter)
    }
    static get table() {
        return '05_03_car_reviews'
    }


    by() {
        return this.belongsTo("App/Models/Admin/User")
    }

    car() {
        return this.belongsTo("App/Models/Car", 'car_id', 'id')
    }

    carResultHistory() {
        return this.belongsTo("App/Models/Admin/CarResultHistory", 'car_result_history_id', 'id')
    }
}

module.exports = CarReview

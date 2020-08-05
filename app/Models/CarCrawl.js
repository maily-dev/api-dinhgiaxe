'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const uuid = use('uuid')
const CarCrawlFilter = use('App/ModelFilters/Admin/CarCrawlFilter')
class CarCrawl extends Model {
    static get table() {
        return '04_01_crawl_cars'
    }

    static boot() {
        super.boot()
        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })

        this.addTrait('@provider:Filterable', CarCrawlFilter)
    }

    static get incrementing() {
        return false
    }

    // brand() {
    //     return this.belongsTo('App/Models/CarBrand', 'brand_id', 'id')
    // }

    // model() {
    //     return this.belongsTo('App/Models/CarModel', 'model_id', 'id')
    // }

    car() {
        return this.belongsTo('App/Models/Car', 'car_id', 'id')
    }

    carType() {
        return this.hasOne('App/Models/CarType', 'car_type_id', 'id') // (model cha, khóa ngoại model hiện tại, khóa chính ở model cha)
    }

    getTrueFalse(value) {
        return Boolean(Number(value))
    }
}

module.exports = CarCrawl

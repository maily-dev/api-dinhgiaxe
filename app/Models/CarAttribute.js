'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { underscoreSlug } = use('App/Helpers/Utils')
const uuid = use('uuid')
const CarAttributeFilter = use('App/ModelFilters/Admin/CarAttributeFilter')
class CarAttribute extends Model {

    static get table() {
        return '03_04_car_attributes'
    }

    static boot() {
        super.boot()
        this.addHook('beforeSave', async (modelInstance) => {
            if (!modelInstance.slug) modelInstance.slug = await underscoreSlug(modelInstance.name)
        })

        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })

        this.addTrait('@provider:Filterable', CarAttributeFilter)
    }

    static get incrementing() {
        return false
    }

    static get hidden() {
        return ['deleted_at', 'updated_at']
    }

    // brand() {
    //     return this.belongsTo("App/Models/CarBrand", "brand_id", "id")
    // }

    model() {
        return this.belongsTo("App/Models/CarModel", "model_id", "id")
    }

    carType() {
        return this.belongsTo("App/Models/CarType", "car_type_id", "id")
    }

    cars() {
        return this.hasMany('App/Models/Car', 'id', 'attribute_id')
    }
}

module.exports = CarAttribute

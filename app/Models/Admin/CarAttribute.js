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

        //Soft delete
        this.addTrait('@provider:Lucid/SoftDeletes')

        this.addTrait('@provider:Filterable', CarAttributeFilter)
    }

    static get incrementing() {
        return false
    }

    model() {
        return this.belongsTo("App/Models/Admin/CarModel", "model_id", "id")
    }

    type() {
        return this.belongsTo("App/Models/Admin/CarType", "car_type_id", "id")
    }
}

module.exports = CarAttribute

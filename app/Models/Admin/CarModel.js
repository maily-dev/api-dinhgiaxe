'use strict'

const Model = use('Model')
const { underscoreSlug } = use('App/Helpers/Utils')
const uuid = use('uuid')
const CarModelFilter = use('App/ModelFilters/Admin/CarModelFilter')

class CarModel extends Model {
    static get table() {
        return '03_02_car_models'
    }

    static boot() {
        super.boot()

        this.addTrait('@provider:Filterable', CarModelFilter)

        this.addHook('beforeSave', async (modelInstance) => {
            if (!modelInstance.slug) modelInstance.slug = await underscoreSlug(modelInstance.name)
        })

        this.addHook('beforeCreate', async instance => {
            instance.primaryKeyValue = uuid.v4()
        })
    }

    static get incrementing() {
        return false
    }

    brand() {
        return this.belongsTo('App/Models/CarBrand', 'brand_id', 'id') // (model cha, khóa ngoại model hiện tại, khóa chính ở model cha)
    }

    attributes() {
        return this.hasMany('App/Models/CarAttribute', 'id', 'model_id') // (model con, khóa chính model hiện tại, khóa ngoại model con)
    }
}

module.exports = CarModel

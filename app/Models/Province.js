'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')
const { slug } = use('App/Helpers/Utils')
class Province extends Model {
    static get table() {
        return '01_02_provinces'
    }

    static boot() {
        super.boot()
        /**
         * A hook to hash the user password before saving
         * it to the database.
         */
        this.addHook('beforeSave', async (modelInstance) => {
            modelInstance.slug = await slug(modelInstance.name)
        })
    }


}

module.exports = Province

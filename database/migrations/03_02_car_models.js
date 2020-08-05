'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CarModelSchema extends Schema {
    up() {
        this.create('03_02_car_models', (table) => {
            table.uuid('id').primary()
            table.uuid('brand_id').references('id').inTable('03_01_car_brands').onDelete('cascade')
            table.string('name').notNullable()
            table.string('slug').notNullable()
            table.datetime('deleted_at').nullable().defaultTo(null)
            table.timestamps()
        })
    }

    down() {
        this.drop('03_02_car_models')
    }
}

module.exports = CarModelSchema

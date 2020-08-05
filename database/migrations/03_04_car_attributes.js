'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CarAttributeSchema extends Schema {
    up() {
        this.create('03_04_car_attributes', (table) => {
            table.uuid('id').primary()
            table.uuid('model_id').references('id').inTable('03_02_car_models').onDelete('cascade')
            table.uuid('car_type_id').references('id').inTable('03_03_car_types').onDelete('cascade')
            table.string('name').notNullable()
            table.string('slug').notNullable().unique()
            table.string('author_site').notNullable()
            // table.string('colors').nullable().defaultTo(null)
            // table.string('options').nullable().defaultTo(null)
            table.datetime('deleted_at').nullable().defaultTo(null)
            table.timestamps()
        })
    }

    down() {
        this.drop('03_04_car_attributes')
    }
}

module.exports = CarAttributeSchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CarTypeSchema extends Schema {
    up() {
        this.create('03_03_car_types', (table) => {
            table.uuid('id').primary()
            table.string('name').notNullable()
            table.string('slug').notNullable().unique()
            table.string('author_site').nullable()
            table.datetime('deleted_at').nullable().defaultTo(null)
            table.timestamps()
        })
    }

    down() {
        this.drop('03_03_car_types')
    }
}

module.exports = CarTypeSchema

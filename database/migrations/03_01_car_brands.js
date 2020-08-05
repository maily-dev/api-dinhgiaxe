'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BrandSchema extends Schema {
    up() {
        this.create('03_01_car_brands', (table) => {
            table.uuid('id').primary()
            table.string('name').notNullable()
            table.string('slug').notNullable().unique()
            table.string('image').nullable()
            table.datetime('deleted_at').nullable().defaultTo(null)
            table.timestamps()
        })
    }

    down() {
        this.drop('03_01_car_brands')
    }
}

module.exports = BrandSchema

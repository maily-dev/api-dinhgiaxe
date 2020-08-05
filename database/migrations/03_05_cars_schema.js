'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CarsSchema extends Schema {
    up() {
        this.create('03_05_cars', (table) => {
            table.uuid('id').primary()
            table.uuid('attribute_id').references('id').inTable('03_04_car_attributes').onDelete('cascade')
            table.string('name').notNullable()
            table.string('slug').notNullable().unique() // để gồm attribute+year để tạo unique
            table.integer('year').notNullable().defaultTo(0)
            table.string('image').nullable()
            table.string('author_site').nullable()
            table.datetime('deleted_at').nullable().defaultTo(null)
            table.timestamps()
        })
    }

    down() {
        this.drop('03_05_cars')
    }
}

module.exports = CarsSchema

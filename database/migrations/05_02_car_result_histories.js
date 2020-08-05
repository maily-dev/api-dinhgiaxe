'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CarResultHistoriesSchema extends Schema {
    up() {
        this.create('05_02_car_result_histories', (table) => {
            table.uuid('id').primary()
            table.uuid('user_id').references('id').inTable('02_01_users').onDelete('cascade')
            table.uuid('car_id').references('id').inTable('03_05_cars').onDelete('cascade')
            table.integer('mileage').notNullable()
            table.decimal('min', 12).notNullable()
            table.decimal('max', 12).notNullable()
            table.string('condition').notNullable()
            table.datetime('deleted_at').nullable().defaultTo(null)
            table.timestamps()
        })
    }

    down() {
        this.drop('05_02_car_result_histories')
    }
}

module.exports = CarResultHistoriesSchema

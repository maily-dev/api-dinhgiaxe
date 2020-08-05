'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CarReview extends Schema {
    up() {
        this.create('05_03_car_reviews', (table) => {
            table.uuid('id').primary()
            table.uuid('user_id').references('id').inTable('02_01_users').onDelete('cascade')
            table.uuid('car_id').references('id').inTable('03_05_cars').onDelete('cascade')
            table.uuid('car_result_history_id').references('id').inTable('05_02_car_result_histories').onDelete('cascade')
            table.string('content').notNullable()
            table.integer('rate').nullable()
            table.integer('status').nullable().defaultTo(0)
            table.datetime('deleted_at').nullable().defaultTo(null)
            table.timestamps()
        })
    }

    down() {
        this.drop('05_03_car_reviews')
    }
}

module.exports = CarReview

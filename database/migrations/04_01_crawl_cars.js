'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CarCrawlSchema extends Schema {
    up() {
        this.create('04_01_crawl_cars', (table) => {
            table.uuid('id').primary()
            // table.uuid('brand_id').references('id').inTable('car_brands').onDelete('cascade')
            // table.uuid('model_id').references('id').inTable('car_models').onDelete('cascade')
            // table.uuid('car_type_id').references('id').inTable('car_types').onDelete('cascade')
            table.uuid('car_id').references('id').inTable('03_05_cars').onDelete('cascade')
            table.string('name').notNullable()
            table.string('condition').notNullable()
            table.integer('mileage').nullable().defaultTo(0)
            table.integer('price').notNullable()
            table.string('price_string').notNullable()
            table.datetime('date_upload').nullable().defaultTo(null)
            table.string('origin').nullable().defaultTo(null)
            table.string('color').nullable().defaultTo(null)
            table.string('engine').nullable().defaultTo(null)
            table.string('fuel_type').nullable().defaultTo(null)
            table.string('transmission').nullable().defaultTo(null)
            table.string('car_power').nullable().defaultTo(null) // công suất
            table.string('car_size').nullable().defaultTo(null)
            table.string('car_fuel_tank_capacity').nullable().defaultTo(null) // dung tích bình xăng (mm)
            table.string('car_turning_circle').nullable().defaultTo(null) // Đường kính vòng quay tối thiểu (m)
            table.string('car_moment').nullable().defaultTo(null) // moment xoắn (nm)
            table.string('drivetrain').nullable().defaultTo(null)
            table.string('author_code').notNullable()
            table.string('author_site').nullable().defaultTo(null)
            table.string('author_location').nullable().defaultTo(null)
            table.string('author_url').nullable().defaultTo(null)
            table.boolean('author_verify').nullable().defaultTo(false)
            table.timestamps()
        })
    }

    down() {
        this.drop('04_01_crawl_cars')
    }
}

module.exports = CarCrawlSchema

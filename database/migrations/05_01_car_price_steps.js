'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CarPriceStepSchema extends Schema {
    up() {
        this.create('05_01_car_price_steps', (table) => {
            table.increments()
            table.uuid('attribute_id').references('id').inTable('03_04_car_attributes').onDelete('cascade')
            table.string('index').notNullable().unique() // để gồm attribute_id+from+to+type+type2 để tạo unique
            table.integer('from').notNullable()
            table.integer('to').notNullable()
            table.float('percent').notNullable()
            table.string('type').notNullable()
            table.string('type_2').notNullable()
            table.timestamps()
        })
    }

    down() {
        this.drop('05_01_car_price_steps')
    }
}

module.exports = CarPriceStepSchema

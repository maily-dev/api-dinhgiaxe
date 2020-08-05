'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SettingSchema extends Schema {
    up() {
        this.create('01_01_settings', (table) => {
            table.increments()
            table.string('key').notNullable()
            table.string('value').notNullable()
            table.string('name').nullable()
            table.string('detail').nullable()
            table.timestamps()
        })
    }

    down() {
        this.drop('01_01_settings')
    }
}

module.exports = SettingSchema

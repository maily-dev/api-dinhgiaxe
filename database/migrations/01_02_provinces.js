'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AuthorLocationSchema extends Schema {
    up() {
        this.create('01_02_provinces', (table) => {
            table.increments()
            table.string('name').notNullable()
            table.string('slug').notNullable()
            table.timestamps()
        })
    }

    down() {
        this.drop('01_02_provinces')
    }
}

module.exports = AuthorLocationSchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ErrorSchema extends Schema {
    up() {
        this.create('04_02_crawl_errors', (table) => {
            table.increments()
            table.string('post_item_code').nullable().defaultTo(null)
            table.string('author').nullable().defaultTo(null)
            table.string('post_item_url').nullable().defaultTo(null)
            table.string('error_in').nullable().defaultTo(null)
            table.string('error').nullable().defaultTo(null)
            table.timestamps()
        })
    }

    down() {
        this.drop('04_02_crawl_errors')
    }
}

module.exports = ErrorSchema

'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TokensSchema extends Schema {
    up() {
        this.create('02_02_tokens', (table) => {
            table.increments()
            table.uuid('user_id').references('id').inTable('02_01_users').onDelete('cascade')
            table.string('token', 255).notNullable().unique().index()
            table.string('type', 80).notNullable()
            table.boolean('is_revoked').defaultTo(false)
            table.timestamps()
        })
    }

    down() {
        this.drop('02_02_tokens')
    }
}

module.exports = TokensSchema

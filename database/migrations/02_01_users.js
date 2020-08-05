'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
    up() {
        this.create('02_01_users', (table) => {
            table.uuid('id').primary()
            table.string('password').notNullable()
            table.string('name')
            table.string('email').unique().notNullable()
            table.string('phone')
            table.string('gender').nullable().defaultTo(null)
            table.date('birthday')
            table.string('address')
            table.text('avatar')
            table.string('code')
            table.timestamps()
            table.datetime('deleted_at')
        })
    }

    down() {
        this.drop('02_01_users')
    }
}

module.exports = UserSchema

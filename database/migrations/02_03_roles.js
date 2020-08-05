'use strict'

const Schema = use('Schema')

class RolesTableSchema extends Schema {
    up() {
        this.create('02_03_roles', table => {
            table.increments()
            table.string('slug').notNullable().unique()
            table.string('name').notNullable().unique()
            table.text('description').nullable()
            table.datetime('deleted_at').defaultTo(null)
            table.timestamps()
        })
    }

    down() {
        this.drop('02_03_roles')
    }
}

module.exports = RolesTableSchema

'use strict'

const Schema = use('Schema')

class PermissionsTableSchema extends Schema {
    up() {
        this.create('02_04_permissions', table => {
            table.increments()
            table.string('slug').notNullable().unique()
            table.string('name').notNullable().unique()
            table.string('group').nullable()
            table.text('description').nullable()
            table.timestamps()
        })
    }

    down() {
        this.drop('02_04_permissions')
    }
}

module.exports = PermissionsTableSchema

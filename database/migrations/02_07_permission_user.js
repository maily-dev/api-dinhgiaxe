'use strict'

const Schema = use('Schema')

class PermissionUserTableSchema extends Schema {
    up() {
        this.create('02_07_permission_user', table => {
            table.increments()
            table.integer('permission_id').unsigned().index().references('id').on('02_04_permissions').onDelete('cascade')
            table.uuid('user_id').references('id').inTable('02_01_users').onDelete('cascade')
            table.timestamps()
        })
    }

    down() {
        this.drop('02_07_permission_user')
    }
}

module.exports = PermissionUserTableSchema

'use strict'

const Schema = use('Schema')

class RoleUserTableSchema extends Schema {
    up() {
        this.create('02_05_role_user', table => {
            table.increments()
            table.integer('role_id').unsigned().index().references('id').inTable('02_03_roles').onDelete('cascade')
            table.uuid('user_id').references('id').inTable('02_01_users').onDelete('cascade')
            table.timestamps()
        })
    }

    down() {
        this.drop('02_05_role_user')
    }
}

module.exports = RoleUserTableSchema

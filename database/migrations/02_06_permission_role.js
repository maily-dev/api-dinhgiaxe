'use strict'

const Schema = use('Schema')

class PermissionRoleTableSchema extends Schema {
    up() {
        this.create('02_06_permission_role', table => {
            table.increments()
            table.integer('permission_id').unsigned().index().references('id').inTable('02_04_permissions').onDelete('cascade')
            table.integer('role_id').unsigned().index().references('id').inTable('02_03_roles').onDelete('cascade')
            table.timestamps()
        })
    }

    down() {
        this.drop('02_06_permission_role')
    }
}

module.exports = PermissionRoleTableSchema

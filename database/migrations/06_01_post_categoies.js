'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostCategoiesSchema extends Schema {
  up() {
    this.create('06_01_post_categoies', (table) => {
      table.uuid('id').primary()
      table.string('name').notNullable()
      table.string('slug', 190).notNullable().unique()
      table.integer('status').nullable().defaultTo(0)
      table.string('image').nullable().defaultTo(null)
      table.integer('primary_index').nullable()
      table.datetime('deleted_at').nullable().defaultTo(null)
      table.timestamps()
    })
  }

  down() {
    this.drop('06_01_post_categoies')
  }
}

module.exports = PostCategoiesSchema

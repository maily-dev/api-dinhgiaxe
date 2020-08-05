'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostSchema extends Schema {
  up() {
    this.create('06_02_posts', (table) => {
      table.uuid('id').primary()
      table.uuid('post_category_id').references('id').inTable('06_01_post_categoies').onDelete('cascade')
      table.uuid('user_id').references('id').inTable('02_01_users').onDelete('cascade')
      table.string('title').notNullable()
      table.string('description').nullable()
      table.string('slug', 190).notNullable().unique()
      table.text('content').nullable().defaultTo(null)
      table.string('resource_id').nullable().defaultTo(null)
      table.integer('status').nullable().defaultTo(0)
      table.integer('primary_index').nullable()
      table.string('image').nullable().defaultTo(null)
      table.integer('view').nullable().defaultTo(0)
      table.datetime('deleted_at').nullable().defaultTo(null)
      table.timestamps()
    })
  }

  down() {
    this.drop('06_02_posts')
  }
}

module.exports = PostSchema


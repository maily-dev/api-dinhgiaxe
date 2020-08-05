'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostCommentsSchema extends Schema {
  up() {
    this.create('06_03_post_comments', (table) => {
      table.uuid('id').primary()
      table.uuid('user_id').references('id').inTable('02_01_users').onDelete('cascade')
      table.uuid('post_id').references('id').inTable('06_02_posts').onDelete('cascade')
      table.uuid('parent_id').references('id').inTable('06_03_post_comments').onDelete('cascade')
      table.string('content').notNullable()
      table.integer('status').nullable().defaultTo(0)
      table.timestamps()
    })
  }

  down() {
    this.drop('06_03_post_comments')
  }
}

module.exports = PostCommentsSchema

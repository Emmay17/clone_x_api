import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'hashtag_tweets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('hashtag_id')
        .unsigned()
        .references('id')
        .inTable('hashtags')

      table.uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
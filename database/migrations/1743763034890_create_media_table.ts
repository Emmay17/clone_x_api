import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'medias'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('url').notNullable()
      table.string('type').notNullable()
      table.string('size').nullable()

      table.integer('tweet_id')
        .unsigned()
        .references('id')
        .inTable('tweets')
        .onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
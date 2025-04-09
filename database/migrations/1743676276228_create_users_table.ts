import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.defer(async (db) => {
      await db.rawQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    })

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('first_name', 50).notNullable()
      table.string('last_name', 50).notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()

      table
        .enum('status', ['activated', 'pending', 'blocked', 'deactivated'], {
          useNative: true,
          enumName: 'user_account_status',
        })
        .notNullable()
        .defaultTo('pending')

      table
        .string('permission_labelle')
        .notNullable()
        .references('label')
        .inTable('roles')
        .onDelete('CASCADE')

      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.raw('DROP TYPE IF EXISTS status_compte')
    })
  }
}

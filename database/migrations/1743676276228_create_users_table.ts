import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.defer(async (db) => {
      await db.rawQuery('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    })

    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('full_name').nullable()
      table.string('username').nullable().unique()
      table.string('email', 254).notNullable().unique()
      table.string('password').notNullable()
      table.timestamp('last_connexion').nullable()

      table
        .enum('status', ['actif', 'desactive', 'dormant'], {
          useNative: true,
          enumName: 'status_compte',
        })
        .notNullable()
        .defaultTo('desactive')

      table.string('profile_image').nullable()
      table.string('bio').nullable()
      table.string('location').nullable()
      table.string('links').nullable()

      // 🔒 Référence au champ labelle de la table permissions
      table
        .string('permission_labelle')
        .notNullable()
        .references('labelle')
        .inTable('permissions')
        .onDelete('CASCADE') // ou SET NULL, selon ton besoin

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
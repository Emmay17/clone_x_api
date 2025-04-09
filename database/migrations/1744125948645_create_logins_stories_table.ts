import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'logins_stories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')  // ID de la connexion
      table.uuid('session_id').notNullable()  // ID de la session
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')  // relation vers l'utilisateur
      table.string('device_name').nullable()  // Nom du device (par exemple "iPhone 12")
      table.string('ip_address').nullable()  // IP de la connexion
      table.timestamp('last_connexion', { useTz: true }).nullable()  // Dernière connexion
      table.enum('status', ['active', 'expired', 'revoked', 'terminated'], { useNative: true, enumName: 'session_status' })
        .notNullable().defaultTo('active')  // Statut de la session
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
    this.defer(async (db) => {
      await db.raw('DROP TYPE IF EXISTS session_status')
    })
  }
}
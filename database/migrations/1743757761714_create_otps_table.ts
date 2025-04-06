import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'otps'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      // Référence à l'utilisateur (ou toute autre entité)
      table
        .uuid('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')

      table.string('code').notNullable()           // le code OTP
      table.string('type').notNullable()           // ex: "email", "sms", "2fa"
      table.boolean('verified').defaultTo(false)   // déjà utilisé ou pas
      table.timestamp('expires_at').notNullable()  // date d’expiration
      table.timestamp('created_at').notNullable().defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
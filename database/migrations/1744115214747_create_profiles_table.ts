import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Profiles extends BaseSchema {
  protected tableName = 'profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().references('id').inTable('users').onDelete('CASCADE')
      table.string('username', 15).notNullable().unique() // important pour les @handle
      table.string('profile_image').nullable().comment('URL to avatar or profile photo')
      table.string('banner_image').nullable().comment('Banner photo like Twitter')
      table.text('bio').nullable()
      table.string('location', 100).nullable()
      table.string('website', 255).nullable()

      table.timestamp('birth_date').nullable()
      table.boolean('is_verified').defaultTo(false)
      table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}

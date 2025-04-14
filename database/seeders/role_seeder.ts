import Role from '#models/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { faker } from '@faker-js/faker'

export default class extends BaseSeeder {
  async run() {
    // Write your database queries inside the run method
   await Role.create( {
    label : 'test_user', description : `${faker.lorem.paragraph({ min: 1, max: 3 })}`}
    )
  }
}
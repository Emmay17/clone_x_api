import factory from '@adonisjs/lucid/factories'
import User from '#models/user'

export const UserFactory = factory
  .define(User, async ({ faker }) => {
    const firstName = faker.person.firstName().charAt(0).toUpperCase()
    const lastName = faker.person.lastName().charAt(0).toUpperCase()
    return {
      firstName: firstName,
      lastName: lastName,
      username: `@${firstName}_${lastName}`,
      email: faker.internet.email(),
      password: 'test12345',
    }
  })
  .build()
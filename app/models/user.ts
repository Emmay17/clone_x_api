import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { afterCreate, BaseModel, beforeCreate, column, hasOne, scope } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { v4 as uuidv4 } from 'uuid'
import Profile from './profile.js'
import type { HasOne } from '@adonisjs/lucid/types/relations'

// Auth mixin configuration
const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  // cle primaire
  @column({ isPrimary: true })
  declare id: string

  // les information indispensable de l'utilisateur
  @column({ columnName: 'first_name', serializeAs: 'firstName' })
  declare firstName: string | null

  @column({ columnName: 'last_name', serializeAs: 'lastName' })
  declare lastName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  // La permission de l'utilisateur
  @column()
  declare role: string

  // Son status pour savoir si son compte est actif ou pas ou dormant et nous aide a verifier l'email grace a un OTP
  @column()
  declare status: 'activated' | 'deactivated' | 'blocked' | 'pending'

  // Timestamps
  @column.dateTime({ autoCreate: true, columnName: 'created_at', serializeAs: 'createdAt' })
  declare createdAt: DateTime

  @column.dateTime({
    autoCreate: true,
    autoUpdate: true,
    columnName: 'updated_at',
    serializeAs: 'updatedAt',
  })
  declare updatedAt: DateTime | null

  @hasOne(() => Profile)
  public profile !: HasOne<typeof Profile>

  @beforeCreate()
  public static assignUuid(user: User) {
    user.id = uuidv4()
    user.role = 'test_user'
    user.status = 'activated'
  }

  @afterCreate()
  public static async createProfile(user: User) {
    const username = `@${user.firstName?.slice(0, 3)}.${user.lastName?.slice(0, 3)}.2025`
    await user.related('profile').create({
      userId: user.id, // si `user_id` est la clé étrangère dans `profiles`
      username,
      bio: '', // exemple de champ
    })
  }

  // Access tokens support
  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })

  static withStatus = scope((query, status: string) => {
    query.where('status', status)
  })
}

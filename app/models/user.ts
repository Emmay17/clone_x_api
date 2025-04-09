import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, beforeCreate, column, scope } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import { v4 as uuidv4 } from 'uuid'

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
  @column({ columnName: 'permission_labelle', serializeAs: 'permissionLabelle' })
  declare role: string

  // Son status pour savoir si son compte est actif ou pas ou dormant et nous aide a verifier l'email grace a un OTP
  @column()
  declare status: 'activated' | 'deactivated' | 'blocked' | 'pending'

  // La derniere connexion de l'utilisateur
  @column.dateTime({
    columnName: 'last_connexion',
    serializeAs: 'lastConnexion',
    autoCreate: true,
    autoUpdate: true,
  })
  declare lastConnexion: DateTime

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

  @beforeCreate()
  public static assignUuid(user: User) {
    user.id = uuidv4()
    user.role = 'Test'
  }
  // Access tokens support
  static accessTokens = DbAccessTokensProvider.forModel(User, {
    expiresIn: '30 days',
    prefix: 'oat_',
    table: 'auth_access_tokens',
    type: 'auth_token',
    tokenSecretLength: 40,
  })

  static activatedAccountUser = scope((query) => {
    query.where('status', 'activated')
  })

  static deactivatedAccountUser = scope((query) => {
    query.where('status', 'deactivated')
  })

  static blockedAccountUser = scope((query) => {
    query.where('status', 'blocked')
  })

  static pendingAccountUser = scope((query) => {
    query.where('status', 'pending')
  })
}

import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'

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
  @column({ columnName: 'full_name', serializeAs: 'fullName' })
  declare fullName: string | null

  @column()
  declare username: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  // Information non critique de l'utilisateur
  @column({ columnName: 'profile_image', serializeAs: 'profileImage' })
  declare profileImage: string | null

  @column()
  declare bio: string | null

  @column()
  declare location: string | null

  @column()
  declare links: string | null

  // La permission de l'utilisateur 
  @column({ columnName: 'permission_labelle', serializeAs: 'permissionLabelle' })
  declare permissionLabelle: string

  // Son status pour savoir si son compte est actif ou pas ou dormant et nous aide a verifier l'email grace a un OTP
  @column()
  declare status: 'actif' | 'desactive' | 'dormant'

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

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at', serializeAs: 'updatedAt' })
  declare updatedAt: DateTime | null

  // Access tokens support
  static accessTokens = DbAccessTokensProvider.forModel(User)
}

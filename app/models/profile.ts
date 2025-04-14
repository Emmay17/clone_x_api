import { DateTime } from 'luxon'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import User from './user.js'
export default class Profile extends BaseModel {
  @column()
  declare id: string

  @column({ columnName: 'user_id' }) // optionnel si le nom est déjà user_id dans ta DB
  declare userId: string

  @column()
  declare username: string

  @column({ columnName: 'profile_image' })
  declare profileImage: string

  @column({ columnName: 'banner_image' })
  declare bannerImage: string

  @column()
  declare bio: string

  @column()
  declare location: string

  @column()
  declare website: string

  @column({ columnName: 'birth_date' })
  declare birthDate: DateTime

  @column({ columnName: 'is_verified' })
  declare isVerified: boolean

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>
}

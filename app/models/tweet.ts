import User from './user.js'
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Media from './media.js'
import Like from './like.js'

export default class Tweet extends BaseModel {
  public static table = 'tweets'
  @column({ isPrimary: true })
  declare id: number

  // @hasOne(() => User)
  // declare userId: HasOne<typeof User>

  @column()
  declare userId: number

  @column()
  declare content: string

  @column()
  declare parent_tweet: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @hasMany(() => Media)
  public medias!: HasMany<typeof Media>

  @hasMany(() => Like)
  declare likes: HasMany<typeof Like>

  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>
}

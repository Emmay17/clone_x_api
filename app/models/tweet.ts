import User from './user.js'
import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, computed, hasMany } from '@adonisjs/lucid/orm'
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

  @belongsTo(() => Tweet, {
    foreignKey: 'parent_tweet',
    localKey: 'id',
  })
  public parentTweet!: BelongsTo<typeof Tweet>

  @hasMany(() => Tweet, {
    foreignKey: 'parent_tweet',
    localKey: 'id',
  })
  public replies!: HasMany<typeof Tweet>

  @computed()
  public get likes_count() {
    return this.$extras.likes_count ?? 0
  }

  @computed()
  public get replies_count() {
    return this.$extras.replies_count ?? 0
  }
}

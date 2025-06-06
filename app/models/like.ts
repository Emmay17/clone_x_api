import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tweet from './tweet.js'

export default class Like extends BaseModel {
  public static table = 'likes'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: string

  @column({ columnName: 'tweet_id' })
  declare tweetId: number

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @belongsTo(() => User)
  public user!: BelongsTo<typeof User>

  @belongsTo(() => Tweet)
  public tweet!: BelongsTo<typeof Tweet>
}

import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Tweet from './tweet.js'
import { DateTime } from 'luxon'

export default class Media extends BaseModel {
  public static table = 'medias'
  
  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public tweetId: number

  @column()
  declare public url: string

  @column()
  declare public type: 'image' | 'video'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Tweet)
  public tweet!: BelongsTo<typeof Tweet>
}

import User from './user.js'
import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'

export default class Tweet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @hasOne(() => User)
  declare userId: HasOne<typeof User>

  @column()
  declare content: string

  @column()
  declare media: string

  @column()
  declare parent_tweet: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}

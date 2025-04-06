import { DateTime } from 'luxon'
import { BaseModel, column, beforeSave } from '@adonisjs/lucid/orm'

export default class Permission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare labelle: string

  @column()
  declare description: string

  @column.dateTime({ autoCreate: true})
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  @beforeSave()
  public static lowercaseFields(permission: Permission) {
    if (permission.labelle) {
      permission.labelle = permission.labelle.toLowerCase()
    }
  }
}
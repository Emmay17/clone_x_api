import Tweet from '#models/tweet'
import { tweetRegister } from '#validators/tweet'
import type { HttpContext } from '@adonisjs/core/http'

export default class TweetsController {
  async postTweet(ctx: HttpContext) {
    const data = ctx.request.all()
    try {
      const userExiste = await Tweet.query().whereRaw('user_id = ?', [data.user_id]).first()
      if (!userExiste) {
        return ctx.response.badRequest({ message: `${data.user_id} n\'existe pas` })
      }
      const validateData = await data.validateUsing(tweetRegister)
      await Tweet.create(validateData)
    } catch (error) {
      console.error('Erreur de validation:', JSON.stringify(error, null, 2))
      const errors = error.formatted || error.messages || error
      return ctx.response.internalServerError({
        message: error.message || "Erreur lors de l'enregistrement du role",
        errors,
      })
    }
  }
}

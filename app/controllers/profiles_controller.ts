import Profile from '#models/profile'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProfilesController {
  async fetchProfile(ctx: HttpContext) {
    const id = ctx.request.param('id')

    if (!id) {
      return ctx.response.badRequest({
        message: 'ID de profil manquant',
      })
    }
    try {
      const profile = await Profile.query().where('user_id', id).first()

      if (!profile) {
        return ctx.response.notFound({
          message: `Aucun profil trouvé avec l'ID ${id}`,
        })
      }
      return ctx.response.ok({
        message: 'Profil trouvé avec succès',
        data: profile,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération du profile :', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération du profile server',
        error: error.message || 'Erreur inconnue',
      })
    }
  }
}

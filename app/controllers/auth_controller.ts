import { loginUserValidator } from '#validators/auth'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async login({ request, auth, response }: HttpContext) {
    // const { email, password } = request.only([`email`, `password`])

    try {
      // 0. validation avec vine
      //  const requestBody = request.only([`email`, `password`])
      //   const validateUser = await loginUserValidator.validate(requestBody)
      const validateUser = await request.validateUsing(loginUserValidator)

      // 1. verifier l'utilidateur
      const user = await User.verifyCredentials(validateUser.email, validateUser.password)

      // 2. cree un token d'accès
      //   const token = await User.accessTokens.create(user, ['*'], { expiresIn: '1 hours' })

      const token = await auth.use('api').createToken(user)

      // 3. retourner le token et les informations de l'utilisateur
      return response.ok({
        message: 'Connexion réussie',
        token: token.toJSON(),
        type: token.type, // type de token (access, refresh, etc.)
        user: user.toJSON(),
      })
    } catch (error) {
      // Gestion des erreurs
      if (error.code === 'E_INVALID_CREDENTIALS') {
        return response.unauthorized({ message: 'Email ou mot de passe incorrect' })
      }

      if (error.code === 'E_VALIDATION_ERROR') {
        return response.badRequest({ message: 'Erreur de validation', errors: error.messages })
      }

      console.error('Erreur login:', error)

      return response.internalServerError({
        message: 'Une erreur est survenue lors de la connexion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }

  async logout({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      if (!user?.currentAccessToken) {
        return response.badRequest({ message: 'Aucun token actif à révoquer' })
      }

      await User.accessTokens.delete(user, user.currentAccessToken.identifier)

      return response.ok({
        message: 'Déconnexion réussie',
      })
    } catch (error) {
      console.error('Erreur logout:', error)
      return response.internalServerError({
        message: 'Erreur lors de la déconnexion',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }
  async refreshToken({ auth, response }: HttpContext) {
    try {
      const user = auth.user!

      if (!user?.currentAccessToken) {
        return response.badRequest({ message: 'Aucun token actif à révoquer' })
      }

      const token = await User.accessTokens.create(user, ['*'], { expiresIn: '1 hours' })

      return response.ok({
        message: 'Token rafraîchi avec succès',
        token: token.toJSON(),
        type: token.type,
        user: user.toJSON(),
      })
    } catch (error) {
      console.error('Erreur refreshToken:', error)
      return response.internalServerError({
        message: 'Erreur lors du rafraîchissement du token',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }
}

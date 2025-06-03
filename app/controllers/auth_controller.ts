import { DateTime } from 'luxon';
import {
  emailValidator,
  loginUserValidator,
  registerProfileValidator,
  registerUserValidator,
} from '#validators/auth'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Profile from '#models/profile'

export default class AuthController {
  async register(ctx: HttpContext) {
    // 0 . recuperer les donnees de la requete
    const data = ctx.request.only(['email', 'password', 'password_confirmation'])
    const profileData = ctx.request.only(['firstName', 'lastName', 'username', 'birthdayDate'])

    const trx = await db.transaction()

    try {
      // 1. validation des donnees

      // valider les donnees de l'utilisateur
      const validate = await registerUserValidator.validate(data)
      // valider les donnees du profile
      const validateProfile = await registerProfileValidator.validate(profileData)

      // 2. enregistrement des donnees dans la BDD

      //enregistrer le user dans la BDD
      const userRegistered = await new User()
        .fill({ email: validate.email, password: validate.password })
        .useTransaction(trx)
        .save()
      //enregistrer le profile de l'utilisateur
      const profileRegistered = await new Profile()
        .fill({
          userId: userRegistered.id,
          firstName: validateProfile.firstName,
          lastName: validateProfile.lastName,
          username: validateProfile.username,
          birthDate: DateTime.fromJSDate(validateProfile.birthdayDate),
        })
        .useTransaction(trx)
        .save()

      // 3. generer un token valide
      await trx.commit()

      const token = await ctx.auth.use('api').createToken(userRegistered)

      // 4. valider la transaction
      // 5. retourner une reponse au client
      return ctx.response.status(201).json({
        message: 'Utilisateur enregistré avec succès',
        token: token.toJSON(),
        type: token.type,
        user: [userRegistered.toJSON(), profileRegistered.toJSON()],
      })
    } catch (error) {
      await trx.rollback()
      console.error('Erreur register:', error)
      if (error.code === 'E_VALIDATION_ERROR') {
        return ctx.response.badRequest({ message: 'Erreur de validation', errors: error.messages })
      }
      return ctx.response.internalServerError({
        message: 'Une erreur est survenue lors de l’inscription',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }
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

  async emailExist(ctx: HttpContext) {
    try {
      const validateEmail = await emailValidator.validate(ctx.request.only(['email']))
      const user = await User.findBy('email', validateEmail.email)

      if (user) {
        return ctx.response.ok({ existe: true })
      }
      return ctx.response.ok({ existe: false })
    } catch (error) {
      console.error('Erreur verifyEmail:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la vérification de l’email',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }
}

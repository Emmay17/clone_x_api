import HttpExceptionHandler from '#exceptions/handler'
import User from '#models/user'
import { registerUserValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  // enregistrement des utilisateurs
  async register(ctx: HttpContext) {
    // 0 . recuperer les donnees de la requete
    const data = ctx.request.all()

    try {
      // 1 . valider les donnees avec note validator fait avec vine
      const validate = await registerUserValidator.validate(data)

      // 2 . verifier si l'email existe deja dans la BDD pour eviter les doublons
      const emailExist = await User.query().whereRaw('email = ?', [data.email]).first()
      if (emailExist) {
        return ctx.response.badRequest({ message: 'Cet email existe déjà' })
      }

      // 3. enregistrer dans la BDD
      const user = await User.create(validate)

      // 4. generer un token valide
      const token = await ctx.auth.use('api').createToken(user)
      // 5. retourner une reponse au client
      return ctx.response.status(201).json({
        message: 'Utilisateur enregistré avec succès',
        token: token.toJSON(),
        type: token.type,
        user: user.toJSON(),
      })
    } catch (error) {
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

  // les differente fetch pour le user
  async fetchAll(ctx: HttpContext) {
    try {
        const allUsers = await User.all() 
        if(allUsers.length === 0) {
            return ctx.response.notFound({
                message : 'Aucun utilisateur trouvé',
                data : allUsers})
        }
        return ctx.response.json({
            message : 'Recuperation effectuer avec succés',
            data : allUsers
        })
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération des utilisateurs',
        error: error.message || 'Erreur inconnue',
      })
        
    }
  }

  async fetchById(ctx: HttpContext) {
    const id = ctx.request.param('id')
    try {
        const user = await User.findOrFail(id)
        if (!user) {
            return ctx.response.notFound({message : `Aucun utilisateur trouvé avec l'id ${id}`})
        }
        return ctx.response.json({
            message : 'Utilisateur trouvé avec succès',
            data : user
        })
    } catch (error) {
      console.error('Erreur lors de la récupération de l’utilisateur:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération de l’utilisateur',
        error: error.message || 'Erreur inconnue',
      })
        
    }
  }

  async fetchByEmail(ctx: HttpContext) {
    const email = ctx.request.param('email')
    try {
        const user = await User.query().whereRaw('email = ?', [email]).first()
        if (!user) {
            return ctx.response.notFound({message : `Aucun utilisateur trouvé avec l'email ${email}`})
        }
    } catch (error) {
      console.error('Erreur lors de la récupération de l’utilisateur:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération de l’utilisateur',
        error: error.message || 'Erreur inconnue',
      })
        
    }
  }

  async fetchByStatus(ctx: HttpContext) {
    const status = ctx.request.param('status')

    try {
        const users = await User.query().whereRaw('status = ?', [status])
        if (users.length === 0) {
            return ctx.response.notFound({message : `Aucun utilisateur trouvé avec le status ${status}`})
        }

        return ctx.response.json({
            message : 'Utilisateur trouvé avec succès',
            data : users
        })
    } catch (error) {
      console.error('Erreur lors de la récupération de l’utilisateur:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération de l’utilisateur',
        error: error.message || 'Erreur inconnue',
      })
        
    }
  }

  async fetchByUsername(ctx: HttpContext) {
    const username = ctx.request.param('username')
    try {
        const user = await User.query().whereRaw('username = ?', [username]).first()
        if (!user) {
            return ctx.response.notFound({message : `Aucun utilisateur trouvé avec le username ${username}`})
        }
        return ctx.response.json({
            message : 'Utilisateur trouvé avec succès',
            data : user
        })
    } catch (error) {
      console.error('Erreur lors de la récupération de l’utilisateur:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération de l’utilisateur',
        error: error.message || 'Erreur inconnue',
      })
        
    }
  }

  async fetchByFullname(ctx : HttpContext){
    const fullName = ctx.request.param('fullName')
    try {
        const user = await User.query().whereRaw('full_name = ?', [fullName]).first()
        if (!user) {
            return ctx.response.notFound({message : `Aucun utilisateur trouvé avec le nom ${fullName}`})
        }
        return ctx.response.json({
            message : `Utilisateur ${fullName} trouvé avec succès`,
            data : user
        })
    } catch (error) {
      console.error('Erreur lors de la récupération de l’utilisateur:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération de l’utilisateur',
        error: error.message || 'Erreur inconnue',
      })
        
    }
  }

  // mise à jour des informations d'un utilisateur
  async update(ctx: HttpContext) {
    const id = ctx.request.param('id')
    const data = ctx.request.all()
    try {
        const user = await User.findOrFail(id)
        if (!user) {
            return ctx.response.notFound({message : `Aucun utilisateur trouvé avec l'id ${id}`})
        }

        const dataVerified = await registerUserValidator.validate(data)

        user.merge(dataVerified)

        await user.save()

        return ctx.response.json({
            message : "Utilisateur mis à jour avec succès",
            data : user
        })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l’utilisateur:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la mise à jour de l’utilisateur',
        error: error.message || 'Erreur inconnue',
      })
        
    }
  }

  // suppression d'un utilisateur
  async delete(ctx: HttpContext) {
    const id = ctx.request.param('id')

    try {
        const user = await User.findOrFail(id);
        if (!user){
            return ctx.response.notFound({message : `Aucun utilisateur trouvé avec l'id ${id}`})
        }

        await user.delete()

        return ctx.response.json({
            message : 'Utilisateur supprimé avec succès'
        })
    } catch (error) {
      console.error('Erreur lors de la suppression de l’utilisateur:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la suppression de l’utilisateur',
        error: error.message || 'Erreur inconnue',
      })
        
    }
  }
}

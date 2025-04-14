import Role from '#models/role'
import { addRole, updateRole } from '#validators/role'
import type { HttpContext } from '@adonisjs/core/http'

export default class RolesController {
  async register(ctx: HttpContext) {
    try {
      // 0 . recuperer les donnees de la requete
      const data = ctx.request.all()

      // 1 . valider les donnees avec note validator fait avec vine
      const validate = await addRole.validate(data)

      // 2 . verifier si le labelle existe deja dans la BDD pour eviter les doublons
      const labelleExist = await Role.query().whereRaw('label = LOWER(?)', [data.labelle]).first()

      if (labelleExist) {
        return ctx.response.badRequest({ message: 'Ce labelle existe déjà' })
      }

      // 3 . enregistrer dans la base de BDD
      await Role.create(validate)
      // 4 . retourner une reponse JSON si la Role est cree avec succés
      return ctx.response.status(201).json({
        message: 'Role enregistrée avec succès',
      })
    } catch (error) {
      console.error('Erreur de validation:', JSON.stringify(error, null, 2))
      const errors = error.formatted || error.messages || error
      return ctx.response.internalServerError({
        message: error.message || "Erreur lors de l'enregistrement du role",
        errors,
      })
    }
  }

  async fetchAll(ctx: HttpContext) {
    try {
      // 1 . recuperation de toute le Roles dans la BDD
      const allRoles = await Role.all()

      // 2. verifier si on a des Roles
      if (allRoles.length === 0) {
        return ctx.response.notFound({
          message: 'Aucune role trouvée',
          data: [],
        })
      }
      // 3 . retourner les Roles trouvées
      return ctx.response.json({
        message: 'Recuperation effectuer avec succés',
        data: allRoles,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des roles:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération des roles',
        error: error.message || 'Erreur inconnue',
      })
    }
  }

  async fetchOne(ctx: HttpContext) {
    try {
      // 1 . recuperer le paramettre de ma route
      const id = ctx.params.id

      // 2 . trouver la Role avec l'id demander
      const role = await Role.findOrFail(id)
      if (!role) {
        return ctx.response.notFound({
          message: `Aucun role trouvée avec l'Id : ${id}`,
        })
      }
      // 3 . retourner la Role trouvée
      return ctx.response.json({
        message: 'Role trouvée avec succés',
        data: role,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération du role:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération du role',
        error: error.message || 'Erreur inconnue',
      })
    }
  }

  async fetchBylabelle(ctx: HttpContext) {
    try {
      // 1 decoder le labelle en cas d'espacement dans le /fetch-labelle/...
      const label = decodeURIComponent(ctx.params.labelle).toLowerCase()

      // 2. trouver la mRole a modifier
      const role = await Role.findBy('labelle', label)

      // 3. verifier si on a une n'existe pas Roles
      if (!role) {
        return ctx.response.notFound({
          message: `Role ${label} non trouvée`,
        })
      }

      // 4. retourner la Role trouvée
      return ctx.response.json({
        message: `Role ${label} trouvée avec succés`,
        data: role,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération de la Role:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération de la Role',
        error: error.message || 'Erreur inconnue',
      })
    }
  }

  async update(ctx: HttpContext) {
    try {
      // 0. recuperer le paramettre de ma route
      const id = ctx.params.id
      // 1. ici on valide les données avec note validator fait avec vine
      const validation = await ctx.request.validateUsing(updateRole)

      // 2. on recupere la Role a modifier
      const role = await Role.findOrFail(id)

      // 3. on met a jour la description
      role.description = validation.description?.toString() ?? ''

      // 4. on sauvegarde la Role
      await role.save()

      // 5. on retourne une réponse JSON
      return ctx.response.json({
        message: 'Role mise à jour avec succès',
        data: role,
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return ctx.response.badRequest({
          message: 'Erreur de validation',
          errors: error.messages, // Retourne les erreurs de validation
        })
      }
      console.error('Erreur lors de la modification de la Role :', error)
      return ctx.response.internalServerError({
        message: `Erreur lors de la modification de la Role`,
        error: error.message || 'Erreur inconnue',
      })
    }
  }

  async delete(ctx: HttpContext) {
    try {
      // 1 . recuperer le paramettre de ma route
      const id = ctx.params.id

      // 2 . trouver la Role avec l'id demander
      const roles = await Role.findOrFail(id)

      // 3 . supprimer la Role
      await roles.delete()

      // 4 . retourner la Role supprimée
      return ctx.response.json({
        message: `Role ${roles.label} supprimée avec succès`,
        data: roles,
      })
    } catch (error) {
      console.error('Erreur lors de la suppression de la Role:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la suppression de la Role',
        error: error.message || 'Erreur inconnue',
      })
    }
  }
}

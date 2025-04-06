import Permission from '#models/permission'
import { addpermission, updatepermission } from '#validators/permission'
import type { HttpContext } from '@adonisjs/core/http'

export default class PermissionsController {
  async register(ctx: HttpContext) {
    try {
      // 0 . recuperer les donnees de la requete
      const data = ctx.request.all()

      // 1 . valider les donnees avec note validator fait avec vine
      const validate = await addpermission.validate(data)

      // 2 . verifier si le labelle existe deja dans la BDD pour eviter les doublons
      const labelleExist = await Permission.query()
        .whereRaw('labelle = LOWER(?)', [data.labelle])
        .first()

      if (labelleExist) {
        return ctx.response.badRequest({ message: 'Ce labelle existe déjà' })
      }

      // 3 . enregistrer dans la base de BDD
      await Permission.create(validate)
      // 4 . retourner une reponse JSON si la permission est cree avec succés
      return ctx.response.status(201).json({
        message: 'Permissions enregistrée avec succès',
      })
    } catch (error) {
      console.error('Erreur de validation:', JSON.stringify(error, null, 2))
      const errors = error.formatted || error.messages || error
      return ctx.response.internalServerError({
        message: error.message || "Erreur lors de l'enregistrement de la permission",
        errors,
      })
    }
  }

  async fetchAll(ctx: HttpContext) {
    try {
      // 1 . recuperation de toute le permissions dans la BDD
      const allpermissions = await Permission.all()

      // 2. verifier si on a des permissions
      if (allpermissions.length === 0) {
        return ctx.response.notFound({
          message: 'Aucune permission trouvée',
          data: [],
        })
      }
      // 3 . retourner les permissions trouvées
      return ctx.response.json({
        message: 'Recuperation effectuer avec succés',
        data: allpermissions,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des permissions:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération des permissions',
        error: error.message || 'Erreur inconnue',
      })
    }
  }

  async fetchOne(ctx: HttpContext) {
    try {
        // 1 . recuperer le paramettre de ma route
      const id = ctx.params.id

        // 2 . trouver la permission avec l'id demander
      const permission = await Permission.findOrFail(id)
      if (!permission) {
        return ctx.response.notFound({
          message: `Aucune permission trouvée avec l'Id : ${id}`,
        })
      }
        // 3 . retourner la permission trouvée
      return ctx.response.json({
        message: 'Permission trouvée avec succés',
        data: permission,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération de la permission:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération de la permission',
        error: error.message || 'Erreur inconnue',
      })
    }
  }

  async fetchBylabelle(ctx: HttpContext) {
    try {
      // 1 decoder le labelle en cas d'espacement dans le /fetch-labelle/...
      const labelle = decodeURIComponent(ctx.params.labelle).toLowerCase()

      // 2. trouver la mpermission a modifier
      const permission = await Permission.findBy('labelle', labelle)

      // 3. verifier si on a une n'existe pas permissions
      if (!permission) {
        return ctx.response.notFound({
          message: `Permission ${labelle} non trouvée`,
        })
      }

      // 4. retourner la permission trouvée
      return ctx.response.json({
        message: `Permission ${labelle} trouvée avec succés`,
        data: permission,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération de la permission:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la récupération de la permission',
        error: error.message || 'Erreur inconnue',
      })
    }
  }

  async update(ctx: HttpContext) {
    try {
      // 0. recuperer le paramettre de ma route
      const id = ctx.params.id
      // 1. ici on valide les données avec note validator fait avec vine
      const validation = await ctx.request.validateUsing(updatepermission)

      // 2. on recupere la permission a modifier
      const permission = await Permission.findOrFail(id)

      // 3. on met a jour la description
      permission.description = validation.description?.toString() ?? ''

      // 4. on sauvegarde la permission
      await permission.save()

      // 5. on retourne une réponse JSON
      return ctx.response.json({
        message: 'Permission mise à jour avec succès',
        data: permission,
      })
    } catch (error) {
      if (error.code === 'E_VALIDATION_ERROR') {
        return ctx.response.badRequest({
          message: 'Erreur de validation',
          errors: error.messages, // Retourne les erreurs de validation
        })
      }
      console.error('Erreur lors de la modification de la permission :', error)
      return ctx.response.internalServerError({
        message: `Erreur lors de la modification de la permission`,
        error: error.message || 'Erreur inconnue',
      })
    }
  }

  async delete(ctx: HttpContext) {
    try {
        // 1 . recuperer le paramettre de ma route
      const id = ctx.params.id

        // 2 . trouver la permission avec l'id demander
        const permissions = await Permission.findOrFail(id)

        // 3 . supprimer la permission
      await permissions.delete()

        // 4 . retourner la permission supprimée
      return ctx.response.json({
        message: `Permission ${permissions.labelle} supprimée avec succès`,
        data: permissions,
      })
    } catch (error) {
      console.error('Erreur lors de la suppression de la permission:', error)
      return ctx.response.internalServerError({
        message: 'Erreur lors de la suppression de la permission',
        error: error.message || 'Erreur inconnue',
      })
    }
  }
}

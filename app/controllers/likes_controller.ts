import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Tweet from '#models/tweet'
import Like from '#models/like'
export default class LikesController {
  async likeUnlikeTweet(ctx: HttpContext) {
    const { tweetId, userId } = ctx.request.params()
    // const userId = ctx.request.input('userId')
    if (!tweetId || !userId) {
      return ctx.response.status(404).json({ message: 'Utilisateur ou tweet non spécifié' })
    }
    try {
      const userExiste = await User.findOrFail(userId)
      const tweetExist = await Tweet.findOrFail(tweetId)

      if (userExiste && tweetExist) {
        // Vérifier si l'utilisateur a déjà liké le tweet
        const alreadyLiked = await tweetExist
          .related('likes')
          .query()
          .where('user_id', userId)
          .first()

        if (alreadyLiked) {
          await alreadyLiked.delete() // Supprimer le like existant
          return ctx.response.status(200).json({
            message: 'like supprimé avec succès',
          })
        }

        // Ajouter le like
        await tweetExist.related('likes').create({ userId })

        return ctx.response.status(201).json({
          message: 'Like ajouté avec succès',
        })
      } else {
        return ctx.response.status(404).json({
          message: 'Utilisateur ou tweet non trouvé',
        })
      }
    } catch (error) {
      return ctx.response.status(500).json({
        message: "Une erreur est survenue lors de l'enregistrement du like",
        error: error.message,
      })
    }
  }
  async fetchLikesByTweetId(ctx: HttpContext) {
    const tweetId = ctx.request.param('tweetId')

    if (!tweetId) {
      return ctx.response.status(404).json({ message: 'Tweet ID est requis' })
    }

    if (isNaN(tweetId)) {
      return ctx.response.status(400).json({ message: 'Tweet ID doit être un nombre' })
    }

    try {
      const tweet = await Tweet.query().where('id', tweetId).withCount('likes').first()

      if (!tweet) {
        return ctx.response.status(404).json({ message: 'Tweet non trouvé' })
      }

      return ctx.response.status(200).json({
        message: 'Likes retrieved successfully',
        data: tweet,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        message: 'Une erreur est survenue lors de la récupération des likes',
        error: error.message,
      })
    }
  }
  async fetchLikesByUserId(ctx: HttpContext) {
    const userId = ctx.request.param('userId')

    if (!userId) {
      return ctx.response.status(404).json({ message: 'User ID is required' })
    }

    try {
      const tweetLiked = await Like.query().where('user_id', userId).preload('tweet')

      if (tweetLiked.length === 0) {
        return ctx.response.status(404).json({ message: 'Aucun like trouvé pour cet utilisateur' })
      }

      return ctx.response.ok({
        message: 'Likes trouvé avec succés',
        data: tweetLiked,
      })
    } catch (error) {
      return ctx.response.status(500).json({
        message: 'Une erreur est survenue lors de la récupération des likes',
        error: error.message,
      })
    }
  }
}

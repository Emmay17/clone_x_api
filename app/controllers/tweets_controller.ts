import Media from '#models/media'
import Tweet from '#models/tweet'
import type { HttpContext } from '@adonisjs/core/http'
import CloudinaryService from '../Services/CloudinaryService.js' // ✔️ Bien importer avec alias
// import Database from '@ioc:Adonis/Lucid/Database'

export default class TweetsController {
  async postTweet(ctx: HttpContext) {
    // const trx = await Database.transaction()
    const data = ctx.request.all()
    try {
      const userId = data.user_id
      const content = data.content || null
      const tweet_id = data.tweet_id || null

      if (!userId || (!content && !ctx.request.file('media'))) {
        return ctx.response.badRequest({
          message: 'Champs requis manquants.',
        })
      }

      // Si c'est un commentaire, on vérifie que le tweet parent existe
    if (tweet_id) {
      const parentTweet = await Tweet.find(tweet_id)
      if (!parentTweet) {
        return ctx.response.notFound({
          message: 'Le tweet parent spécifié est introuvable.',
        })
      }
    }

      // Étape 1 : Création du tweet
      const tweet = await Tweet.create({
        userId: userId,
        content: content,
        parent_tweet: tweet_id,
      })

      // Étape 2 : Récupération des fichiers médias
      const files = ctx.request.files('media', {
        extnames: ['jpg', 'png', 'jpeg'],
        size: '100mb',
      })

      // Étape 3 : Envoi et enregistrement des médias
      for (const file of files) {
        if (!file.tmpPath) continue
        const result = await CloudinaryService.upload(file.tmpPath)

        const type = result.resource_type === 'video' ? 'video' : 'image'

        await Media.create({
          tweetId: tweet.id,
          url: result.secure_url,
          type: type,
        })
      }

      const message = tweet_id
        ? 'Réponse ajoutée avec succès'
        : 'Tweet créé avec succès'

        return ctx.response.created({
          message,
          data: tweet,
        })
    } catch (error) {
      const errors = error.formatted || error.messages || error
      return ctx.response.internalServerError({
        message: error.message || "Erreur lors de l'enregistrement du tweet",
        errors,
      })
    }
  }

  async fetchTweetsByUserId(ctx: HttpContext) {
    const userId = ctx.request.param('id')
    // ✅ Vérification explicite avec un type plus clair
    if (typeof userId !== 'string' || userId.trim() === '') {
      return ctx.response.badRequest({
        message: 'ID utilisateur requis.',
      })
    }
    try {
      const tweets = await Tweet.query()
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .preload('medias', (query) => {
          query.select(['tweet_id', 'url', 'type'])
        })
        .preload('user', (userQuery) => {
          userQuery.select(['id', 'email'])
          userQuery.preload('profile', (profileQuery) => {
            profileQuery.select([
              'user_id',
              'first_name',
              'last_name',
              'username',
              'profile_image',
              'is_verified',
            ])
          })
        })
        .withCount('likes', (query) => {
          query.as('likes_count')
        })

      const reponse = tweets.map((tweet) => tweet.toJSON())
      return ctx.response.ok({
        message: 'Tweets récupérés avec succès',
        data: reponse,
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des tweets:', error)
      return ctx.response.internalServerError({
        message: 'Erreur serveur lors de la récupération des tweets.',
        errors: error.message || 'Erreur inconnue',
      })
    }
  }

  async fetchAllTweet(ctx: HttpContext) {
    try {
      const tweets = await Tweet.query()
        .orderBy('created_at', 'desc')
        .whereNull('parent_tweet') // Récupérer uniquement les tweets principaux
        .preload('medias', (query) => {
          query.select(['tweet_id', 'url', 'type'])
        })
        .preload('user', (userQuery) => {
          userQuery.select(['id', 'email'])
          userQuery.preload('profile', (profileQuery) => {
            profileQuery.select([
              'user_id',
              'first_name',
              'last_name',
              'username',
              'profile_image',
              'is_verified',
            ])
          })
        })
        .withCount('likes')
        .withCount('replies')
        // .preload('replies')
        .paginate(ctx.request.input('page', 1), ctx.request.input('perPage', 10))

      return ctx.response.ok({
        message: 'Tweets récupérés avec succès',
        tweets: tweets.serialize(),
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des tweets:', error)
      return ctx.response.internalServerError({
        message: 'Erreur serveur lors de la récupération des tweets.',
        errors: error.message || 'Erreur inconnue',
      })
    }
  }

  // async retweet(ctx: HttpContext) {
  // }
}

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

      await tweet.load('medias')
      await tweet.load('user', (userQuery) => {
        userQuery.preload('profile')
      })

      const message = tweet_id ? 'Réponse ajoutée avec succès' : 'Tweet créé avec succès'

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
      await ctx.auth.authenticate()
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
        .preload('likes', (likesQuery) => {
          likesQuery.where('user_id', ctx.auth.user?.id || 0)
          // likesQuery.as('is_liked')
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
    const page = Number(ctx.request.param('page', 1))
    const perPage = Number(ctx.request.param('perPage', 10))

    // Valider que page et perPage sont bien des entiers positifs
    if (isNaN(page) || page < 1 || isNaN(perPage) || perPage < 1) {
      return ctx.response.badRequest({
        message: 'Les paramètres de pagination sont invalides.',
      })
    }
    await ctx.auth.authenticate()
    // const user = await ctx.auth.getUserOrFail()
    // if (!user) {
    //   return ctx.response.notFound({
    //     message: 'Utilisateur non trouvé',
    //   })
    // }
    try {
      console.log("mon id de l'utilisateur connecté:", ctx.auth.user?.id)
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
        .preload('likes', (likesQuery) => {
          likesQuery.where('user_id', ctx.auth.user?.id || 0)
          // likesQuery.as('is_liked')
        })
        .paginate(page, perPage)

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

}

/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import AuthController from '#controllers/auth_controller'
import PermissionsController from '#controllers/roles_controller'
import UsersController from '#controllers/users_controller'
import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import TweetsController from '#controllers/tweets_controller'
import ProfilesController from '#controllers/profiles_controller'
import LikesController from '#controllers/likes_controller'

router.get('/', async () => {
  return 'BInevenue sur mon API avec AdonisJS'
})

//  route pour les permissions
router
  .group(() => {
    // route pour l'enregistrement des permissions
    router.post('/register', [PermissionsController, 'register']).as('permission.register') // enregistrement d'une permission

    // route pour les differents fetch des permissions
    router.get('/fetch-all', [PermissionsController, 'fetchAll']).as('permission.fetchAll') // rechercher toutes les permissions
    router.get('/fetch-one/:id', [PermissionsController, 'fetchOne']).as('permission.fetchOne') // rechercher une permission par son id
    router
      .get('/fetch-labelle/:labelle', [PermissionsController, 'fetchBylabelle'])
      .as('permission.fetchByLabelle') // rechercher une permission par son labelle

    // route pour la mise a jour des permissions
    router.put('/update/:id', [PermissionsController, 'update']).as('permission.update') // mettre a jour une permission

    // route pour la suppression des permissions
    router.delete('/delete/:id', [PermissionsController, 'delete']).as('permission.delete') // supprimer une permission
  })
  .prefix('permissions')

// route pour authentifications
router
  .group(() => {
    // route d'enregistrement des utilisateurs
    router.post('/register', [AuthController, 'register']).as('user.register') // enregistrement d'un Utilisateur
    router.post('/login', [AuthController, 'login']).as('auth.login') // authentification d'un Utilisateur
    router
      .post('/logout', [AuthController, 'logout'])
      .as('auth.logout') // deconnexion d'un Utilisateur
      .use(middleware.auth())
  })
  .prefix('/auth')

// route pour les utilisateurs
router
  .group(() => {
    // routes pour les differentes recherche des Utilisateurs
    router.get('/fetch-all', [UsersController, 'fetchAll']).as('user.fetchAll') // rechercher tous les Utilisateurs
    router.get('/fetch-id/:id', [UsersController, 'fetchById']).as('user.fetchById') // rechercher un utilisateur par son Id
    router.get('/fetch-email/:email', [UsersController, 'fetchByEmail']).as('user.fetchByEmail') // rechercher un utilisateur par son Email
    router
      .get('/fetch-username/:username', [UsersController, 'fetchByUsername'])
      .as('user.fetchByUsername') // rechercher un utilisateur par son Username
    router
      .get('/fetch-fullname/:fullName', [UsersController, 'fetchByFullname'])
      .as('user.fetchByFullname') // rechercher un utilisateur par son Fullname

    // recuperation du profile de l'utilisateur
    router.get('/profile/:id', [ProfilesController, 'fetchProfile']).as('user.profile') // recuperer le profile de l'utilisateur

    // route pour la mise a jour des utilisateurs
    router.put('/update/:id', [UsersController, 'update']).as('user.update') // mettre a jour un Utilisateur

    // route pour supprimer un utilisateur grace a son ID
    router.delete('/delete/:id', [UsersController, 'delete']).as('user.delete') // supprimer un Utilisateur
  })
  .prefix('user')

router
  .group(() => {
    // route pour eneregister un tweet avec media ou meme sans media tout court
    router.post('/post-tweet', [TweetsController, 'postTweet']).as('tweet.postTweet')
    // .use(middleware.auth())
    router
      .get('/fetch-tweets/:id', [TweetsController, 'fetchTweetsByUserId'])
      .as('tweet.fetchTweets') // recuperer tous les tweets

    router
      .get('/fetch-all-tweets/:page/:perPage', [TweetsController, 'fetchAllTweet'])
      .as('tweet.fetchAllTweets') // recuperer tous les tweets
  })
  .prefix('tweet').use(middleware.auth()) 

router
  .group(() => {
    // route pour liker un tweet
    router
      .post('/likeUnlike-tweet/:tweetId/user/:userId', [LikesController, 'likeUnlikeTweet'])
      .as('tweet.likeTweet') // liker un tweet

    router
      .post('/fetch-likes/:tweetId', [LikesController, 'fetchLikesByTweetId'])
      .as('tweet.fetchLikesByTweetId') // recuperer les likes d'un tweet

    router
      .post('/fetch-likes/user/:userId', [LikesController, 'fetchLikesByUserId'])
      .as('tweet.fetchLikesByUserId') // recuperer les likes d'un utilisateur
  })
  .prefix('likes').use(middleware.auth()) // Authentification requise pour les routes de likes

router.post('auth/verify-email', [AuthController, 'emailExist']).as('auth.verifyEmail') // verifier l'email d'un Utilisateur

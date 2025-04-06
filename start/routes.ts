/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import PermissionsController from '#controllers/permissions_controller'
import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'world',
  }
})
router.group(() => {
  router.post('/register', [PermissionsController, 'register']).as('permission.register')
  router.get('/fetch-all', [PermissionsController, 'fetchAll']).as('permission.fetchAll')
  router.get('/fetch-one/:id', [PermissionsController, 'fetchOne']).as('permission.fetchOne')
  router.get('/fetch-labelle/:labelle', [PermissionsController, 'fetchBylabelle']).as('permission.fetchByLabelle')
  router.put('/update/:id', [PermissionsController, 'update']).as('permission.update')
  router.delete('/delete/:id', 'permissions_controller.delete').as('permission.delete')
}).prefix('permission')

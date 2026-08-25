import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from '../services/session.service'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      // Página pública de entrada. Sin meta.requiresAuth: cualquiera puede verla.
      path: '/',
      name: 'index',
      component: () => import('../pages/IndexPage.vue')
    },
    {
      // Login. Tampoco requiere auth (obviamente, es donde te logueás).
      path: '/login',
      name: 'login',
      component: () => import('../pages/auth/LoginPage.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../pages/auth/RegisterPage.vue')
    },
    {
      // Contenedor de TODO lo privado. El meta va acá, en el padre,
      // y Vue Router lo hereda automáticamente a todas sus rutas hijas.
      path: '/',
      component: () => import('../components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: 'home',
          name: 'home',
          component: () => import('../pages/home/HomePage.vue')
        },
        {
          path: 'cuenta',
          name: 'account',
          component: () => import('../pages/account/AccountPage.vue')
        }
        // Los módulos futuros se agregan acá como nuevas rutas hijas,
        // y quedan protegidos automáticamente sin tocar nada más.
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !getAccessToken()) {
    next('/login')
    return
  }

  next()
})

export default router
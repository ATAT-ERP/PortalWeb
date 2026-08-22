import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'index',
      component: () => import('../pages/IndexPage.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/auth/LoginPage.vue')
    },
    {
      path: '/',
      component: () => import('../components/layout/AppLayout.vue'),
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
        // Los módulos futuros se agregan acá como nuevas rutas hijas.
      ]
    }
  ]
})

export default router

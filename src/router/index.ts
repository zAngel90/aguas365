import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import MainLayout from '@/layouts/MainLayout.vue'
import HistorialMantenimientosView from '@/views/HistorialMantenimientosView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue')
        },
        {
          path: 'clientes',
          name: 'clientes',
          component: () => import('@/views/ClientesView.vue')
        },
        {
          path: 'dispensadores',
          name: 'dispensadores',
          component: () => import('@/views/DispensadoresView.vue')
        },
        {
          path: 'mantenimientos',
          name: 'mantenimientos',
          component: () => import('@/views/MantenimientosView.vue')
        },
        {
          path: 'tecnicos',
          name: 'tecnicos',
          component: () => import('@/views/TecnicosView.vue')
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('@/views/UsuariosView.vue')
        },
        {
          path: 'reportes',
          name: 'reportes',
          component: () => import('@/views/ReportesView.vue')
        },
        {
          path: 'historial-mantenimientos',
          name: 'historial-mantenimientos',
          component: HistorialMantenimientosView
        }
      ]
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !authStore.checkAuth()) {
    next('/login')
  } else if (to.path === '/login' && authStore.checkAuth()) {
    next('/')
  } else {
    next()
  }
})

export default router 
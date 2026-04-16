import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/views/layout/index.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '数据概览', icon: 'DataAnalysis' }
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('@/views/users/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('@/views/orders/index.vue'),
        meta: { title: '订单管理', icon: 'Document' }
      },
      {
        path: 'content',
        name: 'Content',
        redirect: '/content/articles',
        meta: { title: '内容管理', icon: 'DocumentCopy' },
        children: [
          {
            path: 'articles',
            name: 'Articles',
            component: () => import('@/views/content/articles.vue'),
            meta: { title: '文章管理' }
          },
          {
            path: 'banners',
            name: 'Banners',
            component: () => import('@/views/content/banners.vue'),
            meta: { title: '海报管理' }
          },
          {
            path: 'magazines',
            name: 'Magazines',
            component: () => import('@/views/content/magazines.vue'),
            meta: { title: '杂志管理' }
          },
          {
            path: 'suites',
            name: 'Suites',
            component: () => import('@/views/content/suites.vue'),
            meta: { title: '房型管理' }
          }
        ]
      },
      {
        path: 'coupons',
        name: 'Coupons',
        component: () => import('@/views/content/coupons.vue'),
        meta: { title: '优惠券管理', icon: 'Ticket' }
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('@/views/content/feedback.vue'),
        meta: { title: '反馈管理', icon: 'ChatDotRound' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  // 设置页面标题
  document.title = `${to.meta.title || '管理后台'} - 爱儿美月子中心`
  
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false
  
  if (requiresAuth && !userStore.isLoggedIn) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else if (to.name === 'Login' && userStore.isLoggedIn) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router

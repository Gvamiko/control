import { createRouter, createWebHistory } from 'vue-router'

// Lazy-load გვერდები
const Dashboard    = () => import('../views/auth/Dashboard.vue')
const Form         = () => import('../views/auth/Form.vue')
const TwoStepAuth  = () => import('../views/auth/TwoStepAuth.vue')

// პატარა ჰელპერი ავტორიზაციისთვის (ფრონტ-ენდი მხოლოდ)
const isAuthenticated = () => !!localStorage.getItem('auth_token')  // true/false

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',       name: 'Dashboard',   component: Dashboard,  meta: { title: 'სია' } },
    { path: '/form',   name: 'Form',        component: Form,       meta: { title: 'დამატება' } },
    { path: '/auth',   name: 'TwoStepAuth', component: TwoStepAuth,meta: { title: 'ავტორიზაცია', public: true } },

    // 404
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: { template: '<div class="p-8 text-center text-gray-700">გვერდი ვერ მოიძებნა</div>' },
      meta: { title: 'გვერდი ვერ მოიძებნა', public: true }
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// --- გვერდის სათაური
router.afterEach((to) => {
  if (to.meta?.title) document.title = `Control — ${to.meta.title}`
  else document.title = 'Control'
})

// --- გლობალური guard (აუცილებელი ავტორიზაცია)
router.beforeEach((to, from, next) => {
  const authed = isAuthenticated()

  // თუ არ არის ავტორიზებული და შედის არა-პუბლიკურ გვერდზე → /auth + redirect
  if (!authed && !to.meta?.public && to.name !== 'TwoStepAuth') {
    return next({ name: 'TwoStepAuth', query: { redirect: to.fullPath } })
  }

  // თუ უკვე ავტორიზებულია და მიდის /auth-ზე → გადააგდე მიზნობრივზე ან მთავარზე
  if (authed && to.name === 'TwoStepAuth') {
    const redirectTo = (to.query.redirect && String(to.query.redirect)) || '/'
    return next(redirectTo)
  }

  return next()
})

export default router

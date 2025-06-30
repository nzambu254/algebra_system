import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import DashboardAdmin from '../views/admin/Dashboard.vue'
import ManageContent from '../views/admin/ManageContent.vue'
import ManageUsers from '../views/admin/ManageUsers.vue'
import StudentProgress from '../views/admin/StudentProgress.vue'
import DashboardStudent from '../views/student/Dashboard.vue'
import LearnModule from '../views/student/LearnModule.vue'
import PracticeModule from '../views/student/PracticeModule.vue'
import MyProgress from '../views/student/MyProgress.vue'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresGuest: true }
  },
  // Admin routes
  {
    path: '/admin/dashboard',
    name: 'DashboardAdmin',
    component: DashboardAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/manage-content',
    name: 'ManageContent',
    component: ManageContent,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/manage-users',
    name: 'ManageUsers',
    component: ManageUsers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/student-progress',
    name: 'StudentProgress',
    component: StudentProgress,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Student routes
  {
    path: '/student/dashboard',
    name: 'DashboardStudent',
    component: DashboardStudent,
    meta: { requiresAuth: true }
  },
  {
    path: '/student/learn',
    name: 'LearnModule',
    component: LearnModule,
    meta: { requiresAuth: true }
  },
  {
    path: '/student/practice',
    name: 'PracticeModule',
    component: PracticeModule,
    meta: { requiresAuth: true }
  },
  {
    path: '/student/my-progress',
    name: 'MyProgress',
    component: MyProgress,
    meta: { requiresAuth: true }
  },
  // Auth route
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('../views/Auth.vue'),
    meta: { requiresGuest: true }
  },
  // Catch-all redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)
   
  // Get current user
  const currentUser = auth.currentUser
   
  // Check auth state before proceeding
  await new Promise(resolve => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe()
      resolve(user)
    })
  })

  if (requiresAuth && !currentUser) {
    // Redirect to home if not authenticated
    next('/')
  } else if (requiresGuest && currentUser) {
    // Redirect to appropriate dashboard if already logged in
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        next(userData.role === 'admin' ? '/admin/dashboard' : '/student/dashboard')
      } else {
        next('/')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      next('/')
    }
  } else if (requiresAuth && requiresAdmin) {
    // Verify admin status
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid))
      if (userDoc.exists() && userDoc.data().role === 'admin') {
        next()
      } else {
        next('/student/dashboard')
      }
    } catch (error) {
      console.error('Error verifying admin status:', error)
      next('/student/dashboard')
    }
  } else {
    next()
  }
})

export default router
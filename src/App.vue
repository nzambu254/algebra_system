<template>
  <div class="app-container">
    <TopNavBar 
      :user="currentUser"
      @logout="handleLogout"
    />
    
    <div class="main-content">
      <Sidebar 
        v-if="isAuthenticated"
        :isAdmin="isAdmin"
      />
      
      <div class="content-wrapper">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from './firebase'
import Sidebar from './components/Sidebar.vue'
import TopNavBar from './components/TopNavBar.vue'

export default {
  components: {
    Sidebar,
    TopNavBar
  },
  setup() {
    const router = useRouter()
    const route = useRoute()
    const currentUser = ref(null)
    const isAuthenticated = ref(false)
    const isAdmin = ref(false)
    const authInitialized = ref(false)

    onMounted(() => {
      auth.onAuthStateChanged(user => {
        currentUser.value = user
        isAuthenticated.value = !!user
        
        if (user) {
          // Simple admin check - in real app, you'd check user claims or database
          isAdmin.value = user.email && user.email.includes('admin')
        } else {
          isAdmin.value = false
        }

        // Only redirect if auth state has been initialized and we're not already on the correct route
        if (authInitialized.value) {
          handleAuthRedirect(user)
        } else {
          // First time initialization
          authInitialized.value = true
          handleInitialAuthRedirect(user)
        }
      })
    })

    const handleInitialAuthRedirect = (user) => {
      // Only redirect on initial load if user is not authenticated and not on login/register pages
      if (!user && !isPublicRoute(route.path)) {
        router.push('/')
      } else if (user && isPublicRoute(route.path)) {
        // User is authenticated but on a public route, redirect to appropriate dashboard
        const adminStatus = user.email && user.email.includes('admin')
        if (adminStatus) {
          router.push('/admin/dashboard')
        } else {
          router.push('/student/dashboard')
        }
      }
    }

    const handleAuthRedirect = (user) => {
      if (!user) {
        // User logged out, redirect to login if not already on a public route
        if (!isPublicRoute(route.path)) {
          router.push('/')
        }
      } else {
        // User logged in, redirect to appropriate dashboard only if on a public route
        if (isPublicRoute(route.path)) {
          const adminStatus = user.email && user.email.includes('admin')
          if (adminStatus) {
            router.push('/admin/dashboard')
          } else {
            router.push('/student/dashboard')
          }
        }
      }
    }

    const isPublicRoute = (path) => {
      const publicRoutes = ['/', '/login', '/register', '/forgot-password']
      return publicRoutes.includes(path)
    }

    const handleLogout = async () => {
      try {
        await auth.signOut()
        // The auth state change will handle the redirect
      } catch (error) {
        console.error('Logout error:', error)
      }
    }

    return {
      currentUser,
      isAuthenticated,
      isAdmin,
      handleLogout
    }
  }
}
</script>

<style>
/* Global Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f8fafc;
}

/* App Container */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Main Content Layout */
.main-content {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 70px); /* Assuming nav height is 70px */
}

/* Content Wrapper */
.content-wrapper {
  flex: 1;
  padding: 2rem;
  background: #f8fafc;
  margin-left: 0;
  transition: all 0.3s ease;
  overflow-y: auto;
  min-height: 100%;
}

/* When sidebar is present */
.main-content:has(.sidebar) .content-wrapper {
  margin-left: 0px; /* Sidebar width */
}

/* Responsive Design */
@media (max-width: 1024px) {
  .content-wrapper {
    padding: 1.5rem;
    margin-left: 0 !important;
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    padding: 1rem;
  }
  
  .main-content {
    flex-direction: column;
  }
}

/* Dashboard Specific Styles */
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
}

.welcome-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.welcome-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #6b7280;
}

/* Stats Cards Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

.stat-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
}

.lessons-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.exercises-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.score-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
  margin-top: 0.5rem;
}

.stat-description {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-top: 0.5rem;
}

/* Progress Bars */
.progress-container {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Recent Activity Section */
.recent-activity {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 2px;
  margin-right: 1rem;
}

/* Loading States */
.loading-spinner {
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Utility Classes */
.text-center {
  text-align: center;
}

.mt-1 { margin-top: 0.25rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-3 { margin-top: 0.75rem; }
.mt-4 { margin-top: 1rem; }

.mb-1 { margin-bottom: 0.25rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mb-3 { margin-bottom: 0.75rem; }
.mb-4 { margin-bottom: 1rem; }

.p-1 { padding: 0.25rem; }
.p-2 { padding: 0.5rem; }
.p-3 { padding: 0.75rem; }
.p-4 { padding: 1rem; }

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

/* Scrollbar Styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Focus States for Accessibility */
*:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

/* Print Styles */
@media print {
  .app-container {
    background: white !important;
  }
  
  .stat-card {
    box-shadow: none !important;
    border: 1px solid #e5e7eb !important;
  }
}
</style>
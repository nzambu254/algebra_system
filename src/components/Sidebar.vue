<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h3>{{ userRole === 'admin' ? 'Admin Panel' : 'Student Panel' }}</h3>
    </div>
    
    <nav class="sidebar-nav">
      <template v-if="userRole === 'admin'">
        <router-link to="/admin/dashboard" class="nav-link">
          <span class="icon">📊</span>
          <span class="text">Dashboard</span>
        </router-link>
        <router-link to="/admin/manage-content" class="nav-link">
          <span class="icon">📚</span>
          <span class="text">Manage Content</span>
        </router-link>
        <router-link to="/admin/manage-users" class="nav-link">
          <span class="icon">👥</span>
          <span class="text">Manage Users</span>
        </router-link>
        <router-link to="/admin/student-progress" class="nav-link">
          <span class="icon">📈</span>
          <span class="text">Student Progress</span>
        </router-link>
      </template>
      
      <template v-else>
        <router-link to="/student/dashboard" class="nav-link">
          <span class="icon">🏠</span>
          <span class="text">Dashboard</span>
        </router-link>
        <router-link to="/student/learn" class="nav-link">
          <span class="icon">🎓</span>
          <span class="text">Learn Module</span>
        </router-link>
        <router-link to="/student/practice" class="nav-link">
          <span class="icon">✏️</span>
          <span class="text">Practice Module</span>
        </router-link>
        <router-link to="/student/my-progress" class="nav-link">
          <span class="icon">📊</span>
          <span class="text">My Progress</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script>
import { ref, onMounted } from 'vue'
import { auth } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

export default {
  name: 'Sidebar',
  setup() {
    const userRole = ref('student') // Default to student

    const fetchUserRole = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
          if (userDoc.exists()) {
            userRole.value = userDoc.data().role || 'student'
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error)
      }
    }

    onMounted(() => {
      fetchUserRole()
      // Listen for auth state changes
      auth.onAuthStateChanged(() => {
        fetchUserRole()
      })
    })

    return {
      userRole
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  background-color: #34495e;
  color: white;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #2c3e50;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.sidebar-nav {
  padding: 10px 0;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #ecf0f1;
  text-decoration: none;
  transition: background-color 0.3s;
}

.nav-link:hover {
  background-color: #2c3e50;
}

.nav-link.router-link-exact-active {
  background-color: #3498db;
}

.icon {
  margin-right: 10px;
  font-size: 1.1rem;
}

.text {
  font-size: 0.95rem;
}
</style>
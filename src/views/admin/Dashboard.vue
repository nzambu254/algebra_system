<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <div class="stats-container">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p>{{ stats.totalUsers || 'Loading...' }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Students</h3>
        <p>{{ stats.activeStudents || 'Loading...' }}</p>
      </div>
      <div class="stat-card">
        <h3>Content Items</h3>
        <p>{{ stats.contentItems || 'Loading...' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, getDocs } from 'firebase/firestore'

export default {
  setup() {
    const stats = ref({
      totalUsers: 0,
      activeStudents: 0,
      contentItems: 0
    })

    onMounted(async () => {
      try {
        // Fetch users count
        const usersSnapshot = await getDocs(collection(db, 'users'))
        stats.value.totalUsers = usersSnapshot.size
        
        // Fetch active students (example - you'd implement your own logic)
        stats.value.activeStudents = usersSnapshot.size - 1 // Assuming 1 admin
        
        // Fetch content items count
        const contentSnapshot = await getDocs(collection(db, 'content'))
        stats.value.contentItems = contentSnapshot.size
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    })

    return { stats }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-card h3 {
  color: #7f8c8d;
  margin-bottom: 10px;
  font-size: 1.1rem;
}

.stat-card p {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}
</style>
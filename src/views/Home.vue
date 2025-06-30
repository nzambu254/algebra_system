<template>
  <div class="home">
    <div class="container">
      <h1>Algebra Learning System</h1>
      <p>Master algebra through interactive lessons</p>
      <div class="buttons">
        <router-link to="/auth?mode=login" class="btn">Login</router-link>
        <router-link to="/auth?mode=register" class="btn">Register</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeView',
  mounted() {
    // Redirect authenticated users away from home page
    if (this.$route.meta.requiresAuth && this.$store.state.user) {
      const redirectPath = this.$store.state.user.role === 'admin' 
        ? '/admin/dashboard' 
        : '/student/dashboard'
      this.$router.push(redirectPath)
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.container {
  text-align: center;
  max-width: 400px;
  padding: 2rem;
}

h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

p {
  color: #666;
  margin-bottom: 2rem;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn:hover {
  background-color: #0056b3;
}
</style>
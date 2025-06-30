<template>
  <div class="home">
    <header class="hero-section">
      <div class="container">
        <h1>Algebra Learning System</h1>
        <p class="subtitle">Master algebra concepts through interactive lessons and practice</p>
        <div class="cta-buttons">
          <router-link to="/auth?mode=login" class="btn btn-primary">Login</router-link>
          <router-link to="/auth?mode=register" class="btn btn-secondary">Register</router-link>
        </div>
      </div>
    </header>

    <section class="features">
      <div class="container">
        <h2>Why Choose Our Platform?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="icon">📚</div>
            <h3>Comprehensive Lessons</h3>
            <p>Learn algebra concepts through structured, easy-to-follow modules.</p>
          </div>
          <div class="feature-card">
            <div class="icon">🧮</div>
            <h3>Interactive Practice</h3>
            <p>Reinforce your learning with hands-on practice problems.</p>
          </div>
          <div class="feature-card">
            <div class="icon">📊</div>
            <h3>Progress Tracking</h3>
            <p>Monitor your improvement with detailed progress reports.</p>
          </div>
        </div>
      </div>
    </section>
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
  flex-direction: column;
}

.hero-section {
  background: linear-gradient(135deg, #4a6bff, #6a11cb);
  color: white;
  padding: 5rem 1rem;
  text-align: center;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: white;
  color: #4a6bff;
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.features {
  padding: 4rem 1rem;
  background-color: #f9f9f9;
}

.features h2 {
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.feature-card .icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  line-height: 1.6;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
</style>
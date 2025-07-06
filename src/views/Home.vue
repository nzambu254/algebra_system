<template>
  <div class="home">
    <!-- Slim Hero Section -->
    <div class="hero">
      <div class="container">
        <h1>Algebra Learning System</h1>
        <p class="subtitle">Master algebra through interactive lessons tailored to your learning style</p>
        <div class="buttons">
          <router-link to="/auth?mode=login" class="btn">Login</router-link>
          <router-link to="/auth?mode=register" class="btn">Register</router-link>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features">
      <div class="container">
        <h2>Why Learn With Us?</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <img src="/alg1.jpeg" alt="Algebra Basics" class="feature-img">
            <h3>Master the Fundamentals</h3>
            <p>Build a rock-solid foundation with our interactive lessons on variables, equations, and expressions. Perfect for beginners and those needing a refresher.</p>
          </div>
          
          <div class="feature-card">
            <img src="/alg2.jpeg" alt="Problem Solving" class="feature-img">
            <h3>Real-World Applications</h3>
            <p>Discover how algebra powers everything from computer graphics to financial planning through our practical problem-solving modules.</p>
          </div>
          
          <div class="feature-card">
            <img src="/alg3.jpeg" alt="Advanced Concepts" class="feature-img">
            <h3>Progress to Advanced Topics</h3>
            <p>Take your skills further with polynomials, quadratic equations, and functions. Our step-by-step approach makes complex concepts accessible.</p>
          </div>
        </div>
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
  background-color: #f8f9fa;
}

.hero {
  min-height: 30vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
  color: #2c3e50;
  text-align: center;
  padding: 2rem;
  border-bottom: 1px solid #e0e0e0;
}

.hero .container {
  max-width: 800px;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  color: #7f8c8d;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn {
  padding: 0.6rem 1.2rem;
  background-color: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-weight: 500;
  border: none;
  font-size: 0.9rem;
}

.btn:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.features {
  padding: 3rem 0;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
  color: #2c3e50;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
}

.feature-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.feature-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-bottom: 1px solid #eee;
}

.feature-card h3 {
  padding: 1rem 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.feature-card p {
  padding: 0.5rem 1rem 1.5rem;
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .hero {
    min-height: 25vh;
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .subtitle {
    font-size: 1rem;
  }
  
  .buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn {
    width: 100%;
    max-width: 180px;
    margin-bottom: 0.5rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
  }
}
</style>
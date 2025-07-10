<template>
  <div class="home">
    <!-- Main Split Layout -->
    <div class="main-layout">
      <!-- Left Side - Graphics and Features -->
      <div class="left-section">
        <div class="hero-content">
          <h1>Algebra Learning System</h1>
          <p class="subtitle">Master algebra through interactive lessons tailored to your learning style</p>
        </div>
        
        <!-- Features Section -->
        <div class="features">
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

      <!-- Right Side - Login/Register -->
      <div class="right-section">
        <div class="auth-container">
          <div class="auth-card">
            <h2>Welcome Back!</h2>
            <p class="auth-subtitle">Choose an option to get started</p>
            <div class="auth-buttons">
              <router-link to="/auth?mode=login" class="btn btn-primary">Login</router-link>
              <router-link to="/auth?mode=register" class="btn btn-secondary">Register</router-link>
            </div>
            <div class="auth-divider">
              <span>or</span>
            </div>
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

.main-layout {
  display: flex;
  min-height: 100vh;
}

/* Left Section - Graphics */
.left-section {
  flex: 1;
  padding: 2rem;
  background-color: #f8f9fa;
  color: rgb(0, 0, 0);
  overflow-y: auto;
}

.hero-content {
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 600;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-content .subtitle {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  color: rgba(10, 10, 10, 0.9);
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: rgb(14, 13, 13);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.feature-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-card h3 {
  padding: 1rem 1rem 0;
  color: rgb(15, 15, 15);
  font-size: 1.2rem;
  font-weight: 600;
}

.feature-card p {
  padding: 0.5rem 1rem 1.5rem;
  color: rgba(10, 10, 10, 0.9);
  line-height: 1.6;
  font-size: 0.9rem;
}

/* Right Section - Auth */
.right-section {
  flex: 0 0 400px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

.auth-container {
  width: 100%;
  max-width: 350px;
  padding: 2rem;
}

.auth-card {
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  background: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.auth-card h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.auth-subtitle {
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #7f8c8d;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn {
  padding: 0.8rem 1.5rem;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  display: block;
  text-align: center;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 2px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.auth-divider {
  position: relative;
  margin: 1.5rem 0;
  color: #bdc3c7;
}

.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e0e0e0;
}

.auth-divider span {
  background: white;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }
  
  .left-section {
    flex: none;
    min-height: 60vh;
    padding: 1.5rem;
  }
  
  .right-section {
    flex: none;
    min-height: 40vh;
  }
  
  .hero-content h1 {
    font-size: 2.2rem;
  }
  
  .hero-content .subtitle {
    font-size: 1.1rem;
  }
  
  .feature-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .auth-container {
    padding: 1rem;
  }
  
  .auth-card {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 1.8rem;
  }
}
</style>
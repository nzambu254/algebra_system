<template>
  <div class="auth-page">
    <div class="auth-container" v-if="!isAuthenticated">
      <div class="auth-card">
        <div class="logo-container">
          <img src="/alg3.jpeg" alt="App Logo" class="logo">
        </div>
        
        <h1>{{ isLoginMode ? 'Welcome Back!' : 'Create Account' }}</h1>
        <p class="auth-subtitle">{{ isLoginMode ? 'Login to continue' : 'Get started with your account' }}</p>
        
        <div class="auth-mode-toggle">
          <button 
            @click="toggleMode"
            class="mode-toggle-btn"
          >
            {{ isLoginMode ? 'Need an account? Register' : 'Already have an account? Login' }}
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div v-if="!isLoginMode" class="form-group">
            <label for="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              v-model="form.name" 
              required
              placeholder="Enter your full name"
            >
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              v-model="form.email" 
              required
              placeholder="Enter your email"
            >
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              v-model="form.password" 
              required
              :placeholder="isLoginMode ? 'Enter your password' : 'Create a password (min 6 characters)'"
              minlength="6"
            >
          </div>

          <div v-if="!isLoginMode" class="form-group">
            <label>Account Type</label>
            <div class="role-options">
              <label>
                <input 
                  type="radio" 
                  v-model="form.role" 
                  value="student" 
                  checked
                > 
                <span class="radio-custom"></span>
                Student
              </label>
              <label>
                <input 
                  type="radio" 
                  v-model="form.role" 
                  value="admin"
                >
                <span class="radio-custom"></span>
                Admin
              </label>
            </div>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? 'Processing...' : isLoginMode ? 'Login' : 'Register' }}
          </button>

          <div v-if="error" class="error-message">
            <i class="error-icon">!</i>
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export default {
  name: 'AuthView',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const loading = ref(false)
    const error = ref('')
    const isAuthenticated = ref(false)
    
    const form = ref({
      name: '',
      email: '',
      password: '',
      role: 'student'
    })

    const isLoginMode = computed(() => {
      return route.query.mode === 'login' || route.path === '/login'
    })

    // Check auth state on component mount
    onMounted(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          isAuthenticated.value = true
          // Redirect will be handled by router guard
        } else {
          isAuthenticated.value = false
        }
      })
      
      // Clear form when component mounts
      form.value = {
        name: '',
        email: '',
        password: '',
        role: 'student'
      }
      error.value = ''
      
      return () => unsubscribe()
    })

    const toggleMode = () => {
      router.push({
        path: '/auth',
        query: { mode: isLoginMode.value ? 'register' : 'login' }
      })
      // Clear form when switching modes
      form.value = {
        name: '',
        email: '',
        password: '',
        role: 'student'
      }
      error.value = ''
    }

    const handleSubmit = async () => {
      loading.value = true
      error.value = ''
      
      try {
        if (isLoginMode.value) {
          // Login logic
          const userCredential = await signInWithEmailAndPassword(
            auth, 
            form.value.email, 
            form.value.password
          )
          
          // Get user role from Firestore after login
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            // Redirect based on role
            if (userData.role === 'admin') {
              await router.push('/admin/dashboard')
            } else {
              await router.push('/student/dashboard')
            }
          } else {
            throw new Error('User data not found')
          }
        } else {
          // Registration logic
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            form.value.email, 
            form.value.password
          )
          
          const user = userCredential.user
          
          // Update user profile with display name
          await updateProfile(user, {
            displayName: form.value.name
          })
          
          // Save additional user data to Firestore
          await setDoc(doc(db, 'users', user.uid), {
            name: form.value.name,
            email: form.value.email,
            role: form.value.role,
            createdAt: new Date().toISOString()
          })
          
          // Redirect based on role after registration
          if (form.value.role === 'admin') {
            await router.push('/admin/dashboard')
          } else {
            await router.push('/student/dashboard')
          }
        }
      } catch (err) {
        // Handle specific Firebase auth errors
        switch (err.code) {
          case 'auth/email-already-in-use':
            error.value = 'An account with this email already exists.'
            break
          case 'auth/weak-password':
            error.value = 'Password should be at least 6 characters long.'
            break
          case 'auth/invalid-email':
            error.value = 'Please enter a valid email address.'
            break
          case 'auth/user-not-found':
            error.value = 'No account found with this email address.'
            break
          case 'auth/wrong-password':
            error.value = 'Incorrect password. Please try again.'
            break
          case 'auth/too-many-requests':
            error.value = 'Too many failed attempts. Please try again later.'
            break
          default:
            error.value = err.message || 'Authentication failed. Please try again.'
        }
        console.error('Auth error:', err)
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      isLoginMode,
      isAuthenticated,
      toggleMode,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.auth-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 480px;
}

.auth-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.logo-container {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f0f0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
}

.auth-subtitle {
  text-align: center;
  color: #718096;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
}

.auth-mode-toggle {
  text-align: center;
  margin-bottom: 1.5rem;
}

.mode-toggle-btn {
  background: none;
  border: none;
  color: #4c51bf;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s;
}

.mode-toggle-btn:hover {
  color: #434190;
  text-decoration: underline;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 0.85rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.role-options {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.role-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
  color: #4a5568;
  position: relative;
  padding-left: 25px;
}

.role-options input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.radio-custom {
  position: absolute;
  left: 0;
  height: 18px;
  width: 18px;
  background-color: #fff;
  border: 2px solid #cbd5e0;
  border-radius: 50%;
}

.role-options input[type="radio"]:checked ~ .radio-custom {
  background-color: #667eea;
  border-color: #667eea;
  box-shadow: inset 0 0 0 3px white;
}

.submit-btn {
  background-color: #667eea;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
  transition: all 0.3s;
  letter-spacing: 0.5px;
}

.submit-btn:hover {
  background-color: #5a67d8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

.submit-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #e53e3e;
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
  padding: 0.75rem;
  background-color: #fff5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.error-icon {
  background-color: #e53e3e;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}
</style>
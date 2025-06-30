<template>
  <div class="auth-container" v-if="!isAuthenticated">
    <div class="auth-card">
      <h1>{{ isLoginMode ? 'Login' : 'Register' }}</h1>
      
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
              > Student
            </label>
            <label>
              <input 
                type="radio" 
                v-model="form.role" 
                value="admin"
              > Admin
            </label>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Processing...' : isLoginMode ? 'Login' : 'Register' }}
        </button>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>
      </form>
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
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.auth-mode-toggle {
  text-align: center;
  margin-bottom: 1.5rem;
}

.mode-toggle-btn {
  background: none;
  border: none;
  color: #4285f4;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
}

.mode-toggle-btn:hover {
  color: #3367d6;
}

.auth-form {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.role-options {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.role-options label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  cursor: pointer;
}

.submit-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 1rem;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #3367d6;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #d32f2f;
  margin-top: 1rem;
  text-align: center;
  font-size: 0.9rem;
}
</style>
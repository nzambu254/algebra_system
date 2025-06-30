<template>
  <div class="student-dashboard">
    <h1>Welcome, {{ userName }}</h1>
    
    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-icon">📚</div>
        <div class="stat-info">
          <h3>Lessons Completed</h3>
          <p>{{ stats.lessonsCompleted }}/{{ stats.totalLessons }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">✏️</div>
        <div class="stat-info">
          <h3>Exercises Completed</h3>
          <p>{{ stats.exercisesCompleted }}/{{ stats.totalExercises }}</p>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-info">
          <h3>Average Score</h3>
          <p>{{ stats.averageScore }}%</p>
        </div>
      </div>
    </div>
    
    <div class="recent-activity">
      <h2>Recent Activity</h2>
      <div v-if="recentActivity.length > 0" class="activity-list">
        <div v-for="(activity, index) in recentActivity" :key="index" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            {{ getActivityIcon(activity.type) }}
          </div>
          <div class="activity-details">
            <h3>{{ activity.title }}</h3>
            <p>{{ activity.description }}</p>
            <span class="activity-date">{{ activity.date }}</span>
          </div>
        </div>
      </div>
      <div v-else class="no-activity">
        <p>No recent activity found.</p>
      </div>
    </div>
    
    <div class="continue-learning">
      <h2>Continue Learning</h2>
      <div v-if="continueLearning" class="learning-card">
        <h3>{{ continueLearning.title }}</h3>
        <p>{{ continueLearning.description }}</p>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${continueLearning.progress}%` }"
          ></div>
        </div>
        <p class="progress-text">{{ continueLearning.progress }}% complete</p>
        <button @click="goToModule(continueLearning.link)" class="continue-btn">
          Continue
        </button>
      </div>
      <div v-else class="no-module">
        <p>No module in progress.</p>
        <button @click="goToModule('learn')" class="start-btn">
          Start Learning
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'

export default {
  setup() {
    const router = useRouter()
    const userName = ref('Student')
    const stats = ref({
      lessonsCompleted: 0,
      totalLessons: 10,
      exercisesCompleted: 0,
      totalExercises: 15,
      averageScore: 0
    })
    const recentActivity = ref([])
    const continueLearning = ref(null)

    const fetchUserData = async () => {
      const user = auth.currentUser
      if (user) {
        // In a real app, you would fetch the user's name from Firestore
        userName.value = user.email.split('@')[0]
        
        try {
          // Fetch user progress from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.progress) {
              stats.value = {
                ...stats.value,
                ...userData.progress
              }
            }
            
            // Set recent activity (in a real app, fetch from Firestore)
            recentActivity.value = [
              {
                type: 'lesson',
                title: 'Quadratic Equations',
                description: 'Completed lesson on solving quadratic equations',
                date: '2 days ago'
              },
              {
                type: 'exercise',
                title: 'Linear Equations Practice',
                description: 'Scored 85% on practice exercises',
                date: '3 days ago'
              },
              {
                type: 'quiz',
                title: 'Polynomials Quiz',
                description: 'Completed quiz with score 78%',
                date: '1 week ago'
              }
            ]
            
            // Set continue learning (in a real app, fetch from Firestore)
            if (userData.currentModule) {
              continueLearning.value = {
                title: userData.currentModule.title || 'Linear Equations',
                description: userData.currentModule.description || 'Solving linear equations with one variable',
                progress: userData.currentModule.progress || 45,
                link: userData.currentModule.link || 'learn'
              }
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
        }
      }
    }

    const getActivityIcon = (type) => {
      switch (type) {
        case 'lesson': return '📚'
        case 'exercise': return '✏️'
        case 'quiz': return '📝'
        default: return 'ℹ️'
      }
    }

    const goToModule = (link) => {
      router.push(`/student/${link}`)
    }

    onMounted(() => {
      fetchUserData()
    })

    return {
      userName,
      stats,
      recentActivity,
      continueLearning,
      getActivityIcon,
      goToModule
    }
  }
}
</script>

<style scoped>
.student-dashboard {
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.stat-info p {
  margin: 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.recent-activity {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.recent-activity h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.activity-list {
  margin-top: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #f5f5f5;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.activity-icon.lesson {
  background-color: #3498db;
  color: white;
}

.activity-icon.exercise {
  background-color: #2ecc71;
  color: white;
}

.activity-icon.quiz {
  background-color: #e67e22;
  color: white;
}

.activity-details h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1rem;
}

.activity-details p {
  margin: 0 0 5px 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.activity-date {
  font-size: 0.8rem;
  color: #95a5a6;
}

.no-activity {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
}

.continue-learning {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.continue-learning h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.learning-card {
  margin-top: 15px;
}

.learning-card h3 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.learning-card p {
  margin: 0 0 15px 0;
  color: #7f8c8d;
}

.progress-bar {
  height: 10px;
  background-color: #ecf0f1;
  border-radius: 5px;
  margin-bottom: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #2ecc71;
  transition: width 0.3s;
}

.progress-text {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 15px !important;
}

.continue-btn {
  padding: 8px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.no-module {
  text-align: center;
  padding: 20px;
}

.no-module p {
  margin-bottom: 15px;
  color: #7f8c8d;
}

.start-btn {
  padding: 8px 15px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
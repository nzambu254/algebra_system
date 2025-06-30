<template>
  <div class="my-progress">
    <h1>My Learning Progress</h1>
    
    <div class="progress-summary">
      <div class="summary-card">
        <h3>Overall Completion</h3>
        <div class="progress-circle">
          <div class="circle-progress" :style="circleStyle(overallCompletion)">
            <span>{{ overallCompletion }}%</span>
          </div>
        </div>
        <p>You've completed {{ completedLessons }} of {{ totalLessons }} lessons</p>
      </div>
      
      <div class="summary-card">
        <h3>Average Score</h3>
        <div class="score-display">
          <span class="score-value">{{ averageScore }}</span>
          <span class="score-label">/100</span>
        </div>
        <p>Across all completed exercises</p>
      </div>
      
      <div class="summary-card">
        <h3>Time Spent</h3>
        <div class="time-display">
          <span class="time-value">{{ formattedTimeSpent }}</span>
        </div>
        <p>Learning this month</p>
      </div>
    </div>
    
    <div class="progress-details">
      <h2>Module Progress</h2>
      
      <div class="module-filters">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          @click="activeFilter = filter.value"
          :class="{ active: activeFilter === filter.value }"
        >
          {{ filter.label }}
        </button>
      </div>
      
      <div class="module-list">
        <div 
          v-for="module in filteredModules" 
          :key="module.id" 
          class="module-card"
          @click="viewModuleDetails(module)"
        >
          <div class="module-header">
            <h3>{{ module.name }}</h3>
            <span class="completion-badge" :class="completionClass(module.completion)">
              {{ module.completion }}%
            </span>
          </div>
          
          <div class="module-progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: `${module.completion}%` }"
            ></div>
          </div>
          
          <div class="module-stats">
            <div class="stat-item">
              <span class="stat-label">Last Active</span>
              <span class="stat-value">{{ module.lastActive || 'Never' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Highest Score</span>
              <span class="stat-value">{{ module.highestScore || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="selectedModule" class="module-details-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedModule.name }}</h2>
          <button @click="selectedModule = null" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <h3>Progress Overview</h3>
            <div class="progress-metrics">
              <div class="metric">
                <span class="metric-value">{{ selectedModule.completion }}%</span>
                <span class="metric-label">Completion</span>
              </div>
              <div class="metric">
                <span class="metric-value">{{ selectedModule.highestScore || 'N/A' }}</span>
                <span class="metric-label">Highest Score</span>
              </div>
              <div class="metric">
                <span class="metric-value">{{ selectedModule.attempts || 0 }}</span>
                <span class="metric-label">Attempts</span>
              </div>
            </div>
          </div>
          
          <div class="detail-section">
            <h3>Lesson Completion</h3>
            <div class="lesson-progress">
              <div 
                v-for="lesson in selectedModule.lessons" 
                :key="lesson.id" 
                class="lesson-item"
              >
                <div class="lesson-info">
                  <h4>{{ lesson.title }}</h4>
                  <p>{{ lesson.description }}</p>
                </div>
                <div class="lesson-status">
                  <span 
                    class="status-badge" 
                    :class="{ completed: lesson.completed }"
                  >
                    {{ lesson.completed ? 'Completed' : 'Pending' }}
                  </span>
                  <span v-if="lesson.score" class="lesson-score">
                    Score: {{ lesson.score }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'

export default {
  setup() {
    const studentId = ref('current_user_id') // In a real app, get from auth
    const modules = ref([])
    const activeFilter = ref('all')
    const selectedModule = ref(null)
    const timeSpent = ref(0) // in minutes
    
    const filters = [
      { value: 'all', label: 'All Modules' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' }
    ]
    
    // Mock data - in a real app, fetch from Firebase
    const mockModules = [
      {
        id: 'linear-equations',
        name: 'Linear Equations',
        completion: 75,
        lastActive: '2 days ago',
        highestScore: 85,
        attempts: 3,
        lessons: [
          { id: 'le1', title: 'Introduction', description: 'Basic concepts', completed: true, score: null },
          { id: 'le2', title: 'Solving Equations', description: 'One-step equations', completed: true, score: 80 },
          { id: 'le3', title: 'Word Problems', description: 'Real-world applications', completed: false, score: null }
        ]
      },
      {
        id: 'quadratic-equations',
        name: 'Quadratic Equations',
        completion: 50,
        lastActive: '1 week ago',
        highestScore: 70,
        attempts: 2,
        lessons: [
          { id: 'qe1', title: 'Introduction', description: 'Basic concepts', completed: true, score: null },
          { id: 'qe2', title: 'Factoring', description: 'Solving by factoring', completed: true, score: 70 },
          { id: 'qe3', title: 'Quadratic Formula', description: 'The discriminant', completed: false, score: null }
        ]
      },
      {
        id: 'polynomials',
        name: 'Polynomials',
        completion: 30,
        lastActive: '3 weeks ago',
        highestScore: 65,
        attempts: 1,
        lessons: [
          { id: 'p1', title: 'Introduction', description: 'Basic concepts', completed: true, score: null },
          { id: 'p2', title: 'Operations', description: 'Adding and subtracting', completed: false, score: null },
          { id: 'p3', title: 'Factoring', description: 'Common factors', completed: false, score: null }
        ]
      }
    ]
    
    const fetchStudentProgress = async () => {
      try {
        // In a real app, fetch actual data from Firebase
        // const docRef = doc(db, 'users', studentId.value)
        // const docSnap = await getDoc(docRef)
        // if (docSnap.exists()) {
        //   modules.value = docSnap.data().progress || []
        // }
        
        // Using mock data for now
        modules.value = mockModules
        timeSpent.value = 325 // Mock data - 5 hours 25 minutes
      } catch (error) {
        console.error('Error fetching student progress:', error)
      }
    }
    
    const filteredModules = computed(() => {
      if (activeFilter.value === 'all') return modules.value
      if (activeFilter.value === 'completed') {
        return modules.value.filter(module => module.completion === 100)
      }
      return modules.value.filter(module => module.completion > 0 && module.completion < 100)
    })
    
    const overallCompletion = computed(() => {
      if (modules.value.length === 0) return 0
      const total = modules.value.reduce((sum, module) => sum + module.completion, 0)
      return Math.round(total / modules.value.length)
    })
    
    const averageScore = computed(() => {
      const scoredModules = modules.value.filter(module => module.highestScore)
      if (scoredModules.length === 0) return 0
      const total = scoredModules.reduce((sum, module) => sum + module.highestScore, 0)
      return Math.round(total / scoredModules.length)
    })
    
    const completedLessons = computed(() => {
      return modules.value.reduce((count, module) => {
        return count + module.lessons.filter(lesson => lesson.completed).length
      }, 0)
    })
    
    const totalLessons = computed(() => {
      return modules.value.reduce((count, module) => count + module.lessons.length, 0)
    })
    
    const formattedTimeSpent = computed(() => {
      const hours = Math.floor(timeSpent.value / 60)
      const minutes = timeSpent.value % 60
      return `${hours}h ${minutes}m`
    })
    
    const circleStyle = (percentage) => {
      const degrees = (percentage / 100) * 360
      return {
        background: `conic-gradient(#2ecc71 ${degrees}deg, #ecf0f1 ${degrees}deg)`
      }
    }
    
    const completionClass = (percentage) => {
      if (percentage === 100) return 'completed'
      if (percentage >= 50) return 'in-progress'
      return 'not-started'
    }
    
    const viewModuleDetails = (module) => {
      selectedModule.value = module
    }
    
    onMounted(() => {
      fetchStudentProgress()
    })
    
    return {
      modules,
      filters,
      activeFilter,
      filteredModules,
      overallCompletion,
      averageScore,
      completedLessons,
      totalLessons,
      timeSpent,
      formattedTimeSpent,
      selectedModule,
      circleStyle,
      completionClass,
      viewModuleDetails
    }
  }
}
</script>

<style scoped>
.my-progress {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h1, h2, h3, h4 {
  color: #2c3e50;
}

.progress-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.progress-circle {
  width: 150px;
  height: 150px;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: #ecf0f1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle-progress {
  width: 130px;
  height: 130px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.score-display {
  margin: 15px 0;
}

.score-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #3498db;
}

.score-label {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.time-display {
  margin: 15px 0;
}

.time-value {
  font-size: 2rem;
  font-weight: bold;
  color: #9b59b6;
}

.module-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.module-filters button {
  padding: 8px 15px;
  background: #ecf0f1;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.module-filters button.active {
  background: #3498db;
  color: white;
}

.module-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.module-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;
}

.module-card:hover {
  transform: translateY(-5px);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.completion-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
}

.completion-badge.completed {
  background: #2ecc71;
  color: white;
}

.completion-badge.in-progress {
  background: #f39c12;
  color: white;
}

.completion-badge.not-started {
  background: #e74c3c;
  color: white;
}

.module-progress-bar {
  height: 8px;
  background-color: #ecf0f1;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background-color: #2ecc71;
  transition: width 0.5s ease;
}

.module-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.8rem;
  color: #7f8c8d;
}

.stat-value {
  font-weight: bold;
}

.module-details-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #ddd;
}

.modal-header h2 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #7f8c8d;
}

.modal-body {
  padding: 20px;
}

.detail-section {
  margin-bottom: 30px;
}

.detail-section h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.progress-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.metric {
  text-align: center;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #3498db;
  display: block;
}

.metric-label {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.lesson-progress {
  margin-top: 15px;
}

.lesson-item {
  display: flex;
  justify-content: space-between;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.lesson-item:last-child {
  border-bottom: none;
}

.lesson-info h4 {
  margin: 0 0 5px 0;
}

.lesson-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.lesson-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  background: #e74c3c;
  color: white;
}

.status-badge.completed {
  background: #2ecc71;
}

.lesson-score {
  font-size: 0.9rem;
  color: #3498db;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .progress-summary {
    grid-template-columns: 1fr;
  }
  
  .module-list {
    grid-template-columns: 1fr;
  }
  
  .module-stats {
    grid-template-columns: 1fr;
  }
  
  .progress-metrics {
    grid-template-columns: 1fr;
  }
  
  .lesson-item {
    flex-direction: column;
  }
  
  .lesson-status {
    align-items: flex-start;
    margin-top: 10px;
  }
}
</style>
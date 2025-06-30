<template>
  <div class="student-progress">
    <h1>Student Progress Monitoring</h1>
    
    <div class="filters">
      <div class="filter-group">
        <label>Filter by:</label>
        <select v-model="filterBy">
          <option value="all">All Students</option>
          <option value="active">Active Students</option>
          <option value="inactive">Inactive Students</option>
        </select>
      </div>
    </div>
    
    <div class="progress-list">
      <div v-for="student in filteredStudents" :key="student.id" class="student-card">
        <div class="student-info">
          <h3>{{ student.name || student.email }}</h3>
          <p>Email: {{ student.email }}</p>
          <p>Last Active: {{ student.lastActive || 'Unknown' }}</p>
        </div>
        
        <div class="progress-info">
          <div class="progress-item">
            <span>Lessons Completed</span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${student.progress?.lessonsCompleted || 0}%` }"
              ></div>
            </div>
            <span>{{ student.progress?.lessonsCompleted || 0 }}%</span>
          </div>
          
          <div class="progress-item">
            <span>Exercises Completed</span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${student.progress?.exercisesCompleted || 0}%` }"
              ></div>
            </div>
            <span>{{ student.progress?.exercisesCompleted || 0 }}%</span>
          </div>
          
          <div class="progress-item">
            <span>Average Score</span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: `${student.progress?.averageScore || 0}%` }"
              ></div>
            </div>
            <span>{{ student.progress?.averageScore || 0 }}%</span>
          </div>
        </div>
        
        <button @click="viewDetails(student)" class="details-btn">View Details</button>
      </div>
    </div>
    
    <div v-if="selectedStudent" class="student-details-modal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedStudent.name || selectedStudent.email }}</h2>
          <button @click="selectedStudent = null" class="close-btn">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="detail-section">
            <h3>Student Information</h3>
            <p><strong>Email:</strong> {{ selectedStudent.email }}</p>
            <p><strong>Status:</strong> {{ selectedStudent.status || 'Active' }}</p>
            <p><strong>Last Active:</strong> {{ selectedStudent.lastActive || 'Unknown' }}</p>
          </div>
          
          <div class="detail-section">
            <h3>Progress Details</h3>
            <div class="detailed-progress">
              <div v-for="(module, index) in selectedStudent.detailedProgress || []" :key="index" class="module-progress">
                <h4>{{ module.name }}</h4>
                <p>Completion: {{ module.completion }}%</p>
                <p>Last Attempt: {{ module.lastAttempt || 'Never' }}</p>
                <p>Highest Score: {{ module.highestScore || 'N/A' }}</p>
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
import { collection, getDocs } from 'firebase/firestore'

export default {
  setup() {
    const students = ref([])
    const filterBy = ref('all')
    const selectedStudent = ref(null)

    const fetchStudents = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'))
        students.value = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.role !== 'admin') // Filter out admins
      } catch (error) {
        console.error('Error fetching students:', error)
      }
    }

    const filteredStudents = computed(() => {
      if (filterBy.value === 'all') return students.value
      return students.value.filter(student => 
        student.status === filterBy.value
      )
    })

    const viewDetails = (student) => {
      // In a real app, you might fetch more detailed data here
      selectedStudent.value = {
        ...student,
        detailedProgress: [
          { name: 'Linear Equations', completion: 75, lastAttempt: '2023-05-15', highestScore: 85 },
          { name: 'Quadratic Equations', completion: 50, lastAttempt: '2023-05-10', highestScore: 70 },
          { name: 'Polynomials', completion: 30, lastAttempt: '2023-04-28', highestScore: 65 }
        ]
      }
    }

    onMounted(() => {
      fetchStudents()
    })

    return {
      students,
      filterBy,
      filteredStudents,
      selectedStudent,
      viewDetails
    }
  }
}
</script>

<style scoped>
.student-progress {
  padding: 20px;
}

.filters {
  margin-bottom: 20px;
  display: flex;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: bold;
}

.filter-group select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.progress-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.student-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.student-info h3 {
  margin-top: 0;
  color: #2c3e50;
}

.progress-item {
  margin: 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.progress-bar {
  flex-grow: 1;
  height: 10px;
  background-color: #ecf0f1;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #2ecc71;
  transition: width 0.3s;
}

.details-btn {
  display: block;
  width: 100%;
  padding: 8px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 15px;
}

.student-details-modal {
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
  margin-bottom: 20px;
}

.detail-section h3 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.detailed-progress {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.module-progress {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 6px;
}

.module-progress h4 {
  margin-top: 0;
  color: #3498db;
}

@media (max-width: 768px) {
  .progress-list {
    grid-template-columns: 1fr;
  }
  
  .detailed-progress {
    grid-template-columns: 1fr;
  }
}
</style>
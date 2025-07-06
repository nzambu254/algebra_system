<template>
  <div class="student-progress">
    <h1>Student Progress Monitoring</h1>
    
    <div class="controls">
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
      
      <div class="report-section">
        <button @click="generateReport" class="report-btn">Generate Report</button>
        <select v-model="reportType" class="report-type">
          <option value="summary">Summary Report</option>
          <option value="detailed">Detailed Report</option>
          <option value="inactive">Inactive Students Report</option>
        </select>
        <button v-if="reportGenerated" @click="downloadReport" class="download-btn">Download PDF</button>
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
import html2pdf from 'html2pdf.js'

export default {
  setup() {
    const students = ref([])
    const filterBy = ref('all')
    const selectedStudent = ref(null)
    const reportType = ref('summary')
    const reportGenerated = ref(false)
    const reportData = ref(null)

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
      selectedStudent.value = {
        ...student,
        detailedProgress: [
          { name: 'Linear Equations', completion: 75, lastAttempt: '2023-05-15', highestScore: 85 },
          { name: 'Quadratic Equations', completion: 50, lastAttempt: '2023-05-10', highestScore: 70 },
          { name: 'Polynomials', completion: 30, lastAttempt: '2023-04-28', highestScore: 65 }
        ]
      }
    }

    const generateReport = () => {
      // Prepare report data based on selected type
      switch(reportType.value) {
        case 'summary':
          reportData.value = {
            title: 'Student Progress Summary Report',
            date: new Date().toLocaleDateString(),
            totalStudents: students.value.length,
            activeStudents: students.value.filter(s => s.status === 'active').length,
            inactiveStudents: students.value.filter(s => s.status === 'inactive').length,
            avgLessonsCompleted: calculateAverage('lessonsCompleted'),
            avgExercisesCompleted: calculateAverage('exercisesCompleted'),
            avgScore: calculateAverage('averageScore')
          }
          break
        case 'detailed':
          reportData.value = {
            title: 'Detailed Student Progress Report',
            date: new Date().toLocaleDateString(),
            students: students.value.map(student => ({
              name: student.name || student.email,
              email: student.email,
              status: student.status || 'active',
              lastActive: student.lastActive || 'Unknown',
              lessonsCompleted: student.progress?.lessonsCompleted || 0,
              exercisesCompleted: student.progress?.exercisesCompleted || 0,
              averageScore: student.progress?.averageScore || 0
            }))
          }
          break
        case 'inactive':
          const inactiveStudents = students.value.filter(s => s.status === 'inactive')
          reportData.value = {
            title: 'Inactive Students Report',
            date: new Date().toLocaleDateString(),
            count: inactiveStudents.length,
            students: inactiveStudents.map(student => ({
              name: student.name || student.email,
              email: student.email,
              lastActive: student.lastActive || 'Unknown',
              daysInactive: calculateDaysInactive(student.lastActive)
            }))
          }
          break
      }
      reportGenerated.value = true
    }

    const calculateAverage = (field) => {
      const validStudents = students.value.filter(s => s.progress && s.progress[field])
      if (validStudents.length === 0) return 0
      const sum = validStudents.reduce((acc, student) => acc + (student.progress[field] || 0), 0)
      return Math.round(sum / validStudents.length)
    }

    const calculateDaysInactive = (lastActive) => {
      if (!lastActive) return 'Unknown'
      const lastActiveDate = new Date(lastActive)
      const today = new Date()
      const diffTime = Math.abs(today - lastActiveDate)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const downloadReport = () => {
      if (!reportData.value) {
        console.error('No report data available. Please generate a report first.')
        return
      }

      try {
        // Create a temporary element to hold the report content
        const element = document.createElement('div')
        element.style.padding = '20px'
        
        // Generate report content based on type
        let content = `
          <h1>${reportData.value.title}</h1>
          <p>Generated on: ${reportData.value.date}</p>
        `
        
        if (reportType.value === 'summary') {
          content += `
            <h2>Summary Statistics</h2>
            <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">
              <tr>
                <th>Total Students</th>
                <td>${reportData.value.totalStudents}</td>
              </tr>
              <tr>
                <th>Active Students</th>
                <td>${reportData.value.activeStudents}</td>
              </tr>
              <tr>
                <th>Inactive Students</th>
                <td>${reportData.value.inactiveStudents}</td>
              </tr>
              <tr>
                <th>Average Lessons Completed</th>
                <td>${reportData.value.avgLessonsCompleted}%</td>
              </tr>
              <tr>
                <th>Average Exercises Completed</th>
                <td>${reportData.value.avgExercisesCompleted}%</td>
              </tr>
              <tr>
                <th>Average Score</th>
                <td>${reportData.value.avgScore}%</td>
              </tr>
            </table>
          `
        } else if (reportType.value === 'detailed' && reportData.value.students) {
          content += `
            <h2>Student Details</h2>
            <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Lessons Completed</th>
                  <th>Exercises Completed</th>
                  <th>Average Score</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.value.students?.map(student => `
                  <tr>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.status}</td>
                    <td>${student.lastActive}</td>
                    <td>${student.lessonsCompleted}%</td>
                    <td>${student.exercisesCompleted}%</td>
                    <td>${student.averageScore}%</td>
                  </tr>
                `).join('') || '<tr><td colspan="7">No student data available</td></tr>'}
              </tbody>
            </table>
          `
        } else if (reportType.value === 'inactive' && reportData.value.students) {
          content += `
            <h2>Inactive Students (Total: ${reportData.value.count})</h2>
            <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse:collapse;">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Last Active</th>
                  <th>Days Inactive</th>
                </tr>
              </thead>
              <tbody>
                ${reportData.value.students?.map(student => `
                  <tr>
                    <td>${student.name}</td>
                    <td>${student.email}</td>
                    <td>${student.lastActive}</td>
                    <td>${student.daysInactive}</td>
                  </tr>
                `).join('') || '<tr><td colspan="4">No inactive students found</td></tr>'}
              </tbody>
            </table>
          `
        }
        
        element.innerHTML = content
        
        // Generate PDF
        const opt = {
          margin: 10,
          filename: `${reportData.value.title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }
        
        html2pdf().from(element).set(opt).save()
      } catch (error) {
        console.error('Error generating PDF:', error)
        alert('Failed to generate PDF. Please try again.')
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
      viewDetails,
      reportType,
      reportGenerated,
      generateReport,
      downloadReport
    }
  }
}
</script>

<style scoped>
.student-progress {
  padding: 20px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.filters {
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

.filter-group select,
.report-type {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  min-width: 150px;
}

.report-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.report-btn,
.download-btn {
  padding: 8px 15px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.report-btn {
  background-color: #3498db;
  color: white;
}

.report-btn:hover {
  background-color: #2980b9;
}

.download-btn {
  background-color: #2ecc71;
  color: white;
}

.download-btn:hover {
  background-color: #27ae60;
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
  .controls {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .progress-list {
    grid-template-columns: 1fr;
  }
  
  .detailed-progress {
    grid-template-columns: 1fr;
  }
  
  .report-section {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .report-type {
    width: 100%;
  }
}
</style>
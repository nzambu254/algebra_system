<template>
  <div class="manage-content">
    <h1>Manage Content</h1>
    
    <div class="content-actions">
      <button @click="showAddForm = true" class="add-btn">+ Add New Content</button>
      <button @click="generateReport" class="report-btn">Generate Report</button>
    </div>
    
    <div v-if="showAddForm" class="add-form">
      <h3>Add New Content</h3>
      <form @submit.prevent="addContent">
        <div class="form-group">
          <label>Title</label>
          <input v-model="newContent.title" type="text" required>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select v-model="newContent.type" required>
            <option value="lesson">Lesson</option>
            <option value="exercise">Exercise</option>
            <option value="quiz">Quiz</option>
          </select>
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="newContent.description" required></textarea>
        </div>
        <button type="submit" class="submit-btn">Save</button>
        <button type="button" @click="cancelAdd" class="cancel-btn">Cancel</button>
      </form>
    </div>

    <div v-if="showReportModal" class="report-modal">
      <div class="modal-content">
        <span class="close" @click="showReportModal = false">&times;</span>
        <h2>Content Report</h2>
        <div class="report-preview" ref="reportContent">
          <h3>Content Summary</h3>
          <p>Generated on: {{ currentDate }}</p>
          <p>Total Items: {{ content.length }}</p>
          
          <h4>Content Breakdown:</h4>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in content" :key="item.id">
                <td>{{ item.title }}</td>
                <td>{{ item.type }}</td>
                <td>{{ item.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="downloadPDF" class="download-btn">Download PDF</button>
      </div>
    </div>
    
    <div class="content-list">
      <div v-for="item in content" :key="item.id" class="content-item">
        <h3>{{ item.title }}</h3>
        <p class="type-badge" :class="item.type">{{ item.type }}</p>
        <p>{{ item.description }}</p>
        <div class="item-actions">
          <button @click="editItem(item)" class="edit-btn">Edit</button>
          <button @click="deleteItem(item.id)" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, getDocs, addDoc, doc, deleteDoc } from 'firebase/firestore'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default {
  setup() {
    const content = ref([])
    const showAddForm = ref(false)
    const showReportModal = ref(false)
    const currentDate = ref(new Date().toLocaleDateString())
    const reportContent = ref(null)

    const newContent = ref({
      title: '',
      type: 'lesson',
      description: ''
    })

    const fetchContent = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'content'))
        content.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      } catch (error) {
        console.error('Error fetching content:', error)
      }
    }

    const addContent = async () => {
      try {
        await addDoc(collection(db, 'content'), newContent.value)
        newContent.value = { title: '', type: 'lesson', description: '' }
        showAddForm.value = false
        fetchContent()
      } catch (error) {
        console.error('Error adding content:', error)
      }
    }

    const deleteItem = async (id) => {
      try {
        await deleteDoc(doc(db, 'content', id))
        fetchContent()
      } catch (error) {
        console.error('Error deleting content:', error)
      }
    }

    const editItem = (item) => {
      // Implement edit functionality
      console.log('Edit item:', item)
    }

    const cancelAdd = () => {
      showAddForm.value = false
      newContent.value = { title: '', type: 'lesson', description: '' }
    }

    const generateReport = () => {
      showReportModal.value = true
    }

    const downloadPDF = () => {
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(18)
      doc.text('Content Management Report', 105, 20, { align: 'center' })
      
      // Date and summary
      doc.setFontSize(12)
      doc.text(`Generated on: ${currentDate.value}`, 14, 30)
      doc.text(`Total Content Items: ${content.value.length}`, 14, 40)
      
      // Content breakdown
      doc.setFontSize(14)
      doc.text('Content Breakdown:', 14, 50)
      
      // Prepare table data
      const tableData = content.value.map(item => [
        item.title,
        item.type,
        item.description.length > 50 ? item.description.substring(0, 50) + '...' : item.description
      ])
      
      // Add table
      doc.autoTable({
        startY: 55,
        head: [['Title', 'Type', 'Description']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 55 }
      })
      
      // Save the PDF
      doc.save(`content_report_${new Date().toISOString().slice(0, 10)}.pdf`)
    }

    onMounted(() => {
      fetchContent()
    })

    return {
      content,
      showAddForm,
      showReportModal,
      currentDate,
      reportContent,
      newContent,
      addContent,
      deleteItem,
      editItem,
      cancelAdd,
      generateReport,
      downloadPDF
    }
  }
}
</script>

<style scoped>
.manage-content {
  padding: 20px;
}

.content-actions {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.add-btn {
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.report-btn {
  padding: 10px 15px;
  background-color: #9b59b6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  min-height: 100px;
}

.submit-btn {
  padding: 8px 15px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
}

.cancel-btn {
  padding: 8px 15px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.report-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 80%;
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  color: #aaa;
}

.close:hover {
  color: #333;
}

.report-preview {
  margin: 20px 0;
}

.report-preview table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.report-preview th, .report-preview td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.report-preview th {
  background-color: #3498db;
  color: white;
}

.report-preview tr:nth-child(even) {
  background-color: #f2f2f2;
}

.download-btn {
  padding: 10px 15px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 20px;
}

.download-btn:hover {
  background-color: #2ecc71;
}

.content-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.content-item {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.type-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin: 5px 0;
}

.type-badge.lesson {
  background-color: #3498db;
  color: white;
}

.type-badge.exercise {
  background-color: #2ecc71;
  color: white;
}

.type-badge.quiz {
  background-color: #e67e22;
  color: white;
}

.item-actions {
  margin-top: 15px;
}

.edit-btn {
  padding: 5px 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  margin-right: 10px;
  cursor: pointer;
}

.delete-btn {
  padding: 5px 10px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
<template>
  <div class="manage-content">
    <h1>Manage Content</h1>
    
    <div class="content-actions">
      <button @click="showAddForm = true" class="add-btn">+ Add New Content</button>
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

export default {
  setup() {
    const content = ref([])
    const showAddForm = ref(false)
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

    onMounted(() => {
      fetchContent()
    })

    return {
      content,
      showAddForm,
      newContent,
      addContent,
      deleteItem,
      editItem,
      cancelAdd
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
}

.add-btn {
  padding: 10px 15px;
  background-color: #3498db;
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
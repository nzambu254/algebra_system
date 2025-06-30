<template>
  <div class="manage-users">
    <h1>Manage Users</h1>
    
    <div class="user-search">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search users..." 
        @input="searchUsers"
      >
    </div>
    
    <div class="user-list">
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.id">
            <td>{{ user.email }}</td>
            <td>
              <span :class="user.role">{{ user.role }}</span>
            </td>
            <td>
              <span :class="user.status">{{ user.status }}</span>
            </td>
            <td>
              <button @click="editUser(user)" class="edit-btn">Edit</button>
              <button @click="deleteUser(user.id)" class="delete-btn">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="showEditModal" class="edit-modal">
      <div class="modal-content">
        <h3>Edit User</h3>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>Email</label>
            <input v-model="currentUser.email" type="email" disabled>
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="currentUser.role">
              <option value="admin">Admin</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div class="form-group">
            <label>Status</label>
            <select v-model="currentUser.status">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="save-btn">Save</button>
            <button type="button" @click="closeModal" class="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase'
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore'

export default {
  setup() {
    const users = ref([])
    const filteredUsers = ref([])
    const searchQuery = ref('')
    const showEditModal = ref(false)
    const currentUser = ref({
      id: '',
      email: '',
      role: 'student',
      status: 'active'
    })

    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'))
        users.value = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        filteredUsers.value = [...users.value]
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    }

    const searchUsers = () => {
      if (!searchQuery.value) {
        filteredUsers.value = [...users.value]
        return
      }
      const query = searchQuery.value.toLowerCase()
      filteredUsers.value = users.value.filter(user => 
        user.email.toLowerCase().includes(query)
      )
    }

    const editUser = (user) => {
      currentUser.value = { ...user }
      showEditModal.value = true
    }

    const saveUser = async () => {
      try {
        await updateDoc(doc(db, 'users', currentUser.value.id), {
          role: currentUser.value.role,
          status: currentUser.value.status
        })
        fetchUsers()
        showEditModal.value = false
      } catch (error) {
        console.error('Error updating user:', error)
      }
    }

    const deleteUser = async (id) => {
      if (confirm('Are you sure you want to delete this user?')) {
        try {
          await deleteDoc(doc(db, 'users', id))
          fetchUsers()
        } catch (error) {
          console.error('Error deleting user:', error)
        }
      }
    }

    const closeModal = () => {
      showEditModal.value = false
    }

    onMounted(() => {
      fetchUsers()
    })

    return {
      users,
      filteredUsers,
      searchQuery,
      showEditModal,
      currentUser,
      searchUsers,
      editUser,
      saveUser,
      deleteUser,
      closeModal
    }
  }
}
</script>

<style scoped>
.manage-users {
  padding: 20px;
}

.user-search {
  margin-bottom: 20px;
}

.user-search input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #34495e;
  color: white;
}

tr:hover {
  background-color: #f5f5f5;
}

span.admin {
  background-color: #3498db;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

span.student {
  background-color: #2ecc71;
  color: white;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

span.active {
  color: #2ecc71;
}

span.inactive {
  color: #f39c12;
}

span.suspended {
  color: #e74c3c;
}

.edit-btn {
  padding: 5px 10px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  margin-right: 5px;
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

.edit-modal {
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
  padding: 20px;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
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
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.save-btn {
  padding: 8px 15px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
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
</style>
<template>
  <div class="notifications-container">
    <!-- Header Section -->
    <div class="notifications-header">
      <div class="header-content">
        <h1 class="page-title">
          <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifications
        </h1>
        <div class="header-actions">
          <button 
            @click="showComposeModal = true" 
            class="compose-button"
          >
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 20L21 4L14 14L3 20Z"/>
              <path d="M21 4L14 14L7 7"/>
            </svg>
            Compose New
          </button>
        </div>
      </div>
    </div>

    <!-- Tabs Section -->
    <div class="notifications-tabs">
      <button 
        @click="activeTab = 'inbox'" 
        :class="{ active: activeTab === 'inbox' }"
        class="tab-button"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        Inbox
        <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
      </button>
      <button 
        @click="activeTab = 'sent'" 
        :class="{ active: activeTab === 'sent' }"
        class="tab-button"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22,2 15,22 11,13 2,9 22,2"/>
        </svg>
        Sent
      </button>
    </div>

    <!-- Notifications List -->
    <div class="notifications-list">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <svg class="spinner-icon" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
            <path d="M12 2C17.523 2 22 6.477 22 12" stroke="currentColor" stroke-width="4" fill="none"/>
          </svg>
        </div>
        <p>Loading notifications...</p>
      </div>
      
      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </div>
        <h3>No notifications found</h3>
        <p>{{ activeTab === 'inbox' ? 'Your inbox is empty' : 'No sent messages' }}</p>
      </div>

      <div v-else class="notifications-grid">
        <div 
          v-for="notification in filteredNotifications" 
          :key="notification.id"
          class="notification-card"
          :class="{ 
            'unread': !notification.read && activeTab === 'inbox',
            'sent': activeTab === 'sent'
          }"
          @click="markAsRead(notification)"
        >
          <div class="notification-avatar">
            <div class="avatar-circle">
              {{ (notification.senderName || 'S')[0].toUpperCase() }}
            </div>
            <div v-if="!notification.read && activeTab === 'inbox'" class="unread-indicator"></div>
          </div>
          
          <div class="notification-content">
            <div class="notification-header">
              <div class="sender-info">
                <span class="sender-name">
                  {{ activeTab === 'inbox' ? notification.senderName || 'System' : 'To Admin' }}
                </span>
                <span class="notification-time">
                  {{ formatDate(notification.timestamp) }}
                </span>
              </div>
              <div class="notification-status">
                <svg v-if="!notification.read && activeTab === 'inbox'" class="status-icon unread" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
                <svg v-else class="status-icon read" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              </div>
            </div>
            
            <div class="notification-title">
              {{ notification.title }}
            </div>
            
            <div class="notification-message">
              {{ notification.message }}
            </div>
            
            <div v-if="activeTab === 'inbox'" class="notification-actions">
              <button 
                @click.stop="replyToNotification(notification)"
                class="action-button reply-button"
              >
                <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M3 20L21 4L14 14L3 20Z"/>
                  <path d="M21 4L14 14L7 7"/>
                </svg>
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Compose Modal -->
    <div v-if="showComposeModal" class="modal-overlay" @click="showComposeModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <svg class="modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 20L21 4L14 14L3 20Z"/>
              <path d="M21 4L14 14L7 7"/>
            </svg>
            Compose Notification
          </h2>
          <button @click="showComposeModal = false" class="close-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Recipient
            </label>
            <select v-model="newNotification.recipientId" class="form-select">
              <option value="">Select a recipient</option>
              <option 
                v-for="admin in admins" 
                :key="admin.id" 
                :value="admin.id"
              >
                {{ admin.name }} (Admin)
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Title
            </label>
            <input 
              v-model="newNotification.title" 
              type="text" 
              class="form-input"
              placeholder="Enter notification title"
            >
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              Message
            </label>
            <textarea 
              v-model="newNotification.message" 
              class="form-textarea"
              placeholder="Type your message here..."
              rows="5"
            ></textarea>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="showComposeModal = false" class="cancel-button">
            Cancel
          </button>
          <button @click="sendNotification" class="send-button">
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9 22,2"/>
            </svg>
            Send Message
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { db } from '@/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { auth } from '@/firebase';

const activeTab = ref('inbox');
const loading = ref(true);
const notifications = ref([]);
const admins = ref([]);
const unreadCount = ref(0);
const showComposeModal = ref(false);

const newNotification = ref({
  recipientId: '',
  title: '',
  message: ''
});

const currentUser = auth.currentUser;

const filteredNotifications = computed(() => {
  return notifications.value.filter(notification => {
    if (activeTab.value === 'inbox') {
      return notification.recipientId === currentUser.uid;
    } else {
      return notification.senderId === currentUser.uid;
    }
  }).sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);
});

const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const fetchNotifications = async () => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', currentUser.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      notifications.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      unreadCount.value = notifications.value.filter(n => !n.read).length;
      loading.value = false;
    });
    
    return unsubscribe;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    loading.value = false;
  }
};

const fetchAdmins = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'admin'));
    const snapshot = await getDocs(q);
    
    admins.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching admins:', error);
  }
};

const markAsRead = async (notification) => {
  if (notification.read || activeTab.value !== 'inbox') return;
  
  try {
    const notificationRef = doc(db, 'notifications', notification.id);
    await updateDoc(notificationRef, {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const replyToNotification = (notification) => {
  showComposeModal.value = true;
  newNotification.value = {
    recipientId: notification.senderId,
    title: `Re: ${notification.title}`,
    message: `\n\n------ Original Message ------\n${notification.message}`
  };
};

const sendNotification = async () => {
  if (!newNotification.value.recipientId || 
      !newNotification.value.title || 
      !newNotification.value.message) {
    alert('Please fill all fields');
    return;
  }
  
  try {
    const notificationsRef = collection(db, 'notifications');
    
    await addDoc(notificationsRef, {
      senderId: currentUser.uid,
      senderName: currentUser.displayName || 'Student',
      recipientId: newNotification.value.recipientId,
      title: newNotification.value.title,
      message: newNotification.value.message,
      timestamp: serverTimestamp(),
      read: false
    });
    
    showComposeModal.value = false;
    newNotification.value = {
      recipientId: '',
      title: '',
      message: ''
    };
    
    alert('Notification sent successfully!');
  } catch (error) {
    console.error('Error sending notification:', error);
    alert('Failed to send notification');
  }
};

let unsubscribeNotifications = null;

onMounted(async () => {
  unsubscribeNotifications = await fetchNotifications();
  await fetchAdmins();
});

onUnmounted(() => {
  if (unsubscribeNotifications) {
    unsubscribeNotifications();
  }
});
</script>

<style scoped>
.notifications-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.notifications-header {
  margin-bottom: 32px;
}

.header-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title-icon {
  width: 32px;
  height: 32px;
  stroke-width: 2;
  color: #667eea;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.compose-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.compose-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.button-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.notifications-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tab-button {
  flex: 1;
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #718096;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
}

.tab-button.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.tab-icon {
  width: 18px;
  height: 18px;
  stroke-width: 2;
}

.notification-badge {
  background: #ff6b6b;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 700;
  min-width: 18px;
  text-align: center;
}

.notifications-list {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.loading-state, .empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #718096;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.spinner-icon {
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  opacity: 0.5;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
  stroke-width: 1.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 1rem;
  margin: 0;
}

.notifications-grid {
  padding: 20px;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  background: rgba(255, 255, 255, 0.9);
}

.notification-card.unread {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.notification-card.sent {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.notification-avatar {
  position: relative;
  flex-shrink: 0;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
}

.unread-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  background: #ff6b6b;
  border-radius: 50%;
  border: 2px solid white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sender-name {
  font-weight: 600;
  color: #2d3748;
}

.notification-time {
  font-size: 0.875rem;
  color: #718096;
}

.notification-status {
  display: flex;
  align-items: center;
}

.status-icon {
  width: 16px;
  height: 16px;
}

.status-icon.unread {
  color: #667eea;
}

.status-icon.read {
  color: #68d391;
  stroke-width: 2;
}

.notification-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.notification-message {
  color: #4a5568;
  white-space: pre-line;
  margin-bottom: 12px;
  line-height: 1.6;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.action-button {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  color: #667eea;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-icon {
  width: 24px;
  height: 24px;
  stroke-width: 2;
  color: #667eea;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: #718096;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #f7fafc;
  color: #4a5568;
}

.close-button svg {
  width: 20px;
  height: 20px;
  stroke-width: 2;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.label-icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
  color: #667eea;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.cancel-button {
  background: #f7fafc;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: #edf2f7;
  color: #2d3748;
}

.send-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.send-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

/* Responsive Design */
@media (max-width: 768px) {
  .notifications-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
    padding: 20px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .title-icon {
    width: 24px;
    height: 24px;
  }
  
  .notifications-tabs {
    flex-direction: column;
    gap: 8px;
  }
  
  .tab-button {
    padding: 16px;
  }
  
  .notification-card {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .sender-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .modal-content {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .modal-header, .modal-body, .modal-footer {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 12px;
  }
  
  .cancel-button, .send-button {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .notifications-container {
    padding: 12px;
  }
  
  .header-content {
    padding: 16px;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .compose-button {
    padding: 10px 16px;
    font-size: 0.875rem;
  }
  
  .notification-card {
    padding: 12px;
  }
  
  .notification-title {
    font-size: 1rem;
  }
  
  .notification-message {
    font-size: 0.875rem;
  }
  
  .modal-content {
    margin: 10px;
    max-width: calc(100vw - 20px);
    border-radius: 16px;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .form-input, .form-select, .form-textarea {
    padding: 10px 12px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .notifications-container {
    background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
  }
  
  .header-content, .notifications-tabs, .notifications-list {
    background: rgba(45, 55, 72, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .page-title, .modal-title, .notification-title, .sender-name {
    color: #f7fafc;
  }
  
  .notification-card {
    background: rgba(45, 55, 72, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .notification-card:hover {
    background: rgba(45, 55, 72, 0.9);
  }
  
  .notification-card.unread {
    background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.1) 100%);
  }
  
  .notification-message {
    color: #cbd5e0;
  }
  
  .notification-time {
    color: #a0aec0;
  }
  
  .tab-button {
    color: #a0aec0;
  }
  
  .tab-button.active {
    color: white;
  }
  
  .modal-content {
    background: #2d3748;
  }
  
  .modal-header, .modal-footer {
    border-color: #4a5568;
  }
  
  .form-input, .form-select, .form-textarea {
    background: #4a5568;
    border-color: #718096;
    color: #f7fafc;
  }
  
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: #667eea;
    background: #4a5568;
  }
  
  .form-label {
    color: #f7fafc;
  }
  
  .cancel-button {
    background: #4a5568;
    color: #f7fafc;
    border-color: #718096;
  }
  
  .cancel-button:hover {
    background: #718096;
  }
  
  .close-button {
    color: #a0aec0;
  }
  
  .close-button:hover {
    background: #4a5568;
    color: #f7fafc;
  }
  
  .empty-state h3 {
    color: #f7fafc;
  }
  
  .empty-state p {
    color: #a0aec0;
  }
}

/* Animation enhancements */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.notification-card {
  animation: fadeIn 0.3s ease-out;
}

.notification-card.unread .unread-indicator {
  animation: pulse 2s infinite;
}

.modal-content {
  animation: fadeIn 0.3s ease-out;
}

.notifications-tabs {
  animation: slideIn 0.4s ease-out;
}

.notifications-list {
  animation: fadeIn 0.5s ease-out;
}

/* Accessibility improvements */
.compose-button:focus,
.tab-button:focus,
.action-button:focus,
.send-button:focus,
.cancel-button:focus,
.close-button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
}

/* Smooth scrolling for notifications list */
.notifications-grid {
  scroll-behavior: smooth;
}

/* Loading animation enhancement */
.loading-spinner {
  position: relative;
}

.loading-spinner::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60px;
  height: 60px;
  margin: -30px 0 0 -30px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Notification badge animation */
.notification-badge {
  animation: fadeIn 0.3s ease-out;
  position: relative;
  overflow: hidden;
}

.notification-badge::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Hover effects for better UX */
.notification-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
  pointer-events: none;
}

.notification-card:hover::before {
  opacity: 1;
}

/* Status indicator improvements */
.status-icon.unread {
  animation: pulse 2s infinite;
}

/* Form validation styles */
.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #ff6b6b;
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.form-group.error .form-label {
  color: #ff6b6b;
}

/* Success states */
.form-input.success,
.form-select.success,
.form-textarea.success {
  border-color: #68d391;
  box-shadow: 0 0 0 3px rgba(104, 211, 145, 0.1);
}

/* Toast notification styles (for future implementation) */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  pointer-events: none;
}

.toast {
  background: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  margin-bottom: 12px;
  animation: slideInRight 0.3s ease-out;
  pointer-events: auto;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
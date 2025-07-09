<template>
  <div class="notifications-container">
    <div class="notifications-header">
      <div class="header-content">
        <h1 class="header-title">
          <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          Notifications
        </h1>
        <button 
          @click="showComposeModal = true" 
          class="compose-button"
        >
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 3h18v18h-18z"/>
            <path d="M21 9l-9 6-9-6"/>
          </svg>
          Compose New
        </button>
      </div>
    </div>

    <div class="notifications-tabs">
      <button 
        @click="activeTab = 'inbox'" 
        :class="{ active: activeTab === 'inbox' }"
        class="tab-button"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        Inbox
        <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
      </button>
      <button 
        @click="activeTab = 'sent'" 
        :class="{ active: activeTab === 'sent' }"
        class="tab-button"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="22" y1="2" x2="11" y2="13"/>
          <polygon points="22,2 15,22 11,13 2,9 22,2"/>
        </svg>
        Sent
      </button>
      <button 
        @click="activeTab = 'broadcast'" 
        :class="{ active: activeTab === 'broadcast' }"
        class="tab-button"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z"/>
        </svg>
        Broadcasts
      </button>
    </div>

    <div class="notifications-list">
      <div v-if="loading" class="loading-spinner">
        <div class="spinner"></div>
        <p>Loading notifications...</p>
      </div>
      
      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <h3>No notifications found</h3>
        <p>{{ getEmptyStateMessage() }}</p>
      </div>

      <div 
        v-else 
        v-for="notification in filteredNotifications" 
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.read && activeTab === 'inbox' }"
        @click="markAsRead(notification)"
      >
        <div class="notification-content">
          <div class="notification-avatar">
            <div class="avatar-circle">
              {{ getInitials(notification.senderName || 'System') }}
            </div>
          </div>
          
          <div class="notification-body">
            <div class="notification-header">
              <div class="sender-info">
                <span class="sender-name">
                  <span v-if="activeTab === 'inbox'">
                    {{ notification.senderName || 'System' }}
                  </span>
                  <span v-else-if="activeTab === 'sent'">
                    To: {{ getRecipientName(notification.recipientId) }}
                  </span>
                  <span v-else>
                    Broadcast to all students
                  </span>
                </span>
                <span v-if="!notification.read && activeTab === 'inbox'" class="unread-dot"></span>
              </div>
              <div class="notification-meta">
                <span class="date">{{ formatDate(notification.timestamp) }}</span>
                <span v-if="notification.isBroadcast" class="broadcast-badge">
                  <svg class="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10 9 11 5.16-1 9-5.45 9-11V7l-10-5z"/>
                  </svg>
                  Broadcast
                </span>
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
                <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 17l6-6-6-6"/>
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
          <div class="modal-title">
            <svg class="modal-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 3h18v18h-18z"/>
              <path d="M21 9l-9 6-9-6"/>
            </svg>
            <h2>Compose Notification</h2>
          </div>
          <button @click="showComposeModal = false" class="close-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/>
                <line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
              Notification Type
            </label>
            <select 
              v-model="notificationType" 
              class="form-select"
              @change="handleNotificationTypeChange"
            >
              <option value="single">Single Recipient</option>
              <option value="broadcast">Broadcast to All Students</option>
            </select>
          </div>
          
          <div v-if="notificationType === 'single'" class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Recipient
            </label>
            <select v-model="newNotification.recipientId" class="form-select">
              <option value="">Select a recipient</option>
              <option 
                v-for="student in students" 
                :key="student.id" 
                :value="student.id"
              >
                {{ student.name }} (Student)
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label class="form-label">
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
              <svg class="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22,2 15,22 11,13 2,9 22,2"/>
            </svg>
            Send {{ notificationType === 'broadcast' ? 'Broadcast' : 'Notification' }}
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
const students = ref([]);
const unreadCount = ref(0);
const showComposeModal = ref(false);
const notificationType = ref('single');

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
    } else if (activeTab.value === 'sent') {
      return notification.senderId === currentUser.uid && !notification.isBroadcast;
    } else {
      return notification.isBroadcast && notification.senderId === currentUser.uid;
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

const getRecipientName = (recipientId) => {
  const student = students.value.find(s => s.id === recipientId);
  return student ? student.name : 'Unknown';
};

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getEmptyStateMessage = () => {
  switch (activeTab.value) {
    case 'inbox':
      return 'You have no notifications in your inbox';
    case 'sent':
      return 'You haven\'t sent any notifications yet';
    case 'broadcast':
      return 'You haven\'t sent any broadcast messages yet';
    default:
      return 'No notifications found';
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

const fetchStudents = async () => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('role', '==', 'student'));
    const snapshot = await getDocs(q);
    
    students.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching students:', error);
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
  notificationType.value = 'single';
  newNotification.value = {
    recipientId: notification.senderId,
    title: `Re: ${notification.title}`,
    message: `\n\n------ Original Message ------\n${notification.message}`
  };
};

const handleNotificationTypeChange = () => {
  if (notificationType.value === 'broadcast') {
    newNotification.value.recipientId = '';
  }
};

const sendNotification = async () => {
  if ((notificationType.value === 'single' && !newNotification.value.recipientId) || 
      !newNotification.value.title || 
      !newNotification.value.message) {
    alert('Please fill all fields');
    return;
  }
  
  try {
    const notificationsRef = collection(db, 'notifications');
    
    if (notificationType.value === 'broadcast') {
      // Send to all students
      for (const student of students.value) {
        await addDoc(notificationsRef, {
          senderId: currentUser.uid,
          senderName: currentUser.displayName || 'Admin',
          recipientId: student.id,
          title: newNotification.value.title,
          message: newNotification.value.message,
          timestamp: serverTimestamp(),
          read: false,
          isBroadcast: true
        });
      }
    } else {
      // Single recipient
      await addDoc(notificationsRef, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Admin',
        recipientId: newNotification.value.recipientId,
        title: newNotification.value.title,
        message: newNotification.value.message,
        timestamp: serverTimestamp(),
        read: false,
        isBroadcast: false
      });
    }
    
    showComposeModal.value = false;
    newNotification.value = {
      recipientId: '',
      title: '',
      message: ''
    };
    
    alert(notificationType.value === 'broadcast' 
      ? 'Broadcast sent successfully!' 
      : 'Notification sent successfully!');
  } catch (error) {
    console.error('Error sending notification:', error);
    alert('Failed to send notification');
  }
};

let unsubscribeNotifications = null;

onMounted(async () => {
  unsubscribeNotifications = await fetchNotifications();
  await fetchStudents();
});

onUnmounted(() => {
  if (unsubscribeNotifications) {
    unsubscribeNotifications();
  }
});
</script>

<style scoped>
.notifications-container {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: 100vh;
}

.notifications-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
}

.header-icon {
  width: 32px;
  height: 32px;
  color: #4299e1;
}

.compose-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
}

.compose-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.6);
}

.button-icon {
  width: 18px;
  height: 18px;
}

.notifications-tabs {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;
  color: #64748b;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  flex: 1;
  justify-content: center;
}

.tab-button:hover {
  color: #4299e1;
  background-color: #f1f5f9;
}

.tab-button.active {
  color: #4299e1;
  background: linear-gradient(135deg, #e6f3ff 0%, #f0f9ff 100%);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

.badge {
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 700;
}

.notifications-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.notification-item {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.notification-item:hover {
  background-color: #f8fafc;
}

.notification-item.unread {
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f3ff 100%);
  border-left: 4px solid #4299e1;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  display: flex;
  gap: 16px;
}

.notification-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.notification-body {
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
  gap: 8px;
}

.sender-name {
  font-weight: 600;
  color: #2d3748;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #4299e1;
  border-radius: 50%;
  flex-shrink: 0;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date {
  font-size: 0.875rem;
  color: #64748b;
}

.broadcast-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f59e0b;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.badge-icon {
  width: 12px;
  height: 12px;
}

.notification-title {
  font-weight: 600;
  color: #1a202c;
  margin-bottom: 8px;
  font-size: 1.125rem;
}

.notification-message {
  color: #d8980d;
  white-space: pre-line;
  line-height: 1.5;
  margin-bottom: 16px;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #4299e1;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  color: #64748b;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #4299e1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  color: #cbd5e0;
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.empty-state p {
  margin: 0;
  font-size: 0.875rem;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
}

.modal-icon {
  width: 24px;
  height: 24px;
  color: #4299e1;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: #f1f5f9;
  color: #2d3748;
}

.close-button svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
}

.label-icon {
  width: 16px;
  height: 16px;
  color: #4299e1;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
}

.cancel-button {
  background: #f1f5f9;
  color: #64748b;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-button:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.send-button {
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #4299e1 0%, #3182ce 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(66, 153, 225, 0.4);
}

.send-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(66, 153, 225, 0.6);
}

/* Responsive design */
@media (max-width: 768px) {
  .notifications-container {
    padding: 16px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .notifications-tabs {
    flex-direction: column;
    gap: 8px;
  }
  
  .tab-button {
    justify-content: flex-start;
  }
  
  .notification-content {
    flex-direction: column;
    gap: 12px;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .modal-header, .modal-body, .modal-footer {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 8px;
  }
  
  .modal-footer button {
    width: 100%;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .notifications-container {
    background-color: #1a202c;
    color: #e2e8f0;
  }
  
  .header-content, .notifications-tabs, .notifications-list {
    background: #2d3748;
    border-color: #4a5568;
  }
  
  .notification-item {
    border-color: #4a5568;
  }
  
  .notification-item:hover {
    background-color: #374151;
  }
  
  .notification-item.unread {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
  }
  
  .header-title, .notification-title, .sender-name {
    color: #e2e8f0;
  }
  
  .modal-content {
    background: #2d3748;
    color: #e2e8f0;
  }
  
  .form-input, .form-select, .form-textarea {
    background: #374151;
    border-color: #4a5568;
    color: #e2e8f0;
  }
  
  .form-input:focus, .form-select:focus, .form-textarea:focus {
    border-color: #4299e1;
  }
}

/* Smooth transitions */
* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}

/* Custom scrollbar */
.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

/* Animation for notifications */
.notification-item {
  animation: fadeInUp 0.3s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Hover effects */
.notification-item:hover .avatar-circle {
  transform: scale(1.05);
}

.notification-item:hover .notification-title {
  color: #4299e1;
}

/* Focus states for accessibility */
button:focus-visible {
  outline: 2px solid #4299e1;
  outline-offset: 2px;
}

.form-input:focus-visible, .form-select:focus-visible, .form-textarea:focus-visible {
  outline: 2px solid #4299e1;
  outline-offset: 2px;
}
</style>
<template>
  <nav class="top-navbar">
    <div class="navbar-brand">Algebra Graphical Solver</div>
         
    <div class="navbar-right">
      <div v-if="user" class="user-info">
        <span class="user-email">{{ user.email }}</span>
        <button @click="$emit('logout')" class="logout-btn">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      default: null
    }
  },
  emits: ['logout']
}
</script>

<style scoped>
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #0a0a0a;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  font-size: 1.5rem;
  font-weight: bold;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-email {
  font-size: 0.9rem;
}

.logout-btn {
  padding: 5px 15px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}
</style>
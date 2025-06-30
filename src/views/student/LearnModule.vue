<template>
  <div class="learn-module">
    <div class="module-header">
      <h1>Learn Algebra</h1>
      <p>Explore interactive lessons to master algebraic concepts</p>
      <button @click="viewContent" class="view-content-btn">
        View Content
      </button>
    </div>
    
    <div class="module-content">
      <div class="topics-list">
        <div 
          v-for="topic in topics" 
          :key="topic.id" 
          class="topic-card"
          :class="{ 'active': activeTopic === topic.id }"
          @click="setActiveTopic(topic.id)"
        >
          <div class="topic-icon">
            {{ topic.icon }}
          </div>
          <div class="topic-info">
            <h3>{{ topic.title }}</h3>
            <p>{{ topic.shortDesc }}</p>
          </div>
          <div class="topic-progress">
            <div class="progress-circle" :style="getProgressStyle(topic.progress)">
              {{ topic.progress }}%
            </div>
          </div>
        </div>
      </div>
      
      <div class="topic-details" v-if="activeTopicData">
        <h2>{{ activeTopicData.title }}</h2>
        <div class="completion-badge" v-if="activeTopicData.progress === 100">
          Completed
        </div>
        
        <div class="topic-content">
          <div class="video-container" v-if="activeTopicData.video">
            <iframe 
              width="100%" 
              height="400" 
              :src="'https://www.youtube.com/embed/' + getVideoId(activeTopicData.video)" 
              frameborder="0" 
              allowfullscreen
            ></iframe>
          </div>
          
          <div class="text-content" v-html="activeTopicData.content"></div>
          
          <div class="topic-actions">
            <button 
              v-if="activeTopicData.progress < 100" 
              @click="completeTopic" 
              class="complete-btn"
            >
              Mark as Complete
            </button>
            <button 
              @click="goToPractice(activeTopicData.id)" 
              class="practice-btn"
            >
              Practice Now
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Modal -->
    <div v-if="showContentModal" class="modal-overlay" @click="closeContentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Admin Content</h3>
          <button @click="closeContentModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="loading">
            Loading content...
          </div>
          <div v-else-if="contentData.length === 0" class="no-content">
            No content available
          </div>
          <div v-else class="content-list">
            <div 
              v-for="content in contentData" 
              :key="content.id" 
              class="content-item"
            >
              <h4>{{ content.title }}</h4>
              <p class="content-meta">
                <span>Type: {{ content.type }}</span>
                <span>Created: {{ formatDate(content.createdAt) }}</span>
              </p>
              <div class="content-body" v-html="content.body"></div>
              <div v-if="content.attachments && content.attachments.length > 0" class="attachments">
                <h5>Attachments:</h5>
                <ul>
                  <li v-for="attachment in content.attachments" :key="attachment.id">
                    <a :href="attachment.url" target="_blank">{{ attachment.name }}</a>
                  </li>
                </ul>
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
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const showContentModal = ref(false)
    const contentData = ref([])
    const loading = ref(false)
    
    const topics = ref([
      {
        id: 'linear-equations',
        title: 'Linear Equations',
        shortDesc: 'Solving equations with one variable',
        icon: '🧮',
        progress: 75,
        video: 'https://www.youtube.com/watch?v=Ft2_QtXAnh8',
        content: `
          <h3>Understanding Linear Equations</h3>
          <p>A linear equation is an equation for a straight line. The general form is:</p>
          <p class="equation">ax + b = 0</p>
          <p>Where:</p>
          <ul>
            <li><strong>a</strong> and <strong>b</strong> are constants</li>
            <li><strong>x</strong> is the variable we need to solve for</li>
          </ul>
          <h3>Solving Linear Equations</h3>
          <p>To solve for x, follow these steps:</p>
          <ol>
            <li>Subtract b from both sides: ax = -b</li>
            <li>Divide both sides by a: x = -b/a</li>
          </ol>
          <h3>Example</h3>
          <p>Solve for x: 2x + 3 = 7</p>
          <p>Solution:</p>
          <p>1. Subtract 3 from both sides: 2x = 4</p>
          <p>2. Divide both sides by 2: x = 2</p>
        `
      },
      {
        id: 'quadratic-equations',
        title: 'Quadratic Equations',
        shortDesc: 'Solving equations with x² terms',
        icon: '📊',
        progress: 50,
        video: 'https://www.youtube.com/embed/r3SEkdtpobo',
        content: `
          <h3>Understanding Quadratic Equations</h3>
          <p>A quadratic equation is a second-order polynomial equation in a single variable x, with a ≠ 0:</p>
          <p class="equation">ax² + bx + c = 0</p>
          <p>Where:</p>
          <ul>
            <li><strong>a</strong>, <strong>b</strong>, and <strong>c</strong> are constants</li>
            <li><strong>x</strong> is the variable we need to solve for</li>
          </ul>
          <h3>Solving Quadratic Equations</h3>
          <p>There are several methods to solve quadratic equations:</p>
          <ol>
            <li><strong>Factoring</strong>: Express the quadratic as a product of two binomials</li>
            <li><strong>Quadratic Formula</strong>: x = [-b ± √(b² - 4ac)] / 2a</li>
            <li><strong>Completing the Square</strong>: Rewrite the equation in vertex form</li>
          </ol>
        `
      },
      {
        id: 'polynomials',
        title: 'Polynomials',
        shortDesc: 'Working with polynomial expressions',
        icon: '📈',
        progress: 30,
        video: 'https://www.youtube.com/watch?v=nPPNgin7W7Y',
        content: `
          <h3>Understanding Polynomials</h3>
          <p>A polynomial is an expression consisting of variables and coefficients, that involves only the operations of addition, subtraction, multiplication, and non-negative integer exponents.</p>
          <p>General form of a polynomial in x:</p>
          <p class="equation">aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀</p>
          <h3>Key Concepts</h3>
          <ul>
            <li><strong>Degree</strong>: The highest power of the variable (n in the above equation)</li>
            <li><strong>Terms</strong>: Each part of the polynomial separated by + or - signs</li>
            <li><strong>Coefficients</strong>: The numerical factors of each term (aₙ, aₙ₋₁, etc.)</li>
          </ul>
          <h3>Operations with Polynomials</h3>
          <p>You can perform various operations with polynomials:</p>
          <ol>
            <li><strong>Addition/Subtraction</strong>: Combine like terms</li>
            <li><strong>Multiplication</strong>: Use the distributive property</li>
            <li><strong>Division</strong>: Polynomial long division or synthetic division</li>
          </ol>
        `
      }
    ])
    
    const activeTopic = ref('linear-equations')
    
    const activeTopicData = computed(() => {
      return topics.value.find(topic => topic.id === activeTopic.value)
    })
    
    const setActiveTopic = (topicId) => {
      activeTopic.value = topicId
    }
    
    const completeTopic = () => {
      const topic = topics.value.find(t => t.id === activeTopic.value)
      if (topic && topic.progress < 100) {
        topic.progress = 100
      }
    }
    
    const goToPractice = (topicId) => {
      router.push(`/student/practice?topic=${topicId}`)
    }
    
    const viewContent = async () => {
      showContentModal.value = true
      loading.value = true
      
      try {
        // Replace this with your actual API call to fetch content from database
        // Example: const response = await fetch('/api/content')
        // const data = await response.json()
        
        // Mock data for demonstration - replace with actual database call
        const mockData = await fetchContentFromDatabase()
        contentData.value = mockData
        
      } catch (error) {
        console.error('Error fetching content:', error)
        contentData.value = []
      } finally {
        loading.value = false
      }
    }
    
    const fetchContentFromDatabase = async () => {
      // This is a mock function. Replace with your actual database call
      // Example using Firebase Firestore:
      // const db = getFirestore()
      // const contentCollection = collection(db, 'content')
      // const contentSnapshot = await getDocs(contentCollection)
      // return contentSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: '1',
              title: 'Advanced Algebra Techniques',
              type: 'Tutorial',
              body: '<p>This content covers advanced techniques for solving complex algebraic equations...</p>',
              createdAt: new Date('2024-01-15'),
              attachments: [
                { id: 'a1', name: 'algebra-formulas.pdf', url: '/downloads/algebra-formulas.pdf' }
              ]
            },
            {
              id: '2',
              title: 'Problem Solving Strategies',
              type: 'Guide',
              body: '<p>Learn effective strategies for approaching difficult algebraic problems...</p>',
              createdAt: new Date('2024-01-20'),
              attachments: []
            }
          ])
        }, 1000)
      })
    }
    
    const closeContentModal = () => {
      showContentModal.value = false
      contentData.value = []
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }
    
    const getProgressStyle = (progress) => {
      const degree = (progress / 100) * 360
      return {
        background: `conic-gradient(#2ecc71 ${degree}deg, #ecf0f1 ${degree}deg 360deg)`
      }
    }
    
    const getVideoId = (url) => {
      // Extract video ID from both regular YouTube URLs and embed URLs
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : null;
    }
    
    return {
      topics,
      activeTopic,
      activeTopicData,
      showContentModal,
      contentData,
      loading,
      setActiveTopic,
      completeTopic,
      goToPractice,
      viewContent,
      closeContentModal,
      formatDate,
      getProgressStyle,
      getVideoId
    }
  }
}
</script>

<style scoped>
.learn-module {
  padding: 20px;
}

.module-header {
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-header div {
  flex: 1;
}

.module-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.module-header p {
  color: #7f8c8d;
  margin: 0;
}

.view-content-btn {
  padding: 12px 20px;
  background-color: #9b59b6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(155, 89, 182, 0.3);
}

.view-content-btn:hover {
  background-color: #8e44ad;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(155, 89, 182, 0.4);
}

.module-content {
  display: flex;
  gap: 20px;
}

.topics-list {
  width: 300px;
}

.topic-card {
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.topic-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.topic-card.active {
  border-left: 4px solid #3498db;
  background-color: #f8f9fa;
}

.topic-icon {
  font-size: 1.5rem;
}

.topic-info h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
  font-size: 1rem;
}

.topic-info p {
  margin: 0;
  color: #7f8c8d;
  font-size: 0.8rem;
}

.topic-progress {
  margin-left: auto;
}

.progress-circle {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  color: #2c3e50;
}

.topic-details {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
}

.topic-details h2 {
  margin-top: 0;
  color: #2c3e50;
}

.completion-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #2ecc71;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: bold;
}

.video-container {
  margin-bottom: 20px;
}

.text-content {
  line-height: 1.6;
}

.text-content h3 {
  color: #2c3e50;
  margin: 20px 0 10px 0;
}

.text-content p, .text-content ul, .text-content ol {
  margin-bottom: 15px;
}

.text-content li {
  margin-bottom: 5px;
}

.equation {
  font-family: monospace;
  font-size: 1.1rem;
  background-color: #f8f9fa;
  padding: 5px 10px;
  border-radius: 4px;
  display: inline-block;
  margin: 10px 0;
}

.topic-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.complete-btn {
  padding: 10px 15px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.complete-btn:hover {
  background-color: #27ae60;
}

.practice-btn {
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.practice-btn:hover {
  background-color: #2980b9;
}

/* Modal Styles */
.modal-overlay {
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
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8f9fa;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.no-content {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
}

.content-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-item {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
  background-color: #f8f9fa;
}

.content-item h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.content-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #7f8c8d;
}

.content-body {
  line-height: 1.6;
  margin-bottom: 15px;
}

.attachments {
  border-top: 1px solid #ddd;
  padding-top: 15px;
}

.attachments h5 {
  margin: 0 0 10px 0;
  color: #2c3e50;
}

.attachments ul {
  margin: 0;
  padding-left: 20px;
}

.attachments a {
  color: #3498db;
  text-decoration: none;
}

.attachments a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .module-content {
    flex-direction: column;
  }
  
  .topics-list {
    width: 100%;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .content-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
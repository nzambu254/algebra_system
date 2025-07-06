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
          <h3>Algebra Content</h3>
          <button @click="closeContentModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="loading">
            Loading content...
          </div>
          <div v-else-if="error" class="error">
            {{ error }}
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
              <h4>{{ content.title || 'Untitled Content' }}</h4>
              <p class="content-meta">
                <span class="type-badge" :class="content.type">{{ content.type || 'lesson' }}</span>
                <span v-if="content.createdAt">Created: {{ formatDate(content.createdAt) }}</span>
              </p>
              <div class="content-body">
                <p>{{ content.description || 'No description available' }}</p>
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
import { db } from '../../firebase'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'

export default {
  setup() {
    const router = useRouter()
    const showContentModal = ref(false)
    const contentData = ref([])
    const loading = ref(false)
    const error = ref('')
    
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
      },
      {
        id: 'functions',
        title: 'Functions',
        shortDesc: 'Understanding and graphing functions',
        icon: '📉',
        progress: 20,
        video: 'https://www.youtube.com/watch?v=52tpYl2tTqk',
        content: `
          <h3>Understanding Functions</h3>
          <p>A function is a relation between a set of inputs (domain) and a set of permissible outputs (range) with the property that each input is related to exactly one output.</p>
          <p>Function notation:</p>
          <p class="equation">f(x) = ...</p>
          <h3>Types of Functions</h3>
          <ul>
            <li><strong>Linear Functions</strong>: f(x) = mx + b</li>
            <li><strong>Quadratic Functions</strong>: f(x) = ax² + bx + c</li>
            <li><strong>Polynomial Functions</strong>: f(x) = aₙxⁿ + ... + a₁x + a₀</li>
            <li><strong>Exponential Functions</strong>: f(x) = a·bˣ</li>
            <li><strong>Logarithmic Functions</strong>: f(x) = logₐx</li>
          </ul>
          <h3>Graphing Functions</h3>
          <p>Key aspects to consider when graphing functions:</p>
          <ol>
            <li><strong>Domain and Range</strong>: The set of possible x and y values</li>
            <li><strong>Intercepts</strong>: Points where the graph crosses the axes</li>
            <li><strong>Asymptotes</strong>: Lines that the graph approaches but never touches</li>
            <li><strong>Transformations</strong>: Shifts, stretches, and reflections of basic graphs</li>
          </ol>
        `
      },
      {
        id: 'systems-equations',
        title: 'Systems of Equations',
        shortDesc: 'Solving multiple equations simultaneously',
        icon: '🧩',
        progress: 10,
        video: 'https://www.youtube.com/embed/HJV_HY0Sh0s',
        content: `
          <h3>Understanding Systems of Equations</h3>
          <p>A system of equations is a set of two or more equations with the same variables. The solution is the set of values that satisfies all equations simultaneously.</p>
          <p>Example of a linear system:</p>
          <p class="equation">
            a₁x + b₁y = c₁<br>
            a₂x + b₂y = c₂
          </p>
          <h3>Methods for Solving Systems</h3>
          <p>There are several approaches to solve systems of equations:</p>
          <ol>
            <li><strong>Graphing</strong>: Plot both equations and find the intersection point</li>
            <li><strong>Substitution</strong>: Solve one equation for one variable and substitute into the other</li>
            <li><strong>Elimination</strong>: Add or subtract equations to eliminate a variable</li>
            <li><strong>Matrices</strong>: Use matrix operations (for more advanced systems)</li>
          </ol>
          <h3>Types of Solutions</h3>
          <ul>
            <li><strong>One Solution</strong>: The lines intersect at one point (consistent and independent)</li>
            <li><strong>No Solution</strong>: The lines are parallel (inconsistent)</li>
            <li><strong>Infinite Solutions</strong>: The lines are identical (consistent and dependent)</li>
          </ul>
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
      error.value = ''
      
      try {
        await fetchContentFromDatabase()
      } catch (err) {
        console.error('Error fetching content:', err)
        error.value = 'Failed to load content. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    const fetchContentFromDatabase = async () => {
      try {
        const contentCollection = collection(db, 'content')
        const contentQuery = query(contentCollection)
        const querySnapshot = await getDocs(contentQuery)
        
        contentData.value = querySnapshot.docs.map(doc => {
          const data = doc.data()
          return {
            id: doc.id,
            title: data.title || 'Untitled Content',
            description: data.description || 'No description available',
            type: data.type || 'lesson',
            createdAt: data.createdAt || null
          }
        })
        
      } catch (err) {
        console.error('Error fetching content:', err)
        throw err
      }
    }
    
    const closeContentModal = () => {
      showContentModal.value = false
      contentData.value = []
      error.value = ''
    }
    
    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown'
      
      let date
      if (timestamp && typeof timestamp.toDate === 'function') {
        date = timestamp.toDate()
      } else if (timestamp instanceof Date) {
        date = timestamp
      } else {
        date = new Date(timestamp)
      }
      
      return date.toLocaleDateString()
    }
    
    const getProgressStyle = (progress) => {
      const degree = (progress / 100) * 360
      return {
        background: `conic-gradient(#2ecc71 ${degree}deg, #ecf0f1 ${degree}deg 360deg)`
      }
    }
    
    const getVideoId = (url) => {
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
      error,
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
  font-size: 1.1rem;
}

.error {
  text-align: center;
  padding: 40px;
  color: #e74c3c;
  font-size: 1.1rem;
}

.no-content {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 1.1rem;
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
  transition: transform 0.2s;
}

.content-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.content-item h4 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.content-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  align-items: center;
}

.content-meta span {
  font-size: 0.9rem;
  color: #7f8c8d;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
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

.content-body {
  line-height: 1.6;
}

.content-body p {
  margin: 0;
  color: #2c3e50;
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
    align-items: flex-start;
  }
}
</style>
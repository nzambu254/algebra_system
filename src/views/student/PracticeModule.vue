<template>
  <div class="practice-module">
    <div class="module-header">
      <h1>Practice Algebra</h1>
      <p>Test your knowledge with interactive exercises</p>
    </div>
    
    <div class="practice-content">
      <div class="topic-selector">
        <label>Select Topic:</label>
        <select v-model="selectedTopic">
          <option 
            v-for="topic in topics" 
            :key="topic.id" 
            :value="topic.id"
          >
            {{ topic.title }}
          </option>
        </select>
        <button @click="showGraphExample" class="graph-btn">
          Solve Equations on Graph
        </button>
      </div>
      
      <div v-if="showGraph" class="graph-container">
        <h3>Graphing Linear Equations</h3>
        <div class="graph-instructions">
          <p>Enter a linear equation in the form <strong>y = mx + b</strong> or <strong>ax + by = c</strong>:</p>
          <div class="equation-input">
            <input
              v-model="userEquation"
              type="text"
              placeholder="e.g., y = 2x + 3 or 3x + 2y = 6"
              @keyup.enter="plotEquation"
            >
            <button @click="plotEquation" class="plot-btn">
              Plot Graph
            </button>
          </div>
          <div v-if="equationError" class="error-message">
            {{ equationError }}
          </div>
        </div>
        
        <div v-if="visiblePoints.length > 0" class="graph-table">
          <table>
            <thead>
              <tr>
                <th>x</th>
                <th>y</th>
                <th>(x, y)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(point, index) in visiblePoints" :key="index">
                <td>{{ point.x }}</td>
                <td>{{ point.y.toFixed(2) }}</td>
                <td>({{ point.x }}, {{ point.y.toFixed(2) }})</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="graph-visualization">
          <div class="graph-axis">
            <!-- Grid lines -->
            <div v-for="i in [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]" :key="'x'+i" 
                 class="grid-line vertical" :style="{ left: 50 + i*8 + '%' }">
              <span class="grid-label">{{ i }}</span>
            </div>
            <div v-for="i in [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]" :key="'y'+i" 
                 class="grid-line horizontal" :style="{ top: 50 - i*8 + '%' }">
              <span class="grid-label">{{ i }}</span>
            </div>
            
            <!-- Main axes -->
            <div class="y-axis"></div>
            <div class="x-axis"></div>
            <div class="origin">0</div>
            
            <!-- SVG for line drawing -->
            <svg class="graph-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <polyline 
                v-if="svgPoints.length > 1"
                :points="svgPoints"
                fill="none"
                stroke="#2563eb"
                stroke-width="2"
              />
            </svg>
            
            <!-- Points -->
            <div 
              v-for="(point, index) in visiblePoints" 
              :key="'point'+index"
              class="point"
              :style="{
                left: 50 + (point.x * 8) + '%',
                top: 50 - (point.y * 8) + '%'
              }"
              :data-point="`(${point.x}, ${point.y.toFixed(2)})`"
            ></div>
          </div>
        </div>
        
        <button @click="hideGraph" class="back-btn">
          Back to Practice
        </button>
      </div>
      
      <div v-if="currentQuestion && !showGraph" class="question-container">
        <div class="question-progress">
          Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
        </div>
        
        <div class="question-card">
          <h3>{{ currentQuestion.text }}</h3>
          
          <div v-if="currentQuestion.type === 'multiple-choice'" class="options">
            <div 
              v-for="(option, index) in currentQuestion.options" 
              :key="index" 
              class="option"
              :class="{
                'selected': selectedAnswer === index,
                'correct': showFeedback && index === currentQuestion.correctAnswer,
                'incorrect': showFeedback && selectedAnswer === index && selectedAnswer !== currentQuestion.correctAnswer
              }"
              @click="selectAnswer(index)"
            >
              {{ option }}
            </div>
          </div>
          
          <div v-else-if="currentQuestion.type === 'input'" class="input-answer">
            <input 
              v-model="userInput" 
              type="text" 
              placeholder="Enter your answer..."
              :disabled="showFeedback"
            >
            <span v-if="showFeedback" class="correct-answer">
              Correct answer: {{ currentQuestion.correctAnswer }}
            </span>
          </div>
          
          <div v-if="showFeedback" class="feedback">
            <p v-if="isAnswerCorrect" class="correct-feedback">
              ✅ Correct! Well done.
            </p>
            <p v-else class="incorrect-feedback">
              ❌ Incorrect. Try again!
            </p>
            <p class="explanation">{{ currentQuestion.explanation }}</p>
          </div>
          
          <div class="question-actions">
            <button 
              v-if="!showFeedback" 
              @click="checkAnswer" 
              class="submit-btn"
              :disabled="selectedAnswer === null && !userInput"
            >
              Submit
            </button>
            <button 
              @click="nextQuestion" 
              class="next-btn"
            >
              {{ isLastQuestion ? 'Finish' : 'Next Question' }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="practiceCompleted && !showGraph" class="results-container">
        <h2>Practice Results</h2>
        <div class="score-display">
          <div class="score-circle">
            {{ Math.round((correctAnswers / questions.length) * 100) }}%
          </div>
          <p>You got {{ correctAnswers }} out of {{ questions.length }} correct</p>
        </div>
        
        <div class="topic-performance">
          <h3>Topic Performance</h3>
          <div class="performance-bar">
            <div 
              class="performance-fill" 
              :style="{ width: `${(correctAnswers / questions.length) * 100}%` }"
            ></div>
          </div>
        </div>
        
        <button @click="restartPractice" class="restart-btn">
          Practice Again
        </button>
        <button @click="goToLearn" class="learn-btn">
          Review Topic
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()
    const topics = ref([
      { id: 'linear-equations', title: 'Linear Equations' },
      { id: 'quadratic-equations', title: 'Quadratic Equations' },
      { id: 'polynomials', title: 'Polynomials' }
    ])
    
    const selectedTopic = ref('linear-equations')
    const questions = ref([])
    const currentQuestionIndex = ref(0)
    const selectedAnswer = ref(null)
    const userInput = ref('')
    const showFeedback = ref(false)
    const correctAnswers = ref(0)
    const practiceCompleted = ref(false)
    const showGraph = ref(false)
    const userEquation = ref('')
    const equationError = ref('')
    const windowWidth = ref(window.innerWidth)
    
    const equationData = ref({
      points: [],
      slope: 0,
      intercept: 0
    })
    
    const visiblePoints = computed(() => {
      return equationData.value.points.filter(point => 
        point.x >= -5 && point.x <= 5 && 
        point.y >= -5 && point.y <= 5
      )
    })
    
    const svgPoints = computed(() => {
      if (visiblePoints.value.length < 2) return ''
      
      return visiblePoints.value.map(point => {
        const svgX = ((point.x + 5) / 10) * 400
        const svgY = ((5 - point.y) / 10) * 400
        return `${svgX},${svgY}`
      }).join(' ')
    })
    
    const parseEquation = (equation) => {
      equationError.value = ''
      equation = equation.replace(/\s+/g, '')
      
      // Reset equation data
      equationData.value = {
        points: [],
        slope: 0,
        intercept: 0
      }
      
      if (equation.includes('y=')) {
        const rightSide = equation.split('y=')[1]
        
        if (rightSide === 'x') {
          equationData.value.slope = 1
          equationData.value.intercept = 0
          return true
        }
        if (rightSide === '-x') {
          equationData.value.slope = -1
          equationData.value.intercept = 0
          return true
        }
        
        let slope = 0
        let intercept = 0
        const parts = rightSide.split(/([+-])/)
        let currentTerm = ''
        let operator = '+'
        
        for (let i = 0; i < parts.length; i++) {
          if (parts[i] === '+' || parts[i] === '-') {
            if (currentTerm) {
              if (currentTerm.includes('x')) {
                const coeff = currentTerm.replace('x', '')
                if (coeff === '' || coeff === '+') slope += 1
                else if (coeff === '-') slope -= 1
                else slope += parseFloat((operator === '-' ? '-' : '') + coeff)
              } else {
                intercept += parseFloat((operator === '-' ? '-' : '') + currentTerm)
              }
            }
            operator = parts[i]
            currentTerm = ''
          } else {
            currentTerm = parts[i]
          }
        }
        
        if (currentTerm) {
          if (currentTerm.includes('x')) {
            const coeff = currentTerm.replace('x', '')
            if (coeff === '' || coeff === '+') slope += (operator === '-' ? -1 : 1)
            else if (coeff === '-') slope -= 1
            else slope += parseFloat((operator === '-' ? '-' : '') + coeff)
          } else {
            intercept += parseFloat((operator === '-' ? '-' : '') + currentTerm)
          }
        }
        
        equationData.value.slope = slope
        equationData.value.intercept = intercept
        return true
      }
      else if (equation.includes('x') && equation.includes('y') && equation.includes('=')) {
        const equationParts = equation.split('=')
        if (equationParts.length !== 2) {
          equationError.value = 'Equation must contain exactly one equals sign (=)'
          return false
        }
        
        const leftSide = equationParts[0]
        const c = parseFloat(equationParts[1])
        
        const xMatch = leftSide.match(/([+-]?\d*\.?\d*)x/)
        const yMatch = leftSide.match(/([+-]?\d*\.?\d*)y/)
        
        let a = 0, b = 0
        
        if (xMatch) {
          const coeff = xMatch[1]
          if (coeff === '' || coeff === '+') a = 1
          else if (coeff === '-') a = -1
          else a = parseFloat(coeff)
        }
        
        if (yMatch) {
          const coeff = yMatch[1]
          if (coeff === '' || coeff === '+') b = 1
          else if (coeff === '-') b = -1
          else b = parseFloat(coeff)
        }
        
        if (b === 0) {
          equationError.value = 'Invalid equation: y coefficient cannot be zero for linear equations'
          return false
        }
        
        const slope = -a / b
        const intercept = c / b
        
        equationData.value.slope = slope
        equationData.value.intercept = intercept
        return true
      }
      else {
        equationError.value = 'Invalid equation format. Use y=mx+b or ax+by=c'
        return false
      }
    }
    
    const calculatePoints = () => {
      const points = []
      const { slope, intercept } = equationData.value
      
      for (let x = -10; x <= 10; x += 0.5) {
        const y = slope * x + intercept
        points.push({ x, y })
      }
      
      equationData.value.points = points
    }
    
    const plotEquation = () => {
      if (!userEquation.value.trim()) {
        equationError.value = 'Please enter an equation'
        return
      }
      
      if (parseEquation(userEquation.value)) {
        calculatePoints()
      }
    }
    
    const plotSampleEquation = () => {
      userEquation.value = 'y = 2x + 1'
      plotEquation()
    }
    
    const generateQuestions = (topic) => {
      if (topic === 'linear-equations') {
        return [
          {
            id: 1,
            text: 'What is the solution to the equation: 2x + 3 = 7?',
            type: 'multiple-choice',
            options: ['x = 1', 'x = 2', 'x = 3', 'x = 4'],
            correctAnswer: 1,
            explanation: 'Subtract 3 from both sides: 2x = 4. Then divide by 2: x = 2.'
          },
          {
            id: 2,
            text: 'Solve for x: 3x - 5 = 10',
            type: 'input',
            correctAnswer: '5',
            explanation: 'Add 5 to both sides: 3x = 15. Then divide by 3: x = 5.'
          },
          {
            id: 3,
            text: 'Which of these is a linear equation?',
            type: 'multiple-choice',
            options: ['x² + 2x + 1 = 0', '3x - 7 = 2', 'y = sin(x)', 'x³ = 8'],
            correctAnswer: 1,
            explanation: 'A linear equation has a degree of 1. Only option 2 fits this criteria.'
          }
        ]
      } else if (topic === 'quadratic-equations') {
        return [
          {
            id: 1,
            text: 'What is the standard form of a quadratic equation?',
            type: 'multiple-choice',
            options: [
              'ax + b = 0',
              'ax² + bx + c = 0',
              'a/x + b = c',
              'x² + y² = r²'
            ],
            correctAnswer: 1,
            explanation: 'The standard form of a quadratic equation is ax² + bx + c = 0.'
          },
          {
            id: 2,
            text: 'What is the solution to x² - 4 = 0?',
            type: 'input',
            correctAnswer: '2,-2',
            explanation: 'Factor as (x-2)(x+2)=0, so solutions are x=2 and x=-2.'
          }
        ]
      } else {
        return [
          {
            id: 1,
            text: 'What is the degree of the polynomial 3x² + 2x - 5?',
            type: 'multiple-choice',
            options: ['0', '1', '2', '3'],
            correctAnswer: 2,
            explanation: 'The degree is the highest power of the variable, which is 2 in this case.'
          }
        ]
      }
    }
    
    const currentQuestion = computed(() => {
      return questions.value[currentQuestionIndex.value]
    })
    
    const isAnswerCorrect = computed(() => {
      if (currentQuestion.value?.type === 'multiple-choice') {
        return selectedAnswer.value === currentQuestion.value.correctAnswer
      } else {
        return userInput.value === currentQuestion.value?.correctAnswer.toString()
      }
    })
    
    const isLastQuestion = computed(() => {
      return currentQuestionIndex.value === questions.value.length - 1
    })
    
    const selectAnswer = (index) => {
      if (!showFeedback.value) {
        selectedAnswer.value = index
      }
    }
    
    const checkAnswer = () => {
      showFeedback.value = true
      if (isAnswerCorrect.value) {
        correctAnswers.value++
      }
    }
    
    const nextQuestion = () => {
      if (showFeedback.value) {
        if (isLastQuestion.value) {
          practiceCompleted.value = true
          questions.value = []
        } else {
          currentQuestionIndex.value++
          selectedAnswer.value = null
          userInput.value = ''
          showFeedback.value = false
        }
      }
    }
    
    const restartPractice = () => {
      questions.value = generateQuestions(selectedTopic.value)
      currentQuestionIndex.value = 0
      selectedAnswer.value = null
      userInput.value = ''
      showFeedback.value = false
      correctAnswers.value = 0
      practiceCompleted.value = false
      showGraph.value = false
      userEquation.value = ''
      equationError.value = ''
      equationData.value = {
        points: [],
        slope: 0,
        intercept: 0
      }
    }
    
    const goToLearn = () => {
      router.push(`/student/learn?topic=${selectedTopic.value}`)
    }
    
    const showGraphExample = () => {
      showGraph.value = true
      userEquation.value = ''
      equationError.value = ''
      equationData.value = {
        points: [],
        slope: 0,
        intercept: 0
      }
      setTimeout(plotSampleEquation, 300)
    }
    
    const hideGraph = () => {
      showGraph.value = false
    }
    
    const onResize = () => {
      windowWidth.value = window.innerWidth
    }
    
    watch(selectedTopic, (newTopic) => {
      restartPractice()
    })
    
    watch(() => equationData.value.slope, () => {
      if (equationData.value.slope !== 0 || equationData.value.intercept !== 0) {
        calculatePoints()
      }
    })
    
    onMounted(() => {
      window.addEventListener('resize', onResize)
      questions.value = generateQuestions(selectedTopic.value)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', onResize)
    })
    
    return {
      topics,
      selectedTopic,
      questions,
      currentQuestion,
      currentQuestionIndex,
      selectedAnswer,
      userInput,
      showFeedback,
      isAnswerCorrect,
      isLastQuestion,
      correctAnswers,
      practiceCompleted,
      showGraph,
      userEquation,
      equationError,
      equationData,
      visiblePoints,
      svgPoints,
      windowWidth,
      selectAnswer,
      checkAnswer,
      nextQuestion,
      restartPractice,
      goToLearn,
      showGraphExample,
      hideGraph,
      plotEquation
    }
  }
}
</script>

<style scoped>
.practice-module {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.module-header {
  text-align: center;
  margin-bottom: 30px;
}

.module-header h1 {
  color: #1f2937;
  margin-bottom: 10px;
}

.topic-selector {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.topic-selector label {
  font-weight: 600;
  color: #374151;
}

.topic-selector select {
  padding: 8px 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.graph-btn, .plot-btn {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.graph-btn:hover, .plot-btn:hover {
  background: #2563eb;
}

.graph-container {
  background: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.graph-instructions {
  margin-bottom: 20px;
}

.equation-input {
  display: flex;
  gap: 10px;
  margin: 10px 0;
  flex-wrap: wrap;
}

.equation-input input {
  flex: 1;
  padding: 10px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  min-width: 200px;
}

.error-message {
  color: #dc2626;
  font-weight: 500;
  margin-top: 10px;
}

.graph-table {
  margin: 20px 0;
  overflow-x: auto;
}

.graph-table table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 6px;
  overflow: hidden;
}

.graph-table th, .graph-table td {
  padding: 8px 12px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.graph-table th {
  background: #f3f4f6;
  font-weight: 600;
}

.graph-visualization {
  margin: 20px 0;
  display: flex;
  justify-content: center;
}

.graph-axis {
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 400px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  margin: 0 auto;
}

.grid-line {
  position: absolute;
  background: #f3f4f6;
}

.grid-line.vertical {
  width: 1px;
  height: 100%;
  top: 0;
}

.grid-line.horizontal {
  height: 1px;
  width: 100%;
  left: 0;
}

.grid-label {
  position: absolute;
  font-size: 10px;
  color: #6b7280;
  font-weight: 500;
}

.grid-line.vertical .grid-label {
  bottom: -15px;
  left: -8px;
}

.grid-line.horizontal .grid-label {
  left: -15px;
  top: -8px;
}

.y-axis {
  position: absolute;
  left: 50%;
  top: 0;
  width: 2px;
  height: 100%;
  background: #374151;
  transform: translateX(-50%);
}

.y-axis::after {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 10px solid #374151;
}

.x-axis {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: #374151;
  transform: translateY(-50%);
}

.x-axis::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-bottom: 6px solid transparent;
  border-left: 10px solid #374151;
}

.origin {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 2px 4px;
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  z-index: 10;
}

.graph-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.point {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #dc2626;
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(1);
  z-index: 5;
  cursor: pointer;
  transition: all 0.3s ease;
}

.point:hover {
  transform: translate(-50%, -50%) scale(1.5);
}

.point:hover::after {
  content: attr(data-point);
  position: absolute;
  top: -25px;
  left: 50%;
  transform: translateX(-50%);
  background: #374151;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 20;
}

.back-btn {
  background: #6b7280;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 20px;
}

.back-btn:hover {
  background: #4b5563;
}

.question-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.question-progress {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 15px;
}

.question-card h3 {
  color: #1f2937;
  margin-bottom: 20px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.option:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option.selected {
  border-color: #3b82f6;
  background: #dbeafe;
}

.option.correct {
  border-color: #10b981;
  background: #d1fae5;
}

.option.incorrect {
  border-color: #ef4444;
  background: #fee2e2;
}

.input-answer {
  margin: 20px 0;
}

.input-answer input {
  width: 100%;
  padding: 12px;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
}

.correct-answer {
  display: block;
  margin-top: 10px;
  color: #059669;
  font-weight: 500;
}

.feedback {
  margin: 20px 0;
  padding: 15px;
  border-radius: 6px;
}

.correct-feedback {
  color: #059669;
  font-weight: 600;
}

.incorrect-feedback {
  color: #dc2626;
  font-weight: 600;
}

.explanation {
  color: #374151;
  margin-top: 10px;
}

.question-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn, .next-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn {
  background: #3b82f6;
  color: white;
}

.submit-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.next-btn {
  background: #10b981;
  color: white;
}

.results-container {
  text-align: center;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.score-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 20px;
}

.topic-performance {
  margin: 20px 0;
}

.performance-bar {
  width: 100%;
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
  margin-top: 10px;
}

.performance-fill {
  height: 100%;
  background: #10b981;
  transition: width 0.3s ease;
}

.restart-btn, .learn-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin: 0 10px;
  font-weight: 600;
}

.restart-btn {
  background: #3b82f6;
  color: white;
}

.learn-btn {
  background: #10b981;
  color: white;
}

@media (max-width: 768px) {
  .topic-selector {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .graph-btn {
    margin-left: 0;
    width: 100%;
  }
  
  .equation-input {
    flex-direction: column;
  }
  
  .equation-input input {
    width: 100%;
  }
  
  .graph-axis {
    height: 300px;
  }
  
  .question-actions {
    flex-direction: column;
  }
  
  .restart-btn, .learn-btn {
    margin: 5px 0;
    width: 100%;
  }
}

.plot-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.topic-selector select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px #bfdbfe;
}
</style>
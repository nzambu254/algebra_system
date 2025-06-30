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
      </div>
      
      <div v-if="currentQuestion" class="question-container">
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
      
      <div v-else class="results-container">
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
import { ref, computed, watch } from 'vue'
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
    
    const generateQuestions = (topic) => {
      // In a real app, you would fetch these from a database
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
      if (currentQuestion.value.type === 'multiple-choice') {
        return selectedAnswer.value === currentQuestion.value.correctAnswer
      } else {
        return userInput.value === currentQuestion.value.correctAnswer.toString()
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
    }
    
    const goToLearn = () => {
      router.push(`/student/learn?topic=${selectedTopic.value}`)
    }
    
    watch(selectedTopic, (newTopic) => {
      restartPractice()
    })
    
    // Initialize
    questions.value = generateQuestions(selectedTopic.value)
    
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
      selectAnswer,
      checkAnswer,
      nextQuestion,
      restartPractice,
      goToLearn
    }
  }
}
</script>

<style scoped>
.practice-module {
  padding: 20px;
}

.module-header {
  margin-bottom: 30px;
}

.module-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.module-header p {
  color: #7f8c8d;
  margin: 0;
}

.practice-content {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.topic-selector {
  margin-bottom: 20px;
}

.topic-selector label {
  margin-right: 10px;
  font-weight: bold;
}

.topic-selector select {
  padding: 8px 15px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.question-progress {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.question-card {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 20px;
}

.question-card h3 {
  margin-top: 0;
  color: #2c3e50;
}

.options {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin: 20px 0;
}

.option {
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.option:hover {
  background-color: #f5f5f5;
}

.option.selected {
  border-color: #3498db;
  background-color: #e1f0fa;
}

.option.correct {
  border-color: #2ecc71;
  background-color: #e8f8f0;
}

.option.incorrect {
  border-color: #e74c3c;
  background-color: #fbe9e7;
}

.input-answer {
  margin: 20px 0;
}

.input-answer input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.correct-answer {
  display: block;
  margin-top: 10px;
  color: #2ecc71;
  font-weight: bold;
}

.feedback {
  margin: 20px 0;
  padding: 15px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.correct-feedback {
  color: #2ecc71;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.incorrect-feedback {
  color: #e74c3c;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.explanation {
  margin: 0;
  color: #7f8c8d;
}

.question-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.next-btn {
  padding: 10px 20px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.results-container {
  text-align: center;
  padding: 20px;
}

.results-container h2 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.score-display {
  margin: 30px 0;
}

.score-circle {
  width: 120px;
  height: 120px;
  margin: 0 auto 15px;
  border-radius: 50%;
  background: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.score-display p {
  font-size: 1.2rem;
  color: #7f8c8d;
}

.topic-performance {
  margin: 30px auto;
  max-width: 500px;
}

.topic-performance h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.performance-bar {
  height: 20px;
  background: #ecf0f1;
  border-radius: 10px;
  overflow: hidden;
}

.performance-fill {
  height: 100%;
  background: #2ecc71;
  transition: width 0.5s ease;
}

.restart-btn {
  padding: 12px 25px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin: 10px;
  transition: background-color 0.3s;
}

.restart-btn:hover {
  background-color: #2980b9;
}

.learn-btn {
  padding: 12px 25px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  margin: 10px;
  transition: background-color 0.3s;
}

.learn-btn:hover {
  background-color: #27ae60;
}

@media (max-width: 600px) {
  .question-actions {
    flex-direction: column;
  }
  
  .submit-btn,
  .next-btn {
    width: 100%;
  }
}
</style>
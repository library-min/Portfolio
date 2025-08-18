import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [todos, setTodos] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState('전체')
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [draggedItem, setDraggedItem] = useState(null)
  const [isAddingTodo, setIsAddingTodo] = useState(false)
  const [deletingTodos, setDeletingTodos] = useState(new Set())
  const [timeOfDay, setTimeOfDay] = useState('morning')
  const inputRef = useRef(null)

  useEffect(() => {
    const savedTodos = localStorage.getItem('todos')
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedTodos) {
      setTodos(JSON.parse(savedTodos))
    }
    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode))
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setDarkMode(prefersDark)
    }
    
    // 페이지 로드 시 입력창에 자동 포커스
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }, [])

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
    document.body.classList.toggle('dark-mode', darkMode)
  }, [darkMode])

  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning')
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('afternoon')
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening')
      } else {
        setTimeOfDay('night')
      }
    }

    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000)
    return () => clearInterval(interval)
  }, [])

  const addTodo = () => {
    if (inputValue.trim() !== '') {
      setIsAddingTodo(true)
      const newTodo = {
        id: Date.now(),
        text: inputValue.trim(),
        completed: false,
        priority: 'medium',
        dueDate: null,
        createdAt: new Date().toISOString()
      }
      setTimeout(() => {
        setTodos([newTodo, ...todos])
        setInputValue('')
        setIsAddingTodo(false)
        inputRef.current?.focus()
      }, 200)
    }
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ))
  }

  const deleteTodo = (id) => {
    setDeletingTodos(prev => new Set([...prev, id]))
    setTimeout(() => {
      setTodos(todos.filter(todo => todo.id !== id))
      setDeletingTodos(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }, 300)
  }

  const clearCompleted = () => {
    const completedIds = todos.filter(todo => todo.completed).map(todo => todo.id)
    completedIds.forEach(id => {
      setDeletingTodos(prev => new Set([...prev, id]))
    })
    setTimeout(() => {
      setTodos(todos.filter(todo => !todo.completed))
      setDeletingTodos(new Set())
    }, 300)
  }

  const updateTodoPriority = (id, priority) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, priority } : todo
    ))
  }

  const updateTodoDueDate = (id, dueDate) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, dueDate } : todo
    ))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTodo()
    }
  }

  const filteredTodos = todos.filter(todo => {
    const matchesFilter = (() => {
      if (filter === '완료') return todo.completed
      if (filter === '미완료') return !todo.completed
      return true
    })()
    
    const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const activeTodos = filteredTodos.filter(todo => !todo.completed)
  const completedTodos = filteredTodos.filter(todo => todo.completed)
  const totalTodos = todos.length
  const completedCount = todos.filter(todo => todo.completed).length
  const progressPercentage = totalTodos > 0 ? (completedCount / totalTodos) * 100 : 0

  useEffect(() => {
    document.documentElement.style.setProperty('--completion-rate', `${progressPercentage}%`)
    document.documentElement.style.setProperty('--completion-glow', progressPercentage > 50 ? '1' : '0')
  }, [progressPercentage])

  const handleDragStart = (e, todo) => {
    setDraggedItem(todo)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetTodo) => {
    e.preventDefault()
    if (!draggedItem || draggedItem.id === targetTodo.id) return
    
    const draggedIndex = todos.findIndex(todo => todo.id === draggedItem.id)
    const targetIndex = todos.findIndex(todo => todo.id === targetTodo.id)
    
    const newTodos = [...todos]
    const [removed] = newTodos.splice(draggedIndex, 1)
    newTodos.splice(targetIndex, 0, removed)
    
    setTodos(newTodos)
    setDraggedItem(null)
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff6b6b'
      case 'medium': return '#feca57'
      case 'low': return '#48dbfb'
      default: return '#a29bfe'
    }
  }

  return (
    <div className={`app ${darkMode ? 'dark' : ''} time-${timeOfDay}`} 
         style={{
           '--total-todos': totalTodos,
           '--completed-todos': completedCount,
           '--progress-percentage': progressPercentage
         }}>
      <div className="theme-checkbox-container">
        <div className="theme-title"></div>
        <label className="theme-checkbox">
          <input
            type="checkbox"
            checked={!darkMode}
            onChange={() => setDarkMode(false)}
          />
          <span className="checkbox-text">☀️ 라이트 모드</span>
        </label>
        <label className="theme-checkbox">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={() => setDarkMode(true)}
          />
          <span className="checkbox-text">🌙 다크 모드</span>
        </label>
      </div>
      <header className="app-header">
        <div className="header-content">
          <h1>To-Do List</h1>
        </div>
        {totalTodos > 0 && (
          <div className="progress-section">
            <div className="progress-info">
              <span>{completedCount}/{totalTodos} 완료</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
      </header>
      
      <div className="todo-input-section">
        <div className="input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="새로운 할 일을 입력하세요"
            className="todo-input"
            disabled={isAddingTodo}
          />
          <button 
            onClick={addTodo} 
            className={`add-button ${isAddingTodo ? 'adding' : ''}`}
            disabled={isAddingTodo}
          >
            {isAddingTodo ? '⏳' : '+'}
          </button>
        </div>
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="할 일 검색"
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-buttons">
          {['전체', '미완료', '완료'].map(filterType => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`filter-button ${filter === filterType ? 'active' : ''}`}
            >
              {filterType}
            </button>
          ))}
        </div>
        {completedTodos.length > 0 && (
          <button 
            onClick={clearCompleted}
            className="clear-completed-button"
          >
            완료된 일 모두 삭제 ({completedTodos.length})
          </button>
        )}
      </div>

      <div className="todos-container">
        <div className="todos-section">
          <h2>할 일 ({activeTodos.length})</h2>
          <div className="todos-list">
            {activeTodos.map(todo => (
              <div 
                key={todo.id} 
                className={`todo-card ${deletingTodos.has(todo.id) ? 'deleting' : ''} ${isOverdue(todo.dueDate) ? 'overdue' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, todo)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, todo)}
                style={{
                  borderLeft: `4px solid ${getPriorityColor(todo.priority)}`
                }}
              >
                <div className="todo-main-content">
                  <span 
                    onClick={() => toggleTodo(todo.id)}
                    className={`todo-text ${todo.completed ? 'completed' : ''}`}
                  >
                    {todo.text}
                  </span>
                  {todo.dueDate && (
                    <div className={`due-date ${isOverdue(todo.dueDate) ? 'overdue' : ''}`}>
                      {isOverdue(todo.dueDate) ? '⚠️' : '📅'} 
                      <span className="due-date-text">
                        {new Date(todo.dueDate).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {isOverdue(todo.dueDate) && (
                        <span className="overdue-badge">연체</span>
                      )}
                    </div>
                  )}
                </div>
                <div className="todo-controls">
                  <div className="control-group">
                    <label className="control-label">중요도</label>
                    <div className="priority-indicator">
                      <select 
                        value={todo.priority}
                        onChange={(e) => updateTodoPriority(todo.id, e.target.value)}
                        className={`priority-select priority-${todo.priority}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="low">🟢 낮음</option>
                        <option value="medium">🟡 보통</option>
                        <option value="high">🔴 높음</option>
                      </select>
                    </div>
                  </div>
                  <div className="control-group">
                    <label className="control-label">마감일</label>
                    <div className="due-date-indicator">
                      <input
                        type="datetime-local"
                        value={todo.dueDate || ''}
                        onChange={(e) => updateTodoDueDate(todo.id, e.target.value)}
                        className={`due-date-input ${isOverdue(todo.dueDate) ? 'overdue-input' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTodo(todo.id)}
                    className="delete-button"
                    title="삭제"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="todos-section">
          <h2>완료된 일 ({completedTodos.length})</h2>
          <div className="todos-list">
            {completedTodos.map(todo => (
              <div 
                key={todo.id} 
                className={`todo-card completed-card ${deletingTodos.has(todo.id) ? 'deleting' : ''}`}
                draggable
                onDragStart={(e) => handleDragStart(e, todo)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, todo)}
              >
                <div className="todo-main-content">
                  <span 
                    onClick={() => toggleTodo(todo.id)}
                    className="todo-text completed"
                  >
                    {todo.text} ✓
                  </span>
                  {todo.dueDate && (
                    <div className="due-date completed">
                      ✅ 
                      <span className="due-date-text">
                        {new Date(todo.dueDate).toLocaleDateString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className="completed-badge">완료</span>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => deleteTodo(todo.id)}
                  className="delete-button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

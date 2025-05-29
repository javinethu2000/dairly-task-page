<script>
        let tasks = [];
        let nextId = 1;
        let currentFilter = 'all';
        let searchQuery = '';

        // Initialize with sample tasks
        const sampleTasks = [
            { text: "Morning workout session", priority: "high", category: "health", dueDate: getTodayDate(9, 0) },
            { text: "Review project proposal", priority: "high", category: "work", dueDate: getTodayDate(14, 0) },
            { text: "Grocery shopping", priority: "medium", category: "shopping", dueDate: getTomorrowDate(18, 0) },
            { text: "Call family", priority: "medium", category: "personal" },
            { text: "Read 30 pages of book", priority: "low", category: "learning" },
            { text: "Prepare presentation", priority: "high", category: "work", dueDate: getTodayDate(16, 30) }
        ];

        function getTodayDate(hours = 23, minutes = 59) {
            const today = new Date();
            today.setHours(hours, minutes, 0, 0);
            return today.toISOString().slice(0, 16);
        }

        function getTomorrowDate(hours = 18, minutes = 0) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(hours, minutes, 0, 0);
            return tomorrow.toISOString().slice(0, 16);
        }

        function initializeTasks() {
            sampleTasks.forEach(task => {
                tasks.push({
                    id: nextId++,
                    text: task.text,
                    completed: false,
                    createdAt: new Date().toISOString(),
                    dueDate: task.dueDate || null,
                    priority: task.priority,
                    category: task.category
                });
            });
        }

        function addTask() {
            const taskInput = document.getElementById('taskInput');
            const dueDateInput = document.getElementById('dueDateInput');
            const prioritySelect = document.getElementById('prioritySelect');
            const categorySelect = document.getElementById('categorySelect');

            const taskText = taskInput.value.trim();
            
            if (!taskText) {
                taskInput.focus();
                return;
            }

            const newTask = {
                id: nextId++,
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString(),
                dueDate: dueDateInput.value || null,
                priority: prioritySelect.value,
                category: categorySelect.value
            };

            tasks.unshift(newTask);
            
            // Clear inputs
            taskInput.value = '';
            dueDateInput.value = '';
            prioritySelect.value = 'medium';
            categorySelect.value = 'personal';
            
            renderTasks();
            updateStats();
            taskInput.focus();
        }

        function toggleTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = !task.completed;
                renderTasks();
                updateStats();
            }
        }

        function deleteTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            renderTasks();
            updateStats();
        }

        function editTask(id) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                const newText = prompt('Edit task:', task.text);
                if (newText && newText.trim()) {
                    task.text = newText.trim();
                    renderTasks();
                }
            }
        }

        function setFilter(filter) {
            currentFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
            renderTasks();
        }

        function handleSearch() {
            searchQuery = document.getElementById('searchInput').value.trim();
            renderTasks();
        }

        function updateDateTime() {
            const now = new Date();
            const dateOptions = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            const timeOptions = { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true
            };

            document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', dateOptions);
            document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-US', timeOptions);
        }

        function formatDate(dateString) {
            if (!dateString) return null;
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = date.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffTime < 0) {
                const overdueDays = Math.abs(diffDays);
                return {
                    text: `Overdue by ${overdueDays} day${overdueDays > 1 ? 's' : ''}`,
                    class: 'overdue-indicator',
                    isOverdue: true
                };
            } else if (diffDays === 0) {
                return {
                    text: `Due today at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
                    class: 'due-today-indicator',
                    isDueToday: true
                };
            } else if (diffDays === 1) {
                return {
                    text: `Due tomorrow at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
                    class: 'due-soon-indicator',
                    isDueSoon: true
                };
            } else if (diffDays <= 7) {
                return {
                    text: `Due ${date.toLocaleDateString('en-US', { weekday: 'long' })} at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
                    class: 'due-week-indicator',
                    isDueThisWeek: true
                };
            } else {
                return {
                    text: `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
                    class: '',
                    isDueLater: true
                };
            }
        }

        function getTaskStatusClass(task) {
            if (!task.dueDate) return '';
            
            const now = new Date();
            const dueDate = new Date(task.dueDate);
            const diffTime = dueDate.getTime() - now.getTime();

            if (diffTime < 0) {
                return 'overdue';
            }
            return '';
        }

        function filterTasks() {
            let filteredTasks = [...tasks];

            // Apply search filter
            if (searchQuery) {
                filteredTasks = filteredTasks.filter(task =>
                    task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    task.category.toLowerCase().includes(searchQuery.toLowerCase())
                );
            }

            // Apply category filter
            switch (currentFilter) {
                case 'pending':
                    filteredTasks = filteredTasks.filter(task => !task.completed);
                    break;
                case 'completed':
                    filteredTasks = filteredTasks.filter(task => task.completed);
                    break;
                case 'overdue':
                    filteredTasks = filteredTasks.filter(task => {
                        if (!task.dueDate || task.completed) return false;
                        return new Date(task.dueDate) < new Date();
                    });
                    break;
                case 'high':
                    filteredTasks = filteredTasks.filter(task => task.priority === 'high');
                    break;
                case 'all':
                default:
                    break;
            }

            return filteredTasks;
        }

        function renderTasks() {
            const taskList = document.getElementById('taskList');
            const filteredTasks = filterTasks();

            if (filteredTasks.length === 0) {
                taskList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list"></i>
                        <h3>No tasks found</h3>
                        <p>Add a new task to get started!</p>
                    </div>
                `;
                return;
            }

            taskList.innerHTML = filteredTasks.map(task => {
                const dateInfo = formatDate(task.dueDate);
                const statusClass = getTaskStatusClass(task);
                
                return `
                    <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority ${statusClass}">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                               onchange="toggleTask(${task.id})">
                        <div class="task-content">
                            <div class="task-text">${task.text}</div>
                            <div class="task-metadata">
                                <span class="priority-badge priority-${task.priority}">
                                    ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} 
                                    ${task.priority}
                                </span>
                                <span class="category-badge">${getCategoryIcon(task.category)} ${task.category}</span>
                                ${dateInfo ? `<span class="due-indicator ${dateInfo.class}">${dateInfo.text}</span>` : ''}
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="action-btn edit-btn" onclick="editTask(${task.id})" title="Edit task">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete-btn" onclick="deleteTask(${task.id})" title="Delete task">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function getCategoryIcon(category) {
            const icons = {
                personal: '📱',
                work: '💼',
                health: '💚',
                learning: '📚',
                shopping: '🛒',
                other: '📝'
            };
            return icons[category] || '📝';
        }

        function updateStats() {
            const total = tasks.length;
            const completed = tasks.filter(t => t.completed).length;
            const pending = total - completed;
            const highPriority = tasks.filter(t => t.priority === 'high' && !t.completed).length;
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            const dueToday = tasks.filter(t => {
                if (!t.dueDate || t.completed) return false;
                const dueDate = new Date(t.dueDate);
                return dueDate >= today && dueDate < tomorrow;
            }).length;
            
            const overdue = tasks.filter(t => {
                if (!t.dueDate || t.completed) return false;
                return new Date(t.dueDate) < today;
            }).length;
            
            const endOfWeek = new Date(today);
            endOfWeek.setDate(today.getDate() + (7 - today.getDay()));
            const thisWeek = tasks.filter(t => {
                if (!t.dueDate || t.completed) return false;
                const dueDate = new Date(t.dueDate);
                return dueDate >= today && dueDate <= endOfWeek;
            }).length;

            // Update progress
            const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
            document.getElementById('progressFill').style.width = progressPercent + '%';
            document.getElementById('progressText').textContent = `${progressPercent}% Complete (${completed}/${total})`;

            // Update stats
            document.getElementById('totalTasks').textContent = total;
            document.getElementById('completedTasks').textContent = completed;
            document.getElementById('pendingCount').textContent = pending;
            document.getElementById('highPriorityCount').textContent = highPriority;
            document.getElementById('dueTodayCount').textContent = dueToday;
            document.getElementById('overdueCount').textContent = overdue;
            document.getElementById('thisWeekCount').textContent = thisWeek;
        }

        // Event listeners
        document.addEventListener('DOMContentLoaded', function() {
            initializeTasks();
            renderTasks();
            updateStats();
            updateDateTime();
            setInterval(updateDateTime, 1000);

            // Add Enter key support for task input
            document.getElementById('taskInput').addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addTask();
                }
            });
        });
    </script>

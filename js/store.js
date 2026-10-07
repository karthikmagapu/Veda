/* ==========================================
   STUDYMATE - Data Store & Auth Manager
   ========================================== */

const USERS_KEY = 'studymate_users_data_v2';
const CURRENT_USER_KEY = 'studymate_current_user_id';

// Default Sample Student Account
const DEFAULT_USER = {
  id: 'user-karthik',
  name: 'Karthik',
  email: 'karthik@student.edu',
  password: 'password123',
  dailyGoalHours: 4,
  theme: 'light',
  avatar: 'K'
};

const GUEST_USER = {
  id: 'guest',
  name: 'Guest Student',
  email: 'Not Signed In',
  password: '',
  dailyGoalHours: 4,
  theme: 'light',
  avatar: '?'
};

const INITIAL_USER_DATA = {
  subjects: [
    { id: 'subj-1', name: 'Java', code: 'CS101', color: '#4F46E5', icon: 'fa-code' },
    { id: 'subj-2', name: 'DSA', code: 'CS201', color: '#06B6D4', icon: 'fa-sitemap' },
    { id: 'subj-3', name: 'DBMS', code: 'CS202', color: '#F59E0B', icon: 'fa-database' },
    { id: 'subj-4', name: 'Operating Systems', code: 'CS301', color: '#8B5CF6', icon: 'fa-microchip' },
    { id: 'subj-5', name: 'Web Development', code: 'CS302', color: '#10B981', icon: 'fa-laptop-code' }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Complete Java Arrays',
      subjectId: 'subj-1',
      date: getTodayDateString(),
      startTime: '09:00',
      priority: 'Medium',
      durationMinutes: 45,
      description: 'Review multi-dimensional array declaration and memory layout.',
      completed: true,
      completedAt: new Date().toISOString(),
      timeSpentMinutes: 45
    },
    {
      id: 'task-2',
      title: 'Solve 3 DSA Problems',
      subjectId: 'subj-2',
      date: getTodayDateString(),
      startTime: '18:00',
      priority: 'High',
      durationMinutes: 60,
      description: 'Practice Two-Pointer and Sliding Window LeetCode medium questions.',
      completed: false,
      completedAt: null,
      timeSpentMinutes: 30
    },
    {
      id: 'task-3',
      title: 'Revise DBMS Normalization',
      subjectId: 'subj-3',
      date: getTodayDateString(),
      startTime: '19:00',
      priority: 'High',
      durationMinutes: 45,
      description: 'Study 1NF, 2NF, 3NF and BCNF concepts with examples.',
      completed: true,
      completedAt: new Date().toISOString(),
      timeSpentMinutes: 45
    },
    {
      id: 'task-4',
      title: 'Complete Web Dev Assignment',
      subjectId: 'subj-5',
      date: getTodayDateString(),
      startTime: '20:30',
      priority: 'Medium',
      durationMinutes: 60,
      description: 'Build responsive grid components for StudyMate UI.',
      completed: false,
      completedAt: null,
      timeSpentMinutes: 0
    }
  ],
  timetable: [
    { id: 'tt-1', day: 'Monday', subjectId: 'subj-1', startTime: '06:00', endTime: '07:00', room: 'Lecture Hall A' },
    { id: 'tt-2', day: 'Monday', subjectId: 'subj-2', startTime: '17:00', endTime: '18:00', room: 'Lab 2' },
    { id: 'tt-3', day: 'Monday', subjectId: 'subj-3', startTime: '19:00', endTime: '20:00', room: 'Self Study' },
    { id: 'tt-4', day: 'Tuesday', subjectId: 'subj-4', startTime: '09:00', endTime: '10:30', room: 'Room 304' },
    { id: 'tt-5', day: 'Wednesday', subjectId: 'subj-2', startTime: '14:00', endTime: '16:00', room: 'Lab 1' },
    { id: 'tt-6', day: 'Thursday', subjectId: 'subj-5', startTime: '10:00', endTime: '11:30', room: 'Web Lab' },
    { id: 'tt-7', day: 'Friday', subjectId: 'subj-1', startTime: '06:00', endTime: '07:00', room: 'Lecture Hall A' },
    { id: 'tt-8', day: 'Friday', subjectId: 'subj-2', startTime: '17:00', endTime: '18:00', room: 'Lab 2' },
    { id: 'tt-9', day: 'Friday', subjectId: 'subj-3', startTime: '19:00', endTime: '20:00', room: 'Self Study' }
  ],
  exams: [
    {
      id: 'exam-1',
      title: 'DSA Mid-Semester Exam',
      subjectId: 'subj-2',
      date: getFutureDateString(12),
      time: '10:00 AM'
    },
    {
      id: 'exam-2',
      title: 'DBMS Final Quiz',
      subjectId: 'subj-3',
      date: getFutureDateString(18),
      time: '02:00 PM'
    }
  ],
  notes: [
    {
      id: 'note-1',
      title: 'Important Array Concepts',
      subjectId: 'subj-2',
      content: 'Array indexing starts from 0.\nTime Complexity:\n- Access: O(1)\n- Search: O(n)\n- Insertion: O(n)\n- Deletion: O(n)\nRemember: Arrays are contiguous blocks in memory.',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'note-2',
      title: 'SQL Join Types Cheat Sheet',
      subjectId: 'subj-3',
      content: 'INNER JOIN: returns matching records in both tables.\nLEFT JOIN: returns all records from left table, matched from right.\nRIGHT JOIN: returns all records from right table, matched from left.\nFULL JOIN: returns all records when there is a match in either.',
      updatedAt: new Date().toISOString()
    }
  ],
  studyLogs: [
    { id: 'log-1', taskId: 'task-1', subjectId: 'subj-1', durationMinutes: 45, date: getTodayDateString(), timestamp: new Date().toISOString() },
    { id: 'log-2', taskId: 'task-3', subjectId: 'subj-3', durationMinutes: 45, date: getTodayDateString(), timestamp: new Date().toISOString() },
    { id: 'log-3', taskId: 'task-2', subjectId: 'subj-2', durationMinutes: 75, date: getTodayDateString(), timestamp: new Date().toISOString() }
  ],
  aiChats: [
    {
      id: 'ai-welcome',
      sender: 'ai',
      text: 'Hello! 👋 I am your **StudyMate AI Assistant**. How can I help you clear your doubts today?\n\nYou can ask me to:\n- Explain complex topics in **DSA, Java, DBMS, or OS**\n- Generate practice quiz questions\n- Debug your code snippets\n- Help prepare a study schedule for your upcoming exams!',
      subjectId: 'subj-2',
      timestamp: new Date().toISOString()
    }
  ],
  streak: {
    count: 5,
    lastActiveDate: getTodayDateString(),
    history: generateInitialStreakHistory()
  },
  notifications: [
    { id: 'notif-1', title: 'Upcoming Exam', message: 'DSA Mid-Semester Exam is in 12 days!', time: '10 mins ago', read: false },
    { id: 'notif-2', title: 'Daily Goal Update', message: 'You have completed 2h 45m of study today!', time: '1 hour ago', read: true }
  ]
};

function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getFutureDateString(daysAhead) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0];
}

function generateInitialStreakHistory() {
  const history = {};
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    history[dateStr] = i < 5;
  }
  return history;
}

class Store {
  constructor() {
    this.users = this.loadUsers();
    this.currentUserId = localStorage.getItem(CURRENT_USER_KEY) || DEFAULT_USER.id;
    
    // Ensure default user exists
    if (!this.users[DEFAULT_USER.id]) {
      this.users[DEFAULT_USER.id] = {
        profile: DEFAULT_USER,
        data: JSON.parse(JSON.stringify(INITIAL_USER_DATA))
      };
      this.saveUsers();
    }

    this.listeners = [];
  }

  loadUsers() {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Error loading users', e);
    }
    return {};
  }

  saveUsers() {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
      this.notifyListeners();
    } catch (e) {
      console.error('Error saving users', e);
    }
  }

  isLoggedIn() {
    return !!(this.currentUserId && this.currentUserId !== 'guest' && this.users[this.currentUserId]);
  }

  getCurrentUser() {
    if (this.currentUserId && this.users[this.currentUserId]) {
      return this.users[this.currentUserId].profile;
    }
    return GUEST_USER;
  }

  get data() {
    if (this.currentUserId && this.users[this.currentUserId]) {
      return this.users[this.currentUserId].data;
    }
    if (this.users[DEFAULT_USER.id]) {
      return this.users[DEFAULT_USER.id].data;
    }
    return JSON.parse(JSON.stringify(INITIAL_USER_DATA));
  }

  registerUser(name, email, password, dailyGoalHours = 4) {
    const existingId = Object.keys(this.users).find(
      id => this.users[id].profile.email.toLowerCase() === email.toLowerCase()
    );
    if (existingId) {
      throw new Error('An account with this email already exists!');
    }

    const userId = 'user-' + Date.now();
    const newUser = {
      id: userId,
      name,
      email,
      password,
      dailyGoalHours: parseFloat(dailyGoalHours) || 4,
      theme: 'light',
      avatar: name.charAt(0).toUpperCase()
    };

    this.users[userId] = {
      profile: newUser,
      data: JSON.parse(JSON.stringify(INITIAL_USER_DATA))
    };

    this.currentUserId = userId;
    localStorage.setItem(CURRENT_USER_KEY, userId);
    this.saveUsers();
    return newUser;
  }

  loginUser(email, password) {
    const userId = Object.keys(this.users).find(
      id => this.users[id].profile.email.toLowerCase() === email.toLowerCase() &&
            this.users[id].profile.password === password
    );

    if (!userId) {
      throw new Error('Invalid email or password. Please try again!');
    }

    this.currentUserId = userId;
    localStorage.setItem(CURRENT_USER_KEY, userId);
    this.saveUsers();
    return this.users[userId].profile;
  }

  logoutUser() {
    this.currentUserId = 'guest';
    localStorage.removeItem(CURRENT_USER_KEY);
    this.saveUsers();
  }

  saveData() {
    this.saveUsers();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notifyListeners() {
    this.listeners.forEach(fn => fn(this.data));
  }

  // --- STREAK LOGIC ---
  recordActivity() {
    const today = getTodayDateString();
    if (!this.data.streak.history[today]) {
      this.data.streak.history[today] = true;
      if (this.data.streak.lastActiveDate !== today) {
        this.data.streak.count += 1;
        this.data.streak.lastActiveDate = today;
      }
      this.saveData();
    }
  }

  // --- TASKS CRUD ---
  getTasks() {
    return this.data.tasks || [];
  }

  getTodayTasks() {
    const today = getTodayDateString();
    return this.getTasks().filter(t => t.date === today);
  }

  addTask(taskData) {
    const newTask = {
      id: 'task-' + Date.now(),
      title: taskData.title,
      subjectId: taskData.subjectId,
      date: taskData.date || getTodayDateString(),
      startTime: taskData.startTime || '18:00',
      priority: taskData.priority || 'Medium',
      durationMinutes: parseInt(taskData.durationMinutes) || 30,
      description: taskData.description || '',
      completed: false,
      completedAt: null,
      timeSpentMinutes: 0
    };
    this.data.tasks.unshift(newTask);
    this.saveData();
    return newTask;
  }

  updateTask(id, updates) {
    const index = this.data.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.tasks[index] = { ...this.data.tasks[index], ...updates };
      this.saveData();
    }
  }

  toggleTaskCompletion(id) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      if (task.completed) {
        this.recordActivity();
      }
      this.saveData();
      return task;
    }
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.saveData();
  }

  // --- SUBJECTS CRUD ---
  getSubjects() {
    return this.data.subjects || [];
  }

  getSubjectById(id) {
    return this.getSubjects().find(s => s.id === id) || { name: 'General', color: '#6366F1', icon: 'fa-book' };
  }

  addSubject(subjData) {
    const newSubj = {
      id: 'subj-' + Date.now(),
      name: subjData.name,
      code: subjData.code || 'GEN',
      color: subjData.color || '#4F46E5',
      icon: subjData.icon || 'fa-book'
    };
    this.data.subjects.push(newSubj);
    this.saveData();
    return newSubj;
  }

  updateSubject(id, updates) {
    const index = this.data.subjects.findIndex(s => s.id === id);
    if (index !== -1) {
      this.data.subjects[index] = { ...this.data.subjects[index], ...updates };
      this.saveData();
    }
  }

  deleteSubject(id) {
    this.data.subjects = this.data.subjects.filter(s => s.id !== id);
    this.saveData();
  }

  // --- TIMETABLE CRUD ---
  getTimetable() {
    return this.data.timetable || [];
  }

  addSchedule(item) {
    const newItem = {
      id: 'tt-' + Date.now(),
      day: item.day,
      subjectId: item.subjectId,
      startTime: item.startTime,
      endTime: item.endTime,
      room: item.room || 'Self Study'
    };
    this.data.timetable.push(newItem);
    this.saveData();
    return newItem;
  }

  updateSchedule(id, updates) {
    const index = this.data.timetable.findIndex(t => t.id === id);
    if (index !== -1) {
      this.data.timetable[index] = { ...this.data.timetable[index], ...updates };
      this.saveData();
    }
  }

  deleteSchedule(id) {
    this.data.timetable = this.data.timetable.filter(t => t.id !== id);
    this.saveData();
  }

  // --- EXAMS CRUD ---
  getExams() {
    return this.data.exams || [];
  }

  addExam(examData) {
    const newExam = {
      id: 'exam-' + Date.now(),
      title: examData.title,
      subjectId: examData.subjectId,
      date: examData.date,
      time: examData.time || '10:00 AM'
    };
    this.data.exams.push(newExam);
    this.saveData();
    return newExam;
  }

  deleteExam(id) {
    this.data.exams = this.data.exams.filter(e => e.id !== id);
    this.saveData();
  }

  // --- NOTES CRUD ---
  getNotes() {
    return this.data.notes || [];
  }

  addNote(noteData) {
    const newNote = {
      id: 'note-' + Date.now(),
      title: noteData.title,
      subjectId: noteData.subjectId,
      content: noteData.content,
      updatedAt: new Date().toISOString()
    };
    this.data.notes.unshift(newNote);
    this.saveData();
    return newNote;
  }

  updateNote(id, updates) {
    const index = this.data.notes.findIndex(n => n.id === id);
    if (index !== -1) {
      this.data.notes[index] = {
        ...this.data.notes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveData();
    }
  }

  deleteNote(id) {
    this.data.notes = this.data.notes.filter(n => n.id !== id);
    this.saveData();
  }

  // --- AI CHAT LOGIC ---
  getAiChats() {
    return this.data.aiChats || [];
  }

  addAiMessage(sender, text, subjectId = null) {
    const msg = {
      id: 'msg-' + Date.now(),
      sender,
      text,
      subjectId,
      timestamp: new Date().toISOString()
    };
    if (!this.data.aiChats) this.data.aiChats = [];
    this.data.aiChats.push(msg);
    this.saveData();
    return msg;
  }

  clearAiChats() {
    this.data.aiChats = [
      {
        id: 'ai-welcome',
        sender: 'ai',
        text: 'Chat history cleared. What study doubt can I solve for you now?',
        subjectId: null,
        timestamp: new Date().toISOString()
      }
    ];
    this.saveData();
  }

  // --- STUDY LOGS & STATISTICS ---
  logStudySession(durationMinutes, taskId = null, subjectId = null) {
    const today = getTodayDateString();
    const newLog = {
      id: 'log-' + Date.now(),
      taskId,
      subjectId,
      durationMinutes,
      date: today,
      timestamp: new Date().toISOString()
    };
    this.data.studyLogs.unshift(newLog);

    if (taskId) {
      const task = this.data.tasks.find(t => t.id === taskId);
      if (task) {
        task.timeSpentMinutes = (task.timeSpentMinutes || 0) + durationMinutes;
      }
    }

    this.recordActivity();
    this.saveData();
    return newLog;
  }

  getTodayStudyTimeMinutes() {
    const today = getTodayDateString();
    const todayLogs = (this.data.studyLogs || []).filter(l => l.date === today);
    return todayLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
  }

  getWeeklyStudyStats() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    const currentDayIdx = (today.getDay() + 6) % 7;
    
    const stats = days.map((dayName, idx) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (currentDayIdx - idx));
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = (this.data.studyLogs || []).filter(l => l.date === dateStr);
      const totalMins = dayLogs.reduce((sum, log) => sum + log.durationMinutes, 0);
      return {
        day: dayName,
        date: dateStr,
        hours: (totalMins / 60).toFixed(1),
        minutes: totalMins
      };
    });

    return stats;
  }

  resetToSampleData() {
    if (this.currentUserId && this.users[this.currentUserId]) {
      this.users[this.currentUserId].data = JSON.parse(JSON.stringify(INITIAL_USER_DATA));
      this.saveData();
    }
  }

  clearAllData() {
    localStorage.removeItem(USERS_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
    this.users = {};
    this.currentUserId = DEFAULT_USER.id;
    this.users[DEFAULT_USER.id] = {
      profile: DEFAULT_USER,
      data: JSON.parse(JSON.stringify(INITIAL_USER_DATA))
    };
    this.saveData();
  }
}

window.store = new Store();

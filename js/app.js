/* ==========================================
   STUDYMATE - Main App Controller & View Logic
   ========================================== */

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.timetableDay = 'Monday';
    this.taskFilter = 'all';
    this.weeklyChart = null;
    this.subjectChart = null;
    
    // Feature Tour State
    this.tourStep = 0;
    this.tourSlides = [
      {
        icon: 'fa-house',
        title: 'Welcome to StudyMate! 🎓',
        subtitle: 'Dashboard & Progress Overview',
        text: 'Your all-in-one student productivity workspace. View your daily progress percentage, total study hours, 🔥 current study streak, and daily study goal status at a single glance!'
      },
      {
        icon: 'fa-circle-check',
        title: 'Organize Study Tasks ✅',
        subtitle: 'Task Management & Fast Entry',
        text: 'Create study tasks with subject tags, priority levels (Low, Medium, High), scheduled start time, and estimated duration. Checking off tasks updates your progress and builds your daily study streak!'
      },
      {
        icon: 'fa-stopwatch',
        title: 'Connected Study Timer ⏱️',
        subtitle: 'Pomodoro, Custom Timer & Stopwatch',
        text: 'Immerse in distraction-free study sessions! Click "▶ Start Study" on any task to auto-load it into the timer. When sessions finish, your study hours and streak are automatically updated!'
      },
      {
        icon: 'fa-robot',
        title: 'Friendly AI Doubt Solver 🤖',
        subtitle: 'ChatGPT-Powered AI Tutor',
        text: 'Clear any academic doubt instantly! Ask the AI Tutor to explain complex DSA, Java, DBMS, or OS concepts in simple terms, generate practice quizzes, or build exam study plans. Save AI explanations directly into your Study Notes with 1 click!'
      },
      {
        icon: 'fa-calendar-days',
        title: 'Weekly Timetable 📅',
        subtitle: 'Class & Self-Study Schedule',
        text: 'Plan your weekly lectures, lab sessions, and self-study slots day-by-day (Monday to Sunday) so your study routine stays organized.'
      },
      {
        icon: 'fa-chart-line',
        title: 'Progress Analytics & Streak 📊',
        subtitle: 'Visual Charts & Consistency Heatmap',
        text: 'Track your weekly study hours with responsive bar charts, view subject-wise study time breakdown, and maintain your 🔥 daily study streak!'
      },
      {
        icon: 'fa-book-bookmark',
        title: 'Subjects, Notes & Exam Countdown 📚',
        subtitle: 'Everything You Need To Excel',
        text: 'Manage your subjects, organize searchable notes, and track upcoming midterms & quizzes with automated countdown badges ("12 Days Remaining")!'
      }
    ];
  }

  init() {
    this.initTheme();
    this.bindNavigation();
    this.bindModals();
    this.bindAuth();
    this.bindTour();
    this.bindForms();
    this.bindGlobalSearch();
    this.bindProfileActions();
    
    window.store.subscribe(() => this.renderAll());

    if (window.studyTimer) window.studyTimer.init();
    if (window.aiAssistant) window.aiAssistant.init();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayStr = days[new Date().getDay()];
    this.timetableDay = todayStr === 'Sunday' ? 'Monday' : todayStr;

    this.renderAll();
    this.checkNotifications();

    // Check if first-time user for Tour
    if (!localStorage.getItem('studymate_tour_seen')) {
      setTimeout(() => this.startTour(), 600);
    }
  }

  // --- FEATURE ONBOARDING TOUR ENGINE ---
  bindTour() {
    const tourPrevBtn = document.getElementById('tour-prev-btn');
    const tourNextBtn = document.getElementById('tour-next-btn');
    const startTourBtn = document.getElementById('start-tour-btn');

    if (startTourBtn) {
      startTourBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) dropdown.classList.remove('show');
        this.startTour();
      });
    }

    if (tourPrevBtn) {
      tourPrevBtn.addEventListener('click', () => {
        if (this.tourStep > 0) {
          this.tourStep -= 1;
          this.renderTourStep();
        }
      });
    }

    if (tourNextBtn) {
      tourNextBtn.addEventListener('click', () => {
        if (this.tourStep < this.tourSlides.length - 1) {
          this.tourStep += 1;
          this.renderTourStep();
        } else {
          // Finish tour
          localStorage.setItem('studymate_tour_seen', 'true');
          this.closeModal('modal-tour');
          this.showMotivationalToast('Tour complete! Ready to boost your productivity? 🚀');
        }
      });
    }
  }

  startTour() {
    this.tourStep = 0;
    this.renderTourStep();
    this.openModal('modal-tour');
  }

  renderTourStep() {
    const slide = this.tourSlides[this.tourStep];
    const container = document.getElementById('tour-slide-container');
    const counterEl = document.getElementById('tour-step-counter');
    const prevBtn = document.getElementById('tour-prev-btn');
    const nextBtn = document.getElementById('tour-next-btn');
    const dotsContainer = document.getElementById('tour-dots-indicator');

    if (counterEl) counterEl.textContent = `Feature ${this.tourStep + 1} of ${this.tourSlides.length}`;

    if (prevBtn) prevBtn.style.visibility = this.tourStep === 0 ? 'hidden' : 'visible';
    if (nextBtn) {
      if (this.tourStep === this.tourSlides.length - 1) {
        nextBtn.innerHTML = 'Get Started <i class="fa-solid fa-check"></i>';
        nextBtn.className = 'btn btn-success btn-sm';
      } else {
        nextBtn.innerHTML = 'Next Feature <i class="fa-solid fa-arrow-right"></i>';
        nextBtn.className = 'btn btn-primary btn-sm';
      }
    }

    if (dotsContainer) {
      dotsContainer.innerHTML = this.tourSlides.map((_, idx) => `
        <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${idx === this.tourStep ? 'var(--accent-primary)' : 'var(--text-muted)'}; display: inline-block; transition: all 0.2s ease;"></span>
      `).join('');
    }

    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 0.5rem 0;">
          <div style="width: 64px; height: 64px; border-radius: var(--radius-lg); background: linear-gradient(135deg, var(--accent-primary), var(--accent-purple)); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1.25rem; box-shadow: 0 6px 16px rgba(79, 70, 229, 0.3);">
            <i class="fa-solid ${slide.icon}"></i>
          </div>
          <h2 style="font-size: 1.4rem; margin-bottom: 0.35rem;">${slide.title}</h2>
          <div style="font-size: 0.85rem; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; margin-bottom: 1rem; letter-spacing: 0.05em;">${slide.subtitle}</div>
          <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; max-width: 480px; margin: 0 auto;">${slide.text}</p>
        </div>
      `;
    }
  }

  // --- THEME MANAGEMENT ---
  initTheme() {
    const user = window.store.getCurrentUser();
    const savedTheme = user.theme || 'light';
    this.setTheme(savedTheme);

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
      });
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const user = window.store.getCurrentUser();
    user.theme = theme;
    window.store.saveData();

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
      }
    }
  }

  // --- USER AUTHENTICATION & LOGIN ---
  bindAuth() {
    const openAuthBtn = document.getElementById('open-auth-btn');
    const tabLoginBtn = document.getElementById('tab-login-btn');
    const tabRegBtn = document.getElementById('tab-register-btn');
    const formLogin = document.getElementById('form-login');
    const formReg = document.getElementById('form-register');
    const demoLoginBtn = document.getElementById('demo-login-trigger');
    const logoutBtn = document.getElementById('logout-btn');

    if (openAuthBtn) {
      openAuthBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) dropdown.classList.remove('show');
        this.openModal('modal-auth');
      });
    }

    if (tabLoginBtn && tabRegBtn) {
      tabLoginBtn.addEventListener('click', () => {
        tabLoginBtn.classList.add('active');
        tabRegBtn.classList.remove('active');
        formLogin.style.display = 'block';
        formReg.style.display = 'none';
        document.getElementById('auth-modal-title').textContent = 'Student Login';
      });

      tabRegBtn.addEventListener('click', () => {
        tabRegBtn.classList.add('active');
        tabLoginBtn.classList.remove('active');
        formReg.style.display = 'block';
        formLogin.style.display = 'none';
        document.getElementById('auth-modal-title').textContent = 'Create Student Account';
      });
    }

    if (demoLoginBtn) {
      demoLoginBtn.addEventListener('click', () => {
        try {
          const user = window.store.loginUser('karthik@student.edu', 'password123');
          this.closeModal('modal-auth');
          this.showMotivationalToast(`Welcome back, ${user.name}! 👋`);
        } catch (err) {
          alert(err.message);
        }
      });
    }

    if (formLogin) {
      formLogin.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email-input').value.trim();
        const pass = document.getElementById('login-pass-input').value.trim();

        try {
          const user = window.store.loginUser(email, pass);
          this.closeModal('modal-auth');
          this.showMotivationalToast(`Signed in successfully as ${user.name}! 🚀`);
        } catch (err) {
          alert(err.message);
        }
      });
    }

    if (formReg) {
      formReg.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name-input').value.trim();
        const email = document.getElementById('reg-email-input').value.trim();
        const pass = document.getElementById('reg-pass-input').value.trim();
        const goal = document.getElementById('reg-goal-input').value;

        try {
          const user = window.store.registerUser(name, email, pass, goal);
          this.closeModal('modal-auth');
          this.showMotivationalToast(`Welcome to StudyMate, ${user.name}! 🎉`);
          setTimeout(() => this.startTour(), 500);
        } catch (err) {
          alert(err.message);
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dropdown = document.getElementById('profile-dropdown');
        if (dropdown) dropdown.classList.remove('show');

        window.store.logoutUser();
        this.showMotivationalToast('Signed out successfully! 👋');
        this.openModal('modal-auth');
      });
    }
  }

  // --- NAVIGATION ---
  bindNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const page = e.currentTarget.getAttribute('data-page');
        this.navigateTo(page);
        document.getElementById('sidebar').classList.remove('mobile-open');
      });
    });

    const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn');
    mobileNavBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.currentTarget.getAttribute('data-page');
        this.navigateTo(page);
      });
    });

    const hdrAiBtn = document.getElementById('hdr-ai-btn');
    if (hdrAiBtn) hdrAiBtn.addEventListener('click', () => this.navigateTo('ai'));

    const mobileToggle = document.getElementById('mobile-nav-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('mobile-open');
      });
    }

    const dashViewAll = document.getElementById('dash-view-all-tasks');
    if (dashViewAll) dashViewAll.addEventListener('click', () => this.navigateTo('tasks'));

    const dashTimerBtn = document.getElementById('dash-open-timer-btn');
    if (dashTimerBtn) dashTimerBtn.addEventListener('click', () => this.navigateTo('timer'));
  }

  navigateTo(pageId) {
    this.currentView = pageId;

    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${pageId}`);
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-page') === pageId);
    });

    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-page') === pageId);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.renderAll();
  }

  // --- RENDER ALL VIEWS ---
  renderAll() {
    this.renderUserProfile();
    this.updateSubjectDropdowns();
    this.renderDashboard();
    this.renderTasks();
    this.renderTimetable();
    this.renderSubjects();
    this.renderProgress();
    this.renderNotes();
    this.renderExams();
    this.renderAi();
    this.renderNotificationsList();
  }

  renderUserProfile() {
    const user = window.store.getCurrentUser();
    const profileNameEl = document.getElementById('profile-name');
    const profileCharEl = document.getElementById('profile-avatar-char');
    const userEmailBadge = document.getElementById('user-email-badge');

    if (profileNameEl) profileNameEl.textContent = user.name || 'Guest Student';
    if (profileCharEl) profileCharEl.textContent = (user.name || 'G').charAt(0).toUpperCase();
    if (userEmailBadge) userEmailBadge.textContent = user.email || 'Not Signed In';
  }

  updateSubjectDropdowns() {
    const subjects = window.store.getSubjects();
    const dropdownIds = [
      'quick-add-subject',
      'task-subject-input',
      'task-filter-subject',
      'sched-subject-input',
      'note-subject-input',
      'notes-filter-subject',
      'exam-subject-input',
      'ai-subject-select'
    ];

    dropdownIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;

      const currentValue = el.value;
      const isFilter = id.includes('filter') || id.includes('select');
      
      let html = isFilter ? '<option value="">All Subjects Context</option>' : '';
      subjects.forEach(s => {
        html += `<option value="${s.id}">${s.name}</option>`;
      });

      el.innerHTML = html;
      if (currentValue) el.value = currentValue;
    });
  }

  renderAi() {
    if (this.currentView === 'ai' && window.aiAssistant) {
      window.aiAssistant.renderChatMessages();
    }
  }

  // ==========================================
  // 1. DASHBOARD RENDER LOGIC
  // ==========================================
  renderDashboard() {
    const user = window.store.getCurrentUser();
    const data = window.store.data;
    const todayTasks = window.store.getTodayTasks();
    const completedTasks = todayTasks.filter(t => t.completed);

    const now = new Date();
    const dateOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', dateOptions);
    const bannerDateEl = document.getElementById('banner-date-str');
    if (bannerDateEl) bannerDateEl.textContent = dateStr;

    const hour = now.getHours();
    let timeGreeting = 'Good Morning';
    if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
    if (hour >= 17) timeGreeting = 'Good Evening';

    const greetingNameEl = document.getElementById('dash-greeting-name');
    if (greetingNameEl) greetingNameEl.textContent = `${user.name || 'Student'}`;

    const totalCount = todayTasks.length;
    const completedCount = completedTasks.length;
    const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    document.getElementById('dash-progress-pct').textContent = `${pct}%`;
    document.getElementById('dash-completed-count').textContent = completedCount;
    document.getElementById('dash-total-count').textContent = totalCount;
    document.getElementById('dash-progress-bar').style.width = `${pct}%`;

    const studyMins = window.store.getTodayStudyTimeMinutes();
    const studyHoursStr = this.formatMinutesToHours(studyMins);
    document.getElementById('dash-study-time').textContent = studyHoursStr;

    const goalHours = user.dailyGoalHours || 4;
    document.getElementById('dash-goal-target').textContent = `${goalHours}h 00m`;
    const goalPct = Math.min(100, Math.round((studyMins / (goalHours * 60)) * 100));
    document.getElementById('dash-goal-bar').style.width = `${goalPct}%`;

    const streakCount = data.streak ? data.streak.count : 0;
    document.getElementById('dash-streak-days').textContent = streakCount;
    document.getElementById('sidebar-streak-count').textContent = streakCount;
    document.getElementById('progress-streak-count').textContent = streakCount;

    const taskListEl = document.getElementById('dash-task-list');
    if (todayTasks.length === 0) {
      taskListEl.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-calendar-check"></i>
          <p>No tasks scheduled for today yet. Add one above!</p>
        </div>
      `;
    } else {
      taskListEl.innerHTML = todayTasks.map(task => this.createTaskItemHTML(task)).join('');
      this.bindTaskEvents(taskListEl);
    }

    const exams = window.store.getExams().slice(0, 2);
    const examsListEl = document.getElementById('dash-exams-list');
    if (exams.length === 0) {
      examsListEl.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">No upcoming exams.</p>';
    } else {
      examsListEl.innerHTML = exams.map(exam => {
        const subj = window.store.getSubjectById(exam.subjectId);
        const daysLeft = this.calculateDaysRemaining(exam.date);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.65rem 0; border-bottom: 1px solid var(--border-color);">
            <div>
              <div style="font-weight: 700; font-size: 0.9rem;">${exam.title}</div>
              <span class="subject-badge" style="font-size: 0.75rem;"><span class="subject-dot" style="background:${subj.color};"></span>${subj.name}</span>
            </div>
            <span class="badge badge-high">${daysLeft}</span>
          </div>
        `;
      }).join('');
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayName = days[now.getDay()];
    const todaySchedule = window.store.getTimetable().filter(s => s.day === currentDayName);

    const schedListEl = document.getElementById('dash-schedule-list');
    if (todaySchedule.length === 0) {
      schedListEl.innerHTML = '<p style="font-size: 0.85rem; color: var(--text-muted);">No schedule slots for today.</p>';
    } else {
      schedListEl.innerHTML = todaySchedule.map(s => {
        const subj = window.store.getSubjectById(s.subjectId);
        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0;">
            <div style="font-size: 0.85rem; font-weight: 600;">${s.startTime} - ${s.endTime}</div>
            <span class="subject-badge"><span class="subject-dot" style="background:${subj.color};"></span>${subj.name}</span>
          </div>
        `;
      }).join('');
    }
  }

  // ==========================================
  // 2. TASKS VIEW RENDER LOGIC
  // ==========================================
  renderTasks() {
    const taskListEl = document.getElementById('full-task-list');
    if (!taskListEl) return;

    let tasks = window.store.getTasks();

    if (this.taskFilter === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      tasks = tasks.filter(t => t.date === todayStr);
    } else if (this.taskFilter === 'pending') {
      tasks = tasks.filter(t => !t.completed);
    } else if (this.taskFilter === 'completed') {
      tasks = tasks.filter(t => t.completed);
    }

    const subjFilter = document.getElementById('task-filter-subject').value;
    if (subjFilter && subjFilter !== 'all') {
      tasks = tasks.filter(t => t.subjectId === subjFilter);
    }

    const prioFilter = document.getElementById('task-filter-priority').value;
    if (prioFilter && prioFilter !== 'all') {
      tasks = tasks.filter(t => t.priority === prioFilter);
    }

    if (tasks.length === 0) {
      taskListEl.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-list-check"></i>
          <p>No tasks match the selected filters.</p>
        </div>
      `;
    } else {
      taskListEl.innerHTML = tasks.map(t => this.createTaskItemHTML(t)).join('');
      this.bindTaskEvents(taskListEl);
    }
  }

  createTaskItemHTML(task) {
    const subj = window.store.getSubjectById(task.subjectId);
    const prioClass = `badge-${task.priority.toLowerCase()}`;

    return `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
        <div class="task-left">
          <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle">
            ${task.completed ? '<i class="fa-solid fa-check"></i>' : ''}
          </div>
          <div class="task-info">
            <div class="task-title">${this.escapeHTML(task.title)}</div>
            <div class="task-meta">
              <span class="subject-badge">
                <span class="subject-dot" style="background-color: ${subj.color};"></span>
                ${subj.name}
              </span>
              <span class="badge ${prioClass}">${task.priority}</span>
              <span><i class="fa-regular fa-clock"></i> ${task.startTime || '18:00'} (${task.durationMinutes}m)</span>
            </div>
          </div>
        </div>

        <div class="task-right">
          ${!task.completed ? `
            <button class="btn btn-primary btn-sm" data-action="start-study" title="Start Studying This Task">
              <i class="fa-solid fa-play"></i> Start Study
            </button>
          ` : ''}
          <button class="btn btn-secondary btn-icon btn-sm" data-action="edit" title="Edit Task">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-danger btn-icon btn-sm" data-action="delete" title="Delete Task">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>
    `;
  }

  bindTaskEvents(container) {
    container.querySelectorAll('.task-item').forEach(item => {
      const taskId = item.getAttribute('data-id');

      item.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const action = e.currentTarget.getAttribute('data-action');

          if (action === 'toggle') {
            const updated = window.store.toggleTaskCompletion(taskId);
            if (updated && updated.completed) {
              this.showMotivationalToast('Task completed! Great job! 🎉');
              if (window.confetti) {
                window.confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
              }
            }
          } else if (action === 'start-study') {
            const task = window.store.getTasks().find(t => t.id === taskId);
            if (task && window.studyTimer) {
              this.navigateTo('timer');
              window.studyTimer.startTaskSession(task);
              this.showMotivationalToast(`Timer launched for "${task.title}" ⏱️`);
            }
          } else if (action === 'edit') {
            this.openEditTaskModal(taskId);
          } else if (action === 'delete') {
            if (confirm('Are you sure you want to delete this task?')) {
              window.store.deleteTask(taskId);
              this.showMotivationalToast('Task deleted');
            }
          }
        });
      });
    });
  }

  // ==========================================
  // 3. TIMETABLE VIEW RENDER LOGIC
  // ==========================================
  renderTimetable() {
    const listEl = document.getElementById('timetable-schedule-list');
    if (!listEl) return;

    document.querySelectorAll('#timetable-days-tabs .day-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-day') === this.timetableDay);
    });

    const items = window.store.getTimetable().filter(i => i.day === this.timetableDay);

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-calendar-xmark"></i>
          <p>No study slots scheduled for ${this.timetableDay}.</p>
        </div>
      `;
    } else {
      items.sort((a, b) => a.startTime.localeCompare(b.startTime));

      listEl.innerHTML = items.map(item => {
        const subj = window.store.getSubjectById(item.subjectId);
        return `
          <div class="schedule-card" style="border-left-color: ${subj.color};">
            <div style="display: flex; align-items: center; gap: 1.5rem;">
              <div class="schedule-time">
                <i class="fa-regular fa-clock" style="color: var(--text-muted); margin-right: 0.35rem;"></i>
                ${item.startTime} - ${item.endTime}
              </div>
              <div>
                <span class="subject-badge" style="font-size: 0.9rem; padding: 0.35rem 0.75rem;">
                  <span class="subject-dot" style="background-color: ${subj.color};"></span>
                  ${subj.name}
                </span>
                <span style="font-size: 0.85rem; color: var(--text-secondary); margin-left: 0.75rem;">
                  <i class="fa-solid fa-location-dot"></i> ${item.room || 'Self Study'}
                </span>
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-secondary btn-icon btn-sm" onclick="app.openEditScheduleModal('${item.id}')" title="Edit">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button class="btn btn-danger btn-icon btn-sm" onclick="app.deleteScheduleItem('${item.id}')" title="Delete">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // ==========================================
  // 4. SUBJECTS VIEW RENDER LOGIC
  // ==========================================
  renderSubjects() {
    const gridEl = document.getElementById('subjects-grid');
    if (!gridEl) return;

    const subjects = window.store.getSubjects();
    const tasks = window.store.getTasks();

    gridEl.innerHTML = subjects.map(subj => {
      const subjTasks = tasks.filter(t => t.subjectId === subj.id);
      const completedTasks = subjTasks.filter(t => t.completed).length;
      const pct = subjTasks.length > 0 ? Math.round((completedTasks / subjTasks.length) * 100) : 0;

      const subjLogs = (window.store.data.studyLogs || []).filter(l => l.subjectId === subj.id);
      const totalMins = subjLogs.reduce((sum, l) => sum + l.durationMinutes, 0);

      return `
        <div class="card subject-card">
          <div>
            <div class="subject-card-top">
              <div class="subject-icon-box" style="background: linear-gradient(135deg, ${subj.color}, var(--accent-purple));">
                <i class="fa-solid ${subj.icon || 'fa-book'}"></i>
              </div>
              <div style="display: flex; gap: 0.35rem;">
                <button class="btn btn-secondary btn-icon btn-sm" onclick="app.openEditSubjectModal('${subj.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-icon btn-sm" onclick="app.deleteSubjectItem('${subj.id}')"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
            <h3 style="font-size: 1.15rem; margin-bottom: 0.2rem;">${this.escapeHTML(subj.name)}</h3>
            <span class="badge badge-low" style="background: var(--bg-tertiary); color: var(--text-secondary);">${subj.code || 'GEN'}</span>

            <div class="subject-stats-row">
              <span>Tasks: <strong>${completedTasks}/${subjTasks.length}</strong></span>
              <span>Logged: <strong>${this.formatMinutesToHours(totalMins)}</strong></span>
            </div>

            <div class="mini-progress-bg" style="margin-top: 0.75rem;">
              <div class="mini-progress-fill" style="width: ${pct}%; background: ${subj.color};"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ==========================================
  // 5. PROGRESS & ANALYTICS RENDER LOGIC
  // ==========================================
  renderProgress() {
    if (this.currentView !== 'progress') return;

    const heatmapGrid = document.getElementById('streak-heatmap-grid');
    if (heatmapGrid) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyStats = window.store.getWeeklyStudyStats();

      heatmapGrid.innerHTML = weeklyStats.map((stat, idx) => {
        const isActive = stat.minutes > 0;
        return `
          <div class="streak-day-box ${isActive ? 'active' : ''}">
            <span>${days[idx]}</span>
            <span>${isActive ? '🔥' : '⚪'}</span>
            <span style="font-size: 0.65rem; opacity: 0.8;">${stat.hours}h</span>
          </div>
        `;
      }).join('');
    }

    const barCtx = document.getElementById('weeklyStudyChart');
    if (barCtx && window.Chart) {
      const weeklyStats = window.store.getWeeklyStudyStats();
      const labels = weeklyStats.map(s => s.day);
      const dataHours = weeklyStats.map(s => parseFloat(s.hours));

      if (this.weeklyChart) this.weeklyChart.destroy();

      this.weeklyChart = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Study Hours',
            data: dataHours,
            backgroundColor: 'rgba(79, 70, 229, 0.85)',
            borderColor: '#4F46E5',
            borderRadius: 8,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Hours' } }
          }
        }
      });
    }

    const doughnutCtx = document.getElementById('subjectDistributionChart');
    if (doughnutCtx && window.Chart) {
      const subjects = window.store.getSubjects();
      const labels = subjects.map(s => s.name);
      const colors = subjects.map(s => s.color);
      const dataMins = subjects.map(subj => {
        const subjLogs = (window.store.data.studyLogs || []).filter(l => l.subjectId === subj.id);
        return subjLogs.reduce((sum, l) => sum + l.durationMinutes, 0) / 60;
      });

      if (this.subjectChart) this.subjectChart.destroy();

      this.subjectChart = new Chart(doughnutCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: dataMins,
            backgroundColor: colors,
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }
  }

  // ==========================================
  // 6. NOTES VIEW RENDER LOGIC
  // ==========================================
  renderNotes() {
    const gridEl = document.getElementById('notes-grid');
    if (!gridEl) return;

    let notes = window.store.getNotes();
    const searchVal = document.getElementById('notes-search-input').value.toLowerCase();
    const subjVal = document.getElementById('notes-filter-subject').value;

    if (searchVal) {
      notes = notes.filter(n => n.title.toLowerCase().includes(searchVal) || n.content.toLowerCase().includes(searchVal));
    }
    if (subjVal && subjVal !== 'all') {
      notes = notes.filter(n => n.subjectId === subjVal);
    }

    if (notes.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <i class="fa-solid fa-note-sticky"></i>
          <p>No notes found.</p>
        </div>
      `;
    } else {
      gridEl.innerHTML = notes.map(n => {
        const subj = window.store.getSubjectById(n.subjectId);
        return `
          <div class="card note-card">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                <h3 style="font-size: 1.05rem;">${this.escapeHTML(n.title)}</h3>
                <span class="subject-badge"><span class="subject-dot" style="background:${subj.color};"></span>${subj.name}</span>
              </div>
              <div class="note-body">${this.escapeHTML(n.content)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 0.75rem;">
              <span style="font-size: 0.75rem; color: var(--text-muted);">${new Date(n.updatedAt).toLocaleDateString()}</span>
              <div style="display: flex; gap: 0.35rem;">
                <button class="btn btn-secondary btn-icon btn-sm" onclick="app.openEditNoteModal('${n.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-icon btn-sm" onclick="app.deleteNoteItem('${n.id}')"><i class="fa-solid fa-trash"></i></button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // ==========================================
  // 7. EXAMS VIEW RENDER LOGIC
  // ==========================================
  renderExams() {
    const gridEl = document.getElementById('exams-grid');
    if (!gridEl) return;

    const exams = window.store.getExams();

    if (exams.length === 0) {
      gridEl.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <i class="fa-solid fa-bullseye"></i>
          <p>No exams added yet.</p>
        </div>
      `;
    } else {
      gridEl.innerHTML = exams.map(e => {
        const subj = window.store.getSubjectById(e.subjectId);
        const daysLeftStr = this.calculateDaysRemaining(e.date);

        return `
          <div class="card exam-card" style="border-top-color: ${subj.color};">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
              <div>
                <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;">${this.escapeHTML(e.title)}</h3>
                <span class="subject-badge"><span class="subject-dot" style="background:${subj.color};"></span>${subj.name}</span>
              </div>
              <button class="btn btn-danger btn-icon btn-sm" onclick="app.deleteExamItem('${e.id}')"><i class="fa-solid fa-trash"></i></button>
            </div>

            <div class="exam-countdown-tag">${daysLeftStr}</div>
            <div style="font-size: 0.85rem; color: var(--text-secondary);">
              <i class="fa-regular fa-calendar" style="margin-right: 0.35rem;"></i> ${e.date} at ${e.time || '10:00 AM'}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // --- NOTIFICATIONS SYSTEM ---
  renderNotificationsList() {
    const listEl = document.getElementById('notif-list-container');
    const notifs = window.store.data.notifications || [];
    const notifDot = document.getElementById('notif-dot');

    const unread = notifs.filter(n => !n.read);
    if (notifDot) notifDot.style.display = unread.length > 0 ? 'block' : 'none';

    if (!listEl) return;

    if (notifs.length === 0) {
      listEl.innerHTML = '<p style="padding: 1rem; font-size: 0.85rem; color: var(--text-muted); text-align: center;">No new notifications.</p>';
    } else {
      listEl.innerHTML = notifs.map(n => `
        <div class="dropdown-item" style="flex-direction: column; align-items: flex-start; gap: 0.2rem;">
          <div style="display: flex; justify-content: space-between; width: 100%; font-weight: 700; font-size: 0.85rem;">
            <span>${n.title}</span>
            <span style="font-size: 0.7rem; color: var(--text-muted);">${n.time}</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-secondary);">${n.message}</div>
        </div>
      `).join('');
    }
  }

  checkNotifications() {
    const exams = window.store.getExams();
    exams.forEach(e => {
      const days = parseInt(this.calculateDaysRemaining(e.date));
      if (!isNaN(days) && days <= 14) {
        // alert active
      }
    });
  }

  // ==========================================
  // MODALS & FORMS BINDING
  // ==========================================
  bindModals() {
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modalId = e.currentTarget.getAttribute('data-modal-close');
        this.closeModal(modalId);
      });
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
        }
      });
    });

    const taskAddBtn = document.getElementById('tasks-add-btn');
    const hdrAddBtn = document.getElementById('hdr-add-task-btn');
    if (taskAddBtn) taskAddBtn.addEventListener('click', () => this.openAddTaskModal());
    if (hdrAddBtn) hdrAddBtn.addEventListener('click', () => this.openAddTaskModal());

    const subjAddBtn = document.getElementById('subjects-add-btn');
    if (subjAddBtn) subjAddBtn.addEventListener('click', () => this.openAddSubjectModal());

    const ttAddBtn = document.getElementById('timetable-add-btn');
    if (ttAddBtn) ttAddBtn.addEventListener('click', () => this.openAddScheduleModal());

    const noteAddBtn = document.getElementById('notes-add-btn');
    if (noteAddBtn) noteAddBtn.addEventListener('click', () => this.openAddNoteModal());

    const examAddBtn = document.getElementById('exams-add-btn');
    if (examAddBtn) examAddBtn.addEventListener('click', () => this.openAddExamModal());

    document.querySelectorAll('#timetable-days-tabs .day-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.timetableDay = e.currentTarget.getAttribute('data-day');
        this.renderTimetable();
      });
    });

    document.querySelectorAll('.task-filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.task-filter-tab').forEach(t => t.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.taskFilter = e.currentTarget.getAttribute('data-filter');
        this.renderTasks();
      });
    });

    document.getElementById('task-filter-subject').addEventListener('change', () => this.renderTasks());
    document.getElementById('task-filter-priority').addEventListener('change', () => this.renderTasks());
    document.getElementById('notes-search-input').addEventListener('input', () => this.renderNotes());
    document.getElementById('notes-filter-subject').addEventListener('change', () => this.renderNotes());
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // --- FORMS SUBMISSION HANDLERS ---
  bindForms() {
    const quickAddForm = document.getElementById('quick-add-form');
    if (quickAddForm) {
      quickAddForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('quick-add-title').value.trim();
        const subjectId = document.getElementById('quick-add-subject').value;

        if (title) {
          window.store.addTask({
            title,
            subjectId,
            priority: 'Medium',
            durationMinutes: 30
          });
          document.getElementById('quick-add-title').value = '';
          this.showMotivationalToast('Task added successfully! 🚀');
        }
      });
    }

    const taskForm = document.getElementById('form-task');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = document.getElementById('task-id').value;
        const taskData = {
          title: document.getElementById('task-title-input').value.trim(),
          subjectId: document.getElementById('task-subject-input').value,
          durationMinutes: document.getElementById('task-duration-input').value,
          date: document.getElementById('task-date-input').value,
          startTime: document.getElementById('task-time-input').value,
          priority: document.querySelector('input[name="priority"]:checked').value,
          description: document.getElementById('task-desc-input').value.trim()
        };

        if (taskId) {
          window.store.updateTask(taskId, taskData);
          this.showMotivationalToast('Task updated');
        } else {
          window.store.addTask(taskData);
          this.showMotivationalToast('New task created! 🎉');
        }
        this.closeModal('modal-task');
      });
    }

    const subjForm = document.getElementById('form-subject');
    if (subjForm) {
      subjForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const subjId = document.getElementById('subj-id').value;
        const data = {
          name: document.getElementById('subj-name-input').value.trim(),
          code: document.getElementById('subj-code-input').value.trim(),
          color: document.getElementById('subj-color-input').value
        };

        if (subjId) {
          window.store.updateSubject(subjId, data);
          this.showMotivationalToast('Subject updated');
        } else {
          window.store.addSubject(data);
          this.showMotivationalToast('Subject added');
        }
        this.closeModal('modal-subject');
      });
    }

    const schedForm = document.getElementById('form-schedule');
    if (schedForm) {
      schedForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('sched-id').value;
        const data = {
          subjectId: document.getElementById('sched-subject-input').value,
          day: document.getElementById('sched-day-input').value,
          startTime: document.getElementById('sched-start-input').value,
          endTime: document.getElementById('sched-end-input').value,
          room: document.getElementById('sched-room-input').value.trim()
        };

        if (id) {
          window.store.updateSchedule(id, data);
        } else {
          window.store.addSchedule(data);
        }
        this.closeModal('modal-schedule');
        this.showMotivationalToast('Schedule saved');
      });
    }

    const noteForm = document.getElementById('form-note');
    if (noteForm) {
      noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = document.getElementById('note-id').value;
        const data = {
          title: document.getElementById('note-title-input').value.trim(),
          subjectId: document.getElementById('note-subject-input').value,
          content: document.getElementById('note-content-input').value.trim()
        };

        if (id) {
          window.store.updateNote(id, data);
        } else {
          window.store.addNote(data);
        }
        this.closeModal('modal-note');
        this.showMotivationalToast('Note saved');
      });
    }

    const examForm = document.getElementById('form-exam');
    if (examForm) {
      examForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          title: document.getElementById('exam-title-input').value.trim(),
          subjectId: document.getElementById('exam-subject-input').value,
          date: document.getElementById('exam-date-input').value,
          time: document.getElementById('exam-time-input').value.trim()
        };

        window.store.addExam(data);
        this.closeModal('modal-exam');
        this.showMotivationalToast('Exam added to countdown! 🎯');
      });
    }

    const goalForm = document.getElementById('form-goal');
    if (goalForm) {
      goalForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const hours = parseFloat(document.getElementById('goal-hours-input').value);
        if (hours) {
          const user = window.store.getCurrentUser();
          user.dailyGoalHours = hours;
          window.store.saveData();
          this.closeModal('modal-goal');
          this.showMotivationalToast(`Daily Goal set to ${hours} hours! 🎯`);
        }
      });
    }
  }

  // --- OPEN SPECIFIC MODALS ---
  openAddTaskModal() {
    document.getElementById('modal-task-title').textContent = 'Add New Task';
    document.getElementById('task-id').value = '';
    document.getElementById('task-title-input').value = '';
    document.getElementById('task-duration-input').value = '45';
    document.getElementById('task-date-input').value = new Date().toISOString().split('T')[0];
    document.getElementById('task-time-input').value = '18:00';
    document.getElementById('task-desc-input').value = '';
    document.getElementById('prio-med').checked = true;
    this.openModal('modal-task');
  }

  openEditTaskModal(id) {
    const task = window.store.getTasks().find(t => t.id === id);
    if (!task) return;

    document.getElementById('modal-task-title').textContent = 'Edit Task';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title-input').value = task.title;
    document.getElementById('task-subject-input').value = task.subjectId;
    document.getElementById('task-duration-input').value = task.durationMinutes;
    document.getElementById('task-date-input').value = task.date;
    document.getElementById('task-time-input').value = task.startTime || '18:00';
    document.getElementById('task-desc-input').value = task.description || '';
    
    const radio = document.querySelector(`input[name="priority"][value="${task.priority}"]`);
    if (radio) radio.checked = true;

    this.openModal('modal-task');
  }

  openAddSubjectModal() {
    document.getElementById('modal-subj-title').textContent = 'Add New Subject';
    document.getElementById('subj-id').value = '';
    document.getElementById('subj-name-input').value = '';
    document.getElementById('subj-code-input').value = '';
    document.getElementById('subj-color-input').value = '#4F46E5';
    this.openModal('modal-subject');
  }

  openEditSubjectModal(id) {
    const subj = window.store.getSubjectById(id);
    if (!subj) return;
    document.getElementById('modal-subj-title').textContent = 'Edit Subject';
    document.getElementById('subj-id').value = subj.id;
    document.getElementById('subj-name-input').value = subj.name;
    document.getElementById('subj-code-input').value = subj.code || '';
    document.getElementById('subj-color-input').value = subj.color || '#4F46E5';
    this.openModal('modal-subject');
  }

  openAddScheduleModal() {
    document.getElementById('modal-sched-title').textContent = 'Add Schedule Slot';
    document.getElementById('sched-id').value = '';
    document.getElementById('sched-day-input').value = this.timetableDay;
    document.getElementById('sched-start-input').value = '09:00';
    document.getElementById('sched-end-input').value = '10:00';
    document.getElementById('sched-room-input').value = '';
    this.openModal('modal-schedule');
  }

  openEditScheduleModal(id) {
    const item = window.store.getTimetable().find(i => i.id === id);
    if (!item) return;
    document.getElementById('modal-sched-title').textContent = 'Edit Schedule Slot';
    document.getElementById('sched-id').value = item.id;
    document.getElementById('sched-subject-input').value = item.subjectId;
    document.getElementById('sched-day-input').value = item.day;
    document.getElementById('sched-start-input').value = item.startTime;
    document.getElementById('sched-end-input').value = item.endTime;
    document.getElementById('sched-room-input').value = item.room || '';
    this.openModal('modal-schedule');
  }

  deleteScheduleItem(id) {
    if (confirm('Delete this timetable slot?')) {
      window.store.deleteSchedule(id);
      this.showMotivationalToast('Schedule slot deleted');
    }
  }

  deleteSubjectItem(id) {
    if (confirm('Delete this subject? Tasks linked to it will remain.')) {
      window.store.deleteSubject(id);
      this.showMotivationalToast('Subject deleted');
    }
  }

  openAddNoteModal() {
    document.getElementById('modal-note-title').textContent = 'Add New Note';
    document.getElementById('note-id').value = '';
    document.getElementById('note-title-input').value = '';
    document.getElementById('note-content-input').value = '';
    this.openModal('modal-note');
  }

  openEditNoteModal(id) {
    const note = window.store.getNotes().find(n => n.id === id);
    if (!note) return;
    document.getElementById('modal-note-title').textContent = 'Edit Note';
    document.getElementById('note-id').value = note.id;
    document.getElementById('note-title-input').value = note.title;
    document.getElementById('note-subject-input').value = note.subjectId;
    document.getElementById('note-content-input').value = note.content;
    this.openModal('modal-note');
  }

  deleteNoteItem(id) {
    if (confirm('Delete this note?')) {
      window.store.deleteNote(id);
      this.showMotivationalToast('Note deleted');
    }
  }

  openAddExamModal() {
    document.getElementById('modal-exam-title').textContent = 'Add Exam';
    document.getElementById('exam-id').value = '';
    document.getElementById('exam-title-input').value = '';
    document.getElementById('exam-date-input').value = new Date().toISOString().split('T')[0];
    document.getElementById('exam-time-input').value = '10:00 AM';
    this.openModal('modal-exam');
  }

  deleteExamItem(id) {
    if (confirm('Delete this exam entry?')) {
      window.store.deleteExam(id);
      this.showMotivationalToast('Exam removed');
    }
  }

  // --- GLOBAL SEARCH MODAL (Ctrl + K) ---
  bindGlobalSearch() {
    const searchTrigger = document.getElementById('global-search-trigger');
    const searchInput = document.getElementById('global-search-input');
    const resultsContainer = document.getElementById('global-search-results');

    if (searchTrigger) {
      searchTrigger.addEventListener('click', () => {
        this.openModal('modal-search');
        if (searchInput) searchInput.focus();
      });
    }

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.openModal('modal-search');
        if (searchInput) searchInput.focus();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase().trim();
        if (!q) {
          resultsContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center;">Start typing to search...</p>';
          return;
        }

        const matchedTasks = window.store.getTasks().filter(t => t.title.toLowerCase().includes(q));
        const matchedNotes = window.store.getNotes().filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
        const matchedExams = window.store.getExams().filter(ex => ex.title.toLowerCase().includes(q));

        let html = '';
        if (matchedTasks.length > 0) {
          html += '<div style="font-weight: 700; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">Tasks</div>';
          matchedTasks.forEach(t => {
            html += `<div class="dropdown-item" onclick="app.closeModal('modal-search'); app.navigateTo('tasks');"><i class="fa-solid fa-circle-check"></i> ${t.title}</div>`;
          });
        }
        if (matchedNotes.length > 0) {
          html += '<div style="font-weight: 700; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin: 0.75rem 0 0.5rem;">Notes</div>';
          matchedNotes.forEach(n => {
            html += `<div class="dropdown-item" onclick="app.closeModal('modal-search'); app.navigateTo('notes');"><i class="fa-solid fa-note-sticky"></i> ${n.title}</div>`;
          });
        }
        if (matchedExams.length > 0) {
          html += '<div style="font-weight: 700; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin: 0.75rem 0 0.5rem;">Exams</div>';
          matchedExams.forEach(ex => {
            html += `<div class="dropdown-item" onclick="app.closeModal('modal-search'); app.navigateTo('exams');"><i class="fa-solid fa-bullseye"></i> ${ex.title}</div>`;
          });
        }

        if (!html) {
          html = '<p style="color: var(--text-muted); font-size: 0.85rem; text-align: center;">No matches found.</p>';
        }
        resultsContainer.innerHTML = html;
      });
    }
  }

  // --- PROFILE & SETTINGS DROPDOWN ---
  bindProfileActions() {
    const profileBtn = document.getElementById('profile-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const notifBtn = document.getElementById('notif-btn');
    const notifDropdown = document.getElementById('notif-dropdown');

    if (profileBtn && profileDropdown) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.classList.toggle('show');
        if (notifDropdown) notifDropdown.classList.remove('show');
      });
    }

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
        if (profileDropdown) profileDropdown.classList.remove('show');
      });
    }

    window.addEventListener('click', () => {
      if (profileDropdown) profileDropdown.classList.remove('show');
      if (notifDropdown) notifDropdown.classList.remove('show');
    });

    const setGoalBtn = document.getElementById('set-daily-goal-btn');
    if (setGoalBtn) {
      setGoalBtn.addEventListener('click', () => {
        const user = window.store.getCurrentUser();
        document.getElementById('goal-hours-input').value = user.dailyGoalHours || 4;
        this.openModal('modal-goal');
      });
    }

    const resetBtn = document.getElementById('reset-data-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Reset application data back to default sample state?')) {
          window.store.resetToSampleData();
          this.showMotivationalToast('Sample data restored');
        }
      });
    }
  }

  // --- MOTIVATIONAL TOAST NOTIFICATIONS ---
  showMotivationalToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="fa-solid fa-sparkles" style="color: var(--accent-warning);"></i>
      <span>${this.escapeHTML(message)}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // --- UTILITY CALCULATIONS ---
  calculateDaysRemaining(dateStr) {
    if (!dateStr) return 'TBD';
    const target = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Passed';
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} Days Remaining`;
  }

  formatMinutesToHours(mins) {
    if (!mins || mins <= 0) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});

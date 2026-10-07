/* ==========================================
   STUDYMATE - Study Timer & Stopwatch Engine
   ========================================== */

class StudyTimer {
  constructor() {
    this.mode = 'pomodoro'; // 'pomodoro' | 'custom' | 'stopwatch'
    this.pomoState = 'study'; // 'study' | 'shortBreak' | 'longBreak'
    this.sessionCount = 1;
    
    // Time tracking (in seconds)
    this.duration = 25 * 60; 
    this.remainingTime = 25 * 60;
    this.stopwatchTime = 0;
    
    this.isRunning = false;
    this.timerInterval = null;
    this.activeTask = null;

    // Web Audio Chime context
    this.audioCtx = null;
  }

  init() {
    this.bindUI();
    this.updateDisplay();
  }

  bindUI() {
    // Mode switcher buttons
    const modeTabs = document.querySelectorAll('.timer-tab');
    modeTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const selectedMode = e.currentTarget.getAttribute('data-mode');
        this.switchMode(selectedMode);
      });
    });

    // Control buttons
    const startBtn = document.getElementById('timer-start-btn');
    const resetBtn = document.getElementById('timer-reset-btn');
    const skipBtn = document.getElementById('timer-skip-btn');

    if (startBtn) startBtn.addEventListener('click', () => this.toggleTimer());
    if (resetBtn) resetBtn.addEventListener('click', () => this.resetTimer());
    if (skipBtn) skipBtn.addEventListener('click', () => this.skipSession());

    // Custom minutes input / preset pills
    const customInput = document.getElementById('custom-timer-mins');
    if (customInput) {
      customInput.addEventListener('change', (e) => {
        const mins = parseInt(e.target.value) || 25;
        this.setCustomDuration(mins);
      });
    }

    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mins = parseInt(e.currentTarget.getAttribute('data-mins'));
        if (customInput) customInput.value = mins;
        this.setCustomDuration(mins);
      });
    });
  }

  switchMode(newMode) {
    this.pauseTimer();
    this.mode = newMode;

    // Update Tab UI
    document.querySelectorAll('.timer-tab').forEach(tab => {
      tab.classList.toggle('active', tab.getAttribute('data-mode') === newMode);
    });

    // Show/Hide custom timer settings box
    const customBox = document.getElementById('custom-timer-settings');
    if (customBox) {
      customBox.style.display = newMode === 'custom' ? 'block' : 'none';
    }

    // Reset duration based on mode
    if (newMode === 'pomodoro') {
      this.pomoState = 'study';
      this.duration = 25 * 60;
      this.remainingTime = 25 * 60;
    } else if (newMode === 'custom') {
      const customInput = document.getElementById('custom-timer-mins');
      const mins = customInput ? parseInt(customInput.value) || 45 : 45;
      this.duration = mins * 60;
      this.remainingTime = mins * 60;
    } else if (newMode === 'stopwatch') {
      this.stopwatchTime = 0;
      this.duration = 0;
      this.remainingTime = 0;
    }

    this.updateDisplay();
  }

  setCustomDuration(mins) {
    if (this.mode !== 'custom') {
      this.switchMode('custom');
    }
    this.duration = mins * 60;
    this.remainingTime = mins * 60;
    this.updateDisplay();
  }

  startTaskSession(task, customMins = null) {
    this.activeTask = task;

    // Update active task banner UI
    const activeTaskTitle = document.getElementById('timer-active-task-title');
    const activeTaskSubject = document.getElementById('timer-active-task-subject');

    if (activeTaskTitle) activeTaskTitle.textContent = task.title;
    if (activeTaskSubject) {
      const subj = window.store.getSubjectById(task.subjectId);
      activeTaskSubject.textContent = subj.name;
    }

    // Set duration from task estimated duration if given
    const mins = customMins || task.durationMinutes || 25;
    this.switchMode('custom');
    const customInput = document.getElementById('custom-timer-mins');
    if (customInput) customInput.value = mins;
    this.setCustomDuration(mins);

    // Auto start
    this.startTimer();
  }

  toggleTimer() {
    if (this.isRunning) {
      this.pauseTimer();
    } else {
      this.startTimer();
    }
  }

  startTimer() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Update play/pause button icon & toggle running animation class
    const startBtn = document.getElementById('timer-start-btn');
    const startBtnIcon = document.querySelector('#timer-start-btn i');
    const timerCircleWrap = document.querySelector('.timer-circle-wrap');

    if (startBtnIcon) startBtnIcon.className = 'fa-solid fa-pause';
    if (startBtn) startBtn.classList.add('running');
    if (timerCircleWrap) timerCircleWrap.classList.add('running');

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 1000);
  }

  pauseTimer() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.timerInterval);

    const startBtn = document.getElementById('timer-start-btn');
    const startBtnIcon = document.querySelector('#timer-start-btn i');
    const timerCircleWrap = document.querySelector('.timer-circle-wrap');

    if (startBtnIcon) startBtnIcon.className = 'fa-solid fa-play';
    if (startBtn) startBtn.classList.remove('running');
    if (timerCircleWrap) timerCircleWrap.classList.remove('running');

    document.title = 'StudyMate - Student Productivity App';
  }

  resetTimer() {
    this.pauseTimer();

    const timerCircleWrap = document.querySelector('.timer-circle-wrap');
    if (timerCircleWrap) timerCircleWrap.classList.remove('running');

    if (this.mode === 'pomodoro') {
      this.remainingTime = this.duration;
    } else if (this.mode === 'custom') {
      this.remainingTime = this.duration;
    } else if (this.mode === 'stopwatch') {
      this.stopwatchTime = 0;
    }

    this.updateDisplay();
  }

  skipSession() {
    this.pauseTimer();
    if (this.mode === 'pomodoro') {
      this.completeSession(true); // skip without logging full time
    }
  }

  tick() {
    if (this.mode === 'stopwatch') {
      this.stopwatchTime += 1;
      this.updateDisplay();
      return;
    }

    if (this.remainingTime > 0) {
      this.remainingTime -= 1;
      this.updateDisplay();
    } else {
      // Timer finished!
      this.completeSession(false);
    }
  }

  completeSession(isSkip = false) {
    this.pauseTimer();
    this.playChime();

    let loggedMins = 0;

    if (this.mode === 'pomodoro') {
      if (this.pomoState === 'study') {
        loggedMins = Math.round(this.duration / 60);
        
        // Log study session in store
        if (!isSkip && loggedMins > 0) {
          window.store.logStudySession(
            loggedMins,
            this.activeTask ? this.activeTask.id : null,
            this.activeTask ? this.activeTask.subjectId : null
          );
        }

        // Determine next break
        this.sessionCount += 1;
        if (this.sessionCount % 4 === 0) {
          this.pomoState = 'longBreak';
          this.duration = 15 * 60;
          this.remainingTime = 15 * 60;
        } else {
          this.pomoState = 'shortBreak';
          this.duration = 5 * 60;
          this.remainingTime = 5 * 60;
        }

        window.app.showMotivationalToast('Study session completed! Take a break 🎉');
      } else {
        // Break finished -> back to study
        this.pomoState = 'study';
        this.duration = 25 * 60;
        this.remainingTime = 25 * 60;
        window.app.showMotivationalToast('Break finished! Ready to focus? 🔥');
      }
    } else if (this.mode === 'custom') {
      loggedMins = Math.round(this.duration / 60);
      if (!isSkip && loggedMins > 0) {
        window.store.logStudySession(
          loggedMins,
          this.activeTask ? this.activeTask.id : null,
          this.activeTask ? this.activeTask.subjectId : null
        );
      }
      this.remainingTime = this.duration;
      window.app.showMotivationalToast('Custom study timer finished! Great work! 🎉');
    }

    // Trigger celebratory confetti if canvas-confetti loaded
    if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }

    this.updateDisplay();
    if (window.app && window.app.renderAll) {
      window.app.renderAll();
    }
  }

  updateDisplay() {
    let displaySecs = this.remainingTime;
    let totalSecs = this.duration;

    if (this.mode === 'stopwatch') {
      displaySecs = this.stopwatchTime;
    }

    const mins = Math.floor(displaySecs / 60);
    const secs = displaySecs % 60;
    const formattedTime = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Update Clock Element
    const clockEl = document.getElementById('timer-clock-display');
    if (clockEl) clockEl.textContent = formattedTime;

    // Update Label / Status
    const labelEl = document.getElementById('timer-label-display');
    if (labelEl) {
      if (this.mode === 'pomodoro') {
        labelEl.textContent = this.pomoState === 'study' ? `Session ${this.sessionCount} (Focus)` : 'Break Time ☕';
      } else if (this.mode === 'custom') {
        labelEl.textContent = 'Custom Study Timer';
      } else {
        labelEl.textContent = 'Stopwatch';
      }
    }

    // Update Browser Tab Title when running
    if (this.isRunning) {
      document.title = `(${formattedTime}) StudyMate`;
    }

    // Update SVG Progress Circle
    const circleProgress = document.getElementById('timer-circle-progress');
    if (circleProgress) {
      const maxOffset = 816; // 2 * PI * 130
      let progressRatio = 1;
      if (this.mode !== 'stopwatch' && totalSecs > 0) {
        progressRatio = this.remainingTime / totalSecs;
      }
      const offset = maxOffset * (1 - progressRatio);
      circleProgress.style.strokeDashoffset = offset;
    }
  }

  // Web Audio Synthesized Chime (No external mp3 assets needed!)
  playChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) this.audioCtx = new AudioCtx();
      
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.6); // G5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.log('Audio chime unavailable', e);
    }
  }
}

window.studyTimer = new StudyTimer();

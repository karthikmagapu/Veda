/* ==========================================
   STUDYMATE - Warm & Friendly AI Study Assistant
   ========================================== */

class AiAssistant {
  constructor() {
    this.isGenerating = false;
  }

  init() {
    this.bindUI();
    this.renderChatMessages();
  }

  bindUI() {
    const sendBtn = document.getElementById('ai-send-btn');
    const inputEl = document.getElementById('ai-input-text');
    const clearBtn = document.getElementById('ai-clear-btn');

    if (sendBtn && inputEl) {
      sendBtn.addEventListener('click', () => this.handleSendMessage());
      inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear our conversation history?')) {
          window.store.clearAiChats();
          this.renderChatMessages();
        }
      });
    }

    // Quick suggestion prompt pills
    document.querySelectorAll('.ai-prompt-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const promptText = e.currentTarget.getAttribute('data-prompt');
        if (inputEl) {
          inputEl.value = promptText;
          this.handleSendMessage();
        }
      });
    });
  }

  renderChatMessages() {
    const chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return;

    const chats = window.store.getAiChats();

    if (chats.length === 0) {
      chatContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); font-size: 0.85rem;">No messages yet. Ask me any study doubt! 😊</p>';
      return;
    }

    chatContainer.innerHTML = chats.map(msg => this.createMessageHTML(msg)).join('');
    this.scrollToBottom();
  }

  createMessageHTML(msg) {
    const isUser = msg.sender === 'user';
    const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedContent = this.formatMarkdownText(msg.text);

    return `
      <div class="ai-msg-row ${isUser ? 'user-msg' : 'ai-msg'}">
        <div class="ai-avatar">
          ${isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>'}
        </div>
        <div class="ai-msg-bubble">
          <div class="ai-msg-header">
            <span class="ai-sender-name">${isUser ? 'You' : 'StudyMate AI Buddy 🤖'}</span>
            <span class="ai-msg-time">${timeStr}</span>
          </div>
          <div class="ai-msg-body">${formattedContent}</div>

          ${!isUser ? `
            <div class="ai-msg-actions">
              <button class="btn btn-secondary btn-sm" onclick="aiAssistant.saveResponseToNotes('${msg.id}')" title="Save to Study Notes">
                <i class="fa-solid fa-bookmark"></i> Save to Notes
              </button>
              <button class="btn btn-secondary btn-sm" onclick="aiAssistant.copyMessageText('${msg.id}')" title="Copy to Clipboard">
                <i class="fa-solid fa-copy"></i> Copy
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  scrollToBottom() {
    const chatContainer = document.getElementById('ai-chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  handleSendMessage() {
    if (this.isGenerating) return;

    const inputEl = document.getElementById('ai-input-text');
    const subjEl = document.getElementById('ai-subject-select');
    const query = inputEl ? inputEl.value.trim() : '';

    if (!query) return;

    const subjectId = subjEl ? subjEl.value : null;

    // Add user message to store
    window.store.addAiMessage('user', query, subjectId);
    if (inputEl) inputEl.value = '';
    this.renderChatMessages();

    // Show AI typing indicator
    this.showTypingIndicator();

    // Generate response with friendly delay
    setTimeout(() => {
      const aiResponseText = this.generateFriendlyAIResponse(query, subjectId);
      this.removeTypingIndicator();
      window.store.addAiMessage('ai', aiResponseText, subjectId);
      this.renderChatMessages();
    }, 1000);
  }

  showTypingIndicator() {
    this.isGenerating = true;
    const chatContainer = document.getElementById('ai-chat-messages');
    if (!chatContainer) return;

    const indicatorHTML = `
      <div class="ai-msg-row ai-msg" id="ai-typing-indicator">
        <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="ai-msg-bubble" style="padding: 0.75rem 1rem;">
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">Thinking & drafting an easy answer for you...</div>
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;
    chatContainer.insertAdjacentHTML('beforeend', indicatorHTML);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    this.isGenerating = false;
    const indicator = document.getElementById('ai-typing-indicator');
    if (indicator) indicator.remove();
  }

  // --- FRIENDLY & ENCOURAGING AI DOUBT SOLVER ENGINE ---
  generateFriendlyAIResponse(userQuery, subjectId) {
    const q = userQuery.toLowerCase();
    const userName = window.store.data.user.name || 'Karthik';
    const subjObj = subjectId ? window.store.getSubjectById(subjectId) : null;
    const subjName = subjObj ? subjObj.name : 'General Study';

    // Warm greetings check
    if (q === 'hi' || q === 'hello' || q === 'hey' || q.startsWith('hi ') || q.startsWith('hello ')) {
      return `Hey ${userName}! 👋 Classic to see you here! 😊 

I'm your **StudyMate AI Buddy**. I'm here to help you clear any doubt, explain tricky concepts in simple terms, debug code, or build an awesome study plan.

What topic are we tackling today? Ask me anything! 🚀`;
    }

    // 1. Data Structures & Algorithms (DSA)
    if (q.includes('dsa') || q.includes('array') || q.includes('linked list') || q.includes('tree') || q.includes('graph') || q.includes('sort') || q.includes('search') || q.includes('recursion') || q.includes('stack') || q.includes('queue')) {
      if (q.includes('array') || q.includes('search')) {
        return `Hey ${userName}! 😊 Great question! Searching in arrays is super fundamental in DSA. Let's break it down so it's crystal clear!

### 💡 Real-World Analogy:
Imagine you're searching for a book in a library:
- **Linear Search**: Looking through every single shelf one by one from left to right.
- **Binary Search**: Opening a dictionary right in the middle, seeing if your word comes before or after, and throwing away half the dictionary each step! 📖

---

### 🔍 Binary Search vs Linear Search:

#### 1. Linear Search (Unsorted Data):
- Checks items one by one.
- **Time Complexity**: $O(N)$

#### 2. Binary Search (Requires Sorted Data):
- Halves the search space every step!
- **Time Complexity**: $O(\\log N)$

\`\`\`java
// Easy Java Implementation of Binary Search
public static int binarySearch(int[] arr, int target) {
    int left = 0, right = arr.length - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) return mid; // Found it! 🎉
        if (arr[mid] < target) left = mid + 1; // Search right half
        else right = mid - 1;                 // Search left half
    }
    return -1; // Not found
}
\`\`\`

---

### 🌟 Quick Practice Question for You:
If an array has **1,000,000 sorted elements**, how many steps will Binary Search take at most?
*(Hint: $\\log_2(1,000,000) \\approx 20$ steps! Super fast!)*

How does that feel? Would you like another code example or practice problem? I'm right here! 🔥`;
      }

      if (q.includes('recursion')) {
        return `Hey ${userName}! 😊 Don't worry at all—recursion trips up almost every developer at first! Let's make it super easy and intuitive.

### 🍕 The Matryoshka Doll Analogy:
Recursion is like opening Russian nesting dolls. You open a doll, find a smaller doll inside, and keep opening until you find the tiniest solid doll (the **Base Case**), then you put them all back together!

---

### 🧠 The 2 Golden Rules of Recursion:
1. **Base Case**: The stop signal so the function doesn't run forever (avoids \`StackOverflowError\`!).
2. **Recursive Case**: The line where the function calls itself with a smaller input.

\`\`\`java
// Finding Factorial (5! = 5 * 4 * 3 * 2 * 1)
public int factorial(int n) {
    // Rule 1: Base Case
    if (n <= 1) return 1; 
    
    // Rule 2: Recursive Call
    return n * factorial(n - 1); 
}
\`\`\`

---

### ⚡ Quick Tip for Exams:
Always draw out the **Call Stack** tree on paper during exams to track the return values step-by-step!

You're doing awesome, ${userName}! Let me know if you want me to draw out a call stack example for you! 🚀`;
      }
    }

    // 2. DBMS & SQL
    if (q.includes('dbms') || q.includes('sql') || q.includes('normalization') || q.includes('join') || q.includes('acid') || q.includes('key')) {
      if (q.includes('normalization') || q.includes('1nf') || q.includes('2nf') || q.includes('3nf')) {
        return `Hey ${userName}! 🌟 Database Normalization can sound complex with all the mathematical definitions, but here is the simplest way to remember it!

### 🎯 Why do we Normalize Databases?
To eliminate messy duplicate data and prevent anomalies (like accidentally deleting a student when deleting a course!).

---

### 📜 The 3 Normal Forms (1NF, 2NF, 3NF):

1. **1NF (First Normal Form)**:
   - **Rule**: Every cell must contain a single atomic value (no multi-valued lists like \`"Math, Physics"\` in one cell).

2. **2NF (Second Normal Form)**:
   - **Rule**: Must be in 1NF + **No Partial Dependency**.
   - All non-key columns must depend on the *entire* Primary Key, not just a part of it!

3. **3NF (Third Normal Form)**:
   - **Rule**: Must be in 2NF + **No Transitive Dependency**.
   - Non-key columns shouldn't depend on other non-key columns! ($A \\rightarrow B \\rightarrow C$).

---

### 💡 Famous Mnemonic to Ace Your DBMS Exam:
> *"The key, the whole key, and nothing but the key, so help me Codd!"*
- **1NF**: The key
- **2NF**: The whole key
- **3NF**: Nothing but the key

You've got this, ${userName}! Click **Save to Notes** below to keep this cheat sheet handy for your exams! 📝`;
      }
    }

    // 3. Quiz & Practice Questions Request
    if (q.includes('quiz') || q.includes('question') || q.includes('test') || q.includes('practice')) {
      return `Awesome attitude, ${userName}! Active testing is scientifically the best way to master any subject! 🎯

Here are 3 friendly quiz questions tailored for **${subjName}**:

---

#### ❓ Question 1:
Which Data Structure operates on a **LIFO** (Last In, First Out) principle?
- A) Queue
- B) Stack
- C) Binary Tree
- D) Array List

#### ❓ Question 2:
In Database Management Systems, what does the **'A'** in ACID properties stand for?
- A) Availability
- B) Algorithm
- C) Atomicity
- D) Authentication

#### ❓ Question 3:
In Java, which memory area holds objects created with the \`new\` keyword?
- A) Stack Memory
- B) Heap Memory
- C) Register Space
- D) Code Segment

---

Take a moment to pick your answers! Reply with your answers (e.g. "1-B, 2-C, 3-B") and I'll grade them for you with friendly explanations! 😊`;
    }

    // 4. General Doubt Solver Engine (Flexible for any student question)
    return `Hey ${userName}! 😊 Thanks for reaching out! Let's clear your doubt on **"${userQuery}"** step-by-step!

### 💡 Simple Explanation:
When we look at **${userQuery}**, the main goal is to understand how the core pieces fit together clearly without over-complicating things.

---

### 🔑 Key Concepts to Remember:
1. **Core Idea**: Start with the basic definition and purpose.
2. **How it Works**: Trace the logical flow step by step.
3. **Common Exam Tip**: Watch out for common edge cases or definitions that professors love to ask about!

\`\`\`java
// Helpful Code / Logic Blueprint
public void solveDoubt() {
    System.out.println("Step 1: Understand the goal");
    System.out.println("Step 2: Apply the logic");
    System.out.println("Step 3: Great job mastering " + "${userQuery}!");
}
\`\`\`

---

### 🌟 You're Doing Great!
Did this help clear your doubt? Feel free to ask a follow-up question or ask for a real-world example! I'm here to help you succeed! 🔥`;
  }

  formatMarkdownText(text) {
    if (!text) return '';
    let html = text;

    // Code blocks ```java ... ```
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre class="ai-code-block"><code>${window.app.escapeHTML(code.trim())}</code></pre>`;
    });

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>');

    // Bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Blockquote > text
    html = html.replace(/^> (.*$)/gim, '<blockquote style="border-left: 3px solid var(--accent-primary); padding-left: 0.75rem; margin: 0.5rem 0; color: var(--text-secondary); font-style: italic;">$1</blockquote>');

    // Headers ### Title
    html = html.replace(/^### (.*$)/gim, '<h3 class="ai-msg-h3" style="font-size: 1.05rem; margin: 0.75rem 0 0.35rem; color: var(--accent-primary);">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 class="ai-msg-h4" style="font-size: 0.95rem; margin: 0.5rem 0 0.25rem;">$1</h4>');

    // Bullet lists - item
    html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 1.25rem;">$1</li>');

    // Line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  saveResponseToNotes(msgId) {
    const chats = window.store.getAiChats();
    const msg = chats.find(m => m.id === msgId);

    if (msg) {
      const defaultSubj = window.store.getSubjects()[0]?.id || 'subj-1';
      window.store.addNote({
        title: `AI Note: Doubt Solution (${new Date().toLocaleDateString()})`,
        subjectId: msg.subjectId || defaultSubj,
        content: msg.text
      });
      window.app.showMotivationalToast('Saved directly to your Study Notes! 📝');
    }
  }

  copyMessageText(msgId) {
    const chats = window.store.getAiChats();
    const msg = chats.find(m => m.id === msgId);
    if (msg && navigator.clipboard) {
      navigator.clipboard.writeText(msg.text);
      window.app.showMotivationalToast('Message copied to clipboard! 📋');
    }
  }
}

window.aiAssistant = new AiAssistant();

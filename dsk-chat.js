// danskliu-chat widget — embedded chat for danskliu.com
(function () {
  'use strict';

  const API_BASE = 'https://danskliu-chat.danskliu.workers.dev';
  const POLL_INTERVAL_MS = 8000; // Poll for Dan's reply every 8s
  const POLL_TIMEOUT_MS = 600000; // Stop polling after 10 minutes
  const OFFICE_HOURS_NOTICE = 'Dan typically replies within a few hours during UK business hours.';

  // ── State ────────────────────────────────────────────────────────
  let sessionId = null;
  let visitor = { name: '', email: '' };
  let awaitingDan = false;
  let pollTimer = null;
  let pollStartTime = 0;
  let escalationOffered = false;

  // ── DOM Setup ────────────────────────────────────────────────────
  const bubble = document.createElement('button');
  bubble.className = 'dsk-chat-bubble';
  bubble.setAttribute('aria-label', 'Chat with assistant');
  bubble.innerHTML = `
    <svg class="dsk-chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg class="dsk-close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;

  const panel = document.createElement('div');
  panel.className = 'dsk-chat-panel';
  panel.innerHTML = `
    <div class="dsk-chat-header">
      <div class="dsk-chat-avatar">💬</div>
      <div class="dsk-chat-header-info">
        <h3>Ask About Dan</h3>
        <p>AI assistant • ${OFFICE_HOURS_NOTICE}</p>
      </div>
    </div>
    <div class="dsk-visitor-form">
      <p>I'd love to know who I'm chatting with — helps Dan follow up if needed.</p>
      <div class="dsk-form-row">
        <input type="text" id="dsk-visitor-name" placeholder="Your name" autocomplete="name">
        <input type="email" id="dsk-visitor-email" placeholder="Email (optional)" autocomplete="email">
      </div>
      <button id="dsk-visitor-start">Start chat →</button>
    </div>
    <div class="dsk-chat-messages"></div>
    <div class="dsk-typing"><span></span><span></span><span></span></div>
    <div class="dsk-chat-input-area">
      <input type="text" id="dsk-chat-input" placeholder="Ask about Dan's work, research, background..." maxlength="500">
      <button id="dsk-chat-send" aria-label="Send message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
    <div class="dsk-chat-footer">AI-powered assistant for danskliu.com</div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(panel);

  const messagesEl = panel.querySelector('.dsk-chat-messages');
  const typingEl = panel.querySelector('.dsk-typing');
  const inputArea = panel.querySelector('.dsk-chat-input-area');
  const inputEl = panel.querySelector('#dsk-chat-input');
  const sendBtn = panel.querySelector('#dsk-chat-send');
  const visitorForm = panel.querySelector('.dsk-visitor-form');
  const nameInput = panel.querySelector('#dsk-visitor-name');
  const emailInput = panel.querySelector('#dsk-visitor-email');
  const startBtn = panel.querySelector('#dsk-visitor-start');

  // ── Helpers ──────────────────────────────────────────────────────
  function addMessage(text, role) {
    const div = document.createElement('div');
    // Worker returns 'assistant' — map to 'bot' for CSS compatibility
    const cssRole = (role === 'assistant') ? 'bot' : role;
    div.className = 'dsk-chat-msg ' + cssRole;
    div.textContent = text;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() { typingEl.classList.add('show'); }
  function hideTyping() { typingEl.classList.remove('show'); }

  function setInputEnabled(enabled) {
    inputEl.disabled = !enabled;
    sendBtn.disabled = !enabled;
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  }

  function startPolling() {
    if (!sessionId) return;
    stopPolling();
    pollStartTime = Date.now();

    pollTimer = setInterval(async () => {
      // Timeout after POLL_TIMEOUT_MS
      if (Date.now() - pollStartTime > POLL_TIMEOUT_MS) {
        stopPolling();
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/chat/${sessionId}`);
        const data = await res.json();

        if (data.reply && data.role === 'dan') {
          // Dan replied!
          hideTyping();
          addMessage(data.reply, 'dan');
          awaitingDan = false;
          escalationOffered = false;
          setInputEnabled(true);
          stopPolling();
          inputEl.placeholder = 'Ask another question...';
          inputEl.maxLength = 500;
        } else if (!data.awaitingDan && awaitingDan) {
          // Dan hasn't replied yet, stop polling if we timed out
        }
      } catch (e) {
        // Silently retry
      }
    }, POLL_INTERVAL_MS);
  }

  // ── API ──────────────────────────────────────────────────────────
  async function sendMessage(text) {
    if (!text.trim()) return;

    const isEscalationConfirm = escalationOffered &&
      /^(yes|yeah|sure|ok|okay|please|go ahead|do it|forward|pass|send|yep|yup)/i.test(text.trim());

    addMessage(text, 'user');
    inputEl.value = '';
    setInputEnabled(false);
    showTyping();

    try {
      const body = {
        message: text,
        sessionId: sessionId,
        visitor: visitor.name ? visitor : undefined,
      };

      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      hideTyping();

      if (data.sessionId) sessionId = data.sessionId;

      if (data.reply) {
        addMessage(data.reply, data.role || 'bot');
      }

      if (data.escalationOffered) {
        // LLM offered escalation — set flag so "yes" / "sure" etc triggers it
        escalationOffered = true;
        setInputEnabled(true);
        inputEl.placeholder = 'Type yes to forward, or ask another question...';
        inputEl.maxLength = 50;
      } else if (data.directChat) {
        // Dan replied — visitor can now reply back directly
        awaitingDan = false;
        escalationOffered = false;
        setInputEnabled(true);
        inputEl.placeholder = 'Reply to Mr Liu directly...';
        inputEl.maxLength = 500;
      } else if (data.escalated && data.awaitingDan) {
        // Conversation has been forwarded
        awaitingDan = true;
        escalationOffered = false;
        setInputEnabled(false);
        startPolling();
        inputEl.placeholder = 'Waiting for Dan to reply...';
      } else if (data.awaitingDan) {
        awaitingDan = true;
        setInputEnabled(false);
        startPolling();
        inputEl.placeholder = 'Waiting for Dan to reply...';
      } else {
        awaitingDan = false;
        escalationOffered = false;
        setInputEnabled(true);
        inputEl.placeholder = 'Ask another question...';
        inputEl.maxLength = 500;
      }
    } catch (e) {
      hideTyping();
      addMessage('Sorry, something went wrong. Please try again.', 'system');
      setInputEnabled(true);
    }
  }

  // ── Event Handlers ──────────────────────────────────────────────
  bubble.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    bubble.classList.toggle('open', isOpen);
    if (isOpen) {
      // Show visitor form if no session yet
      if (!sessionId) {
        visitorForm.classList.add('show');
        inputArea.classList.remove('show');
        nameInput.focus();
      } else {
        inputEl.focus();
      }
    }
  });

  startBtn.addEventListener('click', () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    if (name) visitor.name = name;
    if (email) visitor.email = email;

    visitorForm.classList.remove('show');
    inputArea.classList.add('show');

    // Welcome message with name if provided
    const greeting = name
      ? `Hi ${name.split(' ')[0]}! I'm an AI assistant on Daniel Liu's website. I can tell you about his work in HPB surgery, his research, background, or publications. What would you like to know?`
      : "Hi! I'm an AI assistant on Daniel Liu's website. I can tell you about his work in HPB surgery, his research, background, or publications. What would you like to know?";

    addMessage(greeting, 'bot');
    inputEl.focus();
  });

  // Allow Enter on name/email fields to trigger start
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startBtn.click();
  });
  emailInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startBtn.click();
  });

  sendBtn.addEventListener('click', () => {
    sendMessage(inputEl.value);
  });

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputEl.value);
    }
  });

  // Close panel on Escape or clicking outside (bubble re-closes)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel.classList.contains('open')) {
      panel.classList.remove('open');
      bubble.classList.remove('open');
    }
  });
})();

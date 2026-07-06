// content_script.js — Phishing Guard + AI Reply Assistant (LLM Powered)

const IMP = {
  critical: {label:'Critical', emoji:'🔴', color:'#ef4444', bg:'rgba(239,68,68,0.15)',  border:'rgba(239,68,68,0.4)'},
  high:     {label:'High',     emoji:'🟠', color:'#f97316', bg:'rgba(249,115,22,0.15)', border:'rgba(249,115,22,0.4)'},
  medium:   {label:'Medium',   emoji:'🟡', color:'#ca8a04', bg:'rgba(234,179,8,0.15)',  border:'rgba(234,179,8,0.4)'},
  low:      {label:'Low',      emoji:'🟢', color:'#16a34a', bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.35)'}
};

// Lightweight heuristic for inbox lists (Too slow to hit LLM for 50 emails at once)
const CRIT_KW = ['urgent','asap','emergency','critical','immediately','expires today','action required today','due today'];
const HIGH_KW = ['deadline','meeting','interview','invoice','payment','contract','important','follow up','reply needed','proposal','quotation','offer letter','action required'];
const MED_KW  = ['reminder','update','question','request','schedule','confirm','appointment','feedback','inquiry','please advise','let me know'];
const LOW_KW  = ['newsletter','subscription','unsubscribe','promotion','sale','discount','weekly digest','monthly report'];
const AUTO_PAT = ['noreply','no-reply','donotreply','newsletter@','notifications@','mailer@','bounce@','hello@mailchimp'];

function scoreImportanceHeuristic(subject, preview, sender) {
  let score = 40;
  const t = (subject + ' ' + preview).toLowerCase();
  const s = sender.toLowerCase();
  if (AUTO_PAT.some(p => s.includes(p))) score -= 25;
  CRIT_KW.forEach(k => { if (t.includes(k)) score += 28; });
  HIGH_KW.forEach(k => { if (t.includes(k)) score += 14; });
  MED_KW.forEach(k  => { if (t.includes(k)) score += 6; });
  LOW_KW.forEach(k  => { if (t.includes(k)) score -= 16; });
  const qCount = (t.match(/\?/g)||[]).length;
  score += Math.min(qCount * 8, 16);
  score = Math.max(0, Math.min(100, score));
  if (score >= 78) return 'critical';
  if (score >= 56) return 'high';
  if (score >= 30) return 'medium';
  return 'low';
}

// ── DOM Helpers ─────────────────────────────────────────────────────────────

function getEmailBody() {
  return document.querySelector('.a3s.aiL') || document.querySelector('.ii.gt .a3s') || document.querySelector('.a3s') || document.querySelector('[data-message-id] .gs');
}
function getEmailSubject() {
  return document.querySelector('h2.hP') || document.querySelector('.ha h2') || document.querySelector('h2[data-legacy-thread-id]');
}
function getEmailSender() {
  return document.querySelector('.gD') || document.querySelector('.go[email]') || document.querySelector('[email]');
}

// ── LLM Integration ─────────────────────────────────────────────────────────

let lastAnalyzedSubject = '';
let isAnalyzing = false;

function extractAndAnalyzeCurrentEmail() {
  if (!window.location.href.includes('mail.google.com')) return;
  const subjectEl = getEmailSubject();
  const bodyEl = getEmailBody();
  
  if (!subjectEl || !bodyEl) {
    document.getElementById('ai-reply-panel')?.remove();
    lastAnalyzedSubject = '';
    return;
  }

  const subject = subjectEl.textContent.trim();
  const body = bodyEl.textContent.trim();
  const senderEl = getEmailSender();
  const sender = senderEl ? (senderEl.getAttribute('email') || senderEl.textContent.trim()) : 'Unknown';

  if (subject === lastAnalyzedSubject || isAnalyzing) return;
  lastAnalyzedSubject = subject;
  isAnalyzing = true;

  // Show loading indicator
  showLoadingPanel();

  // Call the LLM Backend
  chrome.runtime.sendMessage({
    type: 'apiRequest',
    endpoint: 'api/analyze_email',
    method: 'POST',
    body: { subject, sender, body }
  }, response => {
    isAnalyzing = false;
    if (!response || !response.success) {
      console.error('LLM Analysis Failed:', response?.error);
      document.getElementById('ai-reply-panel')?.remove();
      alert(`AI Agent Backend Error: ${response?.error || 'Server unreachable'}.\nMake sure you added your Gemini API Key to project/.env and restarted the server.`);
      return;
    }

    const aiData = response.data;
    
    // 1. Phishing Guard UI
    if (aiData.phishing && aiData.phishing.is_threat) {
      showPhishingPopup(aiData.phishing.reasons, aiData.phishing.score);
    }

    // 2. AI Reply Panel UI
    injectReplyPanel(aiData.priority, aiData.replies);
  });
}

// ── UI Generation ───────────────────────────────────────────────────────────

function showLoadingPanel() {
  document.getElementById('ai-reply-panel')?.remove();
  const panel = document.createElement('div');
  panel.id = 'ai-reply-panel';
  panel.innerHTML = `
    <div class="arp-header">
      <span class="arp-header-icon">🤖</span>
      <span class="arp-header-title">Analyzing with LLM...</span>
    </div>
    <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px;">
      <div class="status-dot" style="display:inline-block; margin-bottom: 8px;"></div>
      <div>Reading email context & generating replies...</div>
    </div>
  `;
  document.body.appendChild(panel);
}

function showPhishingPopup(reasons, score) {
  document.getElementById('phishing-warning-overlay')?.remove();
  const sev = score >= 10 ? 'critical' : score >= 6 ? 'high' : 'medium';
  const label = {critical:'🔴 CRITICAL THREAT', high:'🟠 HIGH RISK', medium:'🟡 SUSPICIOUS'}[sev];
  const el = document.createElement('div');
  el.id = 'phishing-warning-overlay';
  el.innerHTML = `
    <div class="pw-backdrop"></div>
    <div class="pw-modal pw-${sev}">
      <div class="pw-pulse-ring"></div>
      <div class="pw-icon">🚨</div>
      <div class="pw-severity-badge">${label}</div>
      <h1 class="pw-title">AI PHISHING ALERT</h1>
      <p class="pw-subtitle"><strong>Do not click on anything in this email!</strong><br>
        Our LLM detected potential malicious intent in the email context.</p>
      <div class="pw-reasons">
        <p class="pw-reasons-title">⚠️ AI Analysis Reasons:</p>
        ${reasons.map(r=>`<div class="pw-reason-item">• ${r}</div>`).join('')}
      </div>
      <div class="pw-actions">
        <button class="pw-btn-danger" id="pw-back-btn">🗑️ Go Back to Inbox</button>
        <button class="pw-btn-dismiss" id="pw-dismiss-btn">I Understand the Risk</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  document.getElementById('pw-back-btn').onclick = () => { el.remove(); window.history.back(); };
  document.getElementById('pw-dismiss-btn').onclick = () => { el.classList.add('pw-fading'); setTimeout(()=>el.remove(),400); };
}

function injectReplyPanel(priorityData, replies) {
  document.getElementById('ai-reply-panel')?.remove();
  if (!priorityData || !replies || replies.length === 0) return;

  const imp = IMP[priorityData.level] || IMP['low'];

  const panel = document.createElement('div');
  panel.id = 'ai-reply-panel';
  panel.innerHTML = `
    <div class="arp-header">
      <span class="arp-header-icon">✨</span>
      <span class="arp-header-title">LLM Reply Assistant</span>
      <button class="arp-close" id="arp-close-btn" title="Close">✕</button>
    </div>

    <div class="arp-priority-row">
      <div style="display:flex; flex-direction:column; gap:2px">
        <span class="arp-priority-label">AI PRIORITY ANALYSIS</span>
        <span style="font-size:10px; color:var(--text-muted)">${priorityData.reason || 'Analyzed via context'}</span>
      </div>
      <span class="arp-priority-badge" style="color:${imp.color};background:${imp.bg};border:1px solid ${imp.border}">
        ${imp.emoji} ${imp.label}
      </span>
    </div>

    <div class="arp-section-label">💬 Generated Responses</div>
    <div class="arp-replies">
      ${replies.map((r, i) => `
        <div class="arp-reply-card">
          <div class="arp-reply-label">${r.label}</div>
          <div class="arp-reply-preview">${r.text.split('\\n').find(l => l.trim()) || '...'}</div>
          <div class="arp-reply-actions">
            <button class="arp-btn-copy" data-text="${encodeURIComponent(r.text)}">📋 Copy text</button>
            <button class="arp-btn-use"  data-text="${encodeURIComponent(r.text)}">✉️ Open &amp; fill</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  document.body.appendChild(panel);
  document.getElementById('arp-close-btn').onclick = () => { panel.remove(); };

  panel.querySelectorAll('.arp-btn-copy').forEach(btn => {
    btn.onclick = () => {
      const text = decodeURIComponent(btn.dataset.text);
      navigator.clipboard.writeText(text).catch(() => {
        const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      });
      const orig = btn.textContent; btn.textContent = '✅ Copied!';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    };
  });

  panel.querySelectorAll('.arp-btn-use').forEach(btn => {
    btn.onclick = () => {
      const text = decodeURIComponent(btn.dataset.text);
      const opened = clickGmailReply();
      setTimeout(() => waitForComposeAndFill(text, 0), opened ? 300 : 0);
      const orig = btn.textContent; btn.textContent = '⏳ Opening…';
      setTimeout(() => { btn.textContent = orig; }, 2500);
    };
  });
}

// ── Gmail Compose Automation ────────────────────────────────────────────────

function waitForComposeAndFill(text, attempts) {
  if (attempts === undefined) attempts = 0;
  if (attempts > 25) return;
  const compose = document.querySelector('.Am.Al.editable[contenteditable="true"]') ||
                  document.querySelector('[contenteditable="true"][g_editable="true"]') ||
                  document.querySelector('.Ap [contenteditable="true"]') ||
                  document.querySelector('.aO7 [contenteditable="true"]') ||
                  document.querySelector('[contenteditable="true"][role="textbox"]');
  if (compose) {
    compose.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, text);
    compose.dispatchEvent(new InputEvent('input', {bubbles: true}));
  } else {
    setTimeout(() => waitForComposeAndFill(text, attempts + 1), 100);
  }
}

function clickGmailReply() {
  const btn = document.querySelector('[data-tooltip="Reply"]') ||
              document.querySelector('[aria-label="Reply"]') ||
              document.querySelector('[data-tooltip*="spund"]') ||
              document.querySelector('[aria-label*="spund"]') ||
              document.querySelector('[data-tooltip*="Antwort"]') ||
              document.querySelector('[data-tooltip*="Répondre"]') ||
              document.querySelector('span.ams.T-I-ax7[role="link"]') ||
              document.querySelector('.T-I.J-J5-Ji.T-I-Js-Gs[role="link"]');
  if (btn) { btn.click(); return true; }
  for (const b of document.querySelectorAll('[role="button"], [role="link"]')) {
    const tip = (b.getAttribute('data-tooltip')||'').toLowerCase();
    const lbl = (b.getAttribute('aria-label')||'').toLowerCase();
    if (tip.includes('reply') || lbl.includes('reply') || tip.includes('spund') || lbl.includes('spund')) { b.click(); return true; }
  }
  return false;
}

// ── Inbox Badges & Yesterday Summary (Heuristics) ──────────────────────────

function injectInboxBadges() {
  if (!window.location.href.includes('mail.google.com')) return;
  const rows = document.querySelectorAll('tr.zA:not([data-imp-done])');
  if (!rows.length) return;

  rows.forEach(row => {
    row.setAttribute('data-imp-done', '1');
    const subjectEl = row.querySelector('.y6 > span:first-child') || row.querySelector('.y6 span') || row.querySelector('.bog') || row.querySelector('.y6');
    const senderEl  = row.querySelector('.zF') || row.querySelector('.yX span');
    const previewEl = row.querySelector('.y2');
    if (!subjectEl) return;

    const subject = subjectEl.textContent.trim();
    const sender  = senderEl ? senderEl.getAttribute('name') || senderEl.textContent.trim() : '';
    const preview = previewEl ? previewEl.textContent.trim() : '';

    const level = scoreImportanceHeuristic(subject, preview, sender);
    const imp = IMP[level];

    const badge = document.createElement('span');
    badge.className = 'ai-imp-badge';
    badge.style.cssText = `display:inline-flex;align-items:center;gap:3px;font-size:10px;font-weight:700;letter-spacing:.5px;padding:2px 8px;border-radius:100px;margin-left:8px;vertical-align:middle;white-space:nowrap;cursor:default;line-height:1.6;font-family:Inter,Segoe UI,sans-serif;color:${imp.color};background:${imp.bg};border:1px solid ${imp.border}`;
    badge.textContent = `${imp.emoji} ${imp.label}`;
    
    if (subjectEl.parentNode) {
      subjectEl.parentNode.insertBefore(badge, subjectEl.nextSibling);
    }
  });
}

function scanYesterdayUnread() {
  const isYesterday = (d) => {
    if (!d || isNaN(d.getTime())) return false;
    const y = new Date(); y.setDate(y.getDate() - 1);
    return d.toDateString() === y.toDateString();
  };

  const found = [];
  document.querySelectorAll('tr.zA').forEach(row => {
    if (!row.classList.contains('zE')) return; // must be unread
    
    const span = row.querySelector('.xW span[title]') || row.querySelector('.yi span[title]') || row.querySelector('span[title]');
    if (!span) return;
    const date = new Date(span.getAttribute('title') || span.textContent);
    if (!isYesterday(date)) return;

    const subjectEl = row.querySelector('.y6 > span:first-child') || row.querySelector('.y6 span') || row.querySelector('.bog');
    const senderEl  = row.querySelector('.zF') || row.querySelector('.yX span');
    const previewEl = row.querySelector('.y2');

    const subject = subjectEl?.textContent?.trim() || '(No subject)';
    const sender  = senderEl?.textContent?.trim()  || 'Unknown sender';
    const preview = previewEl?.textContent?.trim() || '';
    const level   = scoreImportanceHeuristic(subject, preview, sender);

    found.push({ subject, sender, preview, level, date });
  });

  const order = { critical:0, high:1, medium:2, low:3 };
  return found.sort((a, b) => order[a.level] - order[b.level]);
}

function showSummaryModal(emails, auto) {
  document.getElementById('ys-summary-overlay')?.remove();
  const y = new Date(); y.setDate(y.getDate() - 1);
  const dateStr = y.toLocaleDateString(undefined, { weekday:'long', month:'long', day:'numeric' });

  const groups = { critical:[], high:[], medium:[], low:[] };
  emails.forEach(e => groups[e.level].push(e));

  const renderGroup = (level, list) => {
    if (!list.length) return '';
    const imp = IMP[level];
    return `
      <div class="ys-group">
        <div class="ys-group-header" style="color:${imp.color};border-color:${imp.border}">
          ${imp.emoji} ${imp.label} Priority <span class="ys-group-count">${list.length}</span>
        </div>
        ${list.map(e => `
          <div class="ys-email-card" style="border-left:3px solid ${imp.color}">
            <div class="ys-email-sender">${e.sender}</div>
            <div class="ys-email-subject">${e.subject}</div>
            ${e.preview ? `<div class="ys-email-preview">${e.preview.slice(0,120)}...</div>` : ''}
          </div>
        `).join('')}
      </div>`;
  };

  const overlay = document.createElement('div');
  overlay.id = 'ys-summary-overlay';
  overlay.innerHTML = `
    <div class="ys-backdrop"></div>
    <div class="ys-modal">
      <div class="ys-header">
        <div class="ys-header-left">
          <div class="ys-icon">📬</div>
          <div><div class="ys-title">Yesterday's Unread Summary</div><div class="ys-date">${dateStr}</div></div>
        </div>
        <button class="ys-close" id="ys-close-btn">✕</button>
      </div>
      ${emails.length === 0 ? `
        <div class="ys-empty">
          <div class="ys-empty-icon">🎉</div>
          <div class="ys-empty-title">All caught up!</div>
          <div class="ys-empty-sub">No unread emails from yesterday were found in your inbox.</div>
        </div>
      ` : `
        <div class="ys-stats">
          <div class="ys-stat-box"><div class="ys-stat-num">${emails.length}</div><div class="ys-stat-label">Unread</div></div>
          <div class="ys-stat-box" style="border-color:rgba(239,68,68,.3);background:rgba(239,68,68,.06)">
            <div class="ys-stat-num" style="color:#ef4444">${groups.critical.length + groups.high.length}</div>
            <div class="ys-stat-label">Need Attention</div>
          </div>
        </div>
        <div class="ys-body">
          ${renderGroup('critical', groups.critical)}
          ${renderGroup('high', groups.high)}
          ${renderGroup('medium', groups.medium)}
          ${renderGroup('low', groups.low)}
        </div>
      `}
    </div>
  `;
  document.body.appendChild(overlay);
  const close = () => { overlay.classList.add('ys-fading'); setTimeout(() => overlay.remove(), 350); };
  document.getElementById('ys-close-btn').onclick = close;
  overlay.querySelector('.ys-backdrop').onclick = close;
}

// ── Observer & Setup ────────────────────────────────────────────────────────

let debounceTimer = null;
const observer = new MutationObserver(() => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    injectInboxBadges();
    extractAndAnalyzeCurrentEmail(); // <-- Now handles both Reply Panel & Phishing
  }, 700);
});
observer.observe(document.body, {childList: true, subtree: true});

setTimeout(() => {
  injectInboxBadges();
  extractAndAnalyzeCurrentEmail();
  if (!sessionStorage.getItem('pg-summary-shown')) {
    sessionStorage.setItem('pg-summary-shown', '1');
    const emails = scanYesterdayUnread();
    if (emails.length > 0) showSummaryModal(emails, true);
  }
}, 2500);

document.addEventListener('pg-show-summary', () => showSummaryModal(scanYesterdayUnread(), false));
document.addEventListener('phishing-manual-scan', () => { lastAnalyzedSubject = ''; extractAndAnalyzeCurrentEmail(); });

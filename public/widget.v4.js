(function() {
  // ---- Read config from the <script> tag ----
  const currentScript = document.currentScript;
  const ENDPOINT = currentScript.getAttribute('data-endpoint');
  const ACCENT   = currentScript.getAttribute('data-accent') || '#0a2342';
  const TEXT     = currentScript.getAttribute('data-text')   || '#111827';
  const AVATAR   = currentScript.getAttribute('data-avatar');     // NEW
  if (!ENDPOINT) { console.warn('[FifthQtr Mascot] Missing data-endpoint'); return; }

  const starters = [
    "My partner retired from footy 15 years ago and now gets headaches and forgets tasks — what should we do?",
    "I’m a retired player with mood swings and poor sleep — where can I find support?",
    "I left football 10+ years ago — are there Australian clinics that check memory and thinking?",
    "I’m caring for a former teammate with worsening headaches and anxiety — what help is available for partners/carers?",
    "What’s the difference between post-concussion symptoms and CTE, and where can I read reliable info?"
  ];

  // ---- Styles (bubble is bigger; avatars reused in header + note) ----
  const css = `
  :root{--fqm-bg:#fff;--fqm-text:${TEXT};--fqm-accent:${ACCENT};--fqm-border:#e5e7eb;--fqm-shadow:0 16px 40px rgba(0,0,0,.22)}
  .fqm-fab{
    position:fixed;right:24px;bottom:24px;
    width:96px;height:96px;              /* bigger bubble */
    border-radius:9999px;
    box-shadow:var(--fqm-shadow);
    background:var(--fqm-bg);
    display:flex;align-items:center;justify-content:center;
    cursor:pointer;border:2px solid var(--fqm-border);
    z-index:2147483000;transition:transform .12s, box-shadow .12s;
    overflow:hidden;                      /* clip avatar circle */
  }
  .fqm-fab:hover{transform:translateY(-1px);box-shadow:0 20px 44px rgba(0,0,0,.26)}
  .fqm-fab img{width:100%;height:100%;object-fit:cover;display:block}

  .fqm-panel{position:fixed;right:24px;bottom:128px;width:380px;max-width:92vw;background:var(--fqm-bg);border:1px solid var(--fqm-border);border-radius:16px;box-shadow:var(--fqm-shadow);overflow:hidden;display:none;z-index:2147483000;color:var(--fqm-text);font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}
  .fqm-header{display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--fqm-text);color:#fff}
  .fqm-header h3{margin:0;font-size:14px;font-weight:700}
  .fqm-actions{margin-left:auto; display:flex; gap:8px}
  .fqm-actions button{background:#ffffff22;color:#fff;border:1px solid #ffffff55;border-radius:8px;padding:6px 8px;font-size:12px;cursor:pointer}
  .fqm-actions button:hover{background:#ffffff33}
  .fqm-close{margin-left:6px;font-size:18px;cursor:pointer;opacity:.9}

  .fqm-body{padding:12px;max-height:60vh;overflow:auto;background:#fff}
  .fqm-starters{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 6px}
  .fqm-starters button{font-size:12px;padding:8px 10px;border-radius:9999px;border:1px solid var(--fqm-border);background:#f9fafb;cursor:pointer}

  .fqm-msg{margin:10px 0}
  .fqm-msg .b{background:#eef2ff;text-align:right}
  .fqm-msg .a{background:#f3f4f6}
  .fqm-bubble{display:inline-block;padding:10px 12px;border-radius:14px;max-width:90%;white-space:pre-wrap}

  .fqm-input{display:flex;gap:8px;padding:10px 12px;border-top:1px solid var(--fqm-border);background:#fff}
  .fqm-input input{flex:1;border:1px solid var(--fqm-border);border-radius:10px;padding:10px;font-size:14px}
  .fqm-input button{border:1px solid var(--fqm-border);background:#fff;border-radius:10px;padding:10px 12px;cursor:pointer}

  .fqm-disclaimer{font-size:11px;color:#6b7280;padding:0 12px 10px;line-height:1.3;background:#fff}

  .fqm-avatar{width:32px;height:32px;border-radius:9999px;background:#fff;border:1px solid var(--fqm-border);overflow:hidden}
  .fqm-header .fqm-avatar{width:36px;height:36px} /* slightly larger in header */

  .fqm-head{display:flex;align-items:center;gap:10px}
  .fqm-avatar img{width:100%;height:100%;object-fit:cover;display:block}

  .fqm-toast{position:fixed;right:24px;bottom:120px;background:#111827;color:#fff;padding:8px 10px;border-radius:8px;font-size:12px;opacity:0;transition:opacity .2s;z-index:2147483001}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---- Floating bubble (uses avatar image if provided) ----
  const fab = document.createElement('div');
  fab.className = 'fqm-fab'; fab.id = 'fqm-fab'; fab.setAttribute('title','FifthQtr Mascot');
  if (AVATAR) {
    const img = document.createElement('img');
    img.src = AVATAR; img.alt = 'FifthQtr Mascot';
    fab.appendChild(img);
  } else {
    // Fallback simple SVG
    fab.innerHTML = '<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">'
      + '<circle cx="32" cy="20" r="12" fill="var(--fqm-text)"/>'
      + '<rect x="18" y="34" width="28" height="18" rx="9" fill="var(--fqm-text)"/>'
      + '<path d="M20 26c3 4 9 6 12 6s9-2 12-6" stroke="#fff" stroke-width="3" fill="none"/>'
      + '</svg>';
  }
  document.body.appendChild(fab);

  // ---- Panel UI (header + note avatars will be filled below) ----
  const panel = document.createElement('div');
  panel.className = 'fqm-panel'; panel.id = 'fqm-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true'); panel.setAttribute('aria-labelledby','fqm-title');
  panel.innerHTML = `
    <div class="fqm-header">
      <div class="fqm-avatar" aria-hidden="true" id="fqm-header-avatar"></div>
      <h3 id="fqm-title">FifthQtr Mascot (Beta)</h3>
      <div class="fqm-actions">
        <button id="fqm-copy">Copy for GP</button>
        <button id="fqm-reset" title="Clear chat">Reset</button>
      </div>
      <div class="fqm-close" id="fqm-close" aria-label="Close">✕</div>
    </div>
    <div class="fqm-body">
      <div class="fqm-head" role="note">
        <div class="fqm-avatar" aria-hidden="true" id="fqm-note-avatar"></div>
        <div><strong>Supporting past players & families.</strong><br>Information only — not a medical diagnosis. In an emergency call 000.</div>
      </div>
      <div class="fqm-starters" id="fqm-starters"></div>
      <div id="fqm-messages" aria-live="polite"></div>
    </div>
    <div class="fqm-input">
      <input id="fqm-input" placeholder="Type your question…" aria-label="Message input"/>
      <button id="fqm-send" aria-label="Send message">Send</button>
    </div>
    <div class="fqm-disclaimer">This service provides general information only. Please see your GP for medical advice. In an emergency call <strong>000</strong>.</div>`;
  document.body.appendChild(panel);

  // ---- Fill the two panel avatars with the same image (or fallback) ----
  (function initAvatars(){
    const els = [panel.querySelector('#fqm-header-avatar'), panel.querySelector('#fqm-note-avatar')];
    if (AVATAR) {
      els.forEach(el => {
        if (!el) return;
        el.innerHTML = `<img src="${AVATAR}" alt="FifthQtr Mascot">`;
      });
    } else {
      els.forEach(el => { if (el) el.style.background = 'var(--fqm-text)'; });
    }
  })();

  // ---- Toast for feedback (copy/reset) ----
  const toast = document.createElement('div');
  toast.className = 'fqm-toast'; toast.id = 'fqm-toast'; toast.textContent = 'Copied';
  document.body.appendChild(toast);
  function showToast(msg){ toast.textContent=msg; toast.style.opacity=1; setTimeout(()=>toast.style.opacity=0, 1400); }

  // ---- State & handles ----
  const history = [];
  const closeBtn = panel.querySelector('#fqm-close');
  const copyBtn  = panel.querySelector('#fqm-copy');
  const resetBtn = panel.querySelector('#fqm-reset');
  const startersEl = panel.querySelector('#fqm-starters');
  const msgsEl = panel.querySelector('#fqm-messages');
  const inputEl = panel.querySelector('#fqm-input');
  const sendBtn = panel.querySelector('#fqm-send');

  function togglePanel(show){ panel.style.display = show ? 'block' : 'none'; if (show) setTimeout(()=>inputEl.focus(), 50); }
  fab.addEventListener('click', ()=>togglePanel(true));
  closeBtn.addEventListener('click', ()=>togglePanel(false));

  starters.forEach(s=>{ const b=document.createElement('button'); b.textContent=s; b.addEventListener('click', ()=>sendMsg(s)); startersEl.appendChild(b); });

  function push(role, text){
    const wrap = document.createElement('div'); wrap.className='fqm-msg';
    const bubble = document.createElement('div'); bubble.className='fqm-bubble '+(role==='user'?'b':'a');
    bubble.textContent = text; wrap.appendChild(bubble); msgsEl.appendChild(wrap);
    msgsEl.scrollTop = msgsEl.scrollHeight;
    history.push({ role, text, ts: Date.now() });
  }

  async function sendMsg(text){
    if (!text) text = inputEl.value;
    if (!text.trim()) return;
    push('user', text); inputEl.value='';
    try {
      const r = await fetch(ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: text }) });
      const j = await r.json();
      push('assistant', j.output || 'Sorry—I could not generate a response.');
    } catch (e) {
      push('assistant','Sorry—network error.');
    }
  }

  function formatForGP(){
    const header = `FifthQtr Mascot — Conversation Summary\n(Date: ${new Date().toLocaleString()})\n\n`;
    const body = history.map(h => (h.role==='user' ? 'You: ' : 'Mascot: ') + h.text).join('\n\n');
    const footer = `\n\n—\nThis summary contains general information only and is not a medical diagnosis. In an emergency call 000.`;
    return header + body + footer;
  }

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(formatForGP());
      showToast('Summary copied for your GP');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = formatForGP(); ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      showToast('Summary copied');
    }
  });

  resetBtn.addEventListener('click', () => {
    history.length = 0;
    msgsEl.innerHTML = '';
    showToast('Chat cleared');
  });

  sendBtn.addEventListener('click', ()=>sendMsg(''));
  inputEl.addEventListener('keydown', e=>{ if(e.key==='Enter') sendMsg(''); });
})();

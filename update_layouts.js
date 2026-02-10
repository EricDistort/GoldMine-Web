const fs = require('fs');
const path = require('path');

const PAGES_TO_UPDATE = [
  ['withdraw.html', 'Wallet'],
  ['sendMoney.html', 'Trade Live'],
  ['profile.html', 'Dashboard'],
  ['orders.html', 'History'],
  ['receive.html', 'Wallet'],
  ['store.html', 'Rewards'],
  ['feed.html', 'Trade Live'],
  ['help.html', 'Help & Support'],
];

const TICKER_MARKER = 'class="market-ticker"';
const RIGHT_PANEL_MARKER = 'class="right-panel"';

PAGES_TO_UPDATE.forEach(([filename, activeNav]) => {
  const filepath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`❌ ${filename} not found`);
    return;
  }

  let content = fs.readFileSync(filepath, 'utf8');
  let updated = false;

  // Skip if already updated
  if (content.includes(TICKER_MARKER) && content.includes(RIGHT_PANEL_MARKER)) {
    console.log(`⏭️  ${filename} already updated`);
    return;
  }

  // 1. Add ticker after <body>
  if (!content.includes(TICKER_MARKER)) {
    const tickerHTML = `    <div class="market-ticker">
      <div class="ticker-track">
        <div class="ticker-item"><span>BTC/USD</span> <span class="t-up">▲ $98,420</span></div>
        <div class="ticker-item"><span>ETH/USD</span> <span class="t-down">▼ $2,840</span></div>
        <div class="ticker-item"><span>SOL/USD</span> <span class="t-up">▲ $142.50</span></div>
        <div class="ticker-item"><span>BNB/USD</span> <span class="t-up">▲ $612.00</span></div>
        <div class="ticker-item"><span>XRP/USD</span> <span class="t-down">▼ $0.55</span></div>
      </div>
    </div>

    <div class="layout-container">`;
    
    content = content.replace(/<body>\s*\n\s*<nav class="sidebar">/i, `<body>\n${tickerHTML}\n      <nav class="sidebar">`);
    updated = true;
  }

  // 2. Add right panel + traders script
  if (!content.includes(RIGHT_PANEL_MARKER)) {
    const rightPanelHTML = `    </div>

    <aside class="right-panel">
      <div class="panel-header">
        <span class="panel-title">👥 Top Traders</span>
        <span class="view-all-link">View All</span>
      </div>
      <div id="tradersList" class="traders-list-container">
        <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
          <div style="font-size: 12px">Connecting...</div>
        </div>
      </div>
    </aside>
    </div>`;

    const tradersScript = `
    <script type="module">
      import { supabase } from "./supabaseClient.js";
      async function loadTraders() {
        try {
          const { data } = await supabase.from("fake_traders").select("id, name, image_url, designation").limit(8);
          if (data) {
            const traders = data.map(t => ({ ...t, amount: Math.floor(Math.random() * 5000) + 500, trend: "up" }));
            renderTraders(traders);
            setInterval(() => simulateTraders(traders), 800);
          }
        } catch (err) { console.error(err); }
      }
      function renderTraders(traders) {
        const container = document.getElementById("tradersList");
        if (!container) return;
        container.innerHTML = traders.map((t, i) => \`<div class="trader-row" onclick="window.location.href='sendMoney.html'">
          <img src="\${t.image_url}" class="trader-avatar" onerror="this.src='https://ai-public.creatie.ai/gen_page/f94b41a0-8e68-41ab-a41a-fabb8fb0db88/avatar.webp'">
          <div class="trader-details"><span class="t-name">\${t.name}</span><span class="t-role">\${t.designation}</span></div>
          <div class="t-profit t-up">+\${t.amount.toFixed(2)}%</div></div>\`).join("");
      }
      function simulateTraders(traders) {
        traders.forEach((t, i) => {
          const profitEl = document.querySelector(\`.trader-row:nth-child(\${i + 1}) .t-profit\`);
          if (profitEl) {
            const change = Math.random() * 40 - 20;
            profitEl.className = \`t-profit \${change >= 0 ? 't-up' : 't-down'}\`;
            profitEl.innerText = \`\${change >= 0 ? '+' : ''}\${(t.amount + change).toFixed(2)}%\`;
          }
        });
      }
      loadTraders();
    </script>`;

    // Find closing divs before script
    content = content.replace(/<\/div>\s*<\/div>\s*<script[^>]*>/i, `${rightPanelHTML}\n\n    <script>`);
    
    // Add traders script before </body>
    if (!content.includes('loadTraders')) {
      content = content.replace(/<\/body>/i, `${tradersScript}\n  </body>`);
    }
    
    updated = true;
  }

  // 3. Update CSS if needed
  if (updated && !content.includes('.market-ticker {')) {
    const cssAdditions = `
      /* --- MARKET TICKER --- */
      .market-ticker { background: #000000; border-bottom: 1px solid rgba(139, 92, 246, 0.15); overflow: hidden; display: flex; align-items: center; white-space: nowrap; font-family: "JetBrains Mono", monospace; font-size: 11px; font-weight: 500; backdrop-filter: blur(10px); }
      .ticker-track { display: flex; animation: ticker 40s linear infinite; gap: 60px; }
      .ticker-item { display: flex; gap: 12px; padding: 8px 0; color: rgba(168, 181, 201, 0.9); align-items: center; }
      .t-up { color: #2dd4bf; font-weight: 700; }
      .t-down { color: #f43f5e; font-weight: 700; }
      @keyframes ticker { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      body { height: 100vh !important; overflow: hidden !important; display: grid !important; grid-template-rows: 48px 1fr !important; }
      .layout-container { display: grid !important; grid-template-columns: 270px 1fr 360px !important; height: 100% !important; overflow: hidden !important; gap: 0 !important; }
      .right-panel { background: linear-gradient(135deg, rgba(8, 4, 18, 0.92), rgba(5, 30, 50, 0.88)); border-left: 1.5px solid rgba(139, 92, 246, 0.15); padding: 24px 20px; display: flex; flex-direction: column; gap: 16px; overflow-y: auto; overflow-x: hidden; backdrop-filter: blur(30px); }
      .right-panel::-webkit-scrollbar { width: 5px; }
      .right-panel::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4)); border-radius: 10px; }
      .panel-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 1px solid rgba(139, 92, 246, 0.15); }
      .panel-title { font-size: 15px; font-weight: 700; background: linear-gradient(90deg, #8b5cf6, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
      .view-all-link { font-size: 11px; color: rgba(139, 92, 246, 0.7); cursor: pointer; }
      .traders-list-container { display: flex; flex-direction: column; gap: 12px; }
      .trader-row { display: flex; align-items: center; background: linear-gradient(135deg, rgba(10, 5, 25, 0.85), rgba(15, 8, 30, 0.75)); border: 1.5px solid rgba(139, 92, 246, 0.2); border-radius: 10px; padding: 12px; cursor: pointer; transition: all 0.3s; }
      .trader-row:hover { border-color: rgba(236, 72, 153, 0.4); transform: translateY(-3px); }
      .trader-avatar { width: 36px; height: 36px; border-radius: 8px; margin-right: 12px; flex-shrink: 0; }
      .trader-details { flex: 1; }
      .t-name { font-size: 12px; font-weight: 600; color: #e0e7ff; }
      .t-role { font-size: 10px; color: rgba(168, 181, 201, 0.6); }`;
    
    content = content.replace(/<\/style>/, `${cssAdditions}\n</style>`);
  }

  // 4. Update container CSS for proper layout
  if (content.includes('class="container"') && !content.includes('overflow-y: auto;')) {
    content = content.replace(/(\.container\s*\{[^}]*?)width:\s*100%;[^}]*(max-width:\s*1200px;)?[^}]*/g, '$1overflow-y: auto; padding: 32px;$2');
  }

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ ${filename} updated - Active Nav: ${activeNav}`);
});

console.log('\n🎉 All pages updated with 3-column layout!');

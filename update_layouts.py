#!/usr/bin/env python3
"""
Auto-update all crypto-web pages to have main.html 3-column layout
Usage: python3 update_layouts.py
"""

import os
import re
from pathlib import Path

PAGES_TO_UPDATE = [
    ('withdraw.html', 'Wallet'),
    ('sendMoney.html', 'Trade Live'),
    ('profile.html', 'Dashboard'),
    ('orders.html', 'History'),
    ('receive.html', 'Wallet'),
    ('store.html', 'Rewards'),
    ('feed.html', 'Trade Live'),
    ('help.html', 'Help & Support'),
]

TICKER_HTML = '''    <div class="market-ticker">
      <div class="ticker-track">
        <div class="ticker-item"><span>BTC/USD</span> <span class="t-up">▲ $98,420</span></div>
        <div class="ticker-item"><span>ETH/USD</span> <span class="t-down">▼ $2,840</span></div>
        <div class="ticker-item"><span>SOL/USD</span> <span class="t-up">▲ $142.50</span></div>
        <div class="ticker-item"><span>BNB/USD</span> <span class="t-up">▲ $612.00</span></div>
        <div class="ticker-item"><span>XRP/USD</span> <span class="t-down">▼ $0.55</span></div>
      </div>
    </div>

    <div class="layout-container">'''

RIGHT_PANEL_HTML = '''    </div>

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
    </div>'''

TRADERS_SCRIPT = '''
    <script type="module">
      import { supabase } from "./supabaseClient.js";

      async function loadTraders() {
        try {
          const { data } = await supabase
            .from("fake_traders")
            .select("id, name, image_url, designation")
            .limit(8);

          if (data) {
            const traders = data.map(t => ({
              ...t,
              amount: Math.floor(Math.random() * 5000) + 500,
              trend: "up",
            }));
            
            renderTraders(traders);
            setInterval(() => simulateTraders(traders), 800);
          }
        } catch (err) {
          console.error("Error loading traders:", err);
        }
      }

      function renderTraders(traders) {
        const container = document.getElementById("tradersList");
        if (!container) return;
        
        container.innerHTML = traders.map(t => `
          <div class="trader-row" onclick="window.location.href='sendMoney.html'">
            <img src="${t.image_url}" class="trader-avatar" onerror="this.src='https://ai-public.creatie.ai/gen_page/f94b41a0-8e68-41ab-a41a-fabb8fb0db88/avatar.webp'">
            <div class="trader-details">
              <span class="t-name">${t.name}</span>
              <span class="t-role">${t.designation}</span>
            </div>
            <div class="t-profit t-up">+${t.amount.toFixed(2)}%</div>
          </div>
        `).join("");
      }

      function simulateTraders(traders) {
        traders.forEach((t, i) => {
          const profitEl = document.querySelector(`.trader-row:nth-child(${i + 1}) .t-profit`);
          if (profitEl) {
            const change = Math.random() * 40 - 20;
            profitEl.className = `t-profit ${change >= 0 ? 't-up' : 't-down'}`;
            profitEl.innerText = `${change >= 0 ? '+' : ''}${(t.amount + change).toFixed(2)}%`;
          }
        });
      }

      loadTraders();
    </script>'''

CSS_ADDITIONS = '''
      /* --- MARKET TICKER --- */
      .market-ticker {
        background: #000000;
        border-bottom: 1px solid rgba(139, 92, 246, 0.15);
        overflow: hidden;
        display: flex;
        align-items: center;
        white-space: nowrap;
        font-family: "JetBrains Mono", monospace;
        font-size: 11px;
        font-weight: 500;
        backdrop-filter: blur(10px);
      }

      .ticker-track {
        display: flex;
        animation: ticker 40s linear infinite;
        gap: 60px;
      }

      .ticker-item {
        display: flex;
        gap: 12px;
        padding: 8px 0;
        color: rgba(168, 181, 201, 0.9);
        align-items: center;
      }

      .t-up { color: #2dd4bf; font-weight: 700; }
      .t-down { color: #f43f5e; font-weight: 700; }

      @keyframes ticker {
        0% { transform: translateX(100%); }
        100% { transform: translateX(-100%); }
      }

      /* --- UPDATE BODY --- */
      body {
        height: 100vh;
        overflow: hidden;
        display: grid !important;
        grid-template-rows: 48px 1fr !important;
      }

      .layout-container {
        display: grid !important;
        grid-template-columns: 270px 1fr 360px !important;
        height: 100% !important;
        overflow: hidden !important;
      }

      /* --- RIGHT PANEL --- */
      .right-panel {
        background: linear-gradient(135deg, rgba(8, 4, 18, 0.92), rgba(5, 30, 50, 0.88));
        border-left: 1.5px solid rgba(139, 92, 246, 0.15);
        padding: 24px 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow-y: auto;
        overflow-x: hidden;
        backdrop-filter: blur(30px);
      }

      .right-panel::-webkit-scrollbar { width: 5px; }
      .right-panel::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(139, 92, 246, 0.4), rgba(236, 72, 153, 0.4)); border-radius: 10px; }

      .panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(139, 92, 246, 0.15);
      }

      .panel-title {
        font-size: 15px;
        font-weight: 700;
        background: linear-gradient(90deg, #8b5cf6, #ec4899);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .view-all-link { font-size: 11px; color: rgba(139, 92, 246, 0.7); cursor: pointer; }

      .traders-list-container { display: flex; flex-direction: column; gap: 12px; }

      .trader-row {
        display: flex;
        align-items: center;
        background: linear-gradient(135deg, rgba(10, 5, 25, 0.85), rgba(15, 8, 30, 0.75));
        border: 1.5px solid rgba(139, 92, 246, 0.2);
        border-radius: 10px;
        padding: 12px;
        cursor: pointer;
        transition: all 0.3s;
      }

      .trader-row:hover {
        border-color: rgba(236, 72, 153, 0.4);
        transform: translateY(-3px);
      }

      .trader-avatar { width: 36px; height: 36px; border-radius: 8px; margin-right: 12px; flex-shrink: 0; }
      .trader-details { flex: 1; }
      .t-name { font-size: 12px; font-weight: 600; color: #e0e7ff; }
      .t-role { font-size: 10px; color: rgba(168, 181, 201, 0.6); }
'''

def update_page(filename, active_nav):
    filepath = Path(filename)
    if not filepath.exists():
        print(f"❌ {filename} not found")
        return False
    
    content = filepath.read_text()
    
    # 1. Add ticker before body content
    content = re.sub(r'<body>\s*<nav class="sidebar">', f'<body>\n{TICKER_HTML}\n      <nav class="sidebar">', content)
    
    # 2. Update nav active item on appropriate page
    if active_nav != 'Dashboard':
        content = re.sub(
            rf'(<div class="nav-item"[^>]*onclick="window\.location\.href = \'{filename.replace(".html", "\.html")}\'">.*?)(?<! class="active")',
            r'\1 active',
            content,
            flags=re.DOTALL
        )
    
    # 3. Add right panel before closing layout-container
    content = re.sub(r'</div>\s*</div>\s*<script', f'{RIGHT_PANEL_HTML}\n\n    <script', content)
    
    # 4. Add CSS before </style>
    if '.market-ticker' not in content:
        content = re.sub(r'(.*@keyframes colorWave.*?})\s*(</style>)', rf'\1{CSS_ADDITIONS}\2', content, flags=re.DOTALL)
    
    # 5. Add trader script before </body>
    if 'loadTraders' not in content:
        content = re.sub(r'(</script>)\s*(</body>)', rf'\1{TRADERS_SCRIPT}\n\2', content)
    
    filepath.write_text(content)
    print(f"✅ {filename} updated - Active: {active_nav}")
    return True

# Main
os.chdir(os.path.dirname(__file__) or '.')
print("🔄 Updating all pages to 3-column layout...\n")

for filename, active_nav in PAGES_TO_UPDATE:
    update_page(filename, active_nav)

print("\n✅ All pages updated with main.html layout!")

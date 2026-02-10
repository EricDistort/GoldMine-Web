const fs = require('fs');
const path = require('path');

const PAGES = [
  'withdraw.html', 'sendMoney.html', 'profile.html', 'orders.html',
  'receive.html', 'store.html', 'feed.html', 'help.html'
];

PAGES.forEach(filename => {
  const filepath = path.join(__dirname, filename);
  if (!fs.existsSync(filepath)) return;

  let content = fs.readFileSync(filepath, 'utf8');

  // FIX 1: Update body CSS to grid 100vh
  content = content.replace(
    /body\s*\{[^}]*?(background:[^;]*;[^}]*?)(?:width:\s*100%;[^}]*?|min-height:\s*100vh;[^}]*?|display:\s*flex;[^}]*?)*([^}]*?)\}/s,
    (match, bg, rest) => {
      const hasGrid = match.includes('grid-template-rows');
      if (hasGrid) return match;
      return `body {${bg}height: 100vh !important; overflow: hidden !important; display: grid !important; grid-template-rows: 48px 1fr !important;${rest}}`;
    }
  );

  // FIX 2: Update layout-container to 3-column grid
  content = content.replace(
    /\.layout-container\s*\{[^}]*?(grid-template-columns:\s*270px\s+1fr);?[^}]*?(width:\s*100%;)?[^}]*?(height:\s*100vh;)?[^}]*?(overflow:\s*hidden;)?[^}]*?\}/s,
    `.layout-container {
        display: grid !important;
        grid-template-columns: 270px 1fr 360px !important;
        height: 100% !important;
        overflow: hidden !important;
        gap: 0 !important;
    }`
  );

  // FIX 3: Update .container CSS to not have width/max-width/margin constraints
  content = content.replace(
    /\.container\s*\{([^}]*?)(width:\s*100%;)?([^}]*?)(max-width:\s*[^;]+;)?([^}]*?)(margin-left:\s*270px;)?([^}]*?)\}/s,
    (match, p1, p2, p3, p4, p5, p6, p7) => {
      // Remove width, max-width, margin-left
      let cleaned = match
        .replace(/width:\s*100%;/g, '')
        .replace(/max-width:\s*[^;]+;/g, '')
        .replace(/margin-left:\s*270px;/g, '')
        .replace(/overflow-x:\s*hidden;/g, '');
      
      // Add required properties if not present
      if (!match.includes('overflow-y:')) {
        cleaned = cleaned.replace(/\.container\s*\{/, '.container { overflow-y: auto; padding: 32px;');
      }
      return cleaned;
    }
  );

  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`✅ CSS fixed: ${filename}`);
});

console.log('\n🎉 All CSS fixes applied!');

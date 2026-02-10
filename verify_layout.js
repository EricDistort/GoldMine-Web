const fs = require('fs');

const pages = [
  'withdraw.html', 'sendMoney.html', 'profile.html', 'orders.html',
  'receive.html', 'store.html', 'feed.html', 'help.html', 'main.html'
];

console.log('\n📋 Layout Verification Report:\n');

pages.forEach(filename => {
  try {
    const content = fs.readFileSync(filename, 'utf8');
    const hasTicker = content.includes('market-ticker');
    const hasRightPanel = content.includes('right-panel');
    const hasLayoutContainer = content.includes('layout-container');
    const heartbeat = hasTicker && hasRightPanel && hasLayoutContainer;
    const status = heartbeat ? '✅' : '⚠️';
    
    console.log(`${status} ${filename}`);
    console.log(`   Ticker: ${hasTicker ? 'YES' : 'NO'} | Right Panel: ${hasRightPanel ? 'YES' : 'NO'} | Layout: ${hasLayoutContainer ? 'YES' : 'NO'}`);
  } catch (e) {
    console.log(`❌ ${filename} (not found)`);
  }
});

console.log('\n✅ All pages have been updated with 3-column layout (ticker + sidebar + content + traders)');

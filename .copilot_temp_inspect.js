const fs = require('fs');
const path = 'C:\\Users\\juame\\Mundial-2026\\frontend\\world-cup-2026\\src\\pages\\Profile.tsx';
const s = fs.readFileSync(path,'utf8');
const lines = s.split(/\r?\n/);
const start = 870, end = 905;
const snippet = lines.slice(start-1,end).join('\n');
console.log('--- SNIPPET ---');
console.log(snippet);
console.log('--- CHARS ---');
for(let i=0;i<snippet.length;i++){
  const ch = snippet.charCodeAt(i);
  if(ch<32||ch>126) process.stdout.write(`\\u${ch.toString(16).padStart(4,'0')}`);
  else process.stdout.write(snippet[i]);
}
console.log('\n--- DONE ---');

const fs = require('fs');
const p = 'C:/Users/juame/Mundial-2026/frontend/world-cup-2026/src/pages/Profile.tsx';
const raw = fs.readFileSync(p);
const s = raw.toString('utf8');
const lines = s.split(/\r?\n/);
let pos = 0;
const targetLine = 898;
for (let i = 0; i < targetLine - 1 && i < lines.length; i++) {
  pos += Buffer.from(lines[i]).length + (s.includes('\r\n') ? 2 : 1);
}
const sliceStart = Math.max(0, pos - 40);
const sliceEnd = Math.min(raw.length, pos + 200);
const slice = raw.slice(sliceStart, sliceEnd);
console.log('byteOffset', sliceStart, 'len', slice.length);
console.log('STRING:\n', slice.toString('utf8'));
console.log('\nHEX:\n', slice.toString('hex'));

// Generator script for sun_mercury.json
// This script reads partial data files and assembles the full JSON
const fs = require('fs');
const base = 'C:\\Users\\user\\.openclaw-autoclaw\\agents\\stellara-ux\\workspace\\stellar';
const target = base + '\\data\\generated\\sign_pair_combos\\sun_mercury.json';

// Read existing file
let data;
try { data = JSON.parse(fs.readFileSync(target, 'utf8')); } catch(e) { data = {}; }
// Remove placeholder
delete data['PLACEHOLDER'];

// Read all chunk files from scripts/chunks/ directory
const chunkDir = base + '\\scripts\\chunks\\';
if (fs.existsSync(chunkDir)) {
  const files = fs.readdirSync(chunkDir).filter(f => f.endsWith('.json'));
  for (const f of files) {
    const chunk = JSON.parse(fs.readFileSync(chunkDir + f, 'utf8'));
    Object.assign(data, chunk);
    console.log('Merged:', f, '- keys:', Object.keys(chunk).length);
  }
}

console.log('Total keys:', Object.keys(data).length);
fs.writeFileSync(target, JSON.stringify(data, null, 2), 'utf8');
console.log('Written to', target);

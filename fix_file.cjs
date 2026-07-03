const fs = require('fs');
const path = 'C:/Users/user/.openclaw-autoclaw/agents/stellara-ux/workspace/stellar/data/generated/sign_pair_combos/sun_mercury.json';
const f = fs.readFileSync(path, 'utf8');

// Find gemini_virgo start
const gvStart = f.indexOf('"gemini_virgo"');
console.log('gemini_virgo starts at byte:', gvStart);

// Find the last complete valid entry (variant 4 ends, variant 5 starts)
// Look for the last "needs_review": false before the truncation
const lastValid = f.lastIndexOf('"needs_review": false');
console.log('Last valid needs_review at byte:', lastValid);

// Find the end of that last valid entry (after the closing })
// Search forward from lastValid for the pattern that ends a variant
let afterLastValid = f.indexOf('}', lastValid);
// Jump past the } and any whitespace/comma
afterLastValid = f.indexOf('}', afterLastValid + 1); // second }
console.log('After last valid entry bracket at:', afterLastValid);

// Show what comes after
console.log('Context after last valid:', JSON.stringify(f.slice(afterLastValid, afterLastValid + 200)));

// Count total complete combos so far
const keys = [];
const keyRe = /"signpair\.sun_mercury\.([^"]+)"/g;
let m;
while ((m = keyRe.exec(f)) !== null) {
  const k = m[1];
  if (!keys.includes(k)) keys.push(k);
}
console.log('Unique keys found:', keys.length);
console.log('Keys:', keys.join(', '));

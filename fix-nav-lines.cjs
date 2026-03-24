const fs = require('fs');
const file = 'd:/Python/Portfolio/Gonish/src/components/layout/ClockSweepNav.tsx';
let content = fs.readFileSync(file, 'utf8');

let lines = content.split(/\r?\n/);

// Replace lines 65-74 (0-indexed 64-73)
lines[64] = "const slotMotionMap: Record<";
lines[65] = "  DialSlot,";
lines[66] = "  { angle: number; inset: number; startAngle: number; startInset: number }";
lines[67] = "> = {";
lines[68] = "  main: { angle: 302, inset: 3.875, startAngle: -14, startInset: 6.625 },";
lines[69] = "  about: { angle: 24, inset: 3.625, startAngle: 10, startInset: 6.5 },";
lines[70] = "  estimate: { angle: 86, inset: 3.375, startAngle: 44, startInset: 6.25 },";
lines[71] = "  portfolio: { angle: 226, inset: 3.25, startAngle: 140, startInset: 5.875 },";
lines[72] = "  contact: { angle: 152, inset: 3.875, startAngle: 92, startInset: 6.25 },";
lines[73] = "};";

// Replace lines 989-995 (0-indexed 988-994)
lines[988] = "                  const motion = slotMotionMap[item.slot];";
lines[989] = "";
lines[990] = "";
lines[991] = "";
lines[992] = "";
lines[993] = "";
lines[994] = "";

// Find --item-radius by searching near 1000
for (let i = 995; i < 1050; i++) {
    if (lines[i] && lines[i].includes('"--item-radius"')) {
        lines[i] = "                    '--item-radius': `calc(var(--dial-size) * 0.5 - ${motion.inset}rem)`,";
        lines[i+1] = "                    '--item-start-radius': `calc(var(--dial-size) * 0.5 - ${motion.startInset}rem)`,";
        break;
    }
}

content = lines.join('\n');
fs.writeFileSync(file, content);
console.log('Script line replacement executed');

const fs = require('fs');
const file = 'd:/Python/Portfolio/Gonish/src/components/layout/ClockSweepNav.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex1 = /const slotMotionMap(?:[\s\S]*?)radius:\s*number;\s*startAngle(?:[\s\S]*?)startRadius: 88 \},\r?\n\};\r?\n/m;
const replace1 = `const slotMotionMap: Record<
  DialSlot,
  { angle: number; inset: number; startAngle: number; startInset: number }
> = {
  main: { angle: 302, inset: 3.875, startAngle: -14, startInset: 6.625 },
  about: { angle: 24, inset: 3.625, startAngle: 10, startInset: 6.5 },
  estimate: { angle: 86, inset: 3.375, startAngle: 44, startInset: 6.25 },
  portfolio: { angle: 226, inset: 3.25, startAngle: 140, startInset: 5.875 },
  contact: { angle: 152, inset: 3.875, startAngle: 92, startInset: 6.25 },
};\n`;

const regex2 = /\"--item-radius\":.*(?:[\s\S]*?)\"--item-start-radius\":.*/m;
const replace2 = `\"--item-radius\": \`calc(var(--dial-size) * 0.5 - \${motion.inset}rem)\`,
                    \"--item-start-radius\": \`calc(var(--dial-size) * 0.5 - \${motion.startInset}rem)\``;

content = content.replace(regex1, replace1).replace(regex2, replace2);
fs.writeFileSync(file, content);
console.log('Done replacement');

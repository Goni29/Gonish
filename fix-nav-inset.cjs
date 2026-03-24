const fs = require('fs');
const file = 'd:/Python/Portfolio/Gonish/src/components/layout/ClockSweepNav.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `const slotMotionMap: Record<
  DialSlot,
  { angle: number; radius: number; startAngle: number; startRadius: number }
> = {
  main: { angle: 302, radius: 126, startAngle: -14, startRadius: 82 },
  about: { angle: 24, radius: 130, startAngle: 10, startRadius: 84 },
  estimate: { angle: 86, radius: 134, startAngle: 44, startRadius: 88 },
  portfolio: { angle: 226, radius: 136, startAngle: 140, startRadius: 94 },
  contact: { angle: 152, radius: 126, startAngle: 92, startRadius: 88 },
};`;

const replace1 = `const slotMotionMap: Record<
  DialSlot,
  { angle: number; inset: number; startAngle: number; startInset: number }
> = {
  main: { angle: 302, inset: 3.875, startAngle: -14, startInset: 6.625 },
  about: { angle: 24, inset: 3.625, startAngle: 10, startInset: 6.5 },
  estimate: { angle: 86, inset: 3.375, startAngle: 44, startInset: 6.25 },
  portfolio: { angle: 226, inset: 3.25, startAngle: 140, startInset: 5.875 },
  contact: { angle: 152, inset: 3.875, startAngle: 92, startInset: 6.25 },
};`;

// Also replace the style mappings inside map
const target2 = `                    "--item-radius": \`\${motion.radius}px\`,
                    "--item-start-radius": \`\${motion.startRadius}px\`,`;

const replace2 = `                    "--item-radius": \`calc(var(--dial-size) * 0.5 - \${motion.inset}rem)\`,
                    "--item-start-radius": \`calc(var(--dial-size) * 0.5 - \${motion.startInset}rem)\`,`;

content = content.replace(target1, replace1).replace(target1.replace(/\\n/g, '\\r\\n'), replace1);
content = content.replace(target2, replace2).replace(target2.replace(/\\n/g, '\\r\\n'), replace2);

fs.writeFileSync(file, content);
console.log('TSX perfect scale fix applied.');

const fs = require('fs');
const file = 'd:/Python/Portfolio/Gonish/src/components/layout/ClockSweepNav.tsx';
let content = fs.readFileSync(file, 'utf8');

// Chunk 1
content = content.replace(
  'const slotMotionMap',
  'const baseSlotMotionMap'
);

// Chunk 2
let target2 = '  const [supportsHoverDial, setSupportsHoverDial] = useState(false);\n  const [isLogoHovered, setIsLogoHovered] = useState(false);';
let replace2 = '  const [supportsHoverDial, setSupportsHoverDial] = useState(false);\n  const [isMobileDial, setIsMobileDial] = useState(false);\n  const [isSmallMobileDial, setIsSmallMobileDial] = useState(false);\n  const [isLogoHovered, setIsLogoHovered] = useState(false);';
// Windows CRLF Support
let target2crlf = target2.replace(/\n/g, '\r\n');
content = content.replace(target2, replace2).replace(target2crlf, replace2);

// Chunk 3
let target3 = '    const mediaQuery = window.matchMedia(desktopDialQuery);\n    const updateInteractionMode = () => setSupportsHoverDial(mediaQuery.matches);\n\n    updateInteractionMode();\n\n    if (typeof mediaQuery.addEventListener === "function") {\n      mediaQuery.addEventListener("change", updateInteractionMode);\n      return () => mediaQuery.removeEventListener("change", updateInteractionMode);\n    }\n\n    mediaQuery.addListener(updateInteractionMode);\n    return () => mediaQuery.removeListener(updateInteractionMode);';
let replace3 = '    const mediaQuery = window.matchMedia(desktopDialQuery);\n    const mQuery = window.matchMedia("(max-width: 639px)");\n    const smQuery = window.matchMedia("(max-width: 359px)");\n\n    const updateInteractionMode = () => {\n      setSupportsHoverDial(mediaQuery.matches);\n      setIsMobileDial(mQuery.matches);\n      setIsSmallMobileDial(smQuery.matches);\n    };\n\n    updateInteractionMode();\n\n    if (typeof mediaQuery.addEventListener === "function") {\n      mediaQuery.addEventListener("change", updateInteractionMode);\n      mQuery.addEventListener("change", updateInteractionMode);\n      smQuery.addEventListener("change", updateInteractionMode);\n      return () => {\n        mediaQuery.removeEventListener("change", updateInteractionMode);\n        mQuery.removeEventListener("change", updateInteractionMode);\n        smQuery.removeEventListener("change", updateInteractionMode);\n      };\n    }\n\n    mediaQuery.addListener(updateInteractionMode);\n    mQuery.addListener(updateInteractionMode);\n    smQuery.addListener(updateInteractionMode);\n    return () => {\n      mediaQuery.removeListener(updateInteractionMode);\n      mQuery.removeListener(updateInteractionMode);\n      smQuery.removeListener(updateInteractionMode);\n    };';
let target3crlf = target3.replace(/\n/g, '\r\n');
content = content.replace(target3, replace3).replace(target3crlf, replace3);

// Chunk 4
let target4 = '                  const motion = slotMotionMap[item.slot];';
let replace4 = '                  const baseMotion = baseSlotMotionMap[item.slot];\n                  const radiusScale = isSmallMobileDial ? 0.74 : isMobileDial ? 0.81 : 1;\n                  const motion = {\n                    ...baseMotion,\n                    radius: baseMotion.radius * radiusScale,\n                    startRadius: baseMotion.startRadius * radiusScale,\n                  };';
content = content.replace(target4, replace4);

fs.writeFileSync(file, content);
console.log('Script execution complete.');

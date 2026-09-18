const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, '..', 'src', 'app'),
  path.join(__dirname, '..', 'src', 'components'),
];

// Color replacement mappings
const replacements = [
  // Backgrounds -> Deep Obsidian Black
  { from: /#050505/g, to: '#0B0C10' },
  { from: /#050507/g, to: '#0B0C10' },
  { from: /#08080b/g, to: '#0B0C10' },
  { from: /#060608/g, to: '#0B0C10' },
  { from: /#09090d/g, to: '#0B0C10' },

  // Surfaces / Cards -> Charcoal Slate
  { from: /#0b0b0e/g, to: '#1F2833' },
  { from: /#0B0B0E/g, to: '#1F2833' },
  { from: /#0E0E14/g, to: '#1F2833' },
  { from: /#0e0e14/g, to: '#1F2833' },
  { from: /#121218/g, to: '#1F2833' },
  { from: /#0d0d12/g, to: '#1F2833' },
  { from: /#111116/g, to: '#1F2833' },

  // Primary Text -> Platinum White
  { from: /#F4F1EA/g, to: '#F5F6FA' },
  { from: /#F5F2EA/g, to: '#F5F6FA' },
  { from: /#f4f1ea/g, to: '#F5F6FA' },

  // Secondary Text -> Muted Silver Gray
  { from: /#969696/g, to: '#8A8D93' },
  { from: /#A1A1AA/g, to: '#8A8D93' },

  // Brand Accent (CTA) -> Electric Neon Cyan
  { from: /#FF6A00/g, to: '#00E5FF' },
  { from: /#ff6a00/g, to: '#00E5FF' },
  { from: /#FF7A00/g, to: '#00E5FF' },
  { from: /#FF8400/g, to: '#00B4D8' },
  { from: /#ff8400/g, to: '#00B4D8' },
  { from: /#FFA000/g, to: '#00B4D8' },

  // RGBA shadow updates for amber -> cyan
  { from: /rgba\(255,\s*106,\s*0,\s*([0-9.]+)\)/g, to: 'rgba(0, 229, 255, $1)' },
  { from: /rgba\(255,106,0,([0-9.]+)\)/g, to: 'rgba(0,229,255,$1)' },
];

function processDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    // Do NOT modify the admin dashboard internal layout itself (which is white/slate SaaS dashboard)
    if (fullPath.includes('admin' + path.sep + '(dashboard)')) {
      continue;
    }
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (/\.(tsx|ts|css)$/.test(entry.name)) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated theme colors in:', path.relative(path.join(__dirname, '..'), fullPath));
      }
    }
  }
}

console.log('Applying theme update across public pages and components...');
for (const dir of targetDirs) {
  processDir(dir);
}
console.log('Theme update complete!');

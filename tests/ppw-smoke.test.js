// Lightweight browser-free smoke checks for PPW source files.
const fs=require('fs');const path=require('path');
const root=path.resolve(__dirname,'..');
for(const file of ['admin-v2.js','article.js','games.js','ppw-enhancements.js','ppw-final.js']){const p=path.join(root,file);if(!fs.existsSync(p))throw new Error(`Missing ${file}`);const s=fs.readFileSync(p,'utf8');if(!s.trim())throw new Error(`Empty ${file}`);new Function(s);}
console.log('PPW JavaScript smoke checks passed.');
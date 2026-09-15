// Lightweight browser-free smoke checks for the current PPW source files.
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

const files=[
  'admin-v3.js',
  'article.js',
  'games-v3.js',
  'ppw-enhancements.js',
  'ppw-page-theme.js',
  'pawword-dictionary.js',
  'category-layouts.js'
];

for(const file of files){
  const p=path.join(root,file);
  if(!fs.existsSync(p))throw new Error(`Missing ${file}`);
  const s=fs.readFileSync(p,'utf8');
  if(!s.trim())throw new Error(`Empty ${file}`);
  new Function(s);
}

console.log('PPW JavaScript smoke checks passed.');

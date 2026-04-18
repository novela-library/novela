const fs=require('fs');
let css=fs.readFileSync('style.css','utf8');
const s1=css.indexOf('/* ===== NAVBAR (topbar) ===== */');
const s2=css.indexOf('/* ===== RESPONSIVE ===== */');
const before=css.substring(0,s1);
const after=css.substring(s2);
const mid=fs.readFileSync('new_css_content.css','utf8');
fs.writeFileSync('style.css',before+mid+after,'utf8');
console.log('Done',fs.statSync('style.css').size);

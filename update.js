const fs = require('fs');

const path = 'client-react/src/styles/global.css';
let css = fs.readFileSync(path, 'utf8');

const m = css.indexOf('BLOG DETAIL v6.0');
const s = css.lastIndexOf('/* ══', m);
let e = css.indexOf('/* ══', m + 100);
if (e === -1) e = css.length; // If it's the very last thing

const newCss = `/* ════════════════════════════════════════════════
   BLOG DETAIL v6.0 — Modern Redesign
   ════════════════════════════════════════════════ */
.blog-progress-bar{position:fixed;top:0;left:0;height:4px;background:var(--primary);z-index:9999;transition:width .15s linear;border-radius:0 2px 2px 0}
.bd-page{padding:3rem 0;background:var(--bg-alt);min-height:100vh}
.bd-container{max-width:960px;margin:0 auto;position:relative}
.bd-back{display:inline-flex;align-items:center;gap:.5rem;font-size:.9rem;font-weight:600;color:var(--text-light);margin-bottom:2rem;transition:color .2s;text-decoration:none}
.bd-back:hover{color:var(--primary)}
.bd-article{background:#fff;border-radius:24px;box-shadow:0 12px 36px rgba(0,0,0,.03);overflow:hidden;padding:2.5rem 3rem}
.bd-header{text-align:center;margin-bottom:2.5rem}
.bd-category{display:inline-block;padding:.3rem .8rem;background:rgba(183,34,45,.06);color:var(--primary);border-radius:50px;font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:1.2rem}
.bd-title{font-size:2.8rem;font-weight:800;color:var(--dark);line-height:1.2;margin-bottom:1.5rem;letter-spacing:-.5px}
.bd-meta{display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border-light);border-bottom:1px solid var(--border-light);padding:1rem 0;margin-top:1rem}
.bd-author{display:flex;align-items:center;gap:1rem;text-align:left}
.bd-avatar{width:46px;height:46px;border-radius:50%;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem}
.bd-author-info{display:flex;flex-direction:column}
.bd-author-info strong{font-size:.95rem;color:var(--dark)}
.bd-author-info span{font-size:.8rem;color:var(--text-light)}
.bd-stats{font-size:.85rem;color:var(--text-light);display:flex;gap:1.2rem}
.bd-stats span{display:flex;align-items:center;gap:.4rem}
.bd-stats i{color:var(--primary)}
.bd-featured{margin:0 -3rem 2.5rem;overflow:hidden;position:relative;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.05)}
.bd-featured img{width:100%;height:auto;max-height:500px;object-fit:cover;display:block}
.bd-layout{display:flex;gap:3rem;position:relative}
.bd-sidebar{width:50px;flex-shrink:0}
.bd-share{position:sticky;top:100px;display:flex;flex-direction:column;align-items:center;gap:.8rem}
.bd-share p{font-size:.7rem;font-weight:700;text-transform:uppercase;color:var(--text-light);margin-bottom:.5rem;writing-mode:vertical-rl;transform:rotate(180deg);letter-spacing:2px}
.bd-social-btn{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1rem;color:#fff;border:none;cursor:pointer;transition:transform .2s,box-shadow .2s;text-decoration:none}
.bd-social-btn:hover{transform:translateY(-3px);box-shadow:0 6px 12px rgba(0,0,0,.15)}
.bd-social-btn.tw{background:#1DA1F2}
.bd-social-btn.in{background:#0077b5}
.bd-social-btn.wa{background:#25D366}
.bd-social-btn.cp{background:var(--dark)}
.bd-content{flex:1;min-width:0;max-width:700px;margin:0 auto}
.bd-html{font-size:1.1rem;line-height:1.9;color:var(--text)}
.bd-html p{margin-bottom:1.5rem}
.bd-html>p:first-of-type::first-letter{float:left;font-size:3.8rem;line-height:.8;font-weight:800;color:var(--primary);margin:0 .5rem 0 0;padding-top:.4rem;font-family:Georgia,serif}
.bd-html h2{font-size:1.8rem;font-weight:800;color:var(--dark);margin:2.5rem 0 1.2rem;letter-spacing:-.5px}
.bd-html h3{font-size:1.4rem;font-weight:700;color:var(--dark);margin:2rem 0 1rem}
.bd-html ul,.bd-html ol{margin:0 0 1.5rem 1.5rem;padding-left:1rem}
.bd-html li{margin-bottom:.6rem}
.bd-html blockquote{border-left:4px solid var(--primary);margin:2rem 0;padding:1.5rem 2rem;background:#fafafa;border-radius:0 12px 12px 0;font-size:1.2rem;font-style:italic;color:var(--dark);line-height:1.7}
.bd-html img{max-width:100%;height:auto;border-radius:12px;margin:1.5rem 0;box-shadow:0 8px 24px rgba(0,0,0,.08)}
.bd-html a{color:var(--primary);text-decoration:none;border-bottom:1px dotted var(--primary);transition:all .2s}
.bd-html a:hover{color:#e11d48;border-bottom-color:#e11d48}
.bd-tags{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;margin:3rem 0;padding-top:1.5rem;border-top:1px solid var(--border-light)}
.bd-tags i{color:var(--primary);font-size:1.1rem;margin-right:.5rem}
.bd-tag{background:var(--bg-alt);color:var(--text);padding:.3rem .8rem;border-radius:50px;font-size:.8rem;font-weight:600;border:1px solid var(--border-light);transition:all .2s}
.bd-tag:hover{background:var(--primary);color:#fff;border-color:var(--primary)}
.bd-author-box{display:flex;align-items:center;gap:1.5rem;background:#fafafa;padding:2rem;border-radius:16px;margin-bottom:3rem}
.bd-author-box-avatar{width:70px;height:70px;flex-shrink:0;border-radius:50%;background:linear-gradient(135deg,var(--primary),#e11d48);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.8rem;box-shadow:0 8px 16px rgba(183,34,45,.2)}
.bd-author-box-info h4{font-size:1.1rem;color:var(--dark);margin-bottom:.5rem;font-weight:700}
.bd-author-box-info p{font-size:.9rem;color:var(--text-light);line-height:1.6;margin:0}
.bd-footer{text-align:center;padding-top:2rem;border-top:1px solid var(--border-light)}
.bd-footer .btn{font-size:.95rem;padding:.7rem 1.8rem;border-radius:50px}
@media(max-width:900px){
  .bd-article{padding:2rem;border-radius:16px}
  .bd-layout{flex-direction:column;gap:2rem}
  .bd-sidebar{width:100%}
  .bd-share{position:static;flex-direction:row;justify-content:center;gap:1rem}
  .bd-share p{writing-mode:horizontal-tb;transform:none;margin:0;align-self:center;margin-right:.5rem}
}
@media(max-width:768px){
  .bd-page{padding:1.5rem 0}
  .bd-article{padding:1.5rem}
  .bd-title{font-size:2rem}
  .bd-meta{flex-direction:column;align-items:flex-start;gap:1rem}
  .bd-featured{margin:0 -1.5rem 2rem;border-radius:0}
  .bd-html{font-size:1.05rem}
  .bd-html>p:first-of-type::first-letter{font-size:3rem}
  .bd-author-box{flex-direction:column;text-align:center;gap:1rem;padding:1.5rem}
}
`;

css = css.substring(0, s) + newCss + '\n\n' + css.substring(e);
fs.writeFileSync(path, css);
console.log('done updating css');

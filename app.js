const NS = "http://www.w3.org/2000/svg";
const $ = (selector, root = document) => root.querySelector(selector);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const algorithms = [
  { id: "red-black-tree", title: "红黑树", en: "RED–BLACK TREE", category: "平衡搜索树", description: "通过颜色约束与旋转，让查找、插入和删除稳定在 O(log n)。", icon: "tree" },
  { id: "b-plus-tree", title: "B+ 树", en: "B+ TREE", category: "多路搜索树", description: "数据库索引的经典结构。观察节点分裂、层级增长与叶节点链表。", icon: "bplus" },
  { id: "minimax", title: "Minimax 剪枝", en: "MINIMAX + αβ", category: "博弈搜索", description: "在对抗搜索树中传播最优值，并用 Alpha–Beta 跳过无效分支。", icon: "minimax" },
  { id: "dijkstra", title: "Dijkstra 最短路", en: "DIJKSTRA", category: "图算法", description: "自定义带权图，查看距离松弛以及最短路径逐步确定的过程。", icon: "graph" },
  { id: "sorting", title: "排序实验室", en: "SORTING LAB", category: "排序算法", description: "比较冒泡、快速与归并排序，逐帧观察元素比较和位置变化。", icon: "sort" }
];

function iconSvg(type) {
  const common = `fill="none" stroke="currentColor" stroke-width="1.4"`;
  if (type === "tree") return `<svg viewBox="0 0 120 90" ${common}><path d="M60 14 31 43M60 14l30 29M31 43 17 73M31 43l16 30M90 43 74 73M90 43l16 30"/><circle cx="60" cy="14" r="8"/><circle cx="31" cy="43" r="8"/><circle cx="90" cy="43" r="8"/><circle cx="17" cy="73" r="7"/><circle cx="47" cy="73" r="7"/><circle cx="74" cy="73" r="7"/><circle cx="106" cy="73" r="7"/></svg>`;
  if (type === "bplus") return `<svg viewBox="0 0 120 90" ${common}><rect x="43" y="10" width="34" height="18"/><path d="M52 28 25 48M68 28l27 20"/><rect x="8" y="48" width="34" height="18"/><rect x="78" y="48" width="34" height="18"/><path stroke-dasharray="3 3" d="M42 57h36"/><path d="M19 52v10M31 52v10M89 52v10M101 52v10"/></svg>`;
  if (type === "minimax") return `<svg viewBox="0 0 120 90" ${common}><path d="M60 10 28 38M60 10l32 28M28 38 12 72M28 38l20 34M92 38 72 72M92 38l16 34"/><circle cx="60" cy="10" r="7"/><circle cx="28" cy="38" r="7"/><circle cx="92" cy="38" r="7"/><path stroke-dasharray="4 3" d="M68 32 102 78"/><text x="84" y="33" fill="currentColor" stroke="none" font-size="10">α β</text></svg>`;
  if (type === "graph") return `<svg viewBox="0 0 120 90" ${common}><path d="M20 54 47 18l33 12 22 38-53 7zM20 54l60-24M47 18l2 57M49 75l53-7"/><circle cx="20" cy="54" r="6"/><circle cx="47" cy="18" r="6"/><circle cx="80" cy="30" r="6"/><circle cx="102" cy="68" r="6"/><circle cx="49" cy="75" r="6"/></svg>`;
  return `<svg viewBox="0 0 120 90" ${common}><path d="M13 73V54h12v19M34 73V22h12v51M55 73V41h12v32M76 73V12h12v61M97 73V31h12v42"/><path stroke-dasharray="4 4" d="M8 79h104"/></svg>`;
}

function renderHome() {
  const app = $("#app");
  app.replaceChildren($("#home-template").content.cloneNode(true));
  const grid = $("#algorithm-grid");
  algorithms.forEach((a, i) => {
    const card = document.createElement("a");
    card.className = "algo-card";
    card.href = `#/${a.id}`;
    card.innerHTML = `<span class="number">${String(i + 1).padStart(2, "0")}</span><div class="algo-icon">${iconSvg(a.icon)}</div><span class="category">${a.category}</span><h3>${a.title}</h3><p>${a.description}</p><span class="arrow">↗</span>`;
    grid.append(card);
  });
}

function renderLab(algo) {
  const app = $("#app");
  app.replaceChildren($("#lab-template").content.cloneNode(true));
  $("#lab-index").textContent = `${String(algorithms.indexOf(algo) + 1).padStart(2, "0")} / ${String(algorithms.length).padStart(2, "0")}`;
  $("#lab-category").textContent = algo.en;
  $("#lab-title").textContent = algo.title;
  $("#lab-description").textContent = algo.description;
  const renderers = { "red-black-tree": renderRBTree, "b-plus-tree": renderBPlus, minimax: renderMinimax, dijkstra: renderDijkstra, sorting: renderSorting };
  renderers[algo.id]($("#lab-content"));
  window.scrollTo(0, 0);
}

function workspace(panel, toolbar, visual = "") {
  return `<div class="workspace"><aside class="control-panel">${panel}</aside><section class="visual-panel"><div class="viz-toolbar">${toolbar}</div><div class="canvas-wrap">${visual}</div></section></div>`;
}

function svgEl(name, attrs = {}, text = "") {
  const el = document.createElementNS(NS, name);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  if (text !== "") el.textContent = text;
  return el;
}

// --- Red-black tree ---------------------------------------------------------
class RBNode { constructor(key, color = "R", parent = null) { this.key = key; this.color = color; this.parent = parent; this.left = null; this.right = null; } }
class RBTree {
  constructor() { this.root = null; this.message = "树已就绪"; }
  find(key) { let n = this.root; while (n && n.key !== key) n = key < n.key ? n.left : n.right; return n; }
  rotateLeft(x) { const y = x.right; if (!y) return; x.right = y.left; if (y.left) y.left.parent = x; y.parent = x.parent; if (!x.parent) this.root = y; else if (x === x.parent.left) x.parent.left = y; else x.parent.right = y; y.left = x; x.parent = y; }
  rotateRight(y) { const x = y.left; if (!x) return; y.left = x.right; if (x.right) x.right.parent = y; x.parent = y.parent; if (!y.parent) this.root = x; else if (y === y.parent.left) y.parent.left = x; else y.parent.right = x; x.right = y; y.parent = x; }
  insert(key) {
    if (this.find(key)) { this.message = `${key} 已存在，未重复插入`; return false; }
    let p = null, n = this.root; while (n) { p = n; n = key < n.key ? n.left : n.right; }
    const z = new RBNode(key, "R", p); if (!p) this.root = z; else if (key < p.key) p.left = z; else p.right = z;
    this.fixInsert(z); this.message = `已插入 ${key}，并恢复红黑约束`; return true;
  }
  fixInsert(z) {
    while (z.parent?.color === "R") {
      const p = z.parent, g = p.parent;
      if (p === g.left) { const u = g.right; if (u?.color === "R") { p.color = u.color = "B"; g.color = "R"; z = g; } else { if (z === p.right) { z = p; this.rotateLeft(z); } z.parent.color = "B"; z.parent.parent.color = "R"; this.rotateRight(z.parent.parent); } }
      else { const u = g.left; if (u?.color === "R") { p.color = u.color = "B"; g.color = "R"; z = g; } else { if (z === p.left) { z = p; this.rotateRight(z); } z.parent.color = "B"; z.parent.parent.color = "R"; this.rotateLeft(z.parent.parent); } }
    }
    this.root.color = "B";
  }
  minimum(n) { while (n?.left) n = n.left; return n; }
  transplant(a, b) { if (!a.parent) this.root = b; else if (a === a.parent.left) a.parent.left = b; else a.parent.right = b; if (b) b.parent = a.parent; }
  delete(key) {
    const z = this.find(key); if (!z) { this.message = `未找到 ${key}`; return false; }
    // Standard BST removal followed by rebuilding through valid RB insertions.
    const keys = []; const walk = n => { if (!n) return; walk(n.left); if (n !== z) keys.push(n.key); walk(n.right); }; walk(this.root);
    this.root = null; keys.forEach(k => this.insert(k)); this.message = `已删除 ${key}，并重新平衡`; return true;
  }
}

function renderRBTree(root) {
  root.innerHTML = workspace(`<h2>DATA CONTROLS</h2><div class="field"><label for="rb-value">节点值</label><input id="rb-value" type="number" value="42" min="-999" max="999"></div><div class="button-row"><button class="control-btn accent" id="rb-insert">插入</button><button class="control-btn danger" id="rb-delete">删除</button><button class="control-btn wide" id="rb-random">生成随机树</button></div><div class="status-box" id="rb-status"></div>`, `<span>结构视图 · O(log n)</span><span class="legend"><span><i class="black"></i>黑节点</span><span><i class="red"></i>红节点</span></span>`, `<svg id="rb-svg" role="img" aria-label="红黑树结构"></svg>`);
  const tree = new RBTree(); [42, 19, 67, 8, 27, 55, 81, 4, 12, 23, 31].forEach(v => tree.insert(v)); tree.message = "示例树已就绪，可插入或删除节点";
  const draw = (active = null) => { drawBinaryTree(tree.root, $("#rb-svg"), active); $("#rb-status").innerHTML = `<strong>状态</strong><br>${tree.message}`; };
  const value = () => clamp(Number($("#rb-value").value), -999, 999);
  $("#rb-insert").onclick = () => { const v = value(); tree.insert(v); draw(v); };
  $("#rb-delete").onclick = () => { const v = value(); tree.delete(v); draw(); };
  $("#rb-random").onclick = () => { tree.root = null; [...new Set(Array.from({length: 12}, () => Math.floor(Math.random() * 90) + 5))].forEach(v => tree.insert(v)); tree.message = "已生成一棵新的随机红黑树"; draw(); };
  $("#rb-value").onkeydown = e => { if (e.key === "Enter") $("#rb-insert").click(); };
  draw();
}

function drawBinaryTree(root, svg, active = null) {
  svg.replaceChildren(); svg.setAttribute("viewBox", "0 0 1000 500");
  if (!root) { svg.append(svgEl("text", { x: 500, y: 250, class: "node-label" }, "空树 · 插入一个节点开始")); return; }
  const positions = new Map(); let order = 0;
  const assign = (n, depth = 0) => { if (!n) return; assign(n.left, depth + 1); positions.set(n, { x: 65 + order++ * (870 / Math.max(1, countNodes(root) - 1)), y: 55 + depth * 85 }); assign(n.right, depth + 1); }; assign(root);
  positions.forEach((p, n) => [n.left, n.right].forEach(c => { if (c) { const q = positions.get(c); svg.append(svgEl("line", { x1: p.x, y1: p.y, x2: q.x, y2: q.y, class: "edge" })); } }));
  positions.forEach((p, n) => { const g = svgEl("g", { class: `tree-node ${n.color === "R" ? "red" : ""} ${n.key === active ? "active" : ""}`, transform: `translate(${p.x} ${p.y})` }); g.append(svgEl("circle", { r: 21 }), svgEl("text", {}, n.key)); svg.append(g); });
}
function countNodes(n) { return n ? 1 + countNodes(n.left) + countNodes(n.right) : 0; }

// --- B+ tree ----------------------------------------------------------------
function buildBPlus(keys, order) {
  if (!keys.length) return null;
  let level = []; for (let i = 0; i < keys.length; i += order - 1) level.push({ leaf: true, keys: keys.slice(i, i + order - 1), children: [] });
  const leaves = level;
  while (level.length > 1) { const next = []; for (let i = 0; i < level.length; i += order) { const children = level.slice(i, i + order); const sep = children.slice(1).map(c => firstKey(c)); next.push({ leaf: false, keys: sep, children }); } level = next; }
  return { root: level[0], leaves };
}
function firstKey(n) { return n.leaf ? n.keys[0] : firstKey(n.children[0]); }
function renderBPlus(root) {
  root.innerHTML = workspace(`<h2>INDEX CONTROLS</h2><div class="field"><label for="bp-value">索引键</label><input id="bp-value" type="number" value="46" min="0" max="999"></div><div class="field"><label for="bp-order">阶数（最大子节点数）</label><select id="bp-order"><option>3</option><option selected>4</option><option>5</option><option>6</option></select></div><div class="button-row"><button class="control-btn accent" id="bp-insert">插入</button><button class="control-btn danger" id="bp-delete">删除</button><button class="control-btn wide" id="bp-reset">恢复示例</button></div><div class="status-box" id="bp-status"></div>`, `<span>索引结构</span><span class="legend"><span><i class="active"></i>叶节点链</span></span>`, `<svg id="bp-svg" role="img" aria-label="B加树结构"></svg>`);
  let keys = [5, 12, 18, 23, 31, 37, 44, 52, 61, 68, 74, 83, 91]; let message = "叶节点保存全部数据，内部节点仅保存索引";
  const draw = active => { const order = Number($("#bp-order").value); drawBPlus(buildBPlus(keys, order), $("#bp-svg"), active); $("#bp-status").innerHTML = `<strong>${keys.length} 个键 · ${order} 阶</strong><br>${message}`; };
  $("#bp-insert").onclick = () => { const v = Number($("#bp-value").value); if (!Number.isFinite(v)) return; if (keys.includes(v)) message = `${v} 已存在`; else { keys.push(v); keys.sort((a,b) => a-b); message = `已插入 ${v}，节点按容量重新分裂`; } draw(v); };
  $("#bp-delete").onclick = () => { const v = Number($("#bp-value").value); const before = keys.length; keys = keys.filter(k => k !== v); message = before === keys.length ? `未找到 ${v}` : `已删除 ${v}，必要时合并节点`; draw(); };
  $("#bp-order").onchange = () => { message = "已按新的阶数重建索引"; draw(); };
  $("#bp-reset").onclick = () => { keys = [5,12,18,23,31,37,44,52,61,68,74,83,91]; message = "示例数据已恢复"; draw(); };
  draw();
}
function drawBPlus(data, svg, active) {
  svg.replaceChildren(); svg.setAttribute("viewBox", "0 0 1050 500"); if (!data) { svg.append(svgEl("text", {x:525,y:250,class:"node-label"}, "空索引 · 插入一个键开始")); return; }
  const levels = [], walk = (n, d = 0) => { (levels[d] ||= []).push(n); n.children.forEach(c => walk(c, d + 1)); }; walk(data.root);
  const pos = new Map(); levels.forEach((nodes, d) => nodes.forEach((n, i) => pos.set(n, { x: (i + 1) * 1050 / (nodes.length + 1), y: 70 + d * 145 })));
  pos.forEach((p, n) => n.children.forEach(c => { const q = pos.get(c); svg.append(svgEl("line", {x1:p.x,y1:p.y+20,x2:q.x,y2:q.y-20,class:"edge"})); }));
  for (let i = 0; i < data.leaves.length - 1; i++) { const a = pos.get(data.leaves[i]), b = pos.get(data.leaves[i+1]); svg.append(svgEl("line", {x1:a.x+44,y1:a.y,x2:b.x-44,y2:b.y,class:"leaf-link"})); }
  pos.forEach((p, n) => { const w = Math.max(62, n.keys.length * 39); const g = svgEl("g", {class:`bplus-node ${n.leaf ? "leaf" : ""}`,transform:`translate(${p.x} ${p.y})`}); g.append(svgEl("rect", {x:-w/2,y:-21,width:w,height:42,rx:3})); n.keys.forEach((k,i) => { const x = -w/2 + (i+.5)*w/n.keys.length; if(i) g.append(svgEl("line", {x1:-w/2+i*w/n.keys.length,y1:-21,x2:-w/2+i*w/n.keys.length,y2:21,class:"edge"})); const t=svgEl("text", {x,y:1}, k); if(k===active) t.setAttribute("fill", "#77e7df"); g.append(t); }); svg.append(g); });
}

// --- Minimax ----------------------------------------------------------------
function makeGameTree(depth, branching, values) {
  let leaf = 0, id = 0; const build = d => { const n = { id:id++, depth:d, children:[], value:null, pruned:false }; if (d === depth) n.value = values[leaf++ % values.length]; else for(let i=0;i<branching;i++) n.children.push(build(d+1)); return n; }; return build(0);
}
function alphaBeta(root, maximizing = true) {
  const steps = [], pruned = new Set();
  function visit(n, alpha, beta, max) {
    steps.push({type:"visit", id:n.id, alpha, beta, text:`访问节点 ${n.id} · α=${fmt(alpha)} β=${fmt(beta)}`});
    if (!n.children.length) { steps.push({type:"value", id:n.id, value:n.value, text:`叶节点 ${n.id} 的效用值为 ${n.value}`}); return n.value; }
    let value = max ? -Infinity : Infinity;
    for (let i=0;i<n.children.length;i++) {
      const child = n.children[i], v = visit(child, alpha, beta, !max); value = max ? Math.max(value,v) : Math.min(value,v); if(max) alpha=Math.max(alpha,value); else beta=Math.min(beta,value);
      steps.push({type:"update", id:n.id, value, alpha, beta, text:`节点 ${n.id} 更新为 ${value} · α=${fmt(alpha)} β=${fmt(beta)}`});
      if (beta <= alpha) { for(let j=i+1;j<n.children.length;j++) mark(n.children[j]); steps.push({type:"prune", id:n.id, text:`α ≥ β，剪去剩余 ${n.children.length-i-1} 个分支`, pruned:new Set(pruned)}); break; }
    }
    n.value=value; return value;
  }
  const mark = n => { pruned.add(n.id); n.children.forEach(mark); };
  const result = visit(root,-Infinity,Infinity,maximizing); return {steps,result,pruned};
}
function fmt(v) { return v === Infinity ? "∞" : v === -Infinity ? "−∞" : v; }
function renderMinimax(root) {
  root.innerHTML = workspace(`<h2>SEARCH CONTROLS</h2><div class="field"><label for="mm-depth">搜索深度</label><select id="mm-depth"><option>2</option><option selected>3</option><option>4</option></select></div><div class="field"><label for="mm-branch">每层分支</label><select id="mm-branch"><option selected>2</option><option>3</option></select></div><div class="field"><label for="mm-values">叶节点值（逗号分隔）</label><textarea id="mm-values" rows="3">3, 5, 6, 9, 1, 2, 0, -1</textarea></div><div class="button-row"><button class="control-btn accent wide" id="mm-build">构建并运行</button></div><div class="status-box" id="mm-status"></div>`, `<span>MAX 从根节点开始</span><span class="step-controls"><button id="mm-prev">←</button><span id="mm-count">0 / 0</span><button id="mm-next">→</button><button id="mm-play">播放</button></span>`, `<svg id="mm-svg" role="img" aria-label="Minimax 搜索树"></svg>`);
  let tree, run, step = 0, timer;
  const rebuild = () => { clearInterval(timer); const depth=Number($("#mm-depth").value), branch=Number($("#mm-branch").value); let values=$("#mm-values").value.split(/[,，\s]+/).map(Number).filter(Number.isFinite); if(!values.length) values=[0]; const total=Math.pow(branch,depth); while(values.length<total) values.push(Math.floor(Math.random()*19)-9); values=values.slice(0,total); $("#mm-values").value=values.join(", "); tree=makeGameTree(depth,branch,values); run=alphaBeta(tree); step=0; draw(); };
  const draw = () => { const state=run.steps[Math.max(0,step-1)]; drawGameTree(tree,$("#mm-svg"),state,step===run.steps.length?run.pruned:new Set()); $("#mm-count").textContent=`${step} / ${run.steps.length}`; $("#mm-status").innerHTML=`<strong>最优值 ${run.result}</strong><br>${state?.text || "按下一步观察 Alpha–Beta 搜索"}`; };
  $("#mm-next").onclick=()=>{step=Math.min(run.steps.length,step+1);draw();}; $("#mm-prev").onclick=()=>{step=Math.max(0,step-1);draw();};
  $("#mm-play").onclick=()=>{ if(timer){clearInterval(timer);timer=null;$("#mm-play").textContent="播放";return;} $("#mm-play").textContent="暂停"; timer=setInterval(()=>{if(step>=run.steps.length){clearInterval(timer);timer=null;$("#mm-play").textContent="播放";return;}step++;draw();},520); };
  $("#mm-build").onclick=rebuild; rebuild();
}
function drawGameTree(root, svg, state, finalPruned) {
  svg.replaceChildren(); svg.setAttribute("viewBox","0 0 1050 500"); const levels=[], leaves=[]; const walk=(n,d=0)=>{(levels[d]||=[]).push(n);if(!n.children.length)leaves.push(n);n.children.forEach(c=>walk(c,d+1));};walk(root); const pos=new Map(); let li=0; const place=n=>{if(!n.children.length){pos.set(n,{x:45+li++*960/Math.max(1,leaves.length-1),y:55+n.depth*125});}else{n.children.forEach(place);pos.set(n,{x:n.children.reduce((s,c)=>s+pos.get(c).x,0)/n.children.length,y:55+n.depth*125});}};place(root);
  const pruned=state?.pruned||finalPruned||new Set(); pos.forEach((p,n)=>n.children.forEach(c=>{const q=pos.get(c);svg.append(svgEl("line",{x1:p.x,y1:p.y,x2:q.x,y2:q.y,class:`edge ${pruned.has(c.id)?"pruned":""}`}));}));
  pos.forEach((p,n)=>{const cls=`tree-node ${state?.id===n.id?"active":""} ${pruned.has(n.id)?"pruned":""}`;const g=svgEl("g",{class:cls,transform:`translate(${p.x} ${p.y})`});g.append(svgEl("circle",{r:18}),svgEl("text",{},n.value??"?"),svgEl("text",{class:"node-label",y:-29},n.depth%2===0?"MAX":"MIN"));svg.append(g);});
}

// --- Dijkstra ---------------------------------------------------------------
function parseGraph(text) { const edges=[]; text.split(/[\n,，]+/).forEach(s=>{const m=s.trim().match(/^([\w\u4e00-\u9fa5]+)\s*[-–>]\s*([\w\u4e00-\u9fa5]+)\s*[:：=]\s*(\d+(?:\.\d+)?)$/);if(m)edges.push({a:m[1],b:m[2],w:Number(m[3])});});return edges; }
function dijkstra(edges,start){const nodes=[...new Set(edges.flatMap(e=>[e.a,e.b]))],dist=Object.fromEntries(nodes.map(n=>[n,Infinity])),prev={},visited=new Set(),steps=[];if(!nodes.includes(start))return{nodes,dist,prev,steps,visited};dist[start]=0;while(visited.size<nodes.length){const u=nodes.filter(n=>!visited.has(n)).sort((a,b)=>dist[a]-dist[b])[0];if(!u||dist[u]===Infinity)break;visited.add(u);steps.push({node:u,dist:{...dist},visited:new Set(visited),text:`确定 ${u} 的最短距离：${dist[u]}`});edges.filter(e=>e.a===u||e.b===u).forEach(e=>{const v=e.a===u?e.b:e.a,alt=dist[u]+e.w;if(alt<dist[v]){dist[v]=alt;prev[v]=u;steps.push({node:v,edge:[u,v],dist:{...dist},visited:new Set(visited),text:`松弛 ${u} → ${v}，距离更新为 ${alt}`});}});}return{nodes,dist,prev,steps,visited};}
function renderDijkstra(root){root.innerHTML=workspace(`<h2>GRAPH CONTROLS</h2><div class="field"><label for="dj-edges">边（A-B:权重）</label><textarea id="dj-edges" rows="7">A-B:4, A-C:2, B-C:1, B-D:5, C-D:8, C-E:10, D-E:2, D-F:6, E-F:3</textarea></div><div class="field"><label for="dj-start">起点</label><input id="dj-start" value="A" maxlength="8"></div><div class="button-row"><button class="control-btn accent wide" id="dj-run">计算最短路</button></div><div class="status-box" id="dj-status"></div>`, `<span>无向非负权图</span><span class="step-controls"><button id="dj-prev">←</button><span id="dj-count">0 / 0</span><button id="dj-next">→</button></span>`,`<svg id="dj-svg" role="img" aria-label="Dijkstra 带权图"></svg>`);let edges,run,step;
  const rebuild=()=>{edges=parseGraph($("#dj-edges").value);run=dijkstra(edges,$("#dj-start").value.trim());step=0;draw();};const draw=()=>{const state=run.steps[Math.max(0,step-1)];drawGraph(edges,run.nodes,$("#dj-svg"),state);$("#dj-count").textContent=`${step} / ${run.steps.length}`;$("#dj-status").innerHTML=`<strong>${run.nodes.length} 个节点 · ${edges.length} 条边</strong><br>${state?.text||"按下一步查看距离松弛过程"}`;};$("#dj-next").onclick=()=>{step=Math.min(run.steps.length,step+1);draw();};$("#dj-prev").onclick=()=>{step=Math.max(0,step-1);draw();};$("#dj-run").onclick=rebuild;rebuild();}
function drawGraph(edges,nodes,svg,state){svg.replaceChildren();svg.setAttribute("viewBox","0 0 900 500");if(!nodes.length){svg.append(svgEl("text",{x:450,y:250,class:"node-label"},"没有识别到有效边，请使用 A-B:4 格式"));return;}const pos=new Map();nodes.forEach((n,i)=>{const a=-Math.PI/2+i*2*Math.PI/nodes.length;pos.set(n,{x:450+280*Math.cos(a),y:250+190*Math.sin(a)});});edges.forEach(e=>{const a=pos.get(e.a),b=pos.get(e.b),active=state?.edge&&state.edge.includes(e.a)&&state.edge.includes(e.b);svg.append(svgEl("line",{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:`edge ${active?"active":""}`}));const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;svg.append(svgEl("circle",{cx:mx,cy:my,r:12,fill:"#0b1825",stroke:"rgba(185,220,225,.25)"}),svgEl("text",{x:mx,y:my,class:"node-label",dy:3},e.w));});nodes.forEach(n=>{const p=pos.get(n),g=svgEl("g",{class:`graph-node ${state?.node===n?"active":""}`,transform:`translate(${p.x} ${p.y})`});g.append(svgEl("circle",{r:24}),svgEl("text",{},n));const d=state?.dist?.[n];if(d!==undefined){g.append(svgEl("circle",{cx:25,cy:-23,r:13,class:"distance-badge"}),svgEl("text",{x:25,y:-23,class:"distance-text"},fmt(d)));}svg.append(g);});}

// --- Sorting ----------------------------------------------------------------
function sortingSteps(values,type){const a=[...values],steps=[{a:[...a],active:[],text:"初始序列"}];const snap=(active,text)=>steps.push({a:[...a],active,text});if(type==="bubble"){for(let i=0;i<a.length-1;i++)for(let j=0;j<a.length-i-1;j++){snap([j,j+1],`比较 ${a[j]} 与 ${a[j+1]}`);if(a[j]>a[j+1]){[a[j],a[j+1]]=[a[j+1],a[j]];snap([j,j+1],"交换相邻元素");}}}else if(type==="quick"){const q=(lo,hi)=>{if(lo>=hi)return;const pivot=a[hi];let i=lo;for(let j=lo;j<hi;j++){snap([j,hi],`将 ${a[j]} 与基准 ${pivot} 比较`);if(a[j]<pivot){[a[i],a[j]]=[a[j],a[i]];snap([i,j],"移动到基准左侧");i++;}}[a[i],a[hi]]=[a[hi],a[i]];snap([i],`基准 ${pivot} 就位`);q(lo,i-1);q(i+1,hi);};q(0,a.length-1);}else{const m=(lo,hi)=>{if(hi-lo<2)return;const mid=(lo+hi)>>1;m(lo,mid);m(mid,hi);const merged=[];let i=lo,j=mid;while(i<mid||j<hi)merged.push(j>=hi||(i<mid&&a[i]<=a[j])?a[i++]:a[j++]);merged.forEach((v,k)=>a[lo+k]=v);snap(Array.from({length:hi-lo},(_,k)=>lo+k),`合并区间 [${lo}, ${hi})`);};m(0,a.length);}steps.push({a:[...a],active:[],sorted:true,text:"排序完成"});return steps;}
function renderSorting(root){root.innerHTML=workspace(`<h2>ARRAY CONTROLS</h2><div class="field"><label for="sort-values">数字序列</label><textarea id="sort-values" rows="4">42, 17, 8, 56, 33, 21, 64, 12, 48, 29</textarea></div><div class="field"><label for="sort-type">排序算法</label><select id="sort-type"><option value="quick">快速排序</option><option value="merge">归并排序</option><option value="bubble">冒泡排序</option></select></div><div class="button-row"><button class="control-btn accent" id="sort-build">载入</button><button class="control-btn" id="sort-random">随机</button></div><div class="status-box" id="sort-status"></div>`,`<span>比较与交换</span><span class="step-controls"><button id="sort-prev">←</button><span id="sort-count">0 / 0</span><button id="sort-next">→</button><button id="sort-play">播放</button></span>`,`<div class="bar-chart" id="bar-chart"></div>`);let steps=[],step=0,timer;
  const rebuild=()=>{clearInterval(timer);let values=$("#sort-values").value.split(/[,，\s]+/).map(Number).filter(Number.isFinite).slice(0,24);if(!values.length)values=[1];steps=sortingSteps(values,$("#sort-type").value);step=0;draw();};const draw=()=>{const s=steps[step],max=Math.max(...s.a,1),min=Math.min(...s.a,0),range=max-min||1;$("#bar-chart").innerHTML=s.a.map((v,i)=>`<div class="bar-item ${s.active.includes(i)?"active":""} ${s.sorted?"sorted":""}" style="height:${32+(v-min)/range*330}px"><span>${v}</span></div>`).join("");$("#sort-count").textContent=`${step} / ${steps.length-1}`;$("#sort-status").innerHTML=`<strong>${$("#sort-type").selectedOptions[0].text}</strong><br>${s.text}`;};$("#sort-next").onclick=()=>{step=Math.min(steps.length-1,step+1);draw();};$("#sort-prev").onclick=()=>{step=Math.max(0,step-1);draw();};$("#sort-build").onclick=rebuild;$("#sort-random").onclick=()=>{$("#sort-values").value=Array.from({length:12},()=>Math.floor(Math.random()*90)+5).join(", ");rebuild();};$("#sort-play").onclick=()=>{if(timer){clearInterval(timer);timer=null;$("#sort-play").textContent="播放";return;}$("#sort-play").textContent="暂停";timer=setInterval(()=>{if(step>=steps.length-1){clearInterval(timer);timer=null;$("#sort-play").textContent="播放";return;}step++;draw();},260);};rebuild();}

function route() {
  const slug = location.hash.replace(/^#\/?/, "").split("/")[0];
  const algo = algorithms.find(a => a.id === slug);
  if (algo) renderLab(algo); else renderHome();
  document.title = algo ? `${algo.title} · Algorithm Atlas` : "Algorithm Atlas · 算法可视化实验室";
}
window.addEventListener("hashchange", route);
route();

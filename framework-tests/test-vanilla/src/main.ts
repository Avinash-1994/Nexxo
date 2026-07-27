interface Card { id: string; title: string; priority: 'low'|'medium'|'high'; }
interface Col { id: string; title: string; cards: Card[]; }

const SEED: Col[] = [
  { id:'backlog', title:'📋 Backlog', cards: [
    {id:'1',title:'Implement OAuth 2.0 login',priority:'high'},
    {id:'2',title:'Add CSV export to reports',priority:'medium'},
    {id:'3',title:'Write API documentation',priority:'low'},
  ]},
  { id:'todo', title:'📝 To Do', cards: [
    {id:'4',title:'Set up CI/CD pipeline',priority:'high'},
    {id:'5',title:'Design onboarding flow',priority:'medium'},
    {id:'6',title:'Performance audit on /dashboard',priority:'high'},
  ]},
  { id:'doing', title:'⚡ In Progress', cards: [
    {id:'7',title:'Integrate Stripe billing',priority:'high'},
    {id:'8',title:'Fix SvelteKit SSR adapter',priority:'high'},
    {id:'9',title:'Add dark mode toggle',priority:'low'},
  ]},
  { id:'done', title:'✅ Done', cards: [
    {id:'10',title:'Security gate with CVE scanning',priority:'high'},
    {id:'11',title:'Playwright E2E test suite',priority:'medium'},
    {id:'12',title:'Plugin system documentation',priority:'low'},
  ]},
];

let state: Col[] = JSON.parse(localStorage.getItem('lunx-kanban') || 'null') ?? SEED;
let dragCard: {cardId:string; fromCol:string} | null = null;

function save() { localStorage.setItem('lunx-kanban', JSON.stringify(state)); }
function priorityColor(p: string) { return p==='high'?'#ef4444':p==='medium'?'#f59e0b':'#22c55e'; }

function render() {
  const app = document.getElementById('app')!;
  app.innerHTML = `
    <div style="padding:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h1>🗂️ Lunx Kanban</h1>
        <span style="color:#94a3b8;font-size:14px">${state.reduce((s,c)=>s+c.cards.length,0)} cards total</span>
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
        ${state.map(col => `
          <div class="col" data-col="${col.id}" style="background:#1e293b;border-radius:12px;padding:16px;min-height:400px" ondragover="event.preventDefault()" ondrop="window._drop('${col.id}')">
            <div style="font-weight:700;margin-bottom:16px;display:flex;justify-content:space-between">
              ${col.title} <span style="background:#0f172a;border-radius:999px;padding:2px 10px;font-size:13px;font-weight:400">${col.cards.length}</span>
            </div>
            ${col.cards.map(card => `
              <div draggable="true" class="card" data-id="${card.id}" data-col="${col.id}" style="background:#0f172a;border-radius:8px;padding:14px;margin-bottom:10px;border-left:3px solid ${priorityColor(card.priority)};cursor:grab">
                <div style="font-size:14px">${card.title}</div>
                <div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center">
                  <span style="color:${priorityColor(card.priority)};font-size:11px;text-transform:uppercase">${card.priority}</span>
                  <button onclick="window._del('${card.id}','${col.id}')" style="background:none;border:none;color:#64748b;cursor:pointer;font-size:16px">🗑</button>
                </div>
              </div>
            `).join('')}
            <button onclick="window._add('${col.id}')" style="width:100%;padding:10px;background:#334155;color:#94a3b8;border:none;border-radius:8px;cursor:pointer;margin-top:8px">+ Add Card</button>
          </div>
        `).join('')}
      </div>
    </div>`;

  document.querySelectorAll('.card').forEach(el => {
    el.addEventListener('dragstart', () => {
      dragCard = { cardId: (el as HTMLElement).dataset.id!, fromCol: (el as HTMLElement).dataset.col! };
    });
  });
}

(window as any)._drop = (toCol: string) => {
  if (!dragCard || dragCard.fromCol === toCol) return;
  const from = state.find(c => c.id === dragCard!.fromCol)!;
  const to = state.find(c => c.id === toCol)!;
  const idx = from.cards.findIndex(c => c.id === dragCard!.cardId);
  const [card] = from.cards.splice(idx, 1);
  to.cards.push(card);
  dragCard = null;
  save(); render();
};
(window as any)._del = (cardId: string, colId: string) => {
  const col = state.find(c => c.id === colId)!;
  col.cards = col.cards.filter(c => c.id !== cardId);
  save(); render();
};
(window as any)._add = (colId: string) => {
  const title = prompt('Card title:');
  if (!title) return;
  const col = state.find(c => c.id === colId)!;
  col.cards.unshift({ id: Date.now().toString(), title, priority: 'medium' });
  save(); render();
};

render();

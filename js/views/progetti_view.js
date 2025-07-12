// js/views/progetti_view.js

const formatCurrency = val => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(val);

export function renderProjectsView(container, appState) {
    const projects = appState.allData.projects;

    const statusInfo = {
        'In corso': 'bg-yellow-100 text-yellow-800',
        'Completato': 'bg-green-100 text-green-800',
        'Da approvare': 'bg-blue-100 text-blue-800',
        'Default': 'bg-slate-100 text-slate-800'
    };

    const projectCardsHtml = projects.map(p => {
        const badge = statusInfo[p.status] || statusInfo.Default;
        return `
          <div class="project-card bg-white rounded-lg shadow p-4 flex flex-col transition-transform duration-200 hover:-translate-y-1">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-lg">${p.name}</h3>
              <span class="text-xs font-semibold px-2 py-1 rounded-full ${badge}">${p.status}</span>
            </div>
            <p class="text-sm text-slate-600 mb-3">${p.client} | PM: ${p.pm}</p>
            <div class="mb-4">
              <div class="flex justify-between text-sm mb-1"><span>Avanzamento</span><span>${p.progress}%</span></div>
              <div class="bg-slate-200 h-2 rounded-full"><div class="bg-blue-600 h-2 rounded-full" style="width: ${p.progress}%"></div></div>
            </div>
            <div class="grid grid-cols-3 text-center text-sm mb-4">
              <div><p class="text-slate-500">Budget</p><p class="font-bold">${formatCurrency(p.budget)}</p></div>
              <div><p class="text-slate-500">Costi</p><p class="font-bold">${formatCurrency(p.costs)}</p></div>
              <div><p class="text-slate-500">Previsto</p><p class="font-bold">${formatCurrency(p.forecast)}</p></div>
            </div>
            <div class="mt-auto pt-4 border-t text-right space-x-4">
              <a href="#tasks/${p.id}" class="text-blue-600 text-sm font-semibold hover:underline">Vedi Task</a>
              <a href="#imprevisti/${p.id}" class="text-blue-600 text-sm font-semibold hover:underline">Vedi Imprevisti</a>
            </div>
          </div>
        `;
    }).join('');

    container.innerHTML = `
        <header class="mb-6"><h2 class="text-3xl font-bold text-slate-900">Dashboard Progetti</h2><p class="text-slate-600 mt-1">Seleziona un progetto per visualizzare i dettagli.</p></header>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">${projectCardsHtml}</div>
    `;
}

// js/views/imprevisti_view.js

// Funzioni Helper specifiche per questa vista
const criticalityInfo = {
    'Alta': { color: 'red', icon: 'alert-octagon', badge: 'border-red-500 text-red-600 bg-red-100' },
    'Media': { color: 'orange', icon: 'alert-triangle', badge: 'border-orange-500 text-orange-600 bg-orange-100' },
    'Bassa': { color: 'green', icon: 'shield-check', badge: 'border-green-500 text-green-600 bg-green-100' },
    'Default': { color: 'gray', icon: 'help-circle', badge: 'border-slate-400 text-slate-500 bg-slate-100' },
};
const statusInfo = {
    'Aperto': { color: 'red', icon: 'folder-open', badge: 'bg-red-100 text-red-800' },
    'In lavorazione': { color: 'yellow', icon: 'loader-2', badge: 'bg-yellow-100 text-yellow-800' },
    'Risolto': { color: 'green', icon: 'check-circle', badge: 'bg-green-100 text-green-800' },
    'Default': { color: 'gray', icon: 'help-circle', badge: 'bg-slate-100 text-slate-800' },
};
const formatDate = (date) => date ? new Date(date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '';


// Funzione di rendering principale per gli imprevisti
export function renderImprevistiView(container, appState, projectId) {
    // --- Preparazione Dati e Stato ---
    const project = appState.allData.projects.find(p => p.id === projectId);
    const allProjectIncidents = appState.allData.imprevisti.filter(i => i.project === projectId);

    let filteredIncidents = [...allProjectIncidents];
    let currentView = 'cards';

    // --- Struttura HTML ---
    const viewHtml = `
        <div class="mb-4">
            <a href="#" class="text-blue-600 hover:underline">&larr; Torna a tutti i progetti</a>
        </div>
        <header class="mb-6">
            <h2 class="text-3xl font-bold text-slate-900">Dettaglio Imprevisti: ${project?.name || 'Progetto'}</h2>
            <p class="text-slate-600 mt-1">Monitoraggio dei rischi e degli imprevisti associati.</p>
        </header>
        
        <section id="kpi-section-imprevisti" class="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"></section>
        
        <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div class="flex items-center bg-slate-200 rounded-lg p-1">
                <button id="view-cards-btn-impr" class="px-4 py-1 text-sm font-semibold rounded-md bg-white shadow text-blue-600">Card</button>
                <button id="view-table-btn-impr" class="px-4 py-1 text-sm font-semibold rounded-md text-slate-600">Tabella</button>
                <button id="view-timeline-btn-impr" class="px-4 py-1 text-sm font-semibold rounded-md text-slate-600">Timeline</button>
            </div>
            </div>
        
        <main id="imprevisti-content"></main>
    `;
    container.innerHTML = viewHtml;

    // --- Logica di Rendering ---
    function renderKPIs() {
        const kpiContainer = document.getElementById('kpi-section-imprevisti');
        const byStatus = filteredIncidents.reduce((acc, { status }) => {
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        kpiContainer.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm">Totale Imprevisti</p><p class="text-2xl font-bold">${filteredIncidents.length}</p></div>
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm">Aperti</p><p class="text-2xl font-bold text-red-500">${byStatus['Aperto'] || 0}</p></div>
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm">In Lavorazione</p><p class="text-2xl font-bold text-yellow-500">${byStatus['In lavorazione'] || 0}</p></div>
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm">Risolti</p><p class="text-2xl font-bold text-green-500">${byStatus['Risolto'] || 0}</p></div>
        `;
    }

    function renderCardView() {
        const content = document.getElementById('imprevisti-content');
        if (filteredIncidents.length === 0) {
            content.innerHTML = '<div class="text-center p-4 bg-white rounded-lg shadow">Nessun imprevisto per questo progetto.</div>';
            return;
        }
        content.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${filteredIncidents.map(incident => {
                const crit = criticalityInfo[incident.criticality] || criticalityInfo.Default;
                const stat = statusInfo[incident.status] || statusInfo.Default;
                return `
                <div class="bg-white rounded-lg shadow p-4 border-l-4 ${crit.badge.split(' ')[0]}">
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-slate-800">${incident.title}</h4>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${stat.badge}">${incident.status}</span>
                    </div>
                    <div class="mt-3 pt-3 border-t flex justify-between items-center text-sm">
                        <span class="flex items-center gap-2 text-slate-600">${formatDate(incident.date)}</span>
                        <span class="font-semibold px-2 py-1 rounded ${crit.badge}">${incident.criticality}</span>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    }

    // Aggiungi qui le funzioni renderTableView e renderTimelineView, simili a renderCardView

    function updateDisplay() {
        renderKPIs();
        // Per ora mostriamo solo le card
        renderCardView();
        lucide.createIcons();
    }

    // --- Avvio Iniziale ---
    updateDisplay();
}

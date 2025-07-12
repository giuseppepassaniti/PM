// js/views/imprevisti_view.js

// ========= 1. FUNZIONI HELPER E OGGETTI DI CONFIGURAZIONE =========
const criticalityInfo = {
    'Alta': { badge: 'border-red-500 text-red-600 bg-red-100', icon: 'alert-octagon' },
    'Media': { badge: 'border-orange-500 text-orange-600 bg-orange-100', icon: 'alert-triangle' },
    'Bassa': { badge: 'border-green-500 text-green-600 bg-green-100', icon: 'shield-check' },
    'Default': { badge: 'border-slate-400 text-slate-500 bg-slate-100', icon: 'help-circle' },
};
const statusInfo = {
    'Aperto': { badge: 'bg-red-100 text-red-800', icon: 'folder-open' },
    'In lavorazione': { badge: 'bg-yellow-100 text-yellow-800', icon: 'loader-2' },
    'Risolto': { badge: 'bg-green-100 text-green-800', icon: 'check-circle' },
    'Default': { badge: 'bg-slate-100 text-slate-800', icon: 'help-circle' },
};
const formatDate = (date, format = 'DD MMM YYYY') => date ? dayjs(date).format(format) : '';

// ========= 2. LA FUNZIONE DI RENDERING PRINCIPALE =========
export function renderImprevistiView(container, appState, projectId) {
    // --- Preparazione Dati e Stato ---
    const project = projectId ? appState.allData.projects.find(p => p.id === projectId) : null;
    const allProjectIncidents = projectId ? appState.allData.imprevisti.filter(i => i.project === projectId) : [];

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

        <div class="bg-white p-4 rounded-lg shadow-md mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label class="text-sm font-semibold">Filtra per Stato:</label>
                    <div id="status-filter-container" class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2"></div>
                </div>
                <div>
                    <label class="text-sm font-semibold">Filtra per Criticità:</label>
                    <div id="criticality-filter-container" class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2"></div>
                </div>
            </div>
        </div>
        
        <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div class="flex items-center bg-slate-200 rounded-lg p-1">
                <button id="view-cards-btn-impr" class="px-4 py-1 text-sm font-semibold rounded-md">Card</button>
                <button id="view-table-btn-impr" class="px-4 py-1 text-sm font-semibold rounded-md">Tabella</button>
                <button id="view-timeline-btn-impr" class="px-4 py-1 text-sm font-semibold rounded-md">Timeline</button>
            </div>
        </div>
        
        <main id="imprevisti-content"></main>
    `;
    container.innerHTML = viewHtml;
    
    // Funzione centrale che aggiorna tutto
    function updateDisplay() {
        applyFilters();
        renderKPIs();
        renderCurrentView();
        lucide.createIcons();
    }

    // ========= 3. LOGICA DI FILTRAGGIO E RENDERING =========
    function applyFilters() {
        const selectedStatuses = Array.from(document.querySelectorAll('#status-filter-container input:checked')).map(el => el.value);
        const selectedCriticalities = Array.from(document.querySelectorAll('#criticality-filter-container input:checked')).map(el => el.value);

        filteredIncidents = allProjectIncidents.filter(incident => {
            const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(incident.status);
            const criticalityMatch = selectedCriticalities.length === 0 || selectedCriticalities.includes(incident.criticality);
            return statusMatch && criticalityMatch;
        });
    }

    function renderKPIs() {
        // ... (la logica KPI rimane la stessa)
    }
    
    function renderCurrentView() {
        document.getElementById('view-cards-btn-impr').classList.toggle('bg-white', currentView === 'cards');
        document.getElementById('view-table-btn-impr').classList.toggle('bg-white', currentView === 'table');
        document.getElementById('view-timeline-btn-impr').classList.toggle('bg-white', currentView === 'timeline');
        
        const contentContainer = document.getElementById('imprevisti-content');
        if (filteredIncidents.length === 0) {
            contentContainer.innerHTML = '<div class="text-center p-8 bg-white rounded-lg shadow">Nessun imprevisto corrisponde ai filtri selezionati.</div>';
            return;
        }

        if (currentView === 'cards') renderCardView(contentContainer);
        else if (currentView === 'table') renderTableView(contentContainer);
        else if (currentView === 'timeline') renderTimelineView(contentContainer);
    }
    
    function renderCardView(content) {
        content.innerHTML = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${filteredIncidents.map(incident => {
                const crit = criticalityInfo[incident.criticality] || criticalityInfo.Default;
                const stat = statusInfo[incident.status] || statusInfo.Default;
                return `
                <div class="bg-white rounded-lg shadow p-4 border-l-4 ${crit?.badge?.split(' ')[0] || 'border-slate-400'}">
                    <div class="flex justify-between items-start">
                        <h4 class="font-bold text-slate-800">${incident.title}</h4>
                        <span class="px-2 py-1 text-xs font-semibold rounded-full ${stat?.badge || 'bg-slate-100'}">${incident.status}</span>
                    </div>
                    <div class="mt-3 pt-3 border-t flex justify-between items-center text-sm">
                        <span class="flex items-center gap-2 text-slate-600"><i data-lucide="calendar" class="h-4 w-4"></i>${formatDate(incident.date)}</span>
                        <span class="font-semibold px-2 py-1 rounded ${crit?.badge || 'bg-slate-100'}">${incident.criticality}</span>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    }

    function renderTableView(content) {
        content.innerHTML = `
            <div class="overflow-x-auto bg-white rounded-lg shadow">
                <table class="min-w-full divide-y divide-slate-200">
                     <thead class="bg-slate-50"><tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Titolo</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tipo</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Criticità</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stato</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Data</th>
                     </tr></thead>
                     <tbody class="divide-y divide-slate-200">
                        ${filteredIncidents.map(incident => {
                            const crit = criticalityInfo[incident.criticality] || criticalityInfo.Default;
                            const stat = statusInfo[incident.status] || statusInfo.Default;
                            return `<tr>
                                <td class="px-4 py-3 text-sm font-medium">${incident.title}</td>
                                <td class="px-4 py-3 text-sm">${incident.type}</td>
                                <td class="px-4 py-3 text-sm"><span class="font-semibold ${crit?.badge || ''} px-2 py-1 rounded">${incident.criticality}</span></td>
                                <td class="px-4 py-3 text-sm"><span class="font-semibold ${stat?.badge || ''} px-2 py-1 rounded">${incident.status}</span></td>
                                <td class="px-4 py-3 text-sm">${formatDate(incident.date)}</td>
                            </tr>`;
                        }).join('')}
                     </tbody>
                </table>
            </div>`;
    }

    function renderTimelineView(content) {
         content.innerHTML = `<div class="space-y-8 relative">
            ${[...filteredIncidents].sort((a,b) => new Date(b.date) - new Date(a.date)).map(incident => {
                const crit = criticalityInfo[incident.criticality] || criticalityInfo.Default;
                return `
                <div class="relative flex items-start timeline-item pl-12">
                     <div class="absolute left-0 flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 ${crit?.badge?.split(' ')[0] || ''} flex items-center justify-center z-10">
                        <i data-lucide="${crit?.icon || 'help-circle'}" class="h-5 w-5 ${crit?.badge?.split(' ')[1] || ''}"></i>
                    </div>
                    <div class="ml-4 bg-white p-4 rounded-lg shadow-md flex-grow">
                        <div class="flex justify-between items-center">
                            <p class="font-bold">${incident.title}</p>
                            <span class="text-sm font-medium text-slate-500">${formatDate(incident.date, 'DD MMMM YYYY')}</span>
                        </div>
                        <p class="text-sm text-slate-600">${incident.type}</p>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    }

    // ========= 4. SETUP INIZIALE DEI CONTROLLI =========
    function setupControls() {
        const statuses = [...new Set(allProjectIncidents.map(i => i.status))];
        document.getElementById('status-filter-container').innerHTML = statuses.map(s => `
            <div class="flex items-center"><input type="checkbox" id="status-${s}" value="${s}" class="h-4 w-4 rounded impr-filter"><label for="status-${s}" class="ml-2 text-sm">${s}</label></div>
        `).join('');

        const criticalities = [...new Set(allProjectIncidents.map(i => i.criticality))];
        document.getElementById('criticality-filter-container').innerHTML = criticalities.map(c => `
            <div class="flex items-center"><input type="checkbox" id="crit-${c}" value="${c}" class="h-4 w-4 rounded impr-filter"><label for="crit-${c}" class="ml-2 text-sm">${c}</label></div>
        `).join('');
        
        document.querySelectorAll('.impr-filter').forEach(el => el.addEventListener('change', updateDisplay));
        
        document.getElementById('view-cards-btn-impr').addEventListener('click', () => { currentView = 'cards'; updateDisplay(); });
        document.getElementById('view-table-btn-impr').addEventListener('click', () => { currentView = 'table'; updateDisplay(); });
        document.getElementById('view-timeline-btn-impr').addEventListener('click', () => { currentView = 'timeline'; updateDisplay(); });
    }

    // ========= 5. AVVIO DELLA VISTA =========
    if (!project) {
        container.innerHTML = `<div class="text-center p-8"><h2 class="text-2xl text-red-600">Errore</h2><p>ID progetto non valido o non trovato.</p><a href="#" class="text-blue-600 hover:underline mt-4 inline-block">&larr; Torna alla homepage</a></div>`;
        return;
    }

    setupControls();
    updateDisplay();
}

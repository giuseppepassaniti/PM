// js/views/tasks_view.js

// ========= 1. FUNZIONI HELPER (Copiate da Task.html) =========
const formatHours = (h) => `${h} ore`;
const parseFloatWithComma = (str) => {
    if (typeof str !== 'string' || !str) return 0;
    return parseFloat(str.replace(',', '.')) || 0;
};
const parseItalianDateForSort = (date) => date ? new Date(date).getTime() : 0;
const parseItalianDateForDisplay = (date) => date ? new Date(date).toLocaleDateString('it-IT') : '';
const parsePercentage = (str) => parseInt(str?.replace('%', ''), 10) || 0;

// ========= 2. LA FUNZIONE DI RENDERING PRINCIPALE =========
export function renderTasksView(container, appState, projectId) {
    // --- Preparazione Dati Iniziale ---
    const project = projectId ? appState.allData.projects.find(p => p.id === projectId) : null;
    const allProjectTasks = projectId ? appState.allData.tasks.filter(t => t.project === projectId) : [];

    // --- Stato Interno della Vista (per filtri, ordinamento, etc.) ---
    let filteredTasks = [...allProjectTasks];
    let currentView = 'table';
    let sortConfig = { key: 'Deadline', direction: 'asc' };

    // --- HTML Completo della Vista (con tutti i filtri originali) ---
    const viewHtml = `
        <div class="mb-4">
            <a href="#" class="text-blue-600 hover:underline">&larr; Torna a tutti i progetti</a>
        </div>
        <header class="mb-6">
            <h2 class="text-3xl font-bold text-slate-900">Dettaglio Task: ${project?.name || 'Progetto'}</h2>
            <p class="text-slate-600 mt-1">Stato di avanzamento delle attività operative.</p>
        </header>

        <section id="kpi-section-tasks" class="mb-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4"></section>

        <div class="bg-white p-4 rounded-lg shadow-md mb-6">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div>
                    <label class="text-xs text-slate-500">Owner</label>
                    <select id="owner-filter" class="p-2 border rounded-md bg-white shadow-sm w-full"></select>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-slate-500">Da Deadline</label><input type="date" id="date-start-filter" class="p-2 border rounded-md w-full text-sm"></div>
                    <div><label class="text-xs text-slate-500">A Deadline</label><input type="date" id="date-end-filter" class="p-2 border rounded-md w-full text-sm"></div>
                </div>
                <div>
                    <label class="text-xs text-slate-500">Criticità</label>
                    <div id="criticality-filter-container" class="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2"></div>
                </div>
                <div class="flex items-center">
                    <input type="checkbox" id="late-status-filter" class="h-4 w-4 rounded">
                    <label for="late-status-filter" class="ml-2 text-sm">Mostra solo task in ritardo</label>
                </div>
            </div>
        </div>
        
        <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
            <div class="flex items-center bg-slate-200 rounded-lg p-1">
                <button id="view-table-btn-task" class="px-4 py-1 text-sm font-semibold rounded-md">Tabella</button>
                <button id="view-gantt-btn-task" class="px-4 py-1 text-sm font-semibold rounded-md">Timeline</button>
            </div>
            <div class="relative w-full md:w-1/3">
                 <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"></i>
                 <input type="text" id="search-input-task" placeholder="Cerca per titolo..." class="w-full pl-10 p-2 border rounded-md">
            </div>
        </div>

        <main id="task-content-container"></main>
    `;
    container.innerHTML = viewHtml;

    // ========= 3. LOGICA COMPLETA =========
    
    // Funzione centrale che aggiorna tutto
    function updateDisplay() {
        applyFiltersAndSort();
        renderKPIs();
        renderCurrentView();
        lucide.createIcons();
    }

    function applyFiltersAndSort() {
        const owner = document.getElementById('owner-filter').value;
        const startDate = document.getElementById('date-start-filter').value;
        const endDate = document.getElementById('date-end-filter').value;
        const criticalities = Array.from(document.querySelectorAll('#criticality-filter-container input:checked')).map(el => el.value);
        const showLateOnly = document.getElementById('late-status-filter').checked;
        const searchTerm = document.getElementById('search-input-task').value.toLowerCase();

        filteredTasks = allProjectTasks.filter(task => {
            const ownerMatch = owner === 'all' || task.owner === owner;
            const lateMatch = !showLateOnly || (task.status !== 'Completato' && new Date(task.deadline) < new Date());
            const criticalityMatch = criticalities.length === 0 || criticalities.includes(task.criticality);
            const date = new Date(task.deadline);
            const dateMatch = (!startDate || date >= new Date(startDate)) && (!endDate || date <= new Date(endDate));
            const searchMatch = !searchTerm || task.title.toLowerCase().includes(searchTerm);
            return ownerMatch && lateMatch && criticalityMatch && dateMatch && searchMatch;
        });

        // Logica di ordinamento
        filteredTasks.sort((a, b) => {
            if (!sortConfig.key) return 0;
            let valA = a[sortConfig.key.toLowerCase()];
            let valB = b[sortConfig.key.toLowerCase()];
            if (sortConfig.key === 'Deadline') {
                valA = parseItalianDateForSort(a.deadline);
                valB = parseItalianDateForSort(b.deadline);
            }
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    // Funzione per il rendering di tutti i KPI
    function renderKPIs() {
        const kpiContainer = document.getElementById('kpi-section-tasks');
        const lateTasks = filteredTasks.filter(t => t.status !== 'Completato' && new Date(t.deadline) < new Date()).length;
        const criticalOpenTasks = filteredTasks.filter(t => t.criticality === 'Alta' && t.status !== 'Completato').length;
        
        kpiContainer.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm">Task Filtrati</p><p class="text-2xl font-bold">${filteredTasks.length}</p></div>
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm">In Ritardo</p><p class="text-2xl font-bold text-red-500">${lateTasks}</p></div>
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm">Critici Aperti</p><p class="text-2xl font-bold text-orange-500">${criticalOpenTasks}</p></div>
            `;
    }

    // Funzione per il rendering della tabella completa, con ordinamento
    function renderTableView() {
        const tableContainer = document.getElementById('task-content-container');
        const headers = ['Titolo Task', '% Completamento', 'Owner', 'Deadline', 'Stato'];
        
        const createHeaderCell = (label) => {
            const key = label.split(' ')[0]; // Semplificato per 'Titolo', 'Owner', etc.
            const isSorted = sortConfig.key === key;
            const sortClass = isSorted ? (sortConfig.direction === 'asc' ? 'sort-asc' : 'sort-desc') : '';
            return `<th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sortable ${sortClass}" data-sort-key="${key}">${label}</th>`;
        };

        tableContainer.innerHTML = `
            <div class="overflow-x-auto bg-white rounded-lg shadow">
                <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50"><tr>${headers.map(createHeaderCell).join('')}</tr></thead>
                    <tbody class="divide-y divide-slate-200">
                        ${filteredTasks.map(task => {
                            const progress = parsePercentage(task['% Completamento']);
                            return `
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-3"><div class="text-sm font-medium text-slate-900">${task.title}</div></td>
                                <td class="px-4 py-3">
                                    <div class="w-full bg-gray-200 rounded-full h-2.5"><div class="bg-blue-600 h-2.5 rounded-full" style="width: ${progress}%"></div></div>
                                </td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm">${task.owner}</td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm">${parseItalianDateForDisplay(task.deadline)}</td>
                                <td class="px-4 py-3 whitespace-nowrap text-sm">${task.status}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        // Aggiungi event listener per l'ordinamento
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const key = header.dataset.sortKey;
                if (sortConfig.key === key) {
                    sortConfig.direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    sortConfig.key = key;
                    sortConfig.direction = 'asc';
                }
                updateDisplay();
            });
        });
    }
    
    // Funzione per il rendering del Gantt completo
    function renderGanttView() {
        const ganttContainer = document.getElementById('task-content-container');
        ganttContainer.innerHTML = '<div class="bg-white p-2 rounded-lg shadow"><svg id="task-gantt-chart"></svg></div>';
        if (filteredTasks.length === 0) return;

        const ganttTasks = filteredTasks.map(task => ({
            id: String(task.id),
            name: task.title,
            start: new Date(task.startDate).toISOString().split('T')[0],
            end: new Date(task.deadline).toISOString().split('T')[0],
            progress: parsePercentage(task['% Completamento']),
            dependencies: task.DipendeDa || ''
        }));

        new Gantt("#task-gantt-chart", ganttTasks, {
            header_height: 50,
            bar_height: 20,
            view_mode: 'Week',
            date_format: 'YYYY-MM-DD',
            language: 'it',
            custom_popup_html: task => `<div class="p-2 text-sm"><strong>${task.name}</strong><br>Scadenza: ${new Date(task._end).toLocaleDateString('it-IT')}</div>`
        });
    }

    function renderCurrentView() {
        document.getElementById('view-table-btn-task').classList.toggle('bg-white', currentView === 'table');
        document.getElementById('view-table-btn-task').classList.toggle('text-blue-600', currentView === 'table');
        document.getElementById('view-gantt-btn-task').classList.toggle('bg-white', currentView === 'gantt');
        document.getElementById('view-gantt-btn-task').classList.toggle('text-blue-600', currentView === 'gantt');
        
        if (currentView === 'table') renderTableView();
        else renderGanttView();
    }
    
    // ========= 4. SETUP INIZIALE DEI CONTROLLI =========
    function setupControls() {
        const owners = ['all', ...new Set(allProjectTasks.map(t => t.owner))];
        document.getElementById('owner-filter').innerHTML = owners.map(o => `<option value="${o}">${o === 'all' ? 'Tutti' : o}</option>`).join('');
        
        const criticalities = [...new Set(allProjectTasks.map(t => t.criticality))];
        document.getElementById('criticality-filter-container').innerHTML = criticalities.map(c => c ? `<div class="flex items-center"><input type="checkbox" value="${c}" class="h-4 w-4 rounded crit-checkbox"><label class="ml-2 text-sm">${c}</label></div>` : '').join('');

        // Eventi per i filtri
        document.getElementById('owner-filter').addEventListener('change', updateDisplay);
        document.getElementById('date-start-filter').addEventListener('change', updateDisplay);
        document.getElementById('date-end-filter').addEventListener('change', updateDisplay);
        document.getElementById('late-status-filter').addEventListener('change', updateDisplay);
        document.getElementById('search-input-task').addEventListener('input', updateDisplay);
        document.querySelectorAll('.crit-checkbox').forEach(el => el.addEventListener('change', updateDisplay));

        // Eventi per il cambio vista
        document.getElementById('view-table-btn-task').addEventListener('click', () => { currentView = 'table'; updateDisplay(); });
        document.getElementById('view-gantt-btn-task').addEventListener('click', () => { currentView = 'gantt'; updateDisplay(); });
    }

    // ========= 5. AVVIO DELLA VISTA =========
    if (!project) {
        container.innerHTML = `<div class="text-center p-8"><h2 class="text-2xl text-red-600">Errore</h2><p>ID progetto non valido o non trovato.</p><a href="#" class="text-blue-600 hover:underline mt-4 inline-block">&larr; Torna alla homepage</a></div>`;
        return;
    }
    
    setupControls();
    updateDisplay();
}

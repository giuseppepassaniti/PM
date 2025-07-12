// js/views/tasks_view.js

// ========= 1. FUNZIONI HELPER (Copiate da Task.html) =========
const formatHours = (h) => `${h} ore`;
const parseFloatWithComma = (str) => {
    if (typeof str !== 'string' || !str) return 0;
    return parseFloat(str.replace(',', '.')) || 0;
};
const parseItalianDateForSort = (date) => date ? new Date(date).getTime() : 0;
const parseItalianDateForDisplay = (date) => date ? new Date(date).toLocaleDateString('it-IT') : '';


// ========= 2. LA FUNZIONE DI RENDERING PRINCIPALE =========
export function renderTasksView(container, appState, projectId) {
    // --- Preparazione Dati Iniziale ---
    const allProjectTasks = appState.allData.tasks.filter(t => t.project === projectId);
    const project = appState.allData.projects.find(p => p.id === projectId);

    // --- Stato Interno della Vista (Variabili che cambiano) ---
    let filteredTasks = [...allProjectTasks];
    let currentView = 'table';
    let sortConfig = { key: 'Deadline', direction: 'asc' };
    
    // --- HTML Completo della Vista (con tutti i filtri) ---
    const viewHtml = `
        <div class="mb-4">
            <a href="#" class="text-blue-600 hover:underline">&larr; Torna a tutti i progetti</a>
        </div>
        <header class="mb-6">
            <h2 class="text-3xl font-bold text-slate-900">Dettaglio Task: ${project?.name || projectId}</h2>
            <p class="text-slate-600 mt-1">Stato di avanzamento delle attività operative.</p>
        </header>

        <section id="kpi-section" class="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4"></section>

        <div class="bg-white p-4 rounded-lg shadow-md mb-6">
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
                <select id="owner-filter" class="p-2 border rounded-md bg-white shadow-sm w-full"></select>
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="text-xs text-slate-500">Da Deadline</label><input type="date" id="date-start-filter" class="p-2 border rounded-md w-full text-sm"></div>
                    <div><label class="text-xs text-slate-500">A Deadline</label><input type="date" id="date-end-filter" class="p-2 border rounded-md w-full text-sm"></div>
                </div>
                <div id="criticality-filter-container" class="flex flex-wrap items-center gap-x-4 gap-y-2"></div>
                <div class="flex items-center"><input type="checkbox" id="late-status-filter" class="h-4 w-4 rounded"><label for="late-status-filter" class="ml-2 text-sm">Mostra solo task in ritardo</label></div>
            </div>
        </div>

        <div class="flex justify-between items-center mb-4">
            <div class="flex items-center bg-slate-200 rounded-lg p-1">
                <button id="view-table-btn" class="px-4 py-1 text-sm font-semibold rounded-md">Tabella</button>
                <button id="view-gantt-btn" class="px-4 py-1 text-sm font-semibold rounded-md">Timeline</button>
            </div>
        </div>
        <div id="task-content-container"></div>
    `;
    container.innerHTML = viewHtml;

    // ========= 3. LOGICA DI FILTRAGGIO E ORDINAMENTO (Copiata da Task.html) =========
    function applyFiltersAndSort() {
        const owner = document.getElementById('owner-filter').value;
        const startDate = document.getElementById('date-start-filter').value;
        const endDate = document.getElementById('date-end-filter').value;
        const criticalities = Array.from(document.querySelectorAll('#criticality-filter-container input:checked')).map(el => el.value);
        const showLateOnly = document.getElementById('late-status-filter').checked;

        filteredTasks = allProjectTasks.filter(task => {
            const ownerMatch = owner === 'all' || task.owner === owner;
            const lateMatch = !showLateOnly || (task.status !== 'Completato' && new Date(task.deadline) < new Date());
            const criticalityMatch = criticalities.length === 0 || criticalities.includes(task.criticality);
            const date = new Date(task.deadline);
            const dateMatch = (!startDate || date >= new Date(startDate)) && (!endDate || date <= new Date(endDate));
            return ownerMatch && lateMatch && criticalityMatch && dateMatch;
        });

        filteredTasks.sort((a, b) => {
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

    // ========= 4. LOGICA DI RENDERING (KPI, Tabella, Gantt - Copiata da Task.html) =========
    function renderKPIs() {
        const kpiContainer = document.getElementById('kpi-section');
        const lateTasks = filteredTasks.filter(t => t.status !== 'Completato' && new Date(t.deadline) < new Date()).length;
        // ... Aggiungi qui le altre logiche KPI come nel tuo file originale
        kpiContainer.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm text-slate-500">Task Filtrati</p><p class="text-2xl font-bold">${filteredTasks.length}</p></div>
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm text-slate-500">In Ritardo</p><p class="text-2xl font-bold text-red-500">${lateTasks}</p></div>
            `;
    }

    function renderTableView() {
        const tableContainer = document.getElementById('task-content-container');
        // Aggiungi qui la logica completa della tua tabella, inclusi gli header ordinabili e le barre di progresso
        tableContainer.innerHTML = `La tabella completa va qui...`; // Sostituisci con la tua logica di rendering della tabella
    }

    function renderGanttView() {
        const ganttContainer = document.getElementById('task-content-container');
        ganttContainer.innerHTML = '<svg id="task-gantt"></svg>';
        if (filteredTasks.length === 0) return;

        const ganttTasks = filteredTasks.map(task => ({
            id: String(task.id),
            name: task.title,
            start: new Date(task.startDate).toISOString().split('T')[0],
            end: new Date(task.deadline).toISOString().split('T')[0],
            progress: task.status === 'Completato' ? 100 : 0, // Semplificato
        }));

        new Gantt("#task-gantt", ganttTasks, {
             // ... le tue opzioni Gantt originali qui
        });
    }
    
    function renderCurrentView() {
        // Aggiorna lo stile dei bottoni
        document.getElementById('view-table-btn').classList.toggle('bg-white', currentView === 'table');
        document.getElementById('view-gantt-btn').classList.toggle('bg-white', currentView === 'gantt');
        
        if (currentView === 'table') renderTableView();
        else renderGanttView();
    }
    
    // Funzione centrale che aggiorna tutto
    function updateDisplay() {
        applyFiltersAndSort();
        renderKPIs();
        renderCurrentView();
    }

    // ========= 5. POPOLAMENTO FILTRI E AGGANCIO EVENTI (Copiato da Task.html) =========
    function setupControls() {
        // Popola filtro owner
        const owners = ['all', ...new Set(allProjectTasks.map(t => t.owner))];
        document.getElementById('owner-filter').innerHTML = owners.map(o => `<option value="${o}">${o === 'all' ? 'Tutti gli Owner' : o}</option>`).join('');
        
        // Popola filtro criticità
        const criticalities = [...new Set(allProjectTasks.map(t => t.criticality))];
        document.getElementById('criticality-filter-container').innerHTML = criticalities.map(c => `<div class="flex items-center"><input type="checkbox" value="${c}" class="h-4 w-4 rounded crit-checkbox"><label class="ml-2 text-sm">${c}</label></div>`).join('');

        // Aggiungi eventi a tutti i filtri
        document.getElementById('owner-filter').addEventListener('change', updateDisplay);
        document.getElementById('date-start-filter').addEventListener('change', updateDisplay);
        document.getElementById('date-end-filter').addEventListener('change', updateDisplay);
        document.getElementById('late-status-filter').addEventListener('change', updateDisplay);
        document.querySelectorAll('.crit-checkbox').forEach(el => el.addEventListener('change', updateDisplay));

        // Aggiungi eventi ai bottoni della vista
        document.getElementById('view-table-btn').addEventListener('click', () => {
            currentView = 'table';
            updateDisplay();
        });
        document.getElementById('view-gantt-btn').addEventListener('click', () => {
            currentView = 'gantt';
            updateDisplay();
        });
    }

    // ========= 6. PRIMO AVVIO DELLA VISTA =========
    setupControls();
    updateDisplay();
}

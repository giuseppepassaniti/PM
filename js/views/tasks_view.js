// js/views/tasks_view.js

// Funzioni Helper
const parseItalianDateForDisplay = (date) => date ? new Date(date).toLocaleDateString('it-IT') : '';

// La funzione di rendering principale
export function renderTasksView(container, appState, projectId) {
    // --- Preparazione Dati sicura ---
    const project = projectId ? appState.allData.projects.find(p => p.id === projectId) : null;
    const allProjectTasks = projectId ? appState.allData.tasks.filter(t => t.project === projectId) : [];

    // --- Stato Interno della Vista ---
    let filteredTasks = [...allProjectTasks];
    // ... qui puoi aggiungere logica per la vista corrente (table/gantt) e l'ordinamento

    // --- HTML della Vista ---
    const viewHtml = `
        <div class="mb-4">
            <a href="#" class="text-blue-600 hover:underline">&larr; Torna a tutti i progetti</a>
        </div>
        <header class="mb-6">
            <h2 class="text-3xl font-bold text-slate-900">Dettaglio Task: ${project ? project.name : 'Progetto non specificato'}</h2>
            <p class="text-slate-600 mt-1">Stato di avanzamento delle attività operative.</p>
        </header>
        
        <div id="kpi-section" class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            </div>

        <div id="task-content-container">
            </div>
    `;
    container.innerHTML = viewHtml;

    // --- Funzioni di Rendering Interne ---
    function renderKPIs() {
        const kpiContainer = document.getElementById('kpi-section');
        const totalTasks = filteredTasks.length;
        const completedTasks = filteredTasks.filter(t => t.status === 'Completato').length;
        const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        kpiContainer.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm text-slate-500">Task Totali</p><p class="text-2xl font-bold">${totalTasks}</p></div>
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm text-slate-500">% Completati</p><p class="text-2xl font-bold">${completionPercentage}%</p></div>
            `;
    }

    function renderTableView() {
        const tableContainer = document.getElementById('task-content-container');
        if (filteredTasks.length === 0) {
            tableContainer.innerHTML = '<div class="bg-white p-4 rounded-lg shadow text-center">Nessun task da visualizzare per questo progetto.</div>';
            return;
        }
        
        const tableHtml = `
            <div class="overflow-x-auto bg-white rounded-lg shadow">
                <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Titolo Task</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Owner</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Deadline</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Stato</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        ${filteredTasks.map(task => `
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-4 whitespace-nowrap">${task.title}</td>
                                <td class="px-4 py-4 whitespace-nowrap">${task.owner}</td>
                                <td class="px-4 py-4 whitespace-nowrap">${parseItalianDateForDisplay(task.deadline)}</td>
                                <td class="px-4 py-4 whitespace-nowrap">${task.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        tableContainer.innerHTML = tableHtml;
    }
    
    // --- Esecuzione iniziale ---
    if (!project) {
        container.innerHTML = '<div class="text-center text-red-500">ID progetto non valido o non trovato.</div>';
        return;
    }
    
    renderKPIs();
    renderTableView();
}

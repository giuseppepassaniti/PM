// js/views/tasks_view.js

// Qui potremmo importare funzioni comuni, ma per ora le teniamo locali
const parseItalianDate = (date) => date ? new Date(date).toLocaleDateString('it-IT') : '';

// La funzione principale che disegna la vista dei task
export function renderTasksView(container, appState, projectId) {
    // 1. Filtra i dati per ottenere solo i task del progetto selezionato
    const projectTasks = appState.allData.tasks.filter(t => t.project === projectId);
    const project = appState.allData.projects.find(p => p.id === projectId);

    // 2. Logica di calcolo dei KPI (dal tuo Task.html originale)
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(t => t.status === 'Completato').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    // Aggiungi qui altri calcoli KPI se necessario...

    // 3. Struttura HTML della vista
    let html = `
        <div class="mb-4">
            <a href="#" class="text-blue-600 hover:underline">&larr; Torna a tutti i progetti</a>
        </div>
        <header class="mb-6">
            <h2 class="text-3xl font-bold text-slate-900">Dettaglio Task: ${project.name}</h2>
            <p class="text-slate-600 mt-1">Stato di avanzamento delle attività operative.</p>
        </header>
        
        <div id="kpi-section" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm text-slate-500">Task Totali</p><p class="text-2xl font-bold">${totalTasks}</p></div>
            <div class="bg-white p-4 rounded-lg shadow"><p class="text-sm text-slate-500">% Completati</p><p class="text-2xl font-bold">${completionPercentage}%</p></div>
            </div>

        <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-bold text-slate-800">Dettaglio Task</h2>
            <div class="flex items-center bg-slate-200 rounded-lg p-1">
                <button id="view-table-btn" class="px-4 py-1 text-sm font-semibold rounded-md bg-white shadow text-blue-600">Tabella</button>
                <button id="view-gantt-btn" class="px-4 py-1 text-sm font-semibold rounded-md text-slate-600">Timeline</button>
            </div>
        </div>

        <div id="task-content-container"></div>
    `;

    container.innerHTML = html;

    // 4. Funzione per renderizzare la tabella (presa e adattata da Task.html)
    function renderTableView() {
        const tableContainer = document.getElementById('task-content-container');
        if (projectTasks.length === 0) {
            tableContainer.innerHTML = '<p>Nessun task per questo progetto.</p>';
            return;
        }
        
        const tableHtml = `
            <div class="overflow-x-auto bg-white rounded-lg shadow">
                <table class="min-w-full divide-y divide-slate-200">
                    <thead class="bg-slate-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Titolo Task</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Owner</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Stato</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200">
                        ${projectTasks.map(task => `
                            <tr class="hover:bg-slate-50">
                                <td class="px-4 py-4 whitespace-nowrap">${task.title}</td>
                                <td class="px-4 py-4 whitespace-nowrap">${task.owner}</td>
                                <td class="px-4 py-4 whitespace-nowrap">${parseItalianDate(task.deadline)}</td>
                                <td class="px-4 py-4 whitespace-nowrap">${task.status}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        tableContainer.innerHTML = tableHtml;
    }

    // Per ora, la vista Gantt è un segnaposto
    function renderGanttView() {
        document.getElementById('task-content-container').innerHTML = '<p>La vista Gantt sarà implementata qui.</p>';
    }

    // 5. Aggiungi gli event listener per i bottoni Tabella/Timeline
    document.getElementById('view-table-btn').addEventListener('click', renderTableView);
    document.getElementById('view-gantt-btn').addEventListener('click', renderGanttView);

    // 6. Renderizza la vista di default (la tabella)
    renderTableView();
}

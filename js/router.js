// js/router.js

// Importiamo le funzioni di rendering da ogni vista.
// Per ora solo quella dei progetti è reale, le altre le aggiungeremo dopo.
import { renderProjectsView } from './views/progetti_view.js';
// import { renderTasksView } from './views/tasks_view.js'; // Sblocccheremo queste dopo
// import { renderImprevistiView } from './views/imprevisti_view.js';

const appContainer = document.getElementById('app-container');

// Funzione che gestisce il cambio di rotta
function handleRouteChange(appState) {
    const hash = window.location.hash || '#'; // Prende l'hash o usa '#' come default
    const [path, id] = hash.substring(1).split('/'); // Es: #tasks/PJT-1001 -> ['tasks', 'PJT-1001']

    console.log(`Navigazione a: path=${path}, id=${id}`);
    
    // Pulisce il contenitore prima di disegnare la nuova vista
    appContainer.innerHTML = ''; 

    switch (path) {
        case 'tasks':
            // renderTasksView(appContainer, appState, id);
            appContainer.innerHTML = `<h1>WIP: Vista Task per ${id}</h1>`; // Segnaposto temporaneo
            break;
        case 'imprevisti':
            // renderImprevistiView(appContainer, appState, id);
            appContainer.innerHTML = `<h1>WIP: Vista Imprevisti per ${id}</h1>`; // Segnaposto temporaneo
            break;
        // Aggiungi qui gli altri 'case' per varianti, milestone, etc.

        default:
            // Se l'hash è vuoto o non corrisponde a nulla, mostra la dashboard dei progetti
            renderProjectsView(appContainer, appState);
            break;
    }
    // Riattiva le icone Lucide dopo ogni cambio di vista
    lucide.createIcons();
}

// Funzione che inizializza il router
export function initRouter(appState) {
    // Gestisce il cambio di hash
    window.addEventListener('hashchange', () => handleRouteChange(appState));
    
    // Gestisce il caricamento iniziale della pagina
    handleRouteChange(appState);
}
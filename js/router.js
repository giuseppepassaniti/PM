// js/router.js

import { renderProjectsView } from './views/progetti_view.js';
import { renderTasksView } from './views/tasks_view.js';

const appContainer = document.getElementById('app-container');

function handleRouteChange(appState) {
    const hash = window.location.hash || '#';
    const [path, id] = hash.substring(1).split('/');

    console.log(`Navigazione a: path=${path}, id=${id}`);
    
    appContainer.innerHTML = ''; 

    switch (path) {
        case 'tasks':
            // Ora la funzione della vista Task viene chiamata correttamente
            renderTasksView(appContainer, appState, id);
            break;
        case 'imprevisti':
            // Qui andrà la chiamata a renderImprevistiView quando sarà pronta
            appContainer.innerHTML = `<h1>WIP: Vista Imprevisti per ${id}</h1>`;
            break;
        // Aggiungi qui gli altri 'case' per le future viste

        default:
            renderProjectsView(appContainer, appState);
            break;
    }
    
    lucide.createIcons();
}

export function initRouter(appState) {
    window.addEventListener('hashchange', () => handleRouteChange(appState));
    handleRouteChange(appState);
}

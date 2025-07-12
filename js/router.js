// js/router.js

import { renderProjectsView } from './views/progetti_view.js';
import { renderTasksView } from './views/tasks_view.js';
// Importa qui le altre viste quando saranno pronte

const appContainer = document.getElementById('app-container');

function handleRouteChange(appState) {
    const hash = window.location.hash || '#';
    const [path, id] = hash.substring(1).split('/');

    console.log(`Navigazione a: path=${path}, id=${id}`);
    
    appContainer.innerHTML = ''; 

    switch (path) {
        case 'tasks':
            if (!id) {
                window.location.hash = '#'; // Se non c'è ID, torna alla home
            } else {
                renderTasksView(appContainer, appState, id);
            }
            break;

        // Aggiungi qui gli altri 'case' per le future viste. Esempio:
        /*
        case 'imprevisti':
            if (!id) {
                window.location.hash = '#';
            } else {
                renderImprevistiView(appContainer, appState, id);
            }
            break;
        */

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

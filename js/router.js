// js/router.js

import { renderProjectsView } from './views/progetti_view.js';
import { renderTasksView } from './views/tasks_view.js';
import { renderImprevistiView } from './views/imprevisti_view.js'; // <-- NUOVO IMPORT

const appContainer = document.getElementById('app-container');

function handleRouteChange(appState) {
    const hash = window.location.hash || '#';
    const [path, id] = hash.substring(1).split('/');
    
    appContainer.innerHTML = ''; 

    switch (path) {
        case 'tasks':
            if (!id) { window.location.hash = '#'; } 
            else { renderTasksView(appContainer, appState, id); }
            break;
        
        case 'imprevisti': // <-- NUOVO CASE
            if (!id) { window.location.hash = '#'; } 
            else { renderImprevistiView(appContainer, appState, id); }
            break;

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

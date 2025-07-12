// js/main.js

import { loadAllData } from './data_loader.js';
import { initRouter } from './router.js'; // Importiamo il nostro nuovo router

const AppState = {
    allData: null,
};

async function initializeApp() {
    console.log("Applicazione in fase di inizializzazione...");
    
    AppState.allData = await loadAllData();

    if (AppState.allData) {
        console.log("Dati caricati e pronti. Avvio del router.", AppState.allData);
        // INIZIALIZZA IL ROUTER E PASSA I DATI
        initRouter(AppState); 
    } else {
        console.error("Inizializzazione fallita: dati non disponibili.");
        document.getElementById('app-container').innerHTML = 
            `<div class="text-center text-red-500">Impossibile caricare i dati. Controlla la console per i dettagli.</div>`;
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
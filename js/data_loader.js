// Funzioni di utility per la pulizia dei dati, ora corrette e più robuste
const parseCurrency = (str) => {
    if (!str) return 0; // Se str è nullo o vuoto, restituisce 0
    return parseFloat(str.replace(/[.€\s]/g, '').replace(',', '.')) || 0;
};
const parsePercentage = (str) => {
    if (!str) return 0;
    return parseInt(str.replace('%', ''), 10) || 0;
};
const parseDays = (str) => {
    if (!str) return 0;
    return parseInt(str.replace('+', ''), 10) || 0;
};
const parseItalianDate = (dateString) => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    // Formato GG/MM/AAAA -> new Date(AAAA, MM-1, GG)
    return new Date(parts[2], parts[1] - 1, parts[0]);
};

// Funzione per caricare un singolo CSV
function fetchAndParseCsv(url) {
    return new Promise((resolve, reject) => {
        Papa.parse(url, {
            download: true,
            header: true,
            skipEmptyLines: true,
            transform: (value) => value.trim(),
            complete: results => resolve(results.data),
            error: err => reject(err),
        });
    });
}

export async function loadAllData() {
    console.log("Inizio caricamento dati...");
    try {
        const [projects, tasks, imprevisti, varianti, milestones, decisions] = await Promise.all([
            // ASSICURATI CHE I PERCORSI SIANO QUESTI:
            fetchAndParseCsv('data/progetti.csv'),
            fetchAndParseCsv('data/tasks.csv'),
            fetchAndParseCsv('data/imprevisti.csv'),
            fetchAndParseCsv('data/varianti.csv'),
            fetchAndParseCsv('data/milestone.csv'),
            fetchAndParseCsv('data/decisioni.csv'),
        ]);

        console.log("Dati grezzi caricati, inizio elaborazione...");

        // Ora elaboriamo i dati per convertirli nei formati corretti
        const processedData = {
            projects: projects.map(p => ({
                id: p['Id Progetto'],
                name: p['Nome Progetto'],
                client: p.Cliente,
                pm: p['PM responsabile'],
                status: p.Stato,
                budget: parseCurrency(p['Budget Inziale']),
                costs: parseCurrency(p['Costi Sostenuti']),
                forecast: parseCurrency(p['Previsione Finale Costi']),
                progress: parsePercentage(p['% Avanzamento'])
            })),
            tasks: tasks.map(t => ({
                id: t.ID,
                title: t['Titolo Task'],
                project: t.Progetto,
                owner: t.Owner,
                startDate: parseItalianDate(t['Start Date']),
                deadline: parseItalianDate(t.Deadline),
                status: t.Stato,
                criticality: t.Criticità || 'Bassa',
            })),
            // Aggiungi qui la logica di processing anche per gli altri file
            // Esempio per gli imprevisti:
            imprevisti: (imprevisti || []).map(i => ({
    title: i['Titolo Imprevisto'],
    project: i.Progetto,
    description: i['Descrizione Problema'],
    type: i.Tipo,
    criticality: i.Criticità || 'Bassa', // <-- AGGIUNTO: Se la criticità è vuota, la imposta a 'Bassa'
    date: parseItalianDate(i['Data Imprevisti']), // <-- CORRETTO: 'Imprevisti' invece di 'Improvisti'
    status: i.Stato,
    risk: i['Rischio Previsionale'], // <-- CORRETTO: 'Previsionale' invece di 'Previsioanle'
})),

            // ... e così via per varianti, milestones, decisioni.
            varianti, // Per ora li lasciamo grezzi come esempio
            milestones,
            decisions
        };
        
        console.log("Elaborazione dati completata.");
        return processedData;

    } catch (error) {
        console.error("Errore durante il caricamento dei dati CSV:", error);
        // Potremmo mostrare un errore all'utente qui
        return null;
    }
}

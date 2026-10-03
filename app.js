// URL del Web App de Google Apps Script 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyUx3xvBTGwS7zUccDMYb275oRgo8ZVaZKeHSqUGyWCYNAtsLTdADAlF7tCGMgSgXYv/exec";

const AUTHORIZED_CURPS = {
    "CURPVALIDA12345678": "Juan Pérez López",
    "CURPVALIDA87654321": "María Gómez García"
};

let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let syncedHistory = JSON.parse(localStorage.getItem('syncedHistory')) || [];
let currentUser = null;
let previousScreen = 'screen-welcome';

let currentEstatusVisita = "LOCALIZADO"; 
let motivoNoLocalizadoValue = "";        

const DB_NAME = "R02_DB";
const DB_VERSION = 1;
const STORE_NAME = "derechohabientes";
let db;

const request = indexedDB.open(DB_NAME, DB_VERSION);
request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "CURP" });
        store.createIndex("by_nombre", "NOMBRE", { unique: false });
        store.createIndex("by_calle", "CALLE", { unique: false });
    }
};
request.onsuccess = (e) => { db = e.target.result; };
request.onerror = (e) => { console.error("Error IndexedDB:", e.target.error); };

function changeScreen(screenId) {
    if (screenId !== 'screen-history') previousScreen = screenId;
    if (screenId === 'screen-search') preloadDatabaseToMemory();
    document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}
function login() {
    const curpInput = document.getElementById('login-curp').value.trim().toUpperCase();
    if (AUTHORIZED_CURPS[curpInput]) {
        currentUser = { curp: curpInput, name: AUTHORIZED_CURPS[curpInput] };
        document.getElementById('welcome-message').innerText = `Bienvenido(a), ${currentUser.name}`;
        changeScreen('screen-welcome');
    } else {
        alert("CURP no autorizada o inválida.");
    }
}

async function downloadAllDataMassive() {
    const btn = document.getElementById('btn-massive-download');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    if (!db) return alert("La base de datos local aún no está lista.");
    
    btn.disabled = true;
    progressContainer.style.display = "block";
    let offset = 0, limit = 10000, isDone = false, totalCargados = 0;
    
    const txClear = db.transaction(STORE_NAME, "readwrite");
    txClear.objectStore(STORE_NAME).clear();
    
    try {
        while (!isDone) {
            progressText.innerText = `Descargando registros: ${totalCargados} acumulados...`;
            const url = `${GOOGLE_SCRIPT_URL}?action=getAllData&offset=${offset}&limit=${limit}&_=${new Date().getTime()}`;
            const response = await fetch(url);
            const textData = await response.text();
            let data = JSON.parse(textData);
            
            if (data && data.records && data.records.length > 0) {
                const tx = db.transaction(STORE_NAME, "readwrite");
                const store = tx.objectStore(STORE_NAME);
                data.records.forEach(record => {
                    if (record && record.CURP) {
                        record.CURP = String(record.CURP).replace(/ /g, "").toUpperCase().trim();
                        store.put(record); 
                        totalCargados++;
                    }
                });
                await new Promise((resolve) => { tx.oncomplete = resolve; });
            }
            isDone = data.done === true || data.records.length === 0;
            offset = data.nextOffset || (offset + limit);
            progressBar.style.width = `${Math.min(100, Math.round((offset / 25000) * 100))}%`;
        }
        progressText.innerText = `¡Descarga completa! ${totalCargados} registros listos.`;
        alert(`Éxito: Se guardaron ${totalCargados} registros.`);
    } catch (error) {
        alert(`Error: ${error.message}`);
    } { btn.disabled = false; }
}
let localMemoryDatabase = [];
function preloadDatabaseToMemory() {
    if (!db) return;
    const tx = db.transaction(STORE_NAME, "readonly");
    tx.objectStore(STORE_NAME).getAll().onsuccess = (e) => {
        localMemoryDatabase = e.target.result || [];
    };
}

function searchData() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = "";
    if (query.length < 3) return;

    const searchTokens = query.split(/\s+/); 
    let matchedRecords = [];

    for (let i = 0; i < localMemoryDatabase.length; i++) {
        const item = localMemoryDatabase[i];
        if (!item) continue;
        const combinedText = `${item['NOMBRE'] || ''} ${item['AP PATERNO'] || ''} ${item['AP MATERNO'] || ''} ${item['CURP'] || ''} ${item['CALLE'] || ''} ${item['NUM EXT'] || ''} ${item['COLONIA'] || ''}`.toLowerCase();
        if (searchTokens.every(t => combinedText.includes(t))) matchedRecords.push(item);
    }

    matchedRecords.sort((a, b) => String(a['NUM EXT']).localeCompare(String(b['NUM EXT'])));
    matchedRecords.slice(0, 30).forEach(item => {
        const div = document.createElement('div');
        const fueVis = (item['Latitud'] && item['Latitud'] !== "0") || pendingSync.some(p => p.CURP === item.CURP);
        div.className = fueVis ? "result-item status-visitado" : "result-item";
        div.innerHTML = `<div><b>${item['NOMBRE'] || ''} ${item['AP PATERNO'] || ''}</b></div><div class='text-xs text-gray-500'>CURP: ${item['CURP']}</div>`;
        div.onclick = () => openForm(item);
        resultsContainer.appendChild(div);
    });
}

function seleccionarEstatusVisita(estatus) {
    currentEstatusVisita = estatus.toUpperCase();
    if (currentEstatusVisita === "NO LOCALIZADO") {
        let mot = prompt("Escriba el motivo por el cual NO FUE LOCALIZADO:");
        if (!mot) { currentEstatusVisita = "LOCALIZADO"; return; }
        motivoNoLocalizadoValue = mot.trim();
    } else { motivoNoLocalizadoValue = ""; }
}

// CORRECCIÓN EXACTA DE LOS IDs DE TU FORMULARIO
function openForm(item) {
    if (!item) return;
    document.getElementById('f-curp').value = item['CURP'] || '';
    document.getElementById('f-id').value = item['ID'] || '';
    document.getElementById('f-nombre').value = item['NOMBRE'] || '';
    document.getElementById('f-paterno').value = item['AP PATERNO'] || '';
    document.getElementById('f-materno').value = item['AP MATERNO'] || '';
    document.getElementById('f-telfijo').value = item['TEL FIJO'] || '';
    document.getElementById('f-telcel').value = item['TEL CEL'] || '';
    document.getElementById('f-municipio').value = item['MUNICIPIO'] || '';
    document.getElementById('f-localidad').value = item['LOCALIDAD'] || '';
    document.getElementById('f-seccion').value = item['SECCION'] || '';
    document.getElementById('f-colonia').value = item['COLONIA'] || '';
    document.getElementById('f-cp').value = item['CP'] || '';
    document.getElementById('f-calle').value = item['CALLE'] || '';
    document.getElementById('f-numext').value = item['NUM EXT'] || '';
    document.getElementById('f-referencia').value = item['REFERENCIA'] || '';
    document.getElementById('f-situacion').value = item['SITUACION'] || '';
    document.getElementById('f-causal').value = item['CAUSAL'] || '';

    currentEstatusVisita = item['ESTATUS_VISITA'] || "LOCALIZADO";
    motivoNoLocalizadoValue = item['MOTIVO_NO_LOCALIZADO'] || "";
    changeScreen('screen-form');
}
function saveData(event) {
    event.preventDefault();
    const targetCurp = document.getElementById('f-curp').value;
    const memoryIndex = localMemoryDatabase.findIndex(r => r.CURP === targetCurp);
    const originalRecord = memoryIndex !== -1 ? localMemoryDatabase[memoryIndex] : {};

    const record = {
        'CURP': targetCurp, 'ID': document.getElementById('f-id').value, 'NOMBRE': document.getElementById('f-nombre').value,
        'AP PATERNO': document.getElementById('f-paterno').value, 'AP MATERNO': document.getElementById('f-materno').value,
        'TEL FIJO': document.getElementById('f-telfijo').value, 'TEL CEL': document.getElementById('f-telcel').value,
        'MUNICIPIO': document.getElementById('f-municipio').value, 'LOCALIDAD': document.getElementById('f-localidad').value,
        'SECCION': document.getElementById('f-seccion').value, 'COLONIA': document.getElementById('f-colonia').value,
        'CP': document.getElementById('f-cp').value, 'CALLE': document.getElementById('f-calle').value,
        'NUM EXT': document.getElementById('f-numext').value, 'REFERENCIA': document.getElementById('f-referencia').value,
        'SITUACION': document.getElementById('f-situacion').value, 'CAUSAL': document.getElementById('f-causal').value,
        'ESTATUS_VISITA': currentEstatusVisita, 'MOTIVO_NO_LOCALIZADO': motivoNoLocalizadoValue,
        'Latitud': document.getElementById('f-lat').value, 'Longitud': document.getElementById('f-lon').value,
        'FECHA_MODIFICACION': new Date().toLocaleString("es-MX"), 'USUARIO_MODIFICA': currentUser.name,
        'SHEETS_ROW_INDEX': originalRecord.SHEETS_ROW_INDEX || ""
    };

    db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(record);
    if (memoryIndex !== -1) localMemoryDatabase[memoryIndex] = record; else localMemoryDatabase.push(record);
    pendingSync.push(record);
    localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
    changeScreen('screen-search');
}

function openHistoryScreen() {
    changeScreen('screen-history');
    document.getElementById('pending-count').innerText = pendingSync.length;
}
function goBackFromHistory() { changeScreen(previousScreen); }

async function syncWithSheets() {
    if (pendingSync.length === 0) return alert("No hay pendientes.");
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "sync", records: pendingSync })
        });
        const result = await response.json();
        if (result.status === "success") {
            syncedHistory = syncedHistory.concat(pendingSync);
            localStorage.setItem('syncedHistory', JSON.stringify(syncedHistory));
            pendingSync = []; localStorage.removeItem('pendingSync');
            openHistoryScreen(); alert("¡Sincronizado!");
        }
    } catch (e) { alert("Error de red."); }
}

function downloadBackupCSV() { /* Código original de exportación CSV idéntico */ }
function clearLocalStorage() { localStorage.clear(); location.reload(); }

// =========================================================================
// R02-DERECHOHABIENTES: CONFIGURACIÓN GENERAL Y ESTADO DE LA APP
// =========================================================================

// URL del Web App de Google Apps Script 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyBFzP8muJhXZsyHWeCmRrW_Yzev1yknhm9yVjH88tphPka4cjF7hYAPNPkCd_O3UOW/exec";

// CURPs Autorizadas en Código para la Pantalla de Acceso (Pantalla 1)
const AUTHORIZED_CURPS = {
    "CURPVALIDA12345678": "Juan Pérez López",
    "CURPVALIDA87654321": "María Gómez García"
};

let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let syncedHistory = JSON.parse(localStorage.getItem('syncedHistory')) || [];
let currentUser = null;
let previousScreen = 'screen-welcome';

// =========================================================================
// INITIALIZACIÓN DE INDEXEDDB (Base de Datos Local para soporte masivo)
// =========================================================================
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

request.onsuccess = (e) => { 
    db = e.target.result; 
    console.log("IndexedDB inicializada correctamente para soporte masivo.");
};

request.onerror = (e) => {
    console.error("Error al abrir IndexedDB:", e.target.error);
};
// NAVEGACIÓN GENERAL ENTRE PANTALLAS
function changeScreen(screenId) {
    if (screenId !== 'screen-history') {
        previousScreen = screenId;
    }
    if (screenId === 'screen-search') {
        preloadDatabaseToMemory();
    }
    document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// =========================================================================
// MÓDULO 2: PANTALLA 1 (LOGIN) Y PANTALLA 2 (DESCARGA)
// =========================================================================
function login() {
    const curpInput = document.getElementById('login-curp').value.trim().toUpperCase();
    if (AUTHORIZED_CURPS[curpInput]) {
        currentUser = { curp: curpInput, name: AUTHORIZED_CURPS[curpInput] };
        document.getElementById('welcome-message').innerText = `Bienvenido(a), ${currentUser.name}`;
        changeScreen('screen-welcome');
    } else {
        alert("CURP no autorizada o inválida en el sistema.");
    }
}
async function downloadAllDataMassive() {
    const btn = document.getElementById('btn-massive-download');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    if (!db) return alert("La base de datos local aún no está lista. Reintente en un segundo.");
    
    btn.disabled = true;
    progressContainer.style.display = "block";
    
    let offset = 0;
    let limit = 10000; 
    let isDone = false;
    let totalCargados = 0;
    
    const txClear = db.transaction(STORE_NAME, "readwrite");
    txClear.objectStore(STORE_NAME).clear();
    
    try {
        while (!isDone) {
            progressText.innerText = `Descargando registros: ${totalCargados} acumulados...`;
            
            const url = `${GOOGLE_SCRIPT_URL}?action=getAllData&offset=${offset}&limit=${limit}&_=${new Date().getTime()}`;
            const response = await fetch(url);
            
            if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
            
            const textData = await response.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (jsonParseError) {
                throw new Error("El servidor de Google devolvió un formato corrompido.");
            }
            
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
            
            let percentage = Math.min(100, Math.round((offset / 25000) * 100));
            progressBar.style.width = `${percentage}%`;
        }
        
        progressText.innerText = `¡Descarga completa! ${totalCargados} derechohabientes listos offline.`;
        alert(`Éxito: Se han guardado ${totalCargados} registros en la memoria interna.`);
    } catch (error) {
        console.error(error);
        alert(`Error en la transferencia: ${error.message}`);
    } finally {
        window.setTimeout(() => { btn.disabled = false; }, 1000);
    }
}
// =========================================================================
// MÓDULO 3: PANTALLA 3 (BUSCADOR FLEXIBLE) Y PANTALLA 4 (FORMULARIO Y GPS)
// =========================================================================
let localMemoryDatabase = [];

function preloadDatabaseToMemory() {
    if (!db) return;
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const requestGetAll = store.getAll(); 

    requestGetAll.onsuccess = (e) => {
        localMemoryDatabase = e.target.result || [];
        console.log(`Base de datos de ${localMemoryDatabase.length} registros precargada en RAM.`);
    };
}

function searchData() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = "";

    if (query.length < 3) return;
    if (localMemoryDatabase.length === 0) preloadDatabaseToMemory();

    const searchTokens = query.split(/\s+/); 
    let matchedRecords = [];

    for (let i = 0; i < localMemoryDatabase.length; i++) {
        const item = localMemoryDatabase[i];
        if (!item) continue;

        const calle = item.CALLE ? String(item.CALLE).toLowerCase() : "";
        const numExt = item.NUM_EXT ? String(item.NUM_EXT).toLowerCase() : "";
        const colonia = item.COLONIA ? String(item.COLONIA).toLowerCase() : "";
        const nombre = item.NOMBRE ? String(item.NOMBRE).toLowerCase() : "";
        const curp = item.CURP ? String(item.CURP).toLowerCase() : "";
        const apPaterno = item.AP_PATERNO ? String(item.AP_PATERNO).toLowerCase() : "";
        const apMaterno = item.AP_MATERNO ? String(item.AP_MATERNO).toLowerCase() : "";

        const combinedText = `${nombre} ${apPaterno} ${apMaterno} ${curp} ${calle} ${numExt} ${colonia}`;
        const isMatch = searchTokens.every(token => combinedText.includes(token));

        if (isMatch) {
            matchedRecords.push(item);
        }
    }
    matchedRecords.sort((a, b) => {
        const valA = a.NUM_EXT ? String(a.NUM_EXT).trim() : "";
        const valB = b.NUM_EXT ? String(b.NUM_EXT).trim() : "";
        const numA = parseInt(valA.match(/\d+/), 10);
        const numB = parseInt(valB.match(/\d+/), 10);

        if (isNaN(numA) && isNaN(numB)) return valA.localeCompare(valB);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        if (numA === numB) return valA.localeCompare(valB);
        return numA - numB;
    });

    // Pinta las tarjetas resultantes en la interfaz de usuario
    matchedRecords.forEach(record => {
        const div = document.createElement('div');
        div.className = "p-4 border-b bg-white rounded-lg shadow-sm mb-2 cursor-pointer hover:bg-gray-50 transition";
        div.onclick = () => {
            // Lógica original para abrir tu formulario pasándole el registro completo
            openUpdateForm(record); 
        };
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold text-gray-900">${record.NOMBRE || ''} ${record.AP_PATERNO || ''} ${record.AP_MATERNO || ''}</p>
                    <p class="text-xs text-gray-500 mt-1">CURP: ${record.CURP || ''} | ID: ${record.ID || ''}</p>
                    <p class="text-xs text-gray-700 mt-1"><b>Dom:</b> Calle ${record.CALLE || ''} Num. ${record.NUM_EXT || ''}, Col. ${record.COLONIA || ''}</p>
                </div>
                <span class="text-xs px-2 py-1 rounded-full font-bold ${record.SITUACION ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${record.SITUACION || 'PENDIENTE'}
                </span>
            </div>
        `;
        resultsContainer.appendChild(div);
    });

    if (matchedRecords.length === 0) {
        resultsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No se encontraron coincidencias en la base offline.</p>';
    }
}

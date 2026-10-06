// =========================================================================
// R02-DERECHOHABIENTES: CONFIGURACIÓN GENERAL Y ESTADO DE LA APP
// =========================================================================

// URL del Web App de Google Apps Script 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyqTsx1_NY7U-ynbVKDdgquBcwxyAo7AIU3oEJYbBVXjBaMb7OKdsSAeeDHVXRfmRWG/exec";

// =========================================================================
// MÓDULO 1: DICCIONARIO DE BRIGADISTAS CON ASIGNACIÓN DE MUNICIPIO
// =========================================================================
const AUTHORIZED_CURPS = {
    "CURPVALIDA12345678": {
        name: "Juan Pérez López",
        municipio: "GOMEZ PALACIO" // Escribe el municipio tal cual viene en tu Sheets (Mayúsculas/Acentos)
    },
    "CURPVALIDA87654321": {
        name: "María Gómez García",
        municipio: "MAPIMI"
    }
};

let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let syncedHistory = JSON.parse(localStorage.getItem('syncedHistory')) || [];

// Estados del usuario firmados localmente
let currentUser = null;
let currentBrigadistaMunicipio = ""; // Almacena el municipio del brigadista logueado

let previousScreen = 'screen-welcome';

// VARIABLES PARA LOS BOTONES DE LOCALIZADO / NO LOCALIZADO
let currentEstatusVisita = "LOCALIZADO"; 
let motivoNoLocalizadoValue = "";        

// INITIALIZACIÓN DE INDEXEDDB (Base de Datos Local para soporte masivo)
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
    updateLocalCounter();
};

request.onerror = (e) => { console.error("Error IndexedDB:", e.target.error); };

function updateLocalCounter() {
    if (!db) return;
    const countRequest = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).count();
    countRequest.onsuccess = () => {
        const countElement = document.getElementById('local-db-count');
        if (countElement) countElement.innerText = countRequest.result;
    };
}
// NAVEGACIÓN GENERAL ENTRE PANTALLAS
function changeScreen(screenId) {
    if (screenId !== 'screen-history') previousScreen = screenId;
    if (screenId === 'screen-search') preloadDatabaseToMemory();
    if (screenId === 'screen-welcome') updateLocalCounter(); 
    
    document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
    
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) targetScreen.classList.remove('hidden');

    const bottomNav = document.getElementById('app-bottom-nav');
    if (!bottomNav) return;
    
    if (screenId === 'screen-login' || screenId === 'screen-form') {
        bottomNav.style.setProperty('display', 'none', 'important');
        bottomNav.classList.add('hidden');
    } else {
        bottomNav.style.setProperty('display', 'flex', 'important');
        bottomNav.classList.remove('hidden');
        
        document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
        if (screenId === 'screen-welcome') document.getElementById('nav-welcome').classList.add('active');
        if (screenId === 'screen-search') document.getElementById('nav-search').classList.add('active');
        if (screenId === 'screen-history') document.getElementById('nav-history').classList.add('active');
    }
}

// CORRECCIÓN DEL LOGIN: Captura el nombre y el municipio asignado de forma instantánea
function login() {
    const curpInput = document.getElementById('login-curp').value.trim().toUpperCase();
    const brigadistaEncontrado = AUTHORIZED_CURPS[curpInput];
    
    if (brigadistaEncontrado) {
        currentUser = { curp: curpInput, name: brigadistaEncontrado.name };
        currentBrigadistaMunicipio = brigadistaEncontrado.municipio.toUpperCase().trim(); // Firma el territorio del usuario
        
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
        updateLocalCounter(); 
        alert(`Éxito: Se guardaron ${totalCargados} registros.`);
    } catch (error) { alert(`Error: ${error.message}`); } finally { btn.disabled = false; }
}
let localMemoryDatabase = [];
function preloadDatabaseToMemory() {
    if (!db) return;
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll().onsuccess = (e) => {
        localMemoryDatabase = e.target.result || [];
    };
}

// CORRECCIÓN DE BÚSQUEDA: Candado geográfico estricto por Municipio asignado
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

        // FILTRO GEOGRÁFICO: Extrae el municipio del derechohabiente actual
        const municipioDerechohabiente = item['MUNICIPIO'] ? String(item['MUNICIPIO']).toUpperCase().trim() : "";

        // Si el municipio del registro NO COINCIDE con el del brigadista, se lo salta y no lo muestra
        if (municipioDerechohabiente !== currentBrigadistaMunicipio) {
            continue; 
        }

        const combinedText = `${item['NOMBRE'] || ''} ${item['AP PATERNO'] || ''} ${item['AP MATERNO'] || ''} ${item['CURP'] || ''} ${item['CALLE'] || ''} ${item['NUM EXT'] || ''} ${item['COLONIA'] || ''}`.toLowerCase();
        if (searchTokens.every(t => combinedText.includes(t))) matchedRecords.push(item);
    }

    matchedRecords.sort((a, b) => String(a['NUM EXT']).localeCompare(String(b['NUM EXT'])));
    matchedRecords.slice(0, 30).forEach(item => {
        const div = document.createElement('div');
        const estatusActual = item['ESTATUS_VISITA'] || "";
        const estaEnColaPendiente = pendingSync.some(p => p['CURP'] === item['CURP']);
        const recordEnCola = pendingSync.find(p => p['CURP'] === item['CURP']);
        const estatusFinal = estaEnColaPendiente && recordEnCola ? recordEnCola['ESTATUS_VISITA'] : estatusActual;

        let claseColor = "result-item"; 
        let textoIndicador = "";

        if (estatusFinal === "LOCALIZADO") {
            claseColor = "result-item status-localizado"; 
            textoIndicador = ' <span style="color:#137333; font-weight:bold; font-size:12px; margin-left:5px;">✓ Localizado</span>';
        } else if (estatusFinal === "NO LOCALIZADO") {
            claseColor = "result-item status-nolocalizado"; 
            textoIndicador = ' <span style="color:#C5221F; font-weight:bold; font-size:12px; margin-left:5px;">✗ No Localizado</span>';
        }

        div.className = claseColor;
        div.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:var(--dark-color); margin-bottom:2px;">
                ${item['NOMBRE'] || ''} ${item['AP PATERNO'] || ''} ${item['AP MATERNO'] || ''}${textoIndicador}
            </div>
            <div style="font-size:13px; font-weight:600; color:var(--primary-color); margin-bottom:4px; letter-spacing:0.3px;">
                CURP: ${item['CURP'] || 'SIN CURP'}
            </div>
            <div style="font-size:13px; color:#555555;">
                📍 Calle: ${item['CALLE'] || 'S/C'}, No. Ext: ${item['NUM EXT'] || 'S/N'}, Col. ${item['COLONIA'] || 'S/C'}
            </div>
        `;
        div.onclick = () => openForm(item);
        resultsContainer.appendChild(div);
    });
}

function seleccionarEstatusVisita(estatus) {
    currentEstatusVisita = estatus.toUpperCase();
    if (currentEstatusVisita === "NO LOCALIZADO") {
        let mot = prompt("Escriba el motivo por el cual NO FUE LOCALIZADO:");
        if (!mot || mot.trim() === "") { 
            alert("🛑 Operación cancelada: Debe ingresar un motivo válido.");
            currentEstatusVisita = "LOCALIZADO"; 
            motivoNoLocalizadoValue = "";
            actualizarEstilosBotonesFormulario();
            return; 
        }
        motivoNoLocalizadoValue = mot.trim();
    } else { motivoNoLocalizadoValue = ""; }
    actualizarEstilosBotonesFormulario();
}

function actualizarEstilosBotonesFormulario() {
    const btnLoc = document.getElementById('btn-status-localizado');
    const btnNoLoc = document.getElementById('btn-status-nolocalizado');
    if (!btnLoc || !btnNoLoc) return;

    if (currentEstatusVisita === "LOCALIZADO") {
        btnLoc.style.backgroundColor = "#E6F4EA";
        btnLoc.style.borderColor = "#137333";
        btnLoc.style.color = "#137333";
        btnLoc.style.boxShadow = "0 4px 12px rgba(19, 115, 51, 0.25), inset 0 2px 4px rgba(255,255,255,0.6)";
        btnLoc.style.transform = "scale(1.02)";
        btnNoLoc.style.backgroundColor = "#F3F4F6";
        btnNoLoc.style.borderColor = "#CBD5E0";
        btnNoLoc.style.color = "#9CA3AF";
        btnNoLoc.style.boxShadow = "none";
        btnNoLoc.style.transform = "scale(1)";
    } else if (currentEstatusVisita === "NO LOCALIZADO") {
        btnNoLoc.style.backgroundColor = "#FCE8E6";
        btnNoLoc.style.borderColor = "#C5221F";
        btnNoLoc.style.color = "#C5221F";
        btnNoLoc.style.boxShadow = "0 4px 12px rgba(197, 34, 31, 0.25), inset 0 2px 4px rgba(255,255,255,0.6)";
        btnNoLoc.style.transform = "scale(1.02)";
        btnLoc.style.backgroundColor = "#F3F4F6";
        btnLoc.style.borderColor = "#CBD5E0";
        btnLoc.style.color = "#9CA3AF";
        btnLoc.style.boxShadow = "none";
        btnLoc.style.transform = "scale(1)";
    }
}
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
    actualizarEstilosBotonesFormulario();

    document.getElementById('f-lat').value = "Buscando satélite...";
    document.getElementById('f-lon').value = "Buscando satélite...";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('f-lat').value = String(position.coords.latitude.toFixed(6)).replace(",", ".");
                document.getElementById('f-lon').value = String(position.coords.longitude.toFixed(6)).replace(",", ".");
            },
            () => { 
                document.getElementById('f-lat').value = "ERROR";
                document.getElementById('f-lon').value = "ERROR";
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }
    changeScreen('screen-form');
}

function saveData(event) {
    event.preventDefault();
    const latValue = document.getElementById('f-lat').value;
    const lonValue = document.getElementById('f-lon').value;
    if (latValue.includes("Buscando") || latValue === "" || latValue === "ERROR") return alert("No se puede guardar sin georreferencia.");
    
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
        'Latitud': latValue, 'Longitud': lonValue,
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
    const logList = document.getElementById('history-log');
    logList.innerHTML = ""; 

    pendingSync.forEach((item) => {
        const div = document.createElement('div');
        div.className = "result-item";
        div.innerHTML = `<strong>⏳ ${item['NOMBRE'] || 'Derechohabiente'} (${item['CURP']})</strong><br><small>Pendiente de subir | Estatus: ${item['ESTATUS_VISITA']}</small>`;
        logList.appendChild(div);
    });

    syncedHistory.forEach((item) => {
        const div = document.createElement('div');
        div.className = "result-item";
        div.style.opacity = "0.6"; 
        div.innerHTML = `<strong>✅ ${item['NOMBRE'] || 'Derechohabiente'} (${item['CURP']})</strong><br><small style="color:green;">Sincronizado con Sheets con éxito | Estatus: ${item['ESTATUS_VISITA']}</small>`;
        logList.appendChild(div);
    });
}

async function syncWithSheets() {
    if (pendingSync.length === 0) return alert("No tienes registros pendientes.");
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
    } catch (e) { alert("Error de red temporal."); }
}

function downloadBackupCSV() {
    const allVisitsOfDay = pendingSync.concat(syncedHistory);
    if (allVisitsOfDay.length === 0) return alert("No hay datos.");
    const headers = ["CURP", "ID", "NOMBRE", "AP PATERNO", "AP MATERNO", "TEL FIJO", "TEL CEL", "MUNICIPIO", "LOCALIDAD", "SECCION", "COLONIA", "CP", "CALLE", "NUM EXT", "REFERENCIA", "SITUACION", "CAUSAL", "ESTATUS_VISITA", "MOTIVO_NO_LOCALIZADO", "Latitud", "Longitud", "FECHA_MODIFICACION", "USUARIO_MODIFICA"];
    let csvRows = [headers.join(",")];
    allVisitsOfDay.forEach(r => {
        csvRows.push(headers.map(h => {
            let v = r[h] !== undefined ? String(r[h]).trim() : "";
            return v.includes(",") ? `"${v.replace(/"/g, '""')}"` : v;
        }).join(","));
    });
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", URL.createObjectURL(new Blob(["\\ufeff" + csvRows.join("\\n")], { type: 'text/csv;charset=utf-8;' })));
    downloadAnchor.setAttribute("download", `R02_Reporte_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor); downloadAnchor.click(); document.body.removeChild(downloadAnchor);
}

function clearLocalStorage() {
    if (confirm("🚨 ADVERTENCIA: ¿Estás seguro de vaciar por completo la memoria? Se borrarán todos los registros descargados y pendientes.")) {
        pendingSync = []; syncedHistory = []; localMemoryDatabase = []; localStorage.clear();
        if (db) {
            db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear().onsuccess = () => {
                document.getElementById('search-input').value = "";
                document.getElementById('search-results').innerHTML = "";
                alert("Memoria interna e IndexedDB limpiadas correctamente.");
                changeScreen('screen-welcome'); 
            };
        } else { changeScreen('screen-welcome'); }
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => console.error(err));
    });
}

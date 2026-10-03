// =========================================================================
// R02-DERECHOHABIENTES: CONFIGURACIÓN GENERAL Y ESTADO DE LA APP
// =========================================================================

// URL del Web App de Google Apps Script 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzCQUpzNGcM0B81MUEH1LlV7peyw-j7IQ2xmtsuSilSGVbCNV2AjK3la_hTLc2am2ss/exec";

// CURPs Autorizadas en Código para la Pantalla de Acceso (Pantalla 1)
const AUTHORIZED_CURPS = {
    "CURPVALIDA12345678": "Juan Pérez López",
    "CURPVALIDA87654321": "María Gómez García"
};

let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let syncedHistory = JSON.parse(localStorage.getItem('syncedHistory')) || [];
let currentUser = null;
let previousScreen = 'screen-welcome';

// VARIABLES PARA LOS BOTONES DE LOCALIZADO / NO LOCALIZADO
let currentEstatusVisita = "LOCALIZADO"; 
let motivoNoLocalizadoValue = "";        

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

        // MAPEO EXACTO: Se adaptan los nombres a tus columnas con espacio de Sheets
        const calle = item['CALLE'] ? String(item['CALLE']).toLowerCase() : "";
        const numExt = item['NUM EXT'] ? String(item['NUM EXT']).toLowerCase() : "";
        const colonia = item['COLONIA'] ? String(item['COLONIA']).toLowerCase() : "";
        const nombre = item['NOMBRE'] ? String(item['NOMBRE']).toLowerCase() : "";
        const curp = item['CURP'] ? String(item['CURP']).toLowerCase() : "";
        const apPaterno = item['AP PATERNO'] ? String(item['AP PATERNO']).toLowerCase() : "";
        const apMaterno = item['AP MATERNO'] ? String(item['AP MATERNO']).toLowerCase() : "";

        const combinedText = `${nombre} ${apPaterno} ${apMaterno} ${curp} ${calle} ${numExt} ${colonia}`;
        const isMatch = searchTokens.every(token => combinedText.includes(token));

        if (isMatch) {
            matchedRecords.push(item);
        }
    }

    matchedRecords.sort((a, b) => {
        const valA = a['NUM EXT'] ? String(a['NUM EXT']).trim() : "";
        const valB = b['NUM EXT'] ? String(b['NUM EXT']).trim() : "";
        const numA = parseInt(valA.match(/\d+/), 10);
        const numB = parseInt(valB.match(/\d+/), 10);

        if (isNaN(numA) && isNaN(numB)) return valA.localeCompare(valB);
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        if (numA === numB) return valA.localeCompare(valB);
        return numA - numB;
    });

    const recordsToDisplay = matchedRecords.slice(0, 30);

    recordsToDisplay.forEach(item => {
        const div = document.createElement('div');
        
        const coordenadaLat = item['Latitud'] || item['latitud'] || "";
        const coordenadaLon = item['Longitud'] || item['longitud'] || "";

        const tieneLat = coordenadaLat !== "" && coordenadaLat !== "0" && coordenadaLat !== "ERROR" && !String(coordenadaLat).includes("Buscando");
        const tieneLon = coordenadaLon !== "" && coordenadaLon !== "0" && coordenadaLon !== "ERROR" && !String(coordenadaLon).includes("Buscando");
        
        const yaSincronizadoOModificado = tieneLat && tieneLon;
        const estaEnColaPendiente = pendingSync.some(p => p['CURP'] === item['CURP']);
        
        const fueVisitado = yaSincronizadoOModificado || estaEnColaPendiente;

        div.className = fueVisitado ? "result-item status-visitado" : "result-item";
        
        const displayNombre = item['NOMBRE'] ? String(item['NOMBRE']).trim() : '';
        const displayPaterno = item['AP PATERNO'] ? String(item['AP PATERNO']).trim() : '';
        const displayMaterno = item['AP MATERNO'] ? String(item['AP MATERNO']).trim() : '';
        const displayCurp = item['CURP'] ? String(item['CURP']).trim() : 'SIN CURP';
        const displayCalle = item['CALLE'] ? String(item['CALLE']).trim() : 'Calle no reg.';
        const displayNumExt = item['NUM EXT'] ? `No. ${String(item['NUM EXT']).trim()}` : 'S/N';
        const displayColonia = item['COLONIA'] ? String(item['COLONIA']).trim() : 'Colonia no reg.';
        
        const indicadorTexto = fueVisitado ? ' <span style="color:#236947; font-weight:bold; font-size:12px; margin-left:5px;">✓ Actualizado</span>' : '';

        div.innerHTML = `
            <div style="font-size:16px; font-weight:700; color:var(--dark-color); margin-bottom:2px;">
                ${displayNombre} ${displayPaterno} ${displayMaterno}${indicadorTexto}
            </div>
            <div style="font-size:13px; font-weight:600; color:var(--primary-color); margin-bottom:4px; letter-spacing:0.3px;">
                CURP: ${displayCurp}
            </div>
            <div style="font-size:13px; color:#555555;">
                📍 ${displayCalle}, ${displayNumExt}, Col. ${displayColonia}
            </div>
        `;
        
        div.onclick = () => openForm(item);
        resultsContainer.appendChild(div);
    });

    if (matchedRecords.length === 0) {
        resultsContainer.innerHTML = "<div class='result-item' style='color: gray; text-align: center;'>No se encontraron derechohabientes.</div>";
    }
}
// CONTROLADORA PARA CAPTURAR EL MOTIVO MEDIANTE CUADRO DE DIÁLOGO
function seleccionarEstatusVisita(estatus) {
    currentEstatusVisita = estatus.toUpperCase();
    
    if (currentEstatusVisita === "NO LOCALIZADO") {
        let motivoInput = prompt("Escriba el motivo por el cual el derechohabiente NO FUE LOCALIZADO:");
        
        if (motivoInput === null || motivoInput.trim() === "") {
            alert("🛑 Operación cancelada: Debe ingresar un motivo válido.");
            currentEstatusVisita = "LOCALIZADO"; 
            motivoNoLocalizadoValue = "";
            return;
        }
        motivoNoLocalizadoValue = motivoInput.trim();
        alert(`Motivo registrado: "${motivoNoLocalizadoValue}"`);
    } else {
        motivoNoLocalizadoValue = ""; 
    }
}

// CORRECCIÓN EXACTA DE LOS ELEMENTOS HTML Y VINCULACIÓN CON TUS COLUMNAS
function openForm(item) {
    if (!item) return alert("Error: No se seleccionó ningún registro.");

    // Se asignan los valores a los IDs reales de tu index.html usando tus columnas de Sheets
    document.getElementById('f-curp').value = item['CURP'] || '';
    document.getElementById('f-id').value = item['ID'] || '';
    document.getElementById('f-nombre').value = item['NOMBRE'] || '';
    
    // Vinculación corregida de tus apellidos con espacio
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
    
    // CORRECCIÓN DE LA TRABA DE HOY: Mapeo exacto al ID del HTML (f-causal) y columna real (CAUSAL)
    document.getElementById('f-causal').value = item['CAUSAL'] || '';

    // Carga de las dos nuevas columnas
    currentEstatusVisita = item['ESTATUS_VISITA'] || "LOCALIZADO";
    motivoNoLocalizadoValue = item['MOTIVO_NO_LOCALIZADO'] || "";

    document.getElementById('f-lat').value = "Buscando satélite...";
    document.getElementById('f-lon').value = "Buscando satélite...";

    const gpsOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                let cleanLat = String(position.coords.latitude.toFixed(6)).replace(",", ".");
                let cleanLon = String(position.coords.longitude.toFixed(6)).replace(",", ".");
                document.getElementById('f-lat').value = cleanLat;
                document.getElementById('f-lon').value = cleanLon;
            },
            (error) => { 
                document.getElementById('f-lat').value = "ERROR";
                document.getElementById('f-lon').value = "ERROR";
                alert("Atención: Otorgue permisos de ubicación para capturar la georreferencia.");
            },
            gpsOptions
        );
    } else {
        document.getElementById('f-lat').value = "NO COMPATIBLE";
        document.getElementById('f-lon').value = "NO COMPATIBLE";
    }
    changeScreen('screen-form');
}

function saveData(event) {
    event.preventDefault();
    const latValue = document.getElementById('f-lat').value;
    const lonValue = document.getElementById('f-lon').value;

    if (latValue.includes("Buscando") || latValue === "" || latValue === "ERROR" || latValue === "NO COMPATIBLE") {
        alert("🛑 BLOQUEO: No se puede guardar el registro sin la georreferencia del domicilio.");
        return; 
    }
    
    const targetCurp = document.getElementById('f-curp').value;
    const memoryIndex = localMemoryDatabase.findIndex(r => r['CURP'] === targetCurp);
    const originalRecord = memoryIndex !== -1 ? localMemoryDatabase[memoryIndex] : {};

    const record = {
        'CURP': targetCurp,
        'ID': document.getElementById('f-id').value,
        'NOMBRE': document.getElementById('f-nombre').value,
        'AP PATERNO': document.getElementById('f-paterno').value,
        'AP MATERNO': document.getElementById('f-materno').value,
        'TEL FIJO': document.getElementById('f-telfijo').value,
        'TEL CEL': document.getElementById('f-telcel').value,
        'MUNICIPIO': document.getElementById('f-municipio').value,
        'LOCALIDAD': document.getElementById('f-localidad').value,
        'SECCION': document.getElementById('f-seccion').value,
        'COLONIA': document.getElementById('f-colonia').value,
        'CP': document.getElementById('f-cp').value,
        'CALLE': document.getElementById('f-calle').value,
        'NUM EXT': document.getElementById('f-numext').value,
        'REFERENCIA': document.getElementById('f-referencia').value,
        'SITUACION': document.getElementById('f-situacion').value,
        'CAUSAL': document.getElementById('f-causal').value,
        
        'ESTATUS_VISITA': currentEstatusVisita,
        'MOTIVO_NO_LOCALIZADO': motivoNoLocalizadoValue,
        
        'Latitud': latValue,
        'Longitud': lonValue,
        'FECHA_MODIFICACION': new Date().toLocaleString("es-MX"),
        'USUARIO_MODIFICA': currentUser.name,
        'SHEETS_ROW_INDEX': originalRecord.SHEETS_ROW_INDEX || ""
    };

    const txUpdate = db.transaction(STORE_NAME, "readwrite");
    txUpdate.objectStore(STORE_NAME).put(record);

    if (memoryIndex !== -1) {
        localMemoryDatabase[memoryIndex] = record;
    } else {
        localMemoryDatabase.push(record);
    }

    pendingSync.push(record);
    localStorage.setItem('pendingSync', JSON.stringify(pendingSync));

    alert("Confirmación: Modificación guardada localmente.");
    document.getElementById('search-input').value = "";
    document.getElementById('search-results').innerHTML = "";
    changeScreen('screen-search');
}
// =========================================================================
// MÓDULO 4: PANTALLA 5 (HISTORIAL, SINCRONIZACIÓN Y OFFLINE)
// =========================================================================
function openHistoryScreen() {
    changeScreen('screen-history');
    document.getElementById('pending-count').innerText = pendingSync.length;
    const logList = document.getElementById('history-log');
    logList.innerHTML = "";

    pendingSync.forEach((item) => {
        const div = document.createElement('div');
        div.className = "result-item";
        div.innerHTML = `<strong>⏳ ${item['NOMBRE']} (${item['CURP']})</strong><br><small>Pendiente | Modificado: ${item['FECHA_MODIFICACION']}</small>`;
        logList.appendChild(div);
    });

    syncedHistory.forEach((item) => {
        const div = document.createElement('div');
        div.className = "result-item";
        div.style.opacity = "0.6"; 
        div.innerHTML = `<strong>✅ ${item['NOMBRE']} (${item['CURP']})</strong><br><small style="color:green;">Sincronizado con Sheets con éxito</small>`;
        logList.appendChild(div);
    });
}

function goBackFromHistory() {
    changeScreen(previousScreen);
}

async function syncWithSheets() {
    if (pendingSync.length === 0) return alert("No tienes registros pendientes de sincronizar.");

    alert("Conectando y sincronizando con Google Sheets...");
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: "sync", records: pendingSync })
        });

        const result = await response.json();

        if (result.status === "success") {
            syncedHistory = syncedHistory.concat(pendingSync);
            localStorage.setItem('syncedHistory', JSON.stringify(syncedHistory));

            pendingSync = [];
            localStorage.removeItem('pendingSync');
            
            openHistoryScreen();
            alert(`¡Excelente! Sincronización realizada en Sheets: ${result.message}`);
        } else {
            alert(`Error del servidor: ${result.message}`);
        }
    } catch (e) {
        console.error(e);
        alert("Fallo de conexión temporal. Los cambios siguen resguardados en el teléfono.");
    }
}

function downloadBackupCSV() {
    const allVisitsOfDay = pendingSync.concat(syncedHistory);

    if (allVisitsOfDay.length === 0) {
        return alert("No tienes ningún registro de visita para exportar hoy.");
    }

    const headers = [
        "CURP", "ID", "NOMBRE", "AP PATERNO", "AP MATERNO", "TEL FIJO", "TEL CEL", 
        "MUNICIPIO", "LOCALIDAD", "SECCION", "COLONIA", "CP", "CALLE", "NUM EXT", 
        "REFERENCIA", "SITUACION", "CAUSAL", "ESTATUS_VISITA", "MOTIVO_NO_LOCALIZADO", 
        "Latitud", "Longitud", "FECHA_MODIFICACION", "USUARIO_MODIFICA"
    ];

    let csvRows = [headers.join(",")];

    allVisitsOfDay.forEach(record => {
        const values = headers.map(header => {
            let val = record[header] !== undefined ? record[header] : "";
            let valStr = String(val).trim();
            if (valStr.includes(",") || valStr.includes("\n") || valStr.includes('"')) {
                valStr = `"${valStr.replace(/"/g, '""')}"`;
            }
            return valStr;
        });
        csvRows.push(values.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const downloadAnchor = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fechaHoy = new Date().toISOString().slice(0, 10);
    
    downloadAnchor.setAttribute("href", url);
    downloadAnchor.setAttribute("download", `R02_Reporte_Completo_${fechaHoy}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    
    document.body.removeChild(downloadAnchor);
    URL.revokeObjectURL(url);
}

function clearLocalStorage() {
    if (confirm("¿Estás seguro de vaciar la memoria? Perderás los registros pendientes y el historial del día.")) {
        pendingSync = [];
        syncedHistory = []; 
        localStorage.clear();
        if (db) {
            const tx = db.transaction(STORE_NAME, "readwrite");
            tx.objectStore(STORE_NAME).clear();
        }
        openHistoryScreen();
        alert("Datos del teléfono eliminados correctamente.");
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker registrado.', reg))
            .catch(err => console.error('Error de Service Worker:', err));
    });
}

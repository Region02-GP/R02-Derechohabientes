// Base de Datos y Estado Global en memoria (Emulación de almacenamiento local persistente)
let database = []; // Aquí se cargará la información descargada de la Colonia
let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let currentUser = null;
let previousScreen = 'screen-welcome';

// CURPs Autorizadas en Código para el Acceso (Ejemplo)
const AUTHORIZED_CURPS = {
    "CURPVALIDA12345678": "Juan Pérez López",
    "CURPVALIDA87654321": "María Gómez García"
};

// URL del Web App de Google Apps Script
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxjaMOLcg7EQucTRSM_D5-JPHEEzHDQx3mC0qb_Sb7FO8Rx3SnSdajjqs_2poEl-Kp-/exec";

function changeScreen(screenId) {
    // Rastrear pantalla anterior para navegación de regreso desde el historial
    if(screenId !== 'screen-history') {
        previousScreen = screenId;
    }
    document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// PANTALLA 1: LOGIN
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

// PANTALLA 2: CARGAR INFORMACIÓN POR FILTRO COLONIA (OFFLINE)
async function downloadDataByColonia() {
    const colonia = document.getElementById('filter-colonia').value.trim();
    if(!colonia) return alert("Por favor escribe una colonia para filtrar.");

    alert(`Buscando y descargando registros de la colonia: ${colonia}...`);
    
    try {
        // Consultar a Google Sheets mediante Apps Script mandando el filtro
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getColonia&colonia=${encodeURIComponent(colonia)}`);
        const data = await response.json();
        
        database = data;
        localStorage.setItem('localDatabase', JSON.stringify(database));
        alert(`Éxito: Se cargaron ${database.length} registros al teléfono.`);
    } catch (e) {
        // En caso de fallar o simulación si no se configura la URL todavía
        alert("Conexión no disponible. Usando datos de respaldo si existen.");
        database = JSON.parse(localStorage.getItem('localDatabase')) || [];
    }
}

// PANTALLA 3: BUSCADOR MULTICRITERIO
function searchData() {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = "";

    if(query.length < 2) return;

    // Filtro simultáneo en CALLE, NOMBRE, CURP, AP PATERNO Y AP MATERNO
    const filtered = database.filter(item => 
        (item.CALLE && item.CALLE.toLowerCase().includes(query)) ||
        (item.NOMBRE && item.NOMBRE.toLowerCase().includes(query)) ||
        (item.CURP && item.CURP.toLowerCase().includes(query)) ||
        (item.AP_PATERNO && item.AP_PATERNO.toLowerCase().includes(query)) ||
        (item.AP_MATERNO && item.AP_MATERNO.toLowerCase().includes(query))
    );

    filtered.forEach(item => {
        const div = document.createElement('div');
        div.className = "result-item";
        div.innerHTML = `<strong>${item.NOMBRE} ${item.AP_PATERNO}</strong><br><small>CURP: ${item.CURP} | Calle: ${item.CALLE}</small>`;
        div.onclick = () => openForm(item);
        resultsContainer.appendChild(div);
    });
}

// PANTALLA 4: FORMULARIO Y CAPTURA GPS
function openForm(item) {
    document.getElementById('f-curp').value = item.CURP || '';
    document.getElementById('f-id').value = item.ID || '';
    document.getElementById('f-nombre').value = item.NOMBRE || '';
    document.getElementById('f-paterno').value = item.AP_PATERNO || '';
    document.getElementById('f-materno').value = item.AP_MATERNO || '';
    document.getElementById('f-situacion').value = item.SITUACION || '';
    document.getElementById('f-causal').value = item.CUSAL || '';
    
    document.getElementById('f-telfijo').value = item.TEL_FIJO || '';
    document.getElementById('f-telcel').value = item.TEL_CEL || '';
    document.getElementById('f-municipio').value = item.MUNICIPIO || '';
    document.getElementById('f-localidad').value = item.LOCALIDAD || '';
    document.getElementById('f-seccion').value = item.SECCION || '';
    document.getElementById('f-colonia').value = item.COLONIA || '';
    document.getElementById('f-cp').value = item.CP || '';
    document.getElementById('f-calle').value = item.CALLE || '';
    document.getElementById('f-numext').value = item.NUM_EXT || '';
    document.getElementById('f-referencia').value = item.REFERENCIA || '';

    // Intentar capturar la georreferencia en tiempo real
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById('f-lat').value = position.coords.latitude;
                document.getElementById('f-lon').value = position.coords.longitude;
            },
            () => { alert("No se pudo obtener la ubicación GPS de forma automática."); }
        );
    }
    changeScreen('screen-form');
}

function saveData(event) {
    event.preventDefault();
    
    const record = {
        CURP: document.getElementById('f-curp').value,
        ID: document.getElementById('f-id').value,
        NOMBRE: document.getElementById('f-nombre').value,
        AP_PATERNO: document.getElementById('f-paterno').value,
        AP_MATERNO: document.getElementById('f-materno').value,
        TEL_FIJO: document.getElementById('f-telfijo').value,
        TEL_CEL: document.getElementById('f-telcel').value,
        MUNICIPIO: document.getElementById('f-municipio').value,
        LOCALIDAD: document.getElementById('f-localidad').value,
        SECCION: document.getElementById('f-seccion').value,
        COLONIA: document.getElementById('f-colonia').value,
        CP: document.getElementById('f-cp').value,
        CALLE: document.getElementById('f-calle').value,
        NUM_EXT: document.getElementById('f-numext').value,
        REFERENCIA: document.getElementById('f-referencia').value,
        SITUACION: document.getElementById('f-situacion').value,
        CUSAL: document.getElementById('f-causal').value,
        Latitud: document.getElementById('f-lat').value,
        Longitud: document.getElementById('f-lon').value,
        FECHA_MODIFICACION: new Date().toISOString(),
        USUARIO_MODIFICA: currentUser.name
    };

    // Almacenar en la cola de Sincronización Local (Offline protection)
    pendingSync.push(record);
    localStorage.setItem('pendingSync', JSON.stringify(pendingSync));

    alert("Modificación guardada exitosamente en el teléfono.");
    
    // Limpiar input de búsqueda y regresar a pantalla 3
    document.getElementById('search-input').value = "";
    document.getElementById('search-results').innerHTML = "";
    changeScreen('screen-search');
}

// PANTALLA 5: HISTORIAL Y SINCRONIZACIÓN
function openHistoryScreen() {
    document.getElementById('pending-count').innerText = pendingSync.length;
    const logList = document.getElementById('history-log');
    logList.innerHTML = "";

    pendingSync.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = "result-item";
        div.innerHTML = `<strong>${item.NOMBRE} (${item.CURP})</strong><br><small>Modificado por: ${item.USUARIO_MODIFICA}</small>`;
        logList.appendChild(div);
    });

    changeScreen('screen-history');
}

function goBackFromHistory() {
    changeScreen(previousScreen);
}

async function syncWithSheets() {
    if(pendingSync.length === 0) return alert("No hay datos pendientes por sincronizar.");

    alert("Sincronizando registros con Google Sheets...");
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Depende del setup de tu Apps Script
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "sync", records: pendingSync })
        });

        // Limpiar cola local al tener éxito
        pendingSync = [];
        localStorage.removeItem('pendingSync');
        openHistoryScreen();
        alert("¡Sincronización completa y exitosa!");
    } catch (e) {
        alert("Fallo la conexión. Los datos siguen resguardados en el celular.");
    }
}

function downloadBackup() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(pendingSync));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "R02_respaldo_pendiente.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function clearLocalStorage() {
    if(confirm("¿Estás seguro de borrar todos los datos del teléfono? Perderás lo que no esté sincronizado.")) {
        pendingSync = [];
        database = [];
        localStorage.clear();
        openHistoryScreen();
    }
}


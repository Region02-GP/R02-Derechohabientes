// URL del Web App de Google Apps Script 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzz3Tm3UPhwyv1c8fJRjCrFw3QlvAZz03lz3gy1pigLXwEheDl3JHVTCYUHfaNvOC2E/exec";

// DICCIONARIO OFICIAL DE BRIGADISTAS CON MUNICIPIO DE OPERACIÓN (130 REGISTROS INTEGRADOS)
const AUTHORIZED_CURPS = {
    "AACG640516MCLLRD01": { name: "ALVARADO CORDERO MARIA GUADALUPE", municipio: "GÓMEZ PALACIO" },
    "AAGS650227MDGNLN04": { name: "ANDRADE GALLEGOS SANDRA GABRIELA", municipio: "GÓMEZ PALACIO" },
    "AECH920906MDGRSL08": { name: "ARELLANES CASTRO HILDA ARELY", municipio: "EL ORO" },
    "AUME921203MDGRND04": { name: "ARGUIJO MONTAÑEZ MARIA EDITH", municipio: "GÓMEZ PALACIO" },
    "AEOP700407MDGRXT08": { name: "ARMENDARIZ DE LA O PETRA", municipio: "MAPIMI" },
    "AEBT950202MDGRNN01": { name: "ARREDONDO BUENO TANIA", municipio: "INDE" },
    "AEGC860822MDGRNR01": { name: "ARREDONDO GONZALEZ CARMEN ESPERANZA", municipio: "EL ORO" },
    "AEHS770422MCLRRN07": { name: "ARREOLA HERNANDEZ SANDRA LETICIA", municipio: "GÓMEZ PALACIO" },
    "AOGS731028MCLRNN06": { name: "ARZOLA GONZALEZ SONIA", municipio: "GÓMEZ PALACIO" },
    "AAMR590803HDGVCS01": { name: "AVALOS MACHADO ROBERTO", municipio: "TLAHUALILO" },
    "AAZS921017MDGYVL03": { name: "AYALA ZAVALA SELMA MARGARITA", municipio: "GUANACEVI" },
    "BAGH020602HDGRRCA0": { name: "BARBOZA GARCIA HECTOR JAIR", municipio: "GÓMEZ PALACIO" },
    "BAML941107HDGRRS09": { name: "BARCENAS MARCHAND LUIS ERNESTO", municipio: "TLAHUALILO" },
    "BAAA830419HDGRNN02": { name: "BARRAZA ANDRADE ANTONIO", municipio: "GÓMEZ PALACIO" },
    "BARF730707HDGLRL03": { name: "BARRAZA REYES FERMIN", municipio: "HIDALGO" },
    "BAPA670424MDGRZL01": { name: "BARRETERO PIZAÑA ALMA ELIA", municipio: "GÓMEZ PALACIO" },
    "BERY830909MDGCDS08": { name: "BECERRA RODRIGUEZ YESICA", municipio: "GÓMEZ PALACIO" },
    "BUMT890307MDGNDM02": { name: "BUENO MEDINA MA. TOMASA", municipio: "EL ORO" },
    "BUBL821105HDGSSS07": { name: "BUSTAMANTE BUSTAMANTE LUIS CARLOS", municipio: "INDE" },
    "BUCA990525MDGSRN01": { name: "BUSTAMANTE CORDOVA ANA JHOSSEMIN", municipio: "GÓMEZ PALACIO" },
    "BUCM650916MDGSRR07": { name: "BUSTAMANTES CORDOVA MARTHA IMELDA", municipio: "GÓMEZ PALACIO" },
    "CACX660709MDGBSN01": { name: "CABRALES CASTAÑEDA MARIA DE LOS ANGELES", municipio: "GÓMEZ PALACIO" },
    "CACG830625MDGRLL00": { name: "CARRERA CALDERON GUILLERMA GUADALUPE", municipio: "HIDALGO" },
    "CAPI691204MDGRSR04": { name: "CARRETE POSADA IRMA ROCIO", municipio: "EL ORO" },
    "CARC790822MDGRDT00": { name: "CARRETE RODRIGUEZ CATALINA", municipio: "SAN BERNARDO" },
    "CAHR830816MDGSLS00": { name: "CASTOR HOLGUIN ROSA IRENE", municipio: "HIDALGO" },
    "CAAE910530MDGSLR04": { name: "CASTRO ALVAREZ ERIKA GUADALUPE", municipio: "INDE" },
    "CXGA680320HDGSRL06": { name: "CASTRO GARCIA JOSE ALFREDO", municipio: "GÓMEZ PALACIO" },
    "CASV020905HCHSLCA3": { name: "CASTRO SALCEDO VICTOR MANUEL", municipio: "INDE" },
    "COCC980119MDGRRR06": { name: "CERVANTES SALGADO MARIA DEL SOCORRO", municipio: "GÓMEZ PALACIO" },
    "CAOJ791217MCLHCS01": { name: "CHACON OCHOA MARIA DE JESUS", municipio: "TLAHUALILO" },
    "CORJ630506HCLMMS03": { name: "COMPEAN RAMIREZ JESUS", municipio: "GÓMEZ PALACIO" },
    "CXLA921207MCHRYN00": { name: "CORCHADO LEYVA ANA KAREN", municipio: "OCAMPO" },
    "COAM950819HDGRLR08": { name: "CORDOVA ALCAZAR MARCO ANTONIO", municipio: "GÓMEZ PALACIO" },
    "COCR600816HDGRML07": { name: "CORTEZ CERVANTES CAROLINA", municipio: "GÓMEZ PALACIO" },
    "CURB700325MCHVSR06": { name: "CUEVAS RIOS BERTHA ALICIA", municipio: "MAPIMI" },
    "DATB950421MCHVVR03": { name: "DAVILA TOVAR BERENICE", municipio: "GÓMEZ PALACIO" },
    "SASL920713MDGNCY02": { name: "DE SANTIAGO SAUCEDO LAEYDY KARINA", municipio: "GÓMEZ PALACIO" },
    "DINE820731MDGZVS00": { name: "DIAZ NAVARRETE ESPERANZA", municipio: "EL ORO" },
    "DITR851118HOCZRM07": { name: "DIAZ TRUJILLO RAMON DE JESUS", municipio: "GÓMEZ PALACIO" },
    "DOCS600411HDGMRR08": { name: "DOMINGUEZ CORCHADO SERGIO ALBERTO", municipio: "GÓMEZ PALACIO" },
    "EIRI840701MCLLYV07": { name: "ELIZALDE REYES IVETTE SARAI", municipio: "GÓMEZ PALACIO" },
    "EILA680224HDGSZL05": { name: "ESPINOZA LOZANO ALFONSO", municipio: "GÓMEZ PALACIO" },
    "EUMN780514MDGSSN08": { name: "ESQUIVEL MASCORRO NANCY ACELA", municipio: "GÓMEZ PALACIO" },
    "EAMM831221HDGSLG02": { name: "ESTRADA MOLINA MIGUEL DE JESUS", municipio: "GÓMEZ PALACIO" },
    "EUXM610213MCHZXY08": { name: "EZQUEDA MARIA MAYELA", municipio: "GÓMEZ PALACIO" },
    "FASR950828MDGVRQ09": { name: "FAVELA SERRANO RAQUEL", municipio: "GUANACEVI" },
    "FIGE871118MDGRRL02": { name: "FIERRO GARCIA MARIA ELIZABETH", municipio: "GÓMEZ PALACIO" },
    "FILL850820MDGGPR07": { name: "FIGUEROA LOPEZ LAURA YANIRA", municipio: "GÓMEZ PALACIO" },
    "FOAM730906MCLLDR08": { name: "FLORES ADAME MARGARITA", municipio: "GÓMEZ PALACIO" },
    "FOTL920107MDGLRS07": { name: "FLORES TORRES LESLY YAMILETH", municipio: "TLAHUALILO" },
    "FUHC951110MCHNRT08": { name: "FUENTES HERNANDEZ CITLALI SARAHI", municipio: "TLAHUALILO" },
    "GARL790916MDGNMC09": { name: "GANDARILLA RAMIREZ LUCILA", municipio: "EL ORO" },
    "GAEJ770121HDGRRN00": { name: "GARCIA ENCERRADO JUAN JOSE", municipio: "GÓMEZ PALACIO" },
    "GAEG960627MDGRSD07": { name: "GARCIA ESPINO GUADALUPE DEL SOCORRO", municipio: "SAN PEDRO DEL GALLO" },
    "GUVG951127MDGRLB06": { name: "GUERECA VILLAGRANA GABRIELA", municipio: "GÓMEZ PALACIO" },
    "GUPF940515HDGLRL03": { name: "GUILLEN PEREZ FELIPE", municipio: "HIDALGO" },
    "HECB870318MDGRMR06": { name: "HERNANDEZ CAMPOS BERA TOMASA", municipio: "HIDALGO" },
    "HEMR651102HDGRXM09": { name: "HERNANDEZ MUÑOZ JOSE RAMON", municipio: "GÓMEZ PALACIO" },
    "HEOM840503MDGRRR01": { name: "HERNANDEZ ORTIZ MARY CRUZ", municipio: "GÓMEZ PALACIO" },
    "HEPL950226HZSRNS07": { name: "HERNANDEZ PUENTES LUIS AGUSTIN", municipio: "SAN PEDRO DEL GALLO" },
    "HESR870605MDGRNC07": { name: "HERNANDEZ SANTOYO ROCIO", municipio: "GÓMEZ PALACIO" },
    "HETD950530HCHRRG03": { name: "HERNANDEZ TORRES DIEGO ALFONSO", municipio: "GÓMEZ PALACIO" },
    "JALL891212HDGCPS02": { name: "JACQUEZ LOPEZ LUIS RENE", municipio: "GÓMEZ PALACIO" },
    "ZAVK981206MDGMLR01": { name: "KARENTH ARELY ZAMARRIPA VELAZQUEZ", municipio: "GÓMEZ PALACIO" },
    "LEBM670913MDGLCR07": { name: "LEAL BECERRA MARGARITA", municipio: "GÓMEZ PALACIO" },
    "LIHJ930427HCLRRS02": { name: "LIRA HERNANDEZ JESUS ANTONIO", municipio: "TLAHUALILO" },
    "LADG790906MFGLZD05": { name: "LLAMAS DIAZ MARIA GUADALUPE", municipio: "TLAHUALILO" },
    "LXCA780211HCLPZN00": { name: "LOPEZ CAZARES JOSE ANGEL", municipio: "GÓMEZ PALACIO" },
    "LOGR621117HDGPRD01": { name: "LOPEZ GARCIA RODOLFO", municipio: "GÓMEZ PALACIO" },
    "LOME820531MDGZRR04": { name: "LOZANO MARQUEZ ERIKA LILIANA", municipio: "GÓMEZ PALACIO" },
    "MACA960216MDGCHN02": { name: "MACIEL CHAVEZ ANDREA IDALY", municipio: "GÓMEZ PALACIO" },
    "MAVC910823MDGGRL00": { name: "MAGALLANES VERA CLAUDIA JAQUELINE", municipio: "MAPIMI" },
    "MAAJ900810HCHRRS04": { name: "MARQUEZ ARREOLA JESUS HERNAN", municipio: "HIDALGO" },
    "MACA720621MCLRML06": { name: "MARTINEZ CAMPOS ALEJANDRA", municipio: "GÓMEZ PALACIO" },
    "MAHG760119MCLRRR02": { name: "MARTINEZ HERRADA GRISELDA YADIRA", municipio: "GÓMEZ PALACIO" },
    "MARD981230MCHRSM03": { name: "MARTINEZ RIOS DIAMAR", municipio: "OCAMPO" },
    "MAVE671026MDGRLV08": { name: "MARTINEZ VALLES EVARISTA MARIA LORENA", municipio: "GÓMEZ PALACIO" },
    "MACC890225MCHYRC01": { name: "MAYA CARRIZALES CECILIA LIZBETH", municipio: "GÓMEZ PALACIO" },
    "MEAI750720MDGDRS09": { name: "MEDINA ARELLANO MARIA ISABEL", municipio: "SAN BERNARDO" },
    "MEVZ960910MDGDLR05": { name: "MEDRANO VALENZUELA ZAIRA YAMILETH", municipio: "HIDALGO" },
    "METO890919MDGNVL11": { name: "MENDEZ TOVAR OLGA LETICIA", municipio: "MAPIMI" },
    "MOCG781028MDGJSR03": { name: "MOJICA CASTAÑEDA GRISELDA", municipio: "GÓMEZ PALACIO" },
    "MOCY871212MCHLSZ06": { name: "MOLINA CASTILLO YAZMIN", municipio: "OCAMPO" },
    "MODV821010MDGNZR05": { name: "MONARREZ DIAZ MARIA VERONICA", municipio: "EL ORO" },
    "MOAM711217MDGRNR10": { name: "MORENO ANDRADE MARTHA PATRICIA", municipio: "GÓMEZ PALACIO" },
    "MOMM650530MDGRXR00": { name: "MORILLON MUÑOZ MARTHA LETICIA", municipio: "GÓMEZ PALACIO" },
    "MUQA511002HOCXRN08": { name: "MUÑOZ QUIROZ ANGEL", municipio: "EL ORO" },
    "MUSS970205HDGXSN06": { name: "MUÑOZ SOSA JOSE SANTIAGO", municipio: "GÓMEZ PALACIO" },
    "NAGY980110HCLJRM05": { name: "NAJERA GARCIA YAMIL", municipio: "GÓMEZ PALACIO" },
    "NAHK921126MDGJRR01": { name: "NAJERA HERNANDEZ KARLA JANETH", municipio: "GÓMEZ PALACIO" },
    "NAHM930114MDGVRG09": { name: "NAVARRETE HERRERA MAGALI", municipio: "SAN BERNARDO" },
    "NAST690922MDGVXM09": { name: "NAVARRETE SIAÑEZ TOMASA", municipio: "EL ORO" },
    "NIEE680116MCLXSL08": { name: "NIÑO ESTRELLA MARIA ELENA", municipio: "GÓMEZ PALACIO" },
    "OISE800627HCLLFN09": { name: "OLIVO SIFUENTES ENRIQUE", municipio: "GÓMEZ PALACIO" },
    "OIUM780129HDGRZN08": { name: "ORTIZ UZQUIANO JOSE MANUEL", municipio: "GÓMEZ PALACIO" },
    "PARJ560313HJCCBS09": { name: "PACHECO ROBLES JUSTINO ENRIQUE", municipio: "GÓMEZ PALACIO" },
    "PAGG700212MDGDRD09": { name: "PADILLA GARCIA MARIA GUADALUPE", municipio: "GÓMEZ PALACIO" },
    "PAGG941107MDGLTD05": { name: "PALMA GUTIERREZ MA GUADALUPE", municipio: "INDE" },
    "PACA730706HDGLRR08": { name: "PALOMO CORONADO ARISTEO", municipio: "GÓMEZ PALACIO" },
    "PECL820309MDGXNC04": { name: "PEÑA CANO MARIA LUCINA", municipio: "INDE" },
    "PEAJ950611HDGRLN07": { name: "PEREZ ALANIS JONATHAN", municipio: "GÓMEZ PALACIO" },
    "PETM810125HDGRVR08": { name: "PEREZ TOVAR MARIO ALBERTO", municipio: "GÓMEZ PALACIO" },
    "PIDR730501MDGLRS00": { name: "PILLADO DURAN ROSA MARIA", municipio: "SAN BERNARDO" },
    "PUTJ701119MDGGRN04": { name: "PUGA TORRES JUANA MARIA", municipio: "GÓMEZ PALACIO" },
    "RAAS951215MGTMRN02": { name: "RAMIREZ ARZOLA SONIA INGRID", municipio: "GÓMEZ PALACIO" },
    "RACK980731MDGMBR07": { name: "RAMIREZ CABRERA KAREN VIANEY", municipio: "GÓMEZ PALACIO" },
    "RAHM870423HCLMNS05": { name: "RAMIREZ HINOJOSA MISAEL", municipio: "GÓMEZ PALACIO" },
    "RAGK980320MDGMTR00": { name: "RAMOS GUTIERREZ KARINA", municipio: "MAPIMI" },
    "REOA501020HDGTLR05": { name: "RETANA OLIVAS ARTEMIO", municipio: "OCAMPO" },
    "RECM930827MCHYRL08": { name: "REYES CARRILLO MAELBI BELEN", municipio: "GUANACEVI" },
    "RECJ920809MCLYNL04": { name: "REYES CONTRERAS JULIANA IVETTE", municipio: "GÓMEZ PALACIO" },
    "REMC000415MDGZRNA3": { name: "REZA MERAZ CINDY PAMELA", municipio: "GÓMEZ PALACIO" },
    "RIMY870520HDGVRS03": { name: "RIVAS MERAZ YOSIMAR", municipio: "GÓMEZ PALACIO" },
    "RIPM820502MMNVRR09": { name: "RIVERA PEREZ MIRIAM", municipio: "INDE" },
    "ROEB840509MDGCNL04": { name: "ROCHA ENRIQUEZ BLANCA ESTELA", municipio: "GÓMEZ PALACIO" },
    "ROCF950113MDGDRL02": { name: "RODRIGUEZ DE LA CRUZ FLOR IVET", municipio: "HIDALGO" },
    "ROEC820112MDGDSL03": { name: "RODRIGUEZ ESQUIVEL CELIA", municipio: "GÓMEZ PALACIO" },
    "ROFG661114MCLDRB04": { name: "RODRIGUEZ FERRER GABRIELA DEL PILAR", municipio: "GÓMEZ PALACIO" },
    "RONA881008MDGDXL06": { name: "RODRIGUEZ NUÑEZ ALMA ANGELICA", municipio: "EL ORO" },
    "RONF800311MDGDXL07": { name: "RODRIGUEZ NUÑEZ FLOR AIDE", municipio: "EL ORO" },
    "RORL740912HDGDYS06": { name: "RODRIGUEZ REYES LUIS", municipio: "GÓMEZ PALACIO" },
    "ROSN991026MDGDLD02": { name: "RODRIGUEZ SALAZAR NADIA", municipio: "GÓMEZ PALACIO" },
    "ROSJ940130HCLDNS03": { name: "RODRIGUEZ SANCHEZ JESUS GUADALUPE", municipio: "GÓMEZ PALACIO" },
    "ROSL761013MCLDNR18": { name: "RODRIGUEZ SANCHEZ LAURA CECILIA", municipio: "GÓMEZ PALACIO" },
    "ROMB941121MCHJZR09": { name: "ROJAS MAZUCA BRENDA PATRICIA", municipio: "GÓMEZ PALACIO" },
    "SASA960229MDGLMN02": { name: "SALAS SAMANIEGO ANA BEATRIZ", municipio: "GÓMEZ PALACIO" },
    "SAAD830130MDGLRL08": { name: "SALAZAR AROÑA DULCE LILIANA", municipio: "GÓMEZ PALACIO" },
    "SARA010403MCHLCZA3": { name: "SALAZAR ROCHA AZUL MICHELLE", municipio: "GÓMEZ PALACIO" },
    "SASA730417MDGNRN01": { name: "SANTOYO SERRATO ANA LILIA", municipio: "GÓMEZ PALACIO" },
    "SAMA010201MCLCRLA1": { name: "SAUCEDO MARTINEZ ALEJANDRA VIRIDIANA", municipio: "GÓMEZ PALACIO" },
    "SEVF730130MDGRGR04": { name: "SERRANO VEGA FRANCISCA", municipio: "GUANACEVI" },
    "SOHF941220MDGSRB01": { name: "SOSA HERNANDEZ FABIOLA LIZETTE", municipio: "GÓMEZ PALACIO" },
    "TOMD540814HCLRRN05": { name: "TORRES MARTINEZ DANIEL", municipio: "GÓMEZ PALACIO" },
    "VACB810404MTSLHR05": { name: "VALDEZ CHAVEZ BRENDA LILIANA", municipio: "SAN PEDRO DEL GALLO" },
    "VALV590521HDGLZL02": { name: "VALENCIA LAZOS VALENTE", municipio: "GUANACEVI" },
    "VACS651102MDGZRL09": { name: "VAZQUEZ CARDOZA SILVIA PATRICIA", municipio: "GÓMEZ PALACIO" },
    "VAMA870830MDGZLL01": { name: "VAZQUEZ MELENDEZ ALMA ROSA ", municipio: "GÓMEZ PALACIO" }
};

let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let syncedHistory = JSON.parse(localStorage.getItem('syncedHistory')) || [];
let currentUser = null;
let currentBrigadistaMunicipio = ""; 
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

// PRECARGA BLINDADA: Al conectar la base, alimenta la RAM en caliente al instante
request.onsuccess = (e) => { 
    db = e.target.result; 
    updateLocalCounter(); 
    preloadDatabaseToMemory(); // Evita que el buscador comience asíncronamente vacío
};
request.onerror = (e) => { console.error("Error IndexedDB:", e.target.error); };
function updateLocalCounter() {
    if (!db) return;
    const countRequest = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).count();
    countRequest.onsuccess = () => {
        const countElement = document.getElementById('local-db-count');
        if (countElement) countElement.innerText = countRequest.result;
    };

    const totalVisitasHoy = pendingSync.length + (syncedHistory ? syncedHistory.length : 0);
    const pendientesPorSubir = pendingSync.length;

    const elTotalVisitas = document.getElementById('metric-total-visitas');
    const elPendientesVisitas = document.getElementById('metric-pendientes-visitas');
    
    if (elTotalVisitas) elTotalVisitas.innerText = totalVisitasHoy;
    if (elPendientesVisitas) elPendientesVisitas.innerText = pendientesPorSubir;

    const elContadorHistorial = document.getElementById('pending-count');
    if (elContadorHistorial) elContadorHistorial.innerText = pendientesPorSubir;
}
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

function login() {
    const curpInput = document.getElementById('login-curp').value.trim().toUpperCase();
    const brigadistaEncontrado = AUTHORIZED_CURPS[curpInput];
    if (brigadistaEncontrado) {
        currentUser = { curp: curpInput, name: brigadistaEncontrado.name };
        currentBrigadistaMunicipio = brigadistaEncontrado.municipio.toUpperCase().trim();
        preloadDatabaseToMemory(); // Precarga síncrona obligatoria al autenticar
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
        preloadDatabaseToMemory(); // Refresca la memoria RAM al completar la descarga
        updateLocalCounter(); 
        alert(`Éxito: Se guardaron ${totalCargados} registros.`);
    } catch (error) {
        alert(`Error: ${error.message}`);
    } finally { btn.disabled = false; }
}
let localMemoryDatabase = [];
function preloadDatabaseToMemory() {
    if (!db) return;
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll().onsuccess = (e) => {
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

        // CANDADO GEOGRÁFICO NATIVO RECUPERADO DE TU VERSIÓN ADJUNTA COMPLETA
        const municipioDerechohabiente = item['MUNICIPIO'] ? String(item['MUNICIPIO']).toUpperCase().trim() : "";
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
        btnNoLoc.style.backgroundColor = "#F3F4F6";
        btnNoLoc.style.borderColor = "#CBD5E0";
        btnNoLoc.style.color = "#9CA3AF";
    } else if (currentEstatusVisita === "NO LOCALIZADO") {
        btnNoLoc.style.backgroundColor = "#FCE8E6";
        btnNoLoc.style.borderColor = "#C5221F";
        btnNoLoc.style.color = "#C5221F";
        btnLoc.style.backgroundColor = "#F3F4F6";
        btnLoc.style.borderColor = "#CBD5E0";
        btnLoc.style.color = "#9CA3AF";
    }
}
function openForm(item) {
    if (!item) return;
    const camposWrapper = document.getElementById('form-fields-wrapper');
    if (camposWrapper) {
        const gridBloqueado = camposWrapper.querySelector('.form-grid');
        if (gridBloqueado) gridBloqueado.classList.add('text-disabled');
    }
    document.getElementById('f-curp').setAttribute('readonly', 'true');
    document.getElementById('f-id').setAttribute('readonly', 'true');
    document.getElementById('f-nombre').setAttribute('readonly', 'true');
    document.getElementById('f-paterno').setAttribute('readonly', 'true');
    document.getElementById('f-materno').setAttribute('readonly', 'true');
    document.getElementById('f-situacion').setAttribute('readonly', 'true');
    document.getElementById('f-causal').setAttribute('readonly', 'true');

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
    
    const targetCurp = document.getElementById('f-curp').value.replace(/[\s\u200B-\u200D\uFEFF]/g, "").toUpperCase().trim();
    if (!targetCurp || targetCurp.length !== 18) return alert("🛑 ERROR: La CURP es obligatoria y debe tener exactamente 18 caracteres.");

    const memoryIndex = localMemoryDatabase.findIndex(r => r.CURP === targetCurp);
    const originalRecord = memoryIndex !== -1 ? localMemoryDatabase[memoryIndex] : {};

    const record = {
        'CURP': targetCurp, 'ID': document.getElementById('f-id').value, 'NOMBRE': document.getElementById('f-nombre').value.toUpperCase().trim(),
        'AP PATERNO': document.getElementById('f-paterno').value.toUpperCase().trim(), 'AP MATERNO': document.getElementById('f-materno').value.toUpperCase().trim(),
        'TEL FIJO': document.getElementById('f-telfijo').value.trim(), 'TEL CEL': document.getElementById('f-telcel').value.trim(),
        'MUNICIPIO': document.getElementById('f-municipio').value.toUpperCase().trim(), 'LOCALIDAD': document.getElementById('f-localidad').value.toUpperCase().trim(),
        'SECCION': document.getElementById('f-seccion').value.trim(), 'COLONIA': document.getElementById('f-colonia').value.toUpperCase().trim(),
        'CP': document.getElementById('f-cp').value.trim(), 'CALLE': document.getElementById('f-calle').value.toUpperCase().trim(),
        'NUM EXT': document.getElementById('f-numext').value.toUpperCase().trim(), 'REFERENCIA': document.getElementById('f-referencia').value.toUpperCase().trim(),
        'SITUACION': document.getElementById('f-situacion').value, 'CAUSAL': document.getElementById('f-causal').value,
        'ESTATUS_VISITA': currentEstatusVisita, 'MOTIVO_NO_LOCALIZADO': motivoNoLocalizadoValue, 'Latitud': latValue, 'Longitud': lonValue,
        'FECHA_MODIFICACION': new Date().toLocaleString("es-MX"), 'USUARIO_MODIFICA': currentUser.name, 'SHEETS_ROW_INDEX': originalRecord.SHEETS_ROW_INDEX || ""
    };

    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = function() {
        if (memoryIndex !== -1) localMemoryDatabase[memoryIndex] = record; else localMemoryDatabase.push(record);
        pendingSync.push(record);
        localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
        alert("✅ ÉXITO: Visita guardada localmente en el teléfono.");
        document.getElementById('search-input').value = "";
        document.getElementById('search-results').innerHTML = "";
        changeScreen('screen-search');
    };
}
function abrirFormularioVacioAltaNueva() {
    const camposWrapper = document.getElementById('form-fields-wrapper');
    if (camposWrapper) {
        const gridBloqueado = camposWrapper.querySelector('.form-grid');
        if (gridBloqueado) gridBloqueado.classList.remove('text-disabled');
        document.getElementById('f-curp').removeAttribute('readonly');
        document.getElementById('f-nombre').removeAttribute('readonly');
        document.getElementById('f-paterno').removeAttribute('readonly');
        document.getElementById('f-materno').removeAttribute('readonly');
    }
    const inputs = ['f-curp', 'f-nombre', 'f-paterno', 'f-materno', 'f-telfijo', 'f-telcel', 'f-localidad', 'f-seccion', 'f-colonia', 'f-cp', 'f-calle', 'f-numext', 'f-referencia', 'f-causal'];
    inputs.forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ''; });
    
    document.getElementById('f-municipio').value = currentBrigadistaMunicipio || ''; 
    document.getElementById('f-id').value = 'NUEVO';
    document.getElementById('f-situacion').value = 'SIN_REGISTRO';
    currentEstatusVisita = "LOCALIZADO"; motivoNoLocalizadoValue = ""; actualizarEstilosBotonesFormulario();

    document.getElementById('f-lat').value = "Buscando satélite...";
    document.getElementById('f-lon').value = "Buscando satélite...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            document.getElementById('f-lat').value = String(position.coords.latitude.toFixed(6)).replace(",", ".");
            document.getElementById('f-lon').value = String(position.coords.longitude.toFixed(6)).replace(",", ".");
        }, () => { document.getElementById('f-lat').value = "ERROR"; document.getElementById('f-lon').value = "ERROR"; });
    }
    const curpInputEl = document.getElementById('f-curp');
    curpInputEl.removeEventListener('input', verificarCurpDuplicadaEnTiempoReal);
    curpInputEl.addEventListener('input', verificarCurpDuplicadaEnTiempoReal);
    changeScreen('screen-form');
}

function verificarCurpDuplicadaEnTiempoReal(e) {
    const valorLimpio = e.target.value.replace(/[\s\u200B-\u200D\uFEFF]/g, "").toUpperCase();
    e.target.value = valorLimpio; 
    if (valorLimpio.length === 18) {
        const registroExistente = localMemoryDatabase.find(r => r.CURP === valorLimpio);
        if (registroExistente) {
            if (confirm(`📢 DETECTOR DE DUPLICADOS: La CURP [${valorLimpio}] ya existe (Municipio: ${registroExistente.MUNICIPIO || 'S/M'}).\n\n¿Desea cargar sus datos antiguos?`)) {
                alert("Cargando información histórica..."); openForm(registroExistente);
            } else { e.target.value = ''; e.target.focus(); alert("Ingrese una CURP que no esté registrada."); }
        }
    }
}

function openHistoryScreen() {
    changeScreen('screen-history');
    document.getElementById('pending-count').innerText = pendingSync.length;
    const logList = document.getElementById('history-log'); logList.innerHTML = ""; 
    pendingSync.forEach((item) => {
        const div = document.createElement('div'); div.className = "result-item";
        div.innerHTML = `<strong>⏳ ${item['NOMBRE'] || 'Derechohabiente'} (${item['CURP']})</strong><br><small>Pendiente de subir | Estatus: ${item['ESTATUS_VISITA']}</small>`;
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
            pendingSync = []; localStorage.removeItem('pendingSync'); openHistoryScreen(); alert("¡Sincronizado!");
        }
    } catch (e) { alert("Error de red temporal."); }
}

function downloadBackupCSV() {
    const allVisitsOfDay = pendingSync.concat(syncedHistory);
    if (allVisitsOfDay.length === 0) return alert("No hay datos.");
    const headers = ["CURP", "ID", "NOMBRE", "AP PATERNO", "AP MATERNO", "TEL FIJO", "TEL CEL", "MUNICIPIO", "LOCALIDAD", "SECCION", "COLONIA", "CP", "CALLE", "NUM EXT", "REFERENCIA", "SITUACION", "CAUSAL", "ESTATUS_VISITA", "MOTIVO_NO_LOCALIZADO", "Latitud", "Longitud", "FECHA_MODIFICACION", "USUARIO_MODIFICA"];
    let csvRows = [headers.join(",")];
    allVisitsOfDay.forEach(r => {
        csvRows.push(headers.map(h => { let v = r[h] !== undefined ? String(r[h]).trim() : ""; return v.includes(",") ? `"${v.replace(/"/g, '""')}"` : v; }).join(","));
    });
    const downloadAnchor = document.createElement('a'); downloadAnchor.setAttribute("href", URL.createObjectURL(new Blob(["\\ufeff" + csvRows.join("\\n")], { type: 'text/csv;charset=utf-8;' })));
    downloadAnchor.setAttribute("download", `R02_Reporte_${new Date().toISOString().slice(0, 10)}.csv`); document.body.appendChild(downloadAnchor); downloadAnchor.click(); document.body.removeChild(downloadAnchor);
}

function clearLocalStorage() {
    if (confirm("🚨 ADVERTENCIA: ¿Estás seguro de vaciar por completo la memoria?")) {
        pendingSync = []; syncedHistory = []; localMemoryDatabase = []; localStorage.clear();
        if (db) {
            db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear().onsuccess = () => {
                document.getElementById('search-input').value = ""; document.getElementById('search-results').innerHTML = ""; alert("Memoria interna e IndexedDB limpiadas."); changeScreen('screen-welcome'); 
            };
        } else { changeScreen('screen-welcome'); }
    }
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(err => console.error(err)); });
}

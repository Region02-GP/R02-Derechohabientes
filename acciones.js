// REEMPLAZA LA PRIMERA LÍNEA DE TU ACCIONES.JS POR ESTA DECLARACIÓN GLOBAL BLINDADA:
window.currentTratoValue = ""; 

function seleccionarTrato(opcion) {
    window.currentTratoValue = opcion.toUpperCase();
    actualizarEstilosBotonesTrato();
}

function actualizarEstilosBotonesTrato() {
    const btnExcelente = document.getElementById('btn-trato-excelente');
    const btnAmable = document.getElementById('btn-trato-amable');
    const btnNeutral = document.getElementById('btn-trato-neutral');
    const btnIncomodo = document.getElementById('btn-trato-incomodo');
    const btnHostil = document.getElementById('btn-trato-hostil');
    if (!btnExcelente || !btnAmable || !btnNeutral || !btnIncomodo || !btnHostil) return;

    [btnExcelente, btnAmable, btnNeutral, btnIncomodo, btnHostil].forEach(btn => {
        btn.style.backgroundColor = "#F3F4F6"; btn.style.borderColor = "#CBD5E0"; btn.style.color = "#4B5563";
    });

    if (window.currentTratoValue === "EXCELENTE") {
        btnExcelente.style.backgroundColor = "#D1E7DD"; btnExcelente.style.borderColor = "#0F5132"; btnExcelente.style.color = "#0F5132";
    } else if (window.currentTratoValue === "AMABLE") {
        btnAmable.style.backgroundColor = "#E6F4EA"; btnAmable.style.borderColor = "#236947"; btnAmable.style.color = "#236947";
    } else if (window.currentTratoValue === "NEUTRAL") {
        btnNeutral.style.backgroundColor = "#EDF4F9"; btnNeutral.style.borderColor = "#BC955C"; btnNeutral.style.color = "#1F2937";
    } else if (window.currentTratoValue === "INCOMODO") {
        btnIncomodo.style.backgroundColor = "#FFF3CD"; btnIncomodo.style.borderColor = "#664D03"; btnIncomodo.style.color = "#664D03";
    } else if (window.currentTratoValue === "HOSTIL") {
        btnHostil.style.backgroundColor = "#FCE8E6"; btnHostil.style.borderColor = "#b91c1c"; btnHostil.style.color = "#b91c1c";
    }
}

// BUSCA EL INICIO DE LA FUNCIÓN abrirFormularioVacioAltaNueva() Y AGREGA ESTE BLOQUE INICIAL:
function abrirFormularioVacioAltaNueva() {
    // NUEVA REGLA CORE: Renderiza el datalist de localidades de forma dinámica al abrir el formulario
    const datalistEl = document.getElementById('lista-localidades');
    if (datalistEl && typeof CATALOGO_LOCALIDADES !== 'undefined') {
        datalistEl.innerHTML = CATALOGO_LOCALIDADES.map(loc => `<option value="${loc}"></option>`).join('');
    }

    const camposWrapper = document.getElementById('form-fields-wrapper');

    // CORRECCIÓN SIN ERRORES: Libera las cajas de texto de nombres para captura manual
    document.getElementById('f-curp').removeAttribute('readonly');
    document.getElementById('f-nombre').removeAttribute('readonly');
    document.getElementById('f-paterno').removeAttribute('readonly');
    document.getElementById('f-materno').removeAttribute('readonly');
    
    const inputs = ['f-curp', 'f-nombre', 'f-paterno', 'f-materno', 'f-telfijo', 'f-telcel', 'f-localidad', 'f-seccion', 'f-colonia', 'f-cp', 'f-calle', 'f-numext', 'f-referencia', 'f-causal'];
    inputs.forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ''; });

    const brigadistaActivo = AUTHORIZED_CURPS[currentUser.curp];
    document.getElementById('f-municipio').value = brigadistaActivo ? brigadistaActivo.municipio : 'GOMEZ PALACIO'; 
    document.getElementById('f-id').value = 'NUEVO';
    document.getElementById('f-situacion').value = 'SIN_REGISTRO';
    
    currentEstatusVisita = "LOCALIZADO"; 
    motivoNoLocalizadoValue = ""; 
    currentTratoValue = "";
    actualizarEstilosBotonesFormulario();
    actualizarEstilosBotonesTrato();

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

// REVISE QUE SU FUNCIÓN DE DETECTOR DE DUPLICADOS EN ACCONES.JS ESTÉ EXACTAMENTE ASÍ:
function verificarCurpDuplicadaEnTiempoReal(e) {
    const valorLimpio = e.target.value.replace(/[\s\u200B-\u200D\uFEFF]/g, "").toUpperCase();
    e.target.value = valorLimpio; 
    
    if (valorLimpio.length === 18) {
        // BÚSQUEDA GLOBAL DE SEGURIDAD: Escanea toda la RAM sin importar las fronteras del municipio
        const registroExistente = localMemoryDatabase.find(r => r.CURP === valorLimpio);
        if (registroExistente) {
            if (confirm(`📢 DETECTOR DE DUPLICADOS: La CURP [${valorLimpio}] ya existe en el sistema (Pertenece al Municipio de: ${registroExistente.MUNICIPIO || 'SIN TERRITORIO'}).\n\n¿Desea abortar esta alta nueva y cargar su registro histórico anterior de forma automática?`)) {
                alert("Cargando información del derechohabiente..."); 
                openForm(registroExistente); // Abre la Pantalla 4 cruzando el filtro
            } else { 
                e.target.value = ''; 
                e.target.focus(); 
                alert("Por favor, ingrese una CURP que no esté registrada en el sistema."); 
            }
        }
    }
}


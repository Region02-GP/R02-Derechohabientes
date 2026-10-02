import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import * as Location from 'expo-location';

// ==========================================
// CONFIGURACIÓN DE CONEXIÓN
// ==========================================
const API_URL = "https://script.google.com/macros/s/AKfycbymIkArKj52jhVXvM8uGTkYETU1Q8Ikbqbu--BdUO0BcTAYrFZ4SPb6r9UOMsjH5RC1/exec"; // <-- COLOCA AQUÍ TU URL /exec
export default function App() {
  const [loading, setLoading] = useState(true);
  const [derechohabientes, setDerechohabientes] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  
  // Estado para el candado de acceso obligatorio por CURP
  const [curpAcceso, setCurpAcceso] = useState('');
  const [haAccedido, setHaAccedido] = useState(false);

  // Campos del formulario vinculados a tus columnas de Sheets
  const [situacion, setSituacion] = useState('LOCALIZADO');
  const [causal, setCausal] = useState('');
  const cargarDatos = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setDerechohabientes(data);
      setFiltrados(data);
    } catch (error) {
      Alert.alert("R02", "Error de conexión con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Función que revisa si la CURP existe en la base de datos para abrir la App
  const manejarAcceso = () => {
    const curpLimpia = curpAcceso.trim().toUpperCase();
    
    if (curpLimpia.length !== 18) {
      Alert.alert("Acceso Denegado", "Por favor, ingresa una CURP válida de 18 caracteres.");
      return;
    }

    // Compara la CURP ingresada contra todas las CURPs de la columna A de tu Sheet
    const usuarioValido = derechohabientes.some(item => 
      item.curp && item.curp.trim().toUpperCase() === curpLimpia
    );

    if (usuarioValido) {
      setHaAccedido(true);
    } else {
      Alert.alert("Acceso Denegado", "La CURP ingresada no se encuentra registrada en el padrón autorizado.");
    }
  };

  const handleBuscar = (text) => {
    setBusqueda(text);
    const query = text.toLowerCase().trim();

    if (!query) {
      setFiltrados(derechohabientes);
      return;
    }

    const filtrados = derechohabientes.filter(item => {
      const nombreSeguro = item.nombre ? item.nombre.toLowerCase() : '';
      const idSeguro = item.id ? item.id.toString().toLowerCase() : '';
      const curpSegura = item.curp ? item.curp.toLowerCase() : '';

      return (
        nombreSeguro.includes(query) || 
        idSeguro.includes(query) || 
        curpSegura.includes(query)
      );
    });
    setFiltrados(filtrados);
  };
  const guardarDatos = async () => {
    if (!causal.trim()) {
      Alert.alert("R02-Derechohabientes", "Por favor introduce el nuevo domicilio o justificación en el campo de Notas.");
      return;
    }

    // Cerramos el formulario de inmediato para agilizar el trabajo en campo
    const copiaSeleccionado = { ...seleccionado };
    setSeleccionado(null); 
    
    // Actualizamos el color del registro en el celular al instante
    setFiltrados(prev => prev.map(item => 
      item.rowNum === copiaSeleccionado.rowNum ? { ...item, situacion: situacion } : item
    ));

    let latitude = "";
    let longitude = "";

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude.toString();
        longitude = loc.coords.longitude.toString();
      }
    } catch (e) {
      console.log("Error obteniendo ubicación rápida");
    }

    // Envío en segundo plano a las columnas P, Q, X e Y de tu Sheets
    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rowNum: copiaSeleccionado.rowNum,
        situacion: situacion,
        causal: causal,
        lat: latitude,
        lng: longitude
      })
    }).catch(err => console.log("Guardado retrasado por red"));

    setCausal('');
    setSituacion('LOCALIZADO');
  };
  // PANTALLA DE CARGA INICIAL
  if (loading && !haAccedido) {
    return (
      <SafeAreaView style={styles.loginCentrado}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={{ color: '#ffffff', marginTop: 15, fontWeight: '600' }}>Sincronizando Padrón R02...</Text>
      </SafeAreaView>
    );
  }

  // PANTALLA DE INICIO DE SESIÓN POR CURP
  if (!haAccedido) {
    return (
      <SafeAreaView style={styles.loginCentrado}>
        <View style={styles.loginTarjeta}>
          <Text style={styles.loginSiglas}>R02</Text>
          <Text style={styles.loginTituloSub}>Control de Territorio</Text>
          <Text style={styles.loginInstruccion}>Ingresa tu CURP para validar tu acceso al sistema:</Text>
          <TextInput 
            style={[styles.input, styles.loginInputMargin]} 
            placeholder="CURP DE 18 DÍGITOS" 
            value={curpAcceso} 
            onChangeText={setCurpAcceso}
            autoCapitalize="characters"
            maxLength={18}
            autoCorrect={false}
          />
          <TouchableOpacity style={[styles.boton, styles.botonGuardar, {width: '100%'}]} onPress={manejarAcceso}>
            <Text style={styles.botonTexto}>Verificar e Ingresar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // APLICACIÓN DESBLOQUEADA (LISTADO Y BUSCADOR)
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerApp}>
        <Text style={styles.titulo}>R02 - Derechohabientes</Text>
        <TouchableOpacity style={styles.botonSalir} onPress={() => { setHaAccedido(false); setCurpAcceso(''); }}>
          <Text style={styles.textoSalir}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
      
      {!seleccionado && (
        <>
          <TextInput style={styles.buscador} placeholder="Buscar por ID, Nombre o CURP..." value={busqueda} onChangeText={handleBuscar} autoCapitalize="none" autoCorrect={false} />
          <FlatList 
            data={filtrados}
            keyExtractor={(item) => item.rowNum.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.tarjeta} onPress={() => { 
                setSeleccionado(item); 
                setSituacion(item.situacion || 'LOCALIZADO');
                setCausal(item.causal || '');
              }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.nombre}>{item.nombre || 'Sin Nombre'}</Text>
                  <Text style={styles.subtexto}><Text style={{fontWeight:'bold'}}>CURP:</Text> {item.curp || 'No registrado'}</Text>
                  <Text style={styles.subtexto}><Text style={{fontWeight:'bold'}}>Dom:</Text> {item.domicilioActual}</Text>
                  <Text style={styles.subtexto}><Text style={{fontWeight:'bold'}}>Mpio:</Text> {item.municipio} | <Text style={{fontWeight:'bold'}}>Cel:</Text> {item.telCel}</Text>
                </View>
                <Text style={styles.badge}>{item.situacion || 'PENDIENTE'}</Text>
              </TouchableOpacity>
            )}
          />
        </>
      )}

      {seleccionado && (
        <ScrollView style={styles.formularioContainer}>
          <Text style={styles.formTitulo}>Actualizar Datos en Territorio</Text>
          <Text style={styles.nombreDerecho}>{seleccionado.nombre}</Text>
          <Text style={styles.subtexto}>ID: {seleccionado.id} | CURP: {seleccionado.curp || 'N/R'}</Text>
          <Text style={styles.label}>SITUACIÓN (Estatus en campo):</Text>
          <View style={styles.opcionesContainer}>
            {['LOCALIZADO', 'NO VIVE AHÍ', 'SE MUDÓ', 'NO EXISTE DOM.'].map((opcion) => (
              <TouchableOpacity key={opcion} style={[styles.opcionBoton, situacion === opcion && styles.opcionSeleccionada]} onPress={() => setSituacion(opcion)}>
                <Text style={[styles.opcionTexto, situacion === opcion && styles.opcionTextoSeleccionado]}>{opcion}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>CAUSAL (Nuevo Domicilio / Observaciones):</Text>
          <TextInput style={[styles.input, styles.textArea]} placeholder="Introduce la nueva dirección completa..." value={causal} onChangeText={setCausal} multiline={true} numberOfLines={4} />
          <View style={styles.botonesContainer}>
            <TouchableOpacity style={[styles.boton, styles.botonGuardar]} onPress={guardarDatos}><Text style={styles.botonTexto}>Guardar en Territorio</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.boton, styles.botonCancelar]} onPress={() => setSeleccionado(null)}><Text style={styles.botonTexto}>Regresar a la lista</Text></TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', paddingHorizontal: 15 },
  headerApp: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  titulo: { fontSize: 20, fontWeight: '800', color: '#621132' },
  botonSalir: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 6, backgroundColor: '#e5e7eb' },
  textoSalir: { fontSize: 12, color: '#4b5563', fontWeight: '600' },
  loginCentrado: { flex: 1, backgroundColor: '#621132', justifyContent: 'center', alignItems: 'center', padding: 20 },
  loginTarjeta: { backgroundColor: '#ffffff', width: '100%', padding: 25, borderRadius: 16, alignItems: 'center', elevation: 5 },
  loginSiglas: { fontSize: 42, fontWeight: '900', color: '#621132', marginBottom: 2 },
  loginTituloSub: { fontSize: 16, color: '#4b5563', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 20 },
  loginInstruccion: { fontSize: 14, color: '#374151', textAlign: 'center', marginBottom: 15, lineHeight: 20 },
  loginInputMargin: { width: '100%', marginBottom: 20, textAlign: 'center', fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
  buscador: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2 },
  tarjeta: { backgroundColor: '#ffffff', padding: 16, borderRadius: 14, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#285c4d', elevation: 2 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  subtexto: { fontSize: 12, color: '#4b5563', lineHeight: 18 },
  badge: { fontSize: 11, backgroundColor: '#fef08a', color: '#854d0e', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginLeft: 10, alignSelf: 'center', fontWeight: '800', textTransform: 'uppercase' },
  formularioContainer: { flex: 1, backgroundColor: '#ffffff', padding: 20, borderRadius: 16, marginTop: 10, elevation: 4 },
  formTitulo: { fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 'bold' },
  nombreDerecho: { fontSize: 20, fontWeight: 'bold', color: '#621132', marginVertical: 6 },
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 18, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#d1d5db', padding: 14, borderRadius: 10, backgroundColor: '#f9fafb', fontSize: 15, color: '#111827' },
  textArea: { height: 100, textAlignVertical: 'top' },
  opcionesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 5 },
  opcionBoton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#d1d5db', backgroundColor: '#ffffff' },
  opcionSeleccionada: { backgroundColor: '#621132', borderColor: '#621132' },
  opcionTexto: { color: '#374151', fontSize: 13, fontWeight: '500' },
  opcionTextoSeleccionado: { color: '#ffffff', fontWeight: 'bold' },
  botonesContainer: { flexDirection: 'column', gap: 12, marginTop: 30, marginBottom: 50 },
  boton: { padding: 16, borderRadius: 10, alignItems: 'center', elevation: 2 },
  botonGuardar: { backgroundColor: '#285c4d' },
  botonCancelar: { backgroundColor: '#982236' },
  botonTexto: { color: '#ffffff', fontWeight: '700', fontSize: 16 }
});

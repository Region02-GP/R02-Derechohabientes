import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, ScrollView } from 'react-native';
import * as Location from 'expo-location';

const API_URL = "https://script.google.com/macros/s/AKfycbymIkArKj52jhVXvM8uGTkYETU1Q8Ikbqbu--BdUO0BcTAYrFZ4SPb6r9UOMsjH5RC1/exec"; // <-- REEMPLAZA CON TU URL /exec

export default function App() {
  const [loading, setLoading] = useState(true);
  const [derechohabientes, setDerechohabientes] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionado, setSeleccionado] = useState(null);
  
  // Campos del formulario vinculados a tu Excel
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

  useEffect(() => { cargarDatos(); }, []);

  const handleBuscar = (text) => {
    setBusqueda(text);
    const filtrados = derechohabientes.filter(item => 
      item.nombre.toLowerCase().includes(text.toLowerCase()) || 
      item.id.includes(text) || 
      item.curp.toLowerCase().includes(text.toLowerCase())
    );
    setFiltrados(filtrados);
  };

  // ==========================================
  // FUNCIÓN GUARDAR DATOS (VERSIÓN ULTRA VELOZ)
  // ==========================================
  const guardarDatos = async () => {
    if (!causal.trim()) {
      Alert.alert("R02-Derechohabientes", "Por favor introduce el nuevo domicilio o justificación en el campo de Notas.");
      return;
    }

    // 1. Cerramos el formulario e indicamos éxito LOCAL de inmediato para ahorrar tiempo
    const copiaSeleccionado = { ...seleccionado };
    setSeleccionado(null); 
    
    // Actualizamos la lista del celular al instante (Cambiamos el color/estatus en la pantalla)
    setFiltrados(prev => prev.map(item => 
      item.rowNum === copiaSeleccionado.rowNum ? { ...item, situacion: situacion } : item
    ));

    let latitude = "";
    let longitude = "";

    try {
      // Pedimos GPS en modo equilibrado (tarda milisegundos en responder)
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude.toString();
        longitude = loc.coords.longitude.toString();
      }
    } catch (e) {
      console.log("Error obteniendo ubicación rápida");
    }

    // 2. Enviamos la información a Google Sheets en segundo plano sin congelar la app
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
    })
    .then(() => {
      // Se sincronizó con éxito silenciosamente en la Sheet
      console.log("Sincronizado en la nube exitosamente");
    })
    .catch(err => {
      console.log("Guardado retrasado por problemas de red");
    });

    // Limpiamos los campos para la siguiente encuesta
    setCausal('');
    setSituacion('LOCALIZADO');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>R02 - Derechohabientes</Text>
      
      {!seleccionado && (
        <>
          <TextInput style={styles.buscador} placeholder="Buscar por ID, Nombre o CURP..." value={busqueda} onChangeText={handleBuscar} />
          {loading ? (
            <ActivityIndicator size="large" color="#1e3a8a" style={{ flex: 1 }} />
          ) : (
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
                    <Text style={styles.subtexto}><Text style={{fontWeight:'bold'}}>CURP:</Text> {item.curp}</Text>
                    <Text style={styles.subtexto}><Text style={{fontWeight:'bold'}}>Dom:</Text> {item.domicilioActual}</Text>
                    <Text style={styles.subtexto}><Text style={{fontWeight:'bold'}}>Mpio:</Text> {item.municipio} | <Text style={{fontWeight:'bold'}}>Cel:</Text> {item.telCel}</Text>
                  </View>
                  <Text style={styles.badge}>{item.situacion || 'PENDIENTE'}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      {seleccionado && (
        <ScrollView style={styles.formularioContainer}>
          <Text style={styles.formTitulo}>Actualizar Datos en Territorio</Text>
          <Text style={styles.nombreDerecho}>{seleccionado.nombre}</Text>
          <Text style={styles.subtexto}>ID: {seleccionado.id} | CURP: {seleccionado.curp}</Text>

          {/* Selector de Situación */}
          <Text style={styles.label}>SITUACIÓN (Estatus en campo):</Text>
          <View style={styles.opcionesContainer}>
            {['LOCALIZADO', 'NO VIVE AHÍ', 'SE MUDÓ', 'NO EXISTE DOM.'].map((opcion) => (
              <TouchableOpacity 
                key={opcion} 
                style={[styles.opcionBoton, situacion === opcion && styles.opcionSeleccionada]} 
                onPress={() => setSituacion(opcion)}
              >
                <Text style={[styles.opcionTexto, situacion === opcion && styles.opcionTextoSeleccionado]}>{opcion}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Notas de Causal */}
          <Text style={styles.label}>CAUSAL (Nuevo Domicilio / Observaciones):</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Introduce la nueva dirección completa o la razón por la que no se localizó..." 
            value={causal} 
            onChangeText={setCausal} 
            multiline={true}
            numberOfLines={4}
          />

          {/* Botones de acción */}
          <View style={styles.botonesContainer}>
            <TouchableOpacity style={[styles.boton, styles.botonGuardar]} onPress={guardarDatos}>
              <Text style={styles.botonTexto}>Guardar en Territorio</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.boton, styles.botonCancelar]} onPress={() => setSeleccionado(null)}>
              <Text style={styles.botonTexto}>Regresar a la lista</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6', paddingHorizontal: 15 },
  titulo: { fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 20, marginBottom: 15, color: '#621132', letterSpacing: 0.5 },
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

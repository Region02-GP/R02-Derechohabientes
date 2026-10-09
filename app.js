// URL del Web App de Google Apps Script 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_rQKWnnixfxxhRqa66SG-FUO33_bHDH08ivvkno8T4zpRL4UaWT0DyDIsQVagdxYV/exec";


let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let syncedHistory = JSON.parse(localStorage.getItem('syncedHistory')) || [];
let currentUser = null;
let previousScreen = 'screen-welcome';
let currentEstatusVisita = "LOCALIZADO"; 
let motivoNoLocalizadoValue = "";        
window.currentTratoValue = ""; 

const CATALOGO_MUNICIPIOS = [
// ... (Tu catálogo de municipios y colonias sigue abajo igual)

    "GOMEZ PALACIO", "EL ORO", "MAPIMI", "INDE", "SAN BERNARDO", "HIDALGO", "TLAHUALILO", "GUANACEVI", "SAN PEDRO DEL GALLO", "OCAMPO"
];
const CATALOGO_COLONIAS = [
    "18 DE MARZO", "AMPLIACION AMPLIACION MIGUEL DE LA MADRID HURTADO", "AMPLIACION BELLA VISTA", "AMPLIACION BRITTINGHAM", 
    "AMPLIACION CASA BLANCA", "AMPLIACION CINCO DE MAYO", "AMPLIACION FELIPE ANGELES", "AMPLIACION LA CENTRAL", 
    "AMPLIACION LA FERIA", "AMPLIACION LA POPULAR", "AMPLIACION LAZARO CARDENAS", "AMPLIACION PARQUE INDUSTRIAL II", 
    "AMPLIACION RICARDO FLORES MAGON", "AMPLIACION SACRAMENTO", "AMPLIACION SAN FELIPE", "AMPLIACION SANTA ROSA", 
    "AMERICA UNO", "AQUILES SERDAN", "ARCINAS", "ARTURO MARTINEZ ADAME", "BELLA UNION", "BERLIN", "BRITTINGHAM", 
    "BUCARELI", "BUENDIA", "CALIFORNIA", "CHIHUAHUITA (CHIHUAHUITA NUEVO)", "CHIHUAHUITA (CHIHUAHUITA VIEJO)", 
    "COLONIA 14 DE NOVIEMBRE", "COLONIA 15 DE DICIEMBRE", "COLONIA 15 DE MAYO", "COLONIA 7 DE NOVIEMBRE", 
    "COLONIA ABRAHAM ROSALES", "COLONIA AGRICOLA LA POPULAR", "COLONIA ARMANDO DEL CASTILLO FRANCO", 
    "COLONIA BELLA VISTA", "COLONIA BICENTENARIO", "COLONIA BRITTINGHAM", "COLONIA CAMPESTRE", "COLONIA CARLOS HERRERA", 
    "COLONIA CARRILLO PUERTO", "COLONIA CASA BLANCA", "COLONIA CERRO DE LA CRUZ", "COLONIA CERRO DE LA PILA", 
    "COLONIA CINCO DE MAYO", "COLONIA DIVISION DEL NORTE", "COLONIA DOROTEO ARANGO", "COLONIA EL 28 DE NOVIEMBRE", 
    "COLONIA EL AMIGO", "COLONIA EL CONSUELO", "COLONIA EL FOCE", "COLONIA EL MEZQUITAL", "COLONIA EL MEZQUITAL II", 
    "COLONIA EL PARAISO", "COLONIA EL REFUGIO", "COLONIA EMILIANO ZAPATA", "COLONIA ERNESTO HERRERA ZAVALA", 
    "COLONIA FCO ZARCO", "COLONIA FELIPE ANGELES", "COLONIA FIDEL VELAZQUEZ (CHAPALA)", "COLONIA FILADELFIA", 
    "COLONIA FRANCISCO PEREZ RIOS", "COLONIA FRANCISCO VILLA", "COLONIA GENARO GARCIA", "COLONIA GONZALEZ DE LA VEGA", 
    "COLONIA GUADALUPE VICTORIA", "COLONIA GUAYULERAS", "COLONIA HECTOR MAYAGOITIA DOMINGUEZ", "COLONIA HIJOS DE CAMPESINOS", 
    "COLONIA HORTENCIA", "COLONIA INDEPENDENCIA", "COLONIA JACINTO CANEK", "COLONIA JERUSALEM", "COLONIA JOSE CAMPILLO SAINZ", 
    "COLONIA JOSE REBOLLO ACOSTA", "COLONIA JOSE RODRIGUEZ RIOS", "COLONIA LA CENTRAL", "COLONIA LA DEPORTIVA", 
    "COLONIA LA HERRADURA", "COLONIA LAS FLORES", "COLONIA LAS LUISAS", "COLONIA LAS ROSAS", "COLONIA LAZARO CARDENAS", 
    "COLONIA LETICIA HERRERA", "COLONIA LOPEZ PORTILLO", "COLONIA LOS ALAMOS", "COLONIA LOS VIÑEDOS", 
    "COLONIA LUIS D COLOSIO MURRIETA", "COLONIA MARIA INES MATA DE RENDON", "COLONIA MIGUEL DE LA MADRID HURTADO"
];
CATALOGO_COLONIAS.push(
    "COLONIA MIGUEL HIDALGO", "COLONIA NICOLAS FERNANDEZ", "COLONIA NIÑOS HEROES", "COLONIA NOGALES", 
    "COLONIA NUCLEO UNIVERSITARIO", "COLONIA NUEVA LOS ALAMOS", "COLONIA NUEVO GOMEZ", "COLONIA NUEVO REFUGIO", 
    "COLONIA OCTAVIANO REDONDO ARCE", "COLONIA OTILIO MONTAÑO", "COLONIA PANFILO NATERA", "COLONIA PANFILO NATERA SECTOR 3", 
    "COLONIA PARQUE HUNDIDO", "COLONIA PRIMAVERA", "COLONIA RESIDENCIAL EL CAMPANARIO (CDA ARANJUEZ)", 
    "COLONIA RESIDENCIAL EL CAMPANARIO (CDA BARCELONA)", "COLONIA RESIDENCIAL EL CAMPANARIO (CERRADA BILBAO)", 
    "COLONIA RESIDENCIAL EL CAMPANARIO CERRADA TOLEDO", "COLONIA REVOLUCION", "COLONIA RICARDO FLORES MAGON", 
    "COLONIA RINCON CAMPESTRE", "COLONIA ROCIO REBOLLO", "COLONIA RODOLFO FIERRO", "COLONIA ROSALES", 
    "COLONIA RUBEN JARAMILLO", "COLONIA SACRAMENTO", "COLONIA SAN ANGEL", "COLONIA SAN IGNACIO", "COLONIA SAN ISIDRO", 
    "COLONIA SANTA ROSA", "COLONIA SANTA ROSA INFONAVIT", "COLONIA SANTA ROSALIA", "COLONIA SEIS DE JULIO (NUEVO NOE)", 
    "COLONIA SIN NOMBRE", "COLONIA SOLIDARIDAD", "COLONIA TIERRA BLANCA", "COLONIA TIERRA Y LIBERTAD", 
    "COLONIA VALLE AZUL", "COLONIA VALLE CAMPESTRE", "COLONIA VALLE DEL GUADIANA", "COLONIA VEITIUNO DE MARZO", 
    "COLONIA VILLA DEL MAR", "COLONIA VILMA ALE DE HERRERA", "COLONIA ZONA CENTRO", "CUATRO DE DICIEMBRE (SAGUNDO)", 
    "DINAMITA", "DOLORES", "EL BARRO", "EL BARRO 33 (EL TREINTA Y TRES)", "EL CARIÑO", "EL CASTILLO", "EL COMPAS", 
    "EL CONSUELO", "EL JUNCO", "EL PARAISO", "EL QUEMADO", "EL RECUERDO", "EL RETOÑO", "EL TRIUNFO", "EL VALLE DE EUREKA", 
    "EL VEINTINUEVE DE AGOSTO", "EL VERGEL", "EL VERGELITO", "EL VOLADO", "ESMERALDA", "ESTACION NOE", "ESTACION VIÑEDO", 
    "EUREKA DE MEDIA LUNA (EUREKA)", "FAMILIA RODRIGUEZ CORDERO", "FRACCIONAMIENTO 11 DE SEPTIEMBRE", 
    "FRACCIONAMIENTO AGAVIAS", "FRACCIONAMIENTO ALTOZANO", "FRACCIONAMIENTO AMPLIACION LAS FLORES", 
    "FRACCIONAMIENTO AMPLIACION SAN ANTONIO", "FRACCIONAMIENTO BOSQUE REAL", "FRACCIONAMIENTO BUGAMBILIAS", 
    "FRACCIONAMIENTO CASA BLANCA", "FRACCIONAMIENTO CDA DEL JAZMIN (CDAS MIRAVALLE)", "FRACCIONAMIENTO CDA PREMIER (MIRAVALLE)", 
    "FRACCIONAMIENTO CDA SAN LUIS (CDAS MIRAVALLE)", "FRACCIONAMIENTO CDA STA LORENA (CDAS MIRAVALLE)", 
    "FRACCIONAMIENTO CDA STA MARTHA (CDAS MIRAVALLE)", "FRACCIONAMIENTO CERRADA ANDALUCIA", "FRACCIONAMIENTO CERRADA DEL ROCIO C 16", 
    "FRACCIONAMIENTO CERRADA ORALIA", "FRACCIONAMIENTO CERRADA SAN CARLOS (CDAS MIRAVALLE)"
);
CATALOGO_COLONIAS.push(
    "FRACCIONAMIENTO CERRADA SAN MARCOS", "FRACCIONAMIENTO CERRADA SAN PATRICIO", "FRACCIONAMIENTO CERRADA SANTA DOLORES", 
    "FRACCIONAMIENTO CERRADA SANTA ISABEL", "FRACCIONAMIENTO CERRADA SANTA LAURA", "FRACCIONAMIENTO CERRADA SANTA MARIA", 
    "FRACCIONAMIENTO CERRADA SANTA TERESA (CDAS MIRAVALLE)", "FRACCIONAMIENTO CERRADA STA ANA (CDAS MIRAVALLE)", 
    "FRACCIONAMIENTO CERRADA VILLAS MIRAVALLE", "FRACCIONAMIENTO CERRADAS MIRAVALLE", "FRACCIONAMIENTO CERRADAS SAN LORENZO", 
    "FRACCIONAMIENTO CERRADAS SAN VICENTE", "FRACCIONAMIENTO CERRO LINDO", "FRACCIONAMIENTO DE LOS PINOS (LOS ARRAYANES)", 
    "FRACCIONAMIENTO DEL ALAMO (LOS ARRAYANES)", "FRACCIONAMIENTO DEL ALMENDRO (LOS ARRAYANES)", "FRACCIONAMIENTO DEL BOSQUE", 
    "FRACCIONAMIENTO DEL CEDRO (LOS ARRAYANES)", "FRACCIONAMIENTO DEL OLIVO (LOS ARRAYANES)", "FRACCIONAMIENTO DEL ROBLE (LOS ARRAYANES)", 
    "FRACCIONAMIENTO EL CENTENARIO", "FRACCIONAMIENTO EL DORADO", "FRACCIONAMIENTO EL REFUGIO", "FRACCIONAMIENTO EUCALIPTOS", 
    "FRACCIONAMIENTO FILADELFIA", "FRACCIONAMIENTO FOVISSSTE", "FRACCIONAMIENTO GEOVILLAS SAN IGNACIO", 
    "FRACCIONAMIENTO HACIENDA EL REFUGIO", "FRACCIONAMIENTO HAMBURGO", "FRACCIONAMIENTO JARDIN", "FRACCIONAMIENTO LA ESPERANZA", 
    "FRACCIONAMIENTO LA FERIA", "FRACCIONAMIENTO LA FLORESTA", "FRACCIONAMIENTO LAS CARMELITAS", "FRACCIONAMIENTO LAS GRANJAS", 
    "FRACCIONAMIENTO LAS GRANJAS 2", "FRACCIONAMIENTO LAS MISIONES MIRAVALLE", "FRACCIONAMIENTO LOMA REAL", 
    "FRACCIONAMIENTO LOS ALAMOS", "FRACCIONAMIENTO LOS CEDROS", "FRACCIONAMIENTO LOS OLIVOS", "FRACCIONAMIENTO MARBELLA", 
    "FRACCIONAMIENTO MIRAVALLE", "FRACCIONAMIENTO MIRAVALLE ORIENTE", "FRACCIONAMIENTO MORELOS I", "FRACCIONAMIENTO MORELOS II", 
    "FRACCIONAMIENTO NUEVO CASTILLO", "FRACCIONAMIENTO NUEVO CUBA", "FRACCIONAMIENTO PARQUE HUNDIDO", "FRACCIONAMIENTO PEDREGAL I", 
    "FRACCIONAMIENTO PEDREGAL II", "FRACCIONAMIENTO PRIVADA COLONIA LA ESPERANZA", "FRACCIONAMIENTO PUERTA DEL SOL", 
    "FRACCIONAMIENTO QUINTA NAPOLES", "FRACCIONAMIENTO QUINTAS LAS NOAS", "FRACCIONAMIENTO RAFAEL CASTELLANOS", 
    "FRACCIONAMIENTO RESIDENCIAL EL CAMPANARIO", "FRACCIONAMIENTO RESIDENCIAL EL CAMPANARIO II", "FRACCIONAMIENTO RESIDENCIAL SAN ALBERTO", 
    "FRACCIONAMIENTO RINCON FILADELFIA", "FRACCIONAMIENTO RINCON LAS GRANJAS", "FRACCIONAMIENTO RINCON SAN ALBERTO", 
    "FRACCIONAMIENTO RINCON SAN ANTONIO", "FRACCIONAMIENTO RINCONADA BUGAMBILIAS", "FRACCIONAMIENTO RINCONADA DEL PARQUE", 
    "FRACCIONAMIENTO RINCONADA NAPOLES", "FRACCIONAMIENTO RINCONADA ROSALES", "FRACCIONAMIENTO RINCONADAS HAMBURGO", 
    "FRACCIONAMIENTO SALVADOR NAVA MARTINEZ", "FRACCIONAMIENTO SAN ANTONIO", "FRACCIONAMIENTO SAN VICENTE", 
    "FRACCIONAMIENTO SANTA ROSA", "FRACCIONAMIENTO SANTA SOFIA", "FRACCIONAMIENTO SANTA TERESA", "FRACCIONAMIENTO SANTO DOMINGO", 
    "FRACCIONAMIENTO SEVILLA", "FRACCIONAMIENTO TORREMOLINOS CERRADA HUELVA", "FRACCIONAMIENTO TORREMOLINOS CERRADA JAEN", 
    "FRACCIONAMIENTO TORREMOLINOS SAN SEBASTIAN", "FRACCIONAMIENTO URBIVILLAS DEL CEDRO", "FRACCIONAMIENTO VALLE DE CHAPALA", 
    "FRACCIONAMIENTO VALLE DEL NAZAS", "FRACCIONAMIENTO VEREDAS DE SANTA RITA", "FRACCIONAMIENTO VILLA LAS MISIONES", 
    "FRACCIONAMIENTO VILLA NAPOLES", "FRACCIONAMIENTO VILLAS DEL DESIERTO", "FRACCIONAMIENTO VILLAS DEL DESIERTO II", 
    "FRACCIONAMIENTO VILLAS EL REFUGIO", "FRACCIONAMIENTO VILLAS LAS NOAS", "FRACCIONAMIENTO VILLAS SAN ANTONIO", 
    "FRACCIONAMIENTO VILLAS SAN FERMIN", "FRANCISCO VILLA", "GLORIETA", "HACIENDA LA NORIA", "HUITRON", "INDEPENDENCIA", 
    "JERUSALEM", "JIMENEZ (JIMENEZ UNO)", "JOLO (DIECINUEVE DE OCTUBRE)", "JOSE MARIA MORELOS Y PAVON", "LA AURORA", 
    "LA COMPETENCIA", "LA FLOR", "LA FORTUNA", "LA LUZ", "LA MAGDALENA (FRESNEDO) [GRANJA]", "LA PLATA", "LA TEHUA", 
    "LAS LECHUZAS (LAS BRUJAS)", "LAS MACITAS", "LAS PLAYAS", "LOS ANGELES", "LAZARO CARDENAS", "MANILA", 
    "MARIA ANTONIETA", "NAZAS (LAS LAGARTIJAS)", "NORIA SECTOR VEINTITRES", "NOE", "NUEVO BARRO", "NUMANCIA", 
    "PALO BLANCO", "PARQUE INDUSTRIAL PARQUE INDUSTRIAL", "PASTOR ROUAIX (JABONCILLO)", "PASTOR ROUAIX (PENJAMO)", 
    "POANAS", "PROVIDENCIA", "PUEBLO ABISINIA (DINAMITA)", "PUEBLO AHEDO"
);
CATALOGO_COLONIAS.push(
    "PUEBLO ARTURO MARTINEZ ADAME", "PUEBLO BELLA UNION", "PUEBLO BERLIN", "PUEBLO BRITTINGHAM", "PUEBLO BUCARELI", 
    "PUEBLO CALIFORNIA", "PUEBLO CHIHUAHUITA VIEJO", "PUEBLO COMPETENCIA", "PUEBLO CUATRO DE DICIEMBRE", "PUEBLO CUBA", 
    "PUEBLO DIECINUEVE DE OCTUBRE", "PUEBLO DIECIOCHO DE MARZO", "PUEBLO DOLORES", "PUEBLO EL BARRO", "PUEBLO EL CARIÑO", 
    "PUEBLO EL CASTILLO", "PUEBLO EL COMPAS", "PUEBLO EL CONSUELO", "PUEBLO EL FENIX", "PUEBLO EL JUNCO", 
    "PUEBLO EL NUEVO CASTILLO", "PUEBLO EL PARAISO", "PUEBLO EL QUEMADO", "PUEBLO EL RECUERDO", "PUEBLO EL RETOÑO", 
    "PUEBLO EL SIETE (PUEBLO NUEVO)", "PUEBLO EL TRIUNFO", "PUEBLO EL VERGEL", "PUEBLO EL VERGELITO", "PUEBLO EL VOLADO", 
    "PUEBLO EMILIANO ZAPATA", "PUEBLO ESMERALDA", "PUEBLO EUREKA", "PUEBLO FILADELFIA", "PUEBLO GLORIETA", 
    "PUEBLO GREGORIO A GARCIA", "PUEBLO HUITRON", "PUEBLO INDEPENDENCIA", "PUEBLO JABONOSO", "PUEBLO JERUSALEM", 
    "PUEBLO JIMENEZ", "PUEBLO JOSE MARIA MORELOS Y PAVON", "PUEBLO LA AURORA", "PUEBLO LA FLOR", "PUEBLO LA FORTUNA", 
    "PUEBLO LA LUZ", "PUEBLO LA PLATA", "PUEBLO LA TEHUA", "PUEBLO LAS CATALINAS", "PUEBLO LAS HUERTAS", 
    "PUEBLO LAS LAGARTIJAS", "PUEBLO LAS LECHUZAS", "PUEBLO LAS LUISAS", "PUEBLO LAS MASITAS", "PUEBLO LAS PLAYAS"
);
CATALOGO_COLONIAS.push(
    "PUEBLO LAZARO CARDENAS", "PUEBLO LOS ANGELES", "PUEBLO LUJAN (SANTA CRUZ)", "PUEBLO MADRID", "PUEBLO MANILA", 
    "PUEBLO MARIA ANTONIETA", "PUEBLO NOE (EJIDO)", "PUEBLO NOE (EST FFCC)", "PUEBLO NUEVO (EL SIETE)", "PUEBLO NUMANCIA", 
    "PUEBLO PALO BLANCO", "PUEBLO PASTOR ROUAIX", "PUEBLO PASTOR ROUAIX (JABONCILLO)", "PUEBLO PENJAMO", "PUEBLO POANAS", 
    "PUEBLO PROVIDENCIA", "PUEBLO PUENTE DE LA TORREÑA", "PUEBLO REFORMA", "PUEBLO RINCON DE SANTA CRUZ", "PUEBLO RINCONADA", 
    "PUEBLO SAN ALBERTO", "PUEBLO SAN JOSE DEL VIÑEDO", "PUEBLO SAN RAMON", "PUEBLO SAN SEBASTIAN", "PUEBLO SANTA CLARA", 
    "PUEBLO SANTOÑA", "PUEBLO SEIS DE OCTUBRE", "PUEBLO TRANSPORTE", "PUEBLO VALLE DE EUREKA", "PUEBLO VENECIA", 
    "PUEBLO VIÑEDO", "PUENTE DE LA TORREÑA", "REFORMA", "RINCONADA", "RINCON DE SANTA CRUZ", "SAN ALBERTO", 
    "SAN ISIDRO", "SAN JOSE DE VIÑEDO", "SAN MARTIN", "SAN RAMON", "SAN ROQUE", "SAN SEBASTIAN", "SANTA CLARA", 
    "SANTA CRUZ LUJAN", "SEIS DE OCTUBRE", "SIERRA HERMOSA", "TAJO VIEJO", "TRANSPORTE", "TRANSPORTE DOS", 
    "TRECE DE MARZO", "UNIDAD HABITACIONAL ALEJANDRA", "VENECIA", "VICENTE NAVA", "VILLA GREGORIO GARCIA", 
    "VILMA ALE DE HERRERA (LAS CUADRITAS)"
);

const CATALOGO_LOCALIDADES = [
    "18 DE MARZO", "ACAPULCO", "ACAPULCO (PROPIEDAD PRIVADA)", "AMERICA UNO", "AMPARO (GRANJA)", "AMPLIACION BUCARELI", 
    "AMPLIACION EL FENIX", "AMPLIACION EL VERGELITO SUR", "AMPLIACION VENECIA", "AMPUEROS", "ANDRES JIMENEZ", 
    "ANTONIO TORRES", "AQUILES SERDAN", "ARCINAS", "ARREOLA HERNANDEZ", "ARTURO MARTINEZ ADAME", "ASCENSION CRUZ", 
    "ASTILLERO", "AURELIO RODRIGUEZ", "AUTODROMO MARCO MAGAÑA (DE LA LAGUNA)", "AUTOTRANSPORTES TRANSBAP [TALLER]", 
    "AVICOLA AURORA", "BELLA UNION", "BERLIN", "BETHEL", "BETHEL (GRANJA)", "BETHEL DOS", "BRITTINGHAM", "BUCARELI", 
    "BUENDIA", "BUGAMBILIA (MARIA CRISTINA) (GRANJA)", "CAIRO DOS", "CALIFORNIA", "CALIFORNIA CRIANZA", 
    "CAMILO CENICEROS", "CAMPO C", "CANTERAS NUEVA CARRARA [MARMOLERA]", "CARLOS GERARDO VALDES BOHIGAS", 
    "CASA BLANCA", "CASETA KILOMETRO 11 MAS 458", "CASETA KILOMETRO 17 CANAL SACRAMENTO", "CEFERESO NUMERO 14", 
    "CEMIX", "CENTRO DE ACOPIO (GRANJA BLANCA)", "CERDO REAL", "CHAPINGO", "CHAVEZ (GRANJA)", 
    "CHIHUAHUITA (CHIHUAHUITA NUEVO)", "CHIHUAHUITA (CHIHUAHUITA VIEJO)", "COLONIA AGRICOLA BUENDIA", 
    "COLONIA AGRICOLA LA POPULAR", "COLONIA ESTABLERA SAN FRANCISCO", "COLONIA SAN ANGEL", 
    "COLONIA SEIS DE JULIO (NUEVO NOE)", "CONEJOS", "CONSUELO OROZCO", "CORDERO CASTRO", "COREA", "CORRALITOS", 
    "CRUZ ARREOLA", "CUATRO DE DICIEMBRE (SAGUNDO)", "CUATRO DE JULIO", "CURVA DE CAMACHO"
];
CATALOGO_LOCALIDADES.push(
    "DAGOBERTO RAMON ARELLANO", "DAVID GAUSIN", "DELGADO SANTA ROSA", "DESARROLLO DORADO DE MILAGROS AC [HOGAR DE ANCIANOS]", 
    "DESARROLLO LACTEO (DESLAC)", "DINAMITA", "DOLORES", "DON MELY (GRANJA)", "DON RICARDO [QUINTA]", "DON ROBERTO", 
    "DOS AMIGOS", "DULCE MARIA (LA LUZ)", "EJIDO BUENDIA (LA CASETA)", "EL AGUILA", "EL ALTO DEL CHIVO (ROMERO ROSAS)", 
    "EL BARRO", "EL BARRO 33 (EL TREINTA Y TRES)", "EL BERCIAL", "EL BUEN PASTOR", "EL CAIRO DOS (GRANJA)", 
    "EL CAIRO [DESPEPITE]", "EL CARIÑO", "EL CARMEN", "EL CASTILLO", "EL CELO", "EL CHAPARRAL", "EL CHIMAL", 
    "EL CHORIZO (FAMILIA TORRES)", "EL COMPAS", "EL CONSUELO", "EL CONSUELO TRES [NORIA]", "EL CORONEL", 
    "EL CORTIJO", "EL DURAZNITO", "EL DURAZNO", "EL EMPAQUE", "EL ERIAZO", "EL ESFUERZO (GRANJA)", "EL FENIX", 
    "EL GARCES", "EL GATO", "EL HERMANO [AUTOPARTES]", "EL INDIO", "EL JUNCO", "EL LABRADOR", "EL LAGUNERO [RESTAURANTE]", 
    "EL MANANTIAL", "EL MEZQUITE", "EL MEZQUITE (CANTU)", "EL NOGUERAL 555 (CAMPO REAL)", "EL OLIVO", "EL PARAISO", 
    "EL PATO", "EL PILAR", "EL PITAYO", "EL POLVORON", "EL PROGRESO", "EL QUEMADO", "EL RECUERDO", "EL REFUGIO", 
    "EL RETOÑO", "EL ROSARIO", "EL SOL (GRANJA)", "EL SOLITO", "EL TAJITO", "EL TREBOL", "EL TREINTA Y UNO", 
    "EL TRIUNFILLO (EL TRIUNFITO)", "EL TRIUNFO", "EL TUANON", "EL VALLE DE EUREKA", "EL VEINTINUEVE DE AGOSTO", 
    "EL VERGEL", "EL VERGELITO", "EL VOLADO", "EL VUELO DEL AGUILA", "ELIAF (EL CHORIZO)", "ENSENADA", "ESMERALDA", 
    "ESTABLO BREMEN", "ESTABLO BRITINGHAM"
);
CATALOGO_LOCALIDADES.push(
    "ESTABLO CHILCHOTA", "ESTABLO EL COMPAS", "ESTABLO EL PORVENIR", "ESTABLO EL VERGEL", "ESTABLO LA GALLEGA", 
    "ESTABLO MADRID", "ESTACION NOE", "ESTACION VIÑEDO", "EUREKA DE MEDIA LUNA (EUREKA)", "FABRICACIONES ESPECIALIZADAS", 
    "FAMILIA ALDAMA SANCHEZ", "FAMILIA BARBA GUTIERREZ", "FAMILIA CISNEROS CALZADA", "FAMILIA CORDERO FLORES", 
    "FAMILIA CORDERO ROSALES", "FAMILIA COSIO CEPEDA", "FAMILIA ESQUIVEL", "FAMILIA GARCIA DELGADILLO", 
    "FAMILIA GARCIA ESCOBEDO", "FAMILIA GUADARRAMA L", "FAMILIA GUTIERREZ PARRA", "FAMILIA LLANES ONTIVEROS", 
    "FAMILIA LOPEZ ZAPATA", "FAMILIA MARTINEZ ANDRADE", "FAMILIA MARTINEZ LOPEZ", "FAMILIA MOTA ANDRADE", 
    "FAMILIA RAMIREZ PEREZ", "FAMILIA RESENDIZ MONTOYA", "FAMILIA RODRIGUEZ CORDERO", "FAMILIA SANCHEZ AGUILAR", 
    "FAMILIA SANCHEZ MACIAS", "FAMILIA SANCHEZ MONTALVO", "FAMILIA SANCHEZ RAMIREZ", "FAMILIA TORRES", 
    "FAMILIA VALDEZ FAVELA", "FAMILIA VARGAS AGUILAR", "FAMILIA VAZQUEZ", "FAMILIA ZAPATA ROSALES", 
    "FERNANDO TURRUBIATES", "FILADELFIA", "FLORENCIO CASAS", "FRANCISCO ESPARZA A", "FRANCISCO MERCADO", 
    "FRANCISCO VILLA", "FRANCISCO VILLA (LOS SIERRA)", "FUENTE BELLA", "GABY (GRANJA)", "GANADERA GILIO", 
    "GANADERA SOLORZANO", "GARCIA (GRANJA)", "GAUCIN ARAIZA", "GAUCIN LUJAN", "GEMA [ESTABLO]", "GLORIETA", 
    "GOMEZ PALACIO", "GONZALEZ TOSCANO", "GRANJA ALBORADA", "GRANJA ANA", "GRANJA CLAUDIA LETICIA", 
    "GRANJA EL CASTILLO", "GRANJA EL ROCIO", "GRANJA ELVIRA", "GRANJA GUADALUPE", "GRANJA LA CANTABRA", 
    "GRANJA PORCINA NOE", "GRANJA PUERTO ARTURO", "GUADALUPE BERLANGA", "GUERRERO (GRANJA)", "GUTIERREZ PARRA", 
    "HERMANOS QUEZADA", "HOREB", "HUERTO SOFIA", "HUITRON", "IDEAGEMA (GRANJA)", "IDEAL (GRANJA)", "ILHUICAMINA", 
    "INDEPENDENCIA", "INDUSTRIAL GUAJARDO", "INDUSTRIAL MAFER", "ISIDRO MORALES", "J GUADALUPE RODRIGUEZ", 
    "JACINTO CAMACHO", "JAIME ROMERO", "JERICO", "JERUSALEM", "JEZALA", "JIMENEZ (JIMENEZ UNO)", "JIMENEZ 2A", 
    "JOLO", "JOSE ANTUNEZ", "JOSE GUADALUPE ANTUNEZ", "JOSE MARIA MORELOS Y PAVON", "JOSE ROBLES", "JOSE SALDAÑA", 
    "JUAN CARLOS SILVA BERNAL", "JUAN LARRIÑAGA", "JUAN LLANES", "JUAN MANUEL", "JUAN RODRIGUEZ", "LA AMPLIACION", 
    "LA AURORA", "LA BECERRA", "LA BILLETERA", "LA CABAÑA", "LA CAPILLA", "LA CASA ROSA", "LA CHILLA", 
    "LA COMPETENCIA", "LA DOÑA", "LA EMPRESA", "LA ENCANTADA", "LA ESCONDIDA", "LA ESPERANZA", "LA ESTRELLA", 
    "LA FE", "LA FLOR", "LA FORTUNA", "LA FOSA", "LA GAVIA", "LA HERMIDA", "LA HERRADURA", "LA ISLA", "LA JARITA", 
    "LA LAGUNITA", "LA LUZ", "LA MAGDALENA", "LA NORIA DE JABONCILLO", "LA NORIA DEL GAVILAN", "LA PAZ", 
    "LA PEQUEÑA SANTANA", "LA PLATA", "LA PLATILLA", "LA POPULAR", "LA PROVIDENCIA", "LA REVANCHA", "LA ROSITA", 
    "LA RUMOROSA", "LA SOLEDAD", "LA TEHUA", "LA VEGA", "LA VEGA DEL PARAISO", "LAGUSOL", "LAS 3 MARIAS", 
    "LAS CARMELAS", "LAS CARMELITAS", "LAS COYOTERAS", "LAS CRIBAS", "LAS CUATITAS", "LAS FLORES", "LAS LECHUZAS", 
    "LAS MACITAS", "LAS MARGARITAS", "LAS MERCEDES F2", "LAS PALMAS", "LAS PLAYAS", "LAS TRES B", "LAS VIRGINIAS", 
    "LAZARO CARDENAS", "LETICIA", "LOPEZ ZAPATA", "LOS 3 HERMANOS", "LOS ANDRADE", "LOS ANFIBIOS", "LOS ANGELES", 
    "LOS CONTRERAS", "LOS DELGADO", "LOS DOS COMPADRES", "LOS DULCES NOMBRES", "LOS EUCALIPTOS", "LOS MARTINEZ", 
    "LOS MIRASOLES", "LOS NOGALES", "LOS OLIVOS", "LOS ORGANOS", "LOS PAPIRINGOS", "LOS POTRILLOS", "LOS REYES", 
    "LOS TREINTA", "LOS TRES CAMACHO", "LUPITA", "MANILA", "MAPIMI", "MAQUILAS Y MINERALES ALFERY", "MARIA ANTONIETA", 
    "MARIA TERESA", "MARMARTHA", "MARTINEZ LEYVA", "MI TUMBA", "MIGUEL MONTAÑEZ MEZA", "MIGUEL SAMANIEGO", 
    "MOISES LOPEZ", "MOLINO LOS ANTUNEZ", "NATO HERNANDEZ", "NAZAS", "NEXTLALPAN", "NICOLAS ROQUE", "NINGUNO", 
    "NOE", "NOEL GAUSIN", "NOELIE (GRANJA)", "NORIA 1919", "NORIA 1926", "NORIA 1981", "NORIA 273", 
    "NORIA DE JIMENEZ DOS", "NORIA DE LA TEHUA", "NORIA DE LA VIRGINIA", "NORIA DEL CONSUELO", "NORIA EL RECUERDO", 
    "NORIA GREGORIO GARCIA", "NORIA LA CUATRO", "NORIA LA TRES", "NORIA LA UNA", "NORIA PARAISO", "NORIA SAN GONZALO", 
    "NORIA SAN MARTIN", "NORIA SECTOR DOS", "NORIA SECTOR VEINTITRES", "NORIA VENECIA CINCO", "NUEVO AMANECER", 
    "NUEVO BARRO", "NUEVO GOMEZ", "NUEVO JERICO", "NUMANCIA", "PABLO LARRIÑAGA", "PADILLA SALAS", "PALO BLANCO", 
    "PALO HUECO", "PARAISO SECTOR 3", "PASTOR ROUAIX", "PATZCUARO", "PENJAMO", "PEQUEÑA BERLIN", "PIMENTEL", 
    "POANAS", "PORVENIR", "POZO NUMERO DOS", "POZO PANCHO VILLA", "PREVEDEL", "PRODUCTOS AGROPECUARIOS 2 Y 2", 
    "PROVIDENCIA", "PUEBLO NUEVO (EL SIETE)", "PUENTE DE LA TORREÑA", "PURISIMA", "QUINTA ALINA", "QUINTA ARMONIA", 
    "QUINTA BAM BAM", "QUINTA EL CAPRICHO", "QUINTA EL RETIRO", "QUINTA ESPERANZA", "QUINTA LAS ILUSIONES", 
    "QUINTA LILIAN", "QUINTA ROSY", "QUINTA SANTA MONICA", "RAMIRO CANALES", "RAMIRO ROJAS", "RAMONA HERMOSILLO", 
    "RANCHO GORDO", "RANCHO GUADALUPE", "RANCHO LA HECTAREA", "RANCHO NUEVO", "RANCHO ROSALBA", "REAL DE SAN SEBASTIAN", 
    "REFORMA", "REMIGIO CUEVAS GALINDO", "RESUMIDEROS", "REYES CASTRO", "REYES SANCHEZ", "RIGOBERTO BECERRA", 
    "RINCON DE SANTA CRUZ", "RINCONADA", "RIOS (GRANJA)", "RIVERA LLANES", "ROBERTO GARCIA", "ROBERTO RIOS", 
    "RUTILIO GARCIA", "SAN AGUSTIN", "SAN ALBERTO", "SAN ANTONIO", "SAN AURELIO", "SAN CARLOS", "SAN FELIPE", 
    "SAN FERNANDO", "SAN FRANCISCO", "SAN GABRIEL", "SAN GERARDO", "SAN ISIDRO", "SAN JOSE", "SAN JOSE DE VIÑEDO", 
    "SAN JUAN", "SAN LORENZO", "SAN LUIS", "SAN LUISITO", "SAN MANUEL", "SAN MARTIN", "SAN MIGUEL", "SAN PEDRO", 
    "SAN RAMIRO", "SAN RAMON", "SAN ROQUE", "SAN SEBASTIAN", "SAN SERGIO", "SAN VICENTE", "SANTA ANGELICA", 
    "SANTA CLARA", "SANTA CRUZ", "SANTA CRUZ LUJAN", "SANTA FE", "SANTA GERTRUDIS", "SANTA HERMINIA", "SANTA INES", 
    "SANTA JULIA", "SANTA LUCINA", "SANTA MARIA", "SANTA ROSA", "SANTA ROSITA", "SANTA SOFIA", "SANTA TERESA", 
    "SANTIAGO", "SIERRA HERMOSA", "TRECE DE MARZO", "TRES ESTRELLAS", "TRES MARIAS", "TRES ROBLES", "TRES VICTORIAS", 
    "VALDEZ", "VAZQUEZ", "VENECIA", "VENUSTIANO CARRANZA", "VIANEY", "VICENTE NAVA", "VICTOR CARRILLO HERNANDEZ", 
    "VILLA GREGORIO GARCIA", "VILLAS URBI DEL CEDRO", "VILMA ALE DE HERRERA", "VIÑASOL", "YOLANDA (GRANJA)"
);
const DB_NAME = "R02_DB"; const DB_VERSION = 1; const STORE_NAME = "derechohabientes"; let db;
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
    preloadDatabaseToMemory(); 
};

request.onerror = (e) => { console.error("Error IndexedDB:", e.target.error); };

function updateLocalCounter() {
    if (!db) return;
    const countRequest = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).count();
    countRequest.onsuccess = () => {
        const countElement = document.getElementById('local-db-count');
        if (countElement) countElement.innerText = countRequest.result;
    };
    const totalVisitasHoy = pendingSync.length + syncedHistory.length; 
    const pendientesPorSubir = pendingSync.length;
    if (document.getElementById('metric-total-visitas')) document.getElementById('metric-total-visitas').innerText = totalVisitasHoy;
    if (document.getElementById('metric-pendientes-visitas')) document.getElementById('metric-pendientes-visitas').innerText = pendientesPorSubir;
    if (document.getElementById('pending-count')) document.getElementById('pending-count').innerText = pendientesPorSubir;
}
function changeScreen(screenId) {
    if (screenId !== 'screen-history') previousScreen = screenId;
    if (screenId === 'screen-search') preloadDatabaseToMemory();
    if (screenId === 'screen-welcome') updateLocalCounter(); 
    
    if (screenId === 'screen-search' && currentUser) {
        const datosBrigadistaActivo = AUTHORIZED_CURPS[currentUser.curp];
        if (datosBrigadistaActivo) {
            if (document.getElementById('search-brigadista-name')) document.getElementById('search-brigadista-name').innerText = datosBrigadistaActivo.name;
            if (document.getElementById('search-brigadista-municipio')) document.getElementById('search-brigadista-municipio').innerText = datosBrigadistaActivo.municipio.toUpperCase().trim();
        }
    }
    
    document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
    const targetScreen = document.getElementById(screenId); 
    if (targetScreen) targetScreen.classList.remove('hidden');

    const bottomNav = document.getElementById('app-bottom-nav'); if (!bottomNav) return;
    if (screenId === 'screen-login' || screenId === 'screen-form') {
        bottomNav.style.setProperty('display', 'none', 'important'); bottomNav.classList.add('hidden');
    } else {
        bottomNav.style.setProperty('display', 'flex', 'important'); bottomNav.classList.remove('hidden');
        document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
        if (screenId === 'screen-welcome') document.getElementById('nav-welcome').classList.add('active');
        if (screenId === 'screen-search') document.getElementById('nav-search').classList.add('active');
        if (screenId === 'screen-history') document.getElementById('nav-history').classList.add('active');
    }
}

function login() {
    const curpInput = document.getElementById('login-curp').value.trim().toUpperCase();
    if (typeof AUTHORIZED_CURPS !== 'undefined' && AUTHORIZED_CURPS[curpInput]) {
        const brigadistaEncontrado = AUTHORIZED_CURPS[curpInput];
        currentUser = { curp: curpInput, name: brigadistaEncontrado.name };
        if (document.getElementById('welcome-message')) document.getElementById('welcome-message').innerText = `Bienvenido(a), ${currentUser.name}`;
        if (document.getElementById('welcome-message-search')) document.getElementById('welcome-message-search').innerText = `Bienvenido(a), ${currentUser.name}`;
        changeScreen('screen-search');
    } else { alert("CURP no autorizada o inválida."); }
}
async function downloadAllDataMassive() {
    const btn = document.getElementById('btn-massive-download');
    const progressContainer = document.getElementById('progress-container'); const progressBar = document.getElementById('progress-bar'); const progressText = document.getElementById('progress-text');
    if (!db) return alert("La base de datos local aún no está lista.");
    
    btn.disabled = true; progressContainer.style.display = "block";
    let offset = 0, limit = 10000, isDone = false, totalCargados = 0;
    db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear();
    
    try {
        while (!isDone) {
            progressText.innerText = `Descargando registros: ${totalCargados} acumulados...`;
            const url = `${GOOGLE_SCRIPT_URL}?action=getAllData&offset=${offset}&limit=${limit}&_=${new Date().getTime()}`;
            const response = await fetch(url); const data = await response.json();
            
            if (data && data.records && data.records.length > 0) {
                const tx = db.transaction(STORE_NAME, "readwrite"); const store = tx.objectStore(STORE_NAME);
                data.records.forEach(record => {
                    if (record && record.CURP) {
                        record.CURP = String(record.CURP).replace(/ /g, "").toUpperCase().trim(); store.put(record); totalCargados++;
                    }
                });
                await new Promise((resolve) => { tx.oncomplete = resolve; });
            }
            isDone = data.done === true || data.records.length === 0; offset = data.nextOffset || (offset + limit);
            progressBar.style.width = `${Math.min(100, Math.round((offset / 25000) * 100))}%`;
        }
        progressText.innerText = `¡Descarga completa! ${totalCargados} registros listos.`;
        preloadDatabaseToMemory(); updateLocalCounter(); alert(`Éxito: Se guardaron ${totalCargados} registros.`); changeScreen('screen-search');
    } catch (error) { alert(`Error: ${error.message}`); } finally { btn.disabled = false; }
}

let localMemoryDatabase = [];
function preloadDatabaseToMemory() {
    if (!db) return;
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll().onsuccess = (e) => { localMemoryDatabase = e.target.result || []; };
}

function searchData() {
    const query = document.getElementById('search-input').value.toLowerCase().trim(); const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ""; if (query.length < 3) return;

    const brigadistaActivo = AUTHORIZED_CURPS[currentUser.curp]; const municipioBrigadista = brigadistaActivo ? brigadistaActivo.municipio.toUpperCase().trim() : "";
    const searchTokens = query.split(/\s+/); let matchedRecords = [];

    for (let i = 0; i < localMemoryDatabase.length; i++) {
        const item = localMemoryDatabase[i]; if (!item) continue;
        const municipioDerechohabiente = item['MUNICIPIO'] ? String(item['MUNICIPIO']).toUpperCase().trim() : "";
        if (municipioDerechohabiente !== municipioBrigadista) continue; 

        const combinedText = `${item['NOMBRE'] || ''} ${item['AP PATERNO'] || ''} ${item['AP MATERNO'] || ''} ${item['CURP'] || ''} ${item['CALLE'] || ''} ${item['NUM EXT'] || ''} ${item['COLONIA'] || ''}`.toLowerCase();
        if (searchTokens.every(t => combinedText.includes(t))) matchedRecords.push(item);
    }

    matchedRecords.sort((a, b) => String(a['NUM EXT']).localeCompare(String(b['NUM EXT'])));
    matchedRecords.slice(0, 30).forEach(item => {
        const div = document.createElement('div'); const estatusActual = item['ESTATUS_VISITA'] || "";
        const estaEnColaPendiente = pendingSync.some(p => p['CURP'] === item['CURP']); const recordEnCola = pendingSync.find(p => p['CURP'] === item['CURP']);
        const estatusFinal = estaEnColaPendiente && recordEnCola ? recordEnCola['ESTATUS_VISITA'] : estatusActual;
        let claseColor = estatusFinal === "LOCALIZADO" ? "result-item status-localizado" : (estatusFinal === "NO LOCALIZADO" ? "result-item status-nolocalizado" : "result-item");
        let textoIndicador = estatusFinal === "LOCALIZADO" ? ' <span style="color:#137333; font-weight:bold; font-size:12px; margin-left:5px;">✓ Localizado</span>' : (estatusFinal === "NO LOCALIZADO" ? ' <span style="color:#C5221F; font-weight:bold; font-size:12px; margin-left:5px;">✗ No Localizado</span>' : "");

        div.className = claseColor;
        div.innerHTML = `<div style="font-size:16px; font-weight:700; color:var(--dark-color); margin-bottom:2px;">${item['NOMBRE'] || ''} ${item['AP PATERNO'] || ''} ${item['AP MATERNO'] || ''}${textoIndicador}</div><div style="font-size:13px; font-weight:600; color:var(--primary-color); margin-bottom:4px; letter-spacing:0.3px;">CURP: ${item['CURP'] || 'SIN CURP'}</div><div style="font-size:13px; color:#555555;">📍 Calle: ${item['CALLE'] || 'S/C'}, No. Ext: ${item['NUM EXT'] || 'S/N'}, Col. ${item['COLONIA'] || 'S/C'}</div>`;
        div.onclick = () => openForm(item); resultsContainer.appendChild(div);
    });
}
function buscarLocalidadesEnPantalla() {
    const query = document.getElementById('f-localidad-buscar').value.toLowerCase().trim(); const resultsContainer = document.getElementById('localidad-search-results');
    resultsContainer.innerHTML = ""; if (query.length < 2) { resultsContainer.style.display = "none"; return; }
    
    let coincidencias = CATALOGO_LOCALIDADES.filter(loc => loc.toLowerCase().includes(query));
    if (coincidencias.length > 0) {
        resultsContainer.style.display = "block";
        coincidencias.forEach(loc => {
            const div = document.createElement('div'); div.style.padding = "12px 14px"; div.style.borderBottom = "1px solid #F3F4F6"; div.style.cursor = "pointer"; div.style.fontSize = "15px"; div.style.fontWeight = "700"; div.style.color = "#1F2937"; div.innerText = "📍 " + loc;
            div.onclick = function() {
                document.getElementById('f-localidad').value = loc; document.getElementById('f-localidad-buscar').value = ""; resultsContainer.innerHTML = ""; resultsContainer.style.display = "none";
            };
            resultsContainer.appendChild(div);
        });
    } else { resultsContainer.style.display = "block"; resultsContainer.innerHTML = '<div style="padding:12px; color:#b91c1c; font-size:14px; font-weight:bold; text-align:center;">❌ Sin coincidencia</div>'; }
}

function buscarMunicipiosEnPantalla() {
    const query = document.getElementById('f-municipio-buscar').value.toLowerCase().trim(); const resultsContainer = document.getElementById('municipio-search-results');
    resultsContainer.innerHTML = ""; if (query.length < 1) { resultsContainer.style.display = "none"; return; }
    
    let coincidencias = CATALOGO_MUNICIPIOS.filter(m => m.toLowerCase().includes(query));
    if (coincidencias.length > 0) {
        resultsContainer.style.display = "block";
        coincidencias.forEach(m => {
            const div = document.createElement('div'); div.style.padding = "12px 14px"; div.style.borderBottom = "1px solid #F3F4F6"; div.style.cursor = "pointer"; div.style.fontSize = "15px"; div.style.fontWeight = "700"; div.style.color = "#1F2937"; div.innerText = "🏢 " + m;
            div.onclick = function() {
                document.getElementById('f-municipio').value = m; document.getElementById('f-municipio-buscar').value = ""; resultsContainer.innerHTML = ""; resultsContainer.style.display = "none";
            };
            resultsContainer.appendChild(div);
        });
    } else { resultsContainer.style.display = "block"; resultsContainer.innerHTML = '<div style="padding:12px; color:#b91c1c; font-size:14px; font-weight:bold; text-align:center;">❌ Sin de coincidencia</div>'; }
}

function buscarColoniasEnPantalla() {
    const query = document.getElementById('f-colonia-buscar').value.toLowerCase().trim(); const resultsContainer = document.getElementById('colonia-search-results');
    resultsContainer.innerHTML = ""; if (query.length < 2) { resultsContainer.style.display = "none"; return; }
    
    let coincidencias = CATALOGO_COLONIAS.filter(c => c.toLowerCase().includes(query));
    if (coincidencias.length > 0) {
        resultsContainer.style.display = "block";
        coincidencias.forEach(c => {
            const div = document.createElement('div'); div.style.padding = "12px 14px"; div.style.borderBottom = "1px solid #F3F4F6"; div.style.cursor = "pointer"; div.style.fontSize = "15px"; div.style.fontWeight = "700"; div.style.color = "#1F2937"; div.innerText = "🏡 " + c;
            div.onclick = function() {
                document.getElementById('f-colonia').value = c; document.getElementById('f-colonia-buscar').value = ""; resultsContainer.innerHTML = ""; resultsContainer.style.display = "none";
            };
            resultsContainer.appendChild(div);
        });
    } else { resultsContainer.style.display = "block"; resultsContainer.innerHTML = '<div style="padding:12px; color:#b91c1c; font-size:14px; font-weight:bold; text-align:center;">❌ Sin de coincidencia</div>'; }
}
function seleccionarEstatusVisita(estatus) {
    currentEstatusVisita = estatus.toUpperCase();
    if (currentEstatusVisita === "NO LOCALIZADO") {
        let mot = prompt("Escriba el motivo por el cual NO FUE LOCALIZADO:");
        if (!mot || mot.trim() === "") { alert("🛑 Operación cancelada."); currentEstatusVisita = "LOCALIZADO"; motivoNoLocalizadoValue = ""; actualizarEstilosBotonesFormulario(); return; }
        motivoNoLocalizadoValue = mot.trim();
    } else { motivoNoLocalizadoValue = ""; }
    actualizarEstilosBotonesFormulario();
}

function actualizarEstilosBotonesFormulario() {
    const btnLoc = document.getElementById('btn-status-localizado'); const btnNoLoc = document.getElementById('btn-status-nolocalizado');
    if (!btnLoc || !btnNoLoc) return;
    if (currentEstatusVisita === "LOCALIZADO") {
        btnLoc.style.backgroundColor = "#E6F4EA"; btnLoc.style.borderColor = "#137333"; btnLoc.style.color = "#137333";
        btnNoLoc.style.backgroundColor = "#F3F4F6"; btnNoLoc.style.borderColor = "#CBD5E0"; btnNoLoc.style.color = "#9CA3AF";
    } else if (currentEstatusVisita === "NO LOCALIZADO") {
        btnNoLoc.style.backgroundColor = "#FCE8E6"; btnNoLoc.style.borderColor = "#C5221F"; btnNoLoc.style.color = "#C5221F";
        btnLoc.style.backgroundColor = "#F3F4F6"; btnLoc.style.borderColor = "#CBD5E0"; btnLoc.style.color = "#9CA3AF";
    }
}

function openForm(item) {
    if (!item) return;
    document.getElementById('f-curp').value = item['CURP'] || ''; document.getElementById('f-id').value = item['ID'] || ''; document.getElementById('f-nombre').value = item['NOMBRE'] || ''; document.getElementById('f-paterno').value = item['AP PATERNO'] || ''; document.getElementById('f-materno').value = item['AP MATERNO'] || ''; document.getElementById('f-telfijo').value = item['TEL FIJO'] || ''; document.getElementById('f-telcel').value = item['TEL CEL'] || ''; document.getElementById('f-seccion').value = item['SECCION'] || ''; document.getElementById('f-cp').value = item['CP'] || ''; document.getElementById('f-calle').value = item['CALLE'] || ''; document.getElementById('f-numext').value = item['NUM EXT'] || ''; document.getElementById('f-referencia').value = item['REFERENCIA'] || ''; document.getElementById('f-situacion').value = item['SITUACION'] || ''; document.getElementById('f-causal').value = item['CAUSAL'] || '';

    currentEstatusVisita = item['ESTATUS_VISITA'] || "LOCALIZADO"; motivoNoLocalizadoValue = item['MOTIVO_NO_LOCALIZADO'] || ""; actualizarEstilosBotonesFormulario();
    window.currentTratoValue = item['EVALUACION_TRATO'] || ""; actualizarEstilosBotonesTrato();

    document.getElementById('f-lat').value = "Buscando satélite..."; document.getElementById('f-lon').value = "Buscando satélite...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            document.getElementById('f-lat').value = String(position.coords.latitude.toFixed(6)).replace(",", "."); document.getElementById('f-lon').value = String(position.coords.longitude.toFixed(6)).replace(",", ".");
        }, () => { document.getElementById('f-lat').value = "ERROR"; document.getElementById('f-lon').value = "ERROR"; });
    }
    changeScreen('screen-form');
    if (document.getElementById('f-localidad-buscar')) document.getElementById('f-localidad-buscar').value = "";
    if (document.getElementById('localidad-search-results')) document.getElementById('localidad-search-results').style.display = "none";
    if (document.getElementById('f-municipio-buscar')) document.getElementById('f-municipio-buscar').value = "";
    if (document.getElementById('municipio-search-results')) document.getElementById('municipio-search-results').style.display = "none";
    if (document.getElementById('f-colonia-buscar')) document.getElementById('f-colonia-buscar').value = "";
    if (document.getElementById('colonia-search-results')) document.getElementById('colonia-search-results').style.display = "none";
    
    document.getElementById('f-localidad').value = item['LOCALIDAD'] ? String(item['LOCALIDAD']).toUpperCase().trim() : "";
    document.getElementById('f-municipio').value = item['MUNICIPIO'] ? String(item['MUNICIPIO']).toUpperCase().trim() : "";
    document.getElementById('f-colonia').value = item['COLONIA'] ? String(item['COLONIA']).toUpperCase().trim() : "";
}

function saveData(event) {
    event.preventDefault();
    const latValue = document.getElementById('f-lat').value; const lonValue = document.getElementById('f-lon').value;
    if (latValue.includes("Buscando") || latValue === "" || latValue === "ERROR") return alert("No se puede guardar sin georreferencia.");
    const targetCurp = document.getElementById('f-curp').value.replace(/[\s\u200B-\u200D\uFEFF]/g, "").toUpperCase().trim();
    if (!targetCurp || targetCurp.length !== 18) return alert("🛑 ERROR EN CAMPO: La CURP debe tener 18 caracteres.");

    const idValue = document.getElementById('f-id').value; const evaluacionTratoActual = window.currentTratoValue || "";
    if (currentEstatusVisita === "LOCALIZADO" || idValue === "NUEVO") {
        if (evaluacionTratoActual === "" || evaluacionTratoActual === "SIN_EVALUACION") {
            alert("🛑 REGLA OBLIGATORIA: Debe seleccionar una de las 5 opciones de trato con emojis antes de guardar.");
            const btnEx = document.getElementById('btn-trato-excelente'); if (btnEx) btnEx.scrollIntoView({ behavior: 'smooth' }); return;
        }
    }

    const memoryIndex = localMemoryDatabase.findIndex(r => r.CURP === targetCurp); const originalRecord = memoryIndex !== -1 ? localMemoryDatabase[memoryIndex] : {};
    const record = {
        'CURP': targetCurp, 'ID': idValue, 'NOMBRE': document.getElementById('f-nombre').value, 'AP PATERNO': document.getElementById('f-paterno').value, 'AP MATERNO': document.getElementById('f-materno').value, 'TEL FIJO': document.getElementById('f-telfijo').value, 'TEL CEL': document.getElementById('f-telcel').value, 'MUNICIPIO': document.getElementById('f-municipio').value, 'LOCALIDAD': document.getElementById('f-localidad').value, 'SECCION': document.getElementById('f-seccion').value, 'COLONIA': document.getElementById('f-colonia').value, 'CP': document.getElementById('f-cp').value, 'CALLE': document.getElementById('f-calle').value, 'NUM EXT': document.getElementById('f-numext').value, 'REFERENCIA': document.getElementById('f-referencia').value, 'SITUACION': document.getElementById('f-situacion').value, 'CAUSAL': document.getElementById('f-causal').value, 'ESTATUS_VISITA': currentEstatusVisita, 'MOTIVO_NO_LOCALIZADO': motivoNoLocalizadoValue, 'EVALUACION_TRATO': currentEstatusVisita === "NO LOCALIZADO" ? "" : evaluacionTratoActual, 'Latitud': latValue, 'Longitud': lonValue, 'FECHA_MODIFICACION': new Date().toLocaleString("es-MX"), 'USUARIO_MODIFICA': currentUser.name, 'SHEETS_ROW_INDEX': originalRecord.SHEETS_ROW_INDEX || ""
    };

    const tx = db.transaction(STORE_NAME, "readwrite"); tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = function() {
        if (memoryIndex !== -1) localMemoryDatabase[memoryIndex] = record; else localMemoryDatabase.push(record);
        pendingSync.push(record); localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
        alert("✅ ÉXITO: Guardado localmente."); document.getElementById('search-input').value = ""; document.getElementById('search-results').innerHTML = ""; changeScreen('screen-search');
    };
}
function openHistoryScreen() {
    changeScreen('screen-history'); document.getElementById('pending-count').innerText = pendingSync.length;
    const logList = document.getElementById('history-log'); logList.innerHTML = ""; 
    pendingSync.forEach((item) => {
        const div = document.createElement('div'); div.className = "result-item"; div.innerHTML = `<strong>⏳ ${item['NOMBRE'] || 'Derechohabiente'} (${item['CURP']})</strong><br><small>Pendiente</small>`; logList.appendChild(div);
    });
}

async function syncWithSheets() {
    if (pendingSync.length === 0) return alert("No tienes registros pendientes.");
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: "sync", records: pendingSync }) });
        const result = await response.json();
        if (result.status === "success") { syncedHistory = syncedHistory.concat(pendingSync); localStorage.setItem('syncedHistory', JSON.stringify(syncedHistory)); pendingSync = []; localStorage.removeItem('pendingSync'); openHistoryScreen(); alert("¡Sincronizado!"); }
    } catch (e) { alert("Error de red temporal."); }
}

function downloadBackupCSV() {
    const allVisitsOfDay = pendingSync.concat(syncedHistory); if (allVisitsOfDay.length === 0) return alert("No hay datos.");
    const headers = ["CURP", "ID", "NOMBRE", "AP PATERNO", "AP MATERNO", "TEL FIJO", "TEL CEL", "MUNICIPIO", "LOCALIDAD", "SECCION", "COLONIA", "CP", "CALLE", "NUM EXT", "REFERENCIA", "SITUACION", "CAUSAL", "ESTATUS_VISITA", "MOTIVO_NO_LOCALIZADO", "Latitud", "Longitud", "FECHA_MODIFICACION", "USUARIO_MODIFICA"];
    let csvRows = [headers.join(",")];
    allVisitsOfDay.forEach(r => { csvRows.push(headers.map(h => { let v = r[h] !== undefined ? String(r[h]).trim() : ""; return v.includes(",") ? `"${v.replace(/"/g, '""')}"` : v; }).join(",")); });
    const downloadAnchor = document.createElement('a'); downloadAnchor.setAttribute("href", URL.createObjectURL(new Blob(["\\ufeff" + csvRows.join("\\n")], { type: 'text/csv;charset=utf-8;' }))); downloadAnchor.setAttribute("download", `R02_Reporte_${new Date().toISOString().slice(0, 10)}.csv`); document.body.appendChild(downloadAnchor); downloadAnchor.click(); document.body.removeChild(downloadAnchor);
}

function clearLocalStorage() {
    if (confirm("🚨 ADVERTENCIA: ¿Vaciamos la memoria?")) {
        pendingSync = []; syncedHistory = []; localMemoryDatabase = []; localStorage.clear();
        if (db) { db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear().onsuccess = () => { document.getElementById('search-input').value = ""; document.getElementById('search-results').innerHTML = ""; alert("Limpiado."); changeScreen('screen-welcome'); }; } else { changeScreen('screen-welcome'); }
    }
}

function seleccionarTrato(opcion) { window.currentTratoValue = opcion.toUpperCase(); actualizarEstilosBotonesTrato(); }
function actualizarEstilosBotonesTrato() {
    const btnEx = document.getElementById('btn-trato-excelente'); const btnAm = document.getElementById('btn-trato-amable'); const btnNe = document.getElementById('btn-trato-neutral'); const btnIn = document.getElementById('btn-trato-incomodo'); const btnHo = document.getElementById('btn-trato-hostil');
    if (!btnEx || !btnAm || !btnNe || !btnIn || !btnHo) return;
    [btnEx, btnAm, btnNe, btnIn, btnHo].forEach(btn => { btn.style.backgroundColor = "#F3F4F6"; btn.style.borderColor = "#CBD5E0"; btn.style.color = "#4B5563"; });
    if (window.currentTratoValue === "EXCELENTE") { btnEx.style.backgroundColor = "#D1E7DD"; btnEx.style.borderColor = "#0F5132"; btnEx.style.color = "#0F5132"; }
    else if (window.currentTratoValue === "AMABLE") { btnAm.style.backgroundColor = "#E6F4EA"; btnAm.style.borderColor = "#236947"; btnAm.style.color = "#236947"; }
    else if (window.currentTratoValue === "NEUTRAL") { btnNe.style.backgroundColor = "#EDF4F9"; btnNe.style.borderColor = "#BC955C"; btnNe.style.color = "#1F2937"; }
    else if (window.currentTratoValue === "INCOMODO") { btnIn.style.backgroundColor = "#FFF3CD"; btnIn.style.borderColor = "#664D03"; btnIn.style.color = "#664D03"; }
    else if (window.currentTratoValue === "HOSTIL") { btnHo.style.backgroundColor = "#FCE8E6"; btnHo.style.borderColor = "#b91c1c"; btnHo.style.color = "#b91c1c"; }
}

function abrirFormularioVacioAltaNueva() {
    document.getElementById('f-curp').removeAttribute('readonly'); document.getElementById('f-nombre').removeAttribute('readonly'); document.getElementById('f-paterno').removeAttribute('readonly'); document.getElementById('f-materno').removeAttribute('readonly');
    const inputs = ['f-curp', 'f-nombre', 'f-paterno', 'f-materno', 'f-telfijo', 'f-telcel', 'f-localidad', 'f-seccion', 'f-colonia', 'f-cp', 'f-calle', 'f-numext', 'f-referencia', 'f-causal'];
    inputs.forEach(id => { if(document.getElementById(id)) document.getElementById(id).value = ''; });
    const brigadistaActivo = AUTHORIZED_CURPS[currentUser.curp]; document.getElementById('f-municipio').value = brigadistaActivo ? brigadistaActivo.municipio : 'GOMEZ PALACIO'; 
    document.getElementById('f-id').value = 'NUEVO'; document.getElementById('f-situacion').value = 'SIN_REGISTRO';
    currentEstatusVisita = "LOCALIZADO"; motivoNoLocalizadoValue = ""; window.currentTratoValue = ""; actualizarEstilosBotonesFormulario(); actualizarEstilosBotonesTrato();
    document.getElementById('f-lat').value = "Buscando satélite..."; document.getElementById('f-lon').value = "Buscando satélite...";
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => { document.getElementById('f-lat').value = String(position.coords.latitude.toFixed(6)).replace(",", "."); document.getElementById('f-lon').value = String(position.coords.longitude.toFixed(6)).replace(",", ".");
        }, () => { document.getElementById('f-lat').value = "ERROR"; document.getElementById('f-lon').value = "ERROR"; });
    }
    const curpInputEl = document.getElementById('f-curp'); curpInputEl.removeEventListener('input', verificarCurpDuplicadaEnTiempoReal); curpInputEl.addEventListener('input', verificarCurpDuplicadaEnTiempoReal);
    
    changeScreen('screen-form');
    if (document.getElementById('f-localidad-buscar')) document.getElementById('f-localidad-buscar').value = "";
    if (document.getElementById('localidad-search-results')) document.getElementById('localidad-search-results').style.display = "none";
    if (document.getElementById('f-municipio-buscar')) document.getElementById('f-municipio-buscar').value = "";
    if (document.getElementById('municipio-search-results')) document.getElementById('municipio-search-results').style.display = "none";
    if (document.getElementById('f-colonia-buscar')) document.getElementById('f-colonia-buscar').value = "";
    if (document.getElementById('colonia-search-results')) document.getElementById('colonia-search-results').style.display = "none";
    
    document.getElementById('f-localidad').value = ""; document.getElementById('f-colonia').value = "";
    document.getElementById('f-municipio').value = brigadistaActivo ? brigadistaActivo.municipio.toUpperCase().trim() : 'GOMEZ PALACIO'; 
}

function verificarCurpDuplicadaEnTiempoReal(e) {
    const valorLimpio = e.target.value.replace(/[\s\u200B-\u200D\uFEFF]/g, "").toUpperCase(); e.target.value = valorLimpio; 
    if (valorLimpio.length === 18) {
        const registroExistente = localMemoryDatabase.find(r => r.CURP === valorLimpio);
        if (registroExistente) {
            if (confirm(`📢 DETECTOR DE DUPLICADOS: La CURP [${valorLimpio}] ya existe (Municipio: ${registroExistente.MUNICIPIO || 'SIN MUNICIPIO'}).\n\n¿Desea cargar sus datos antiguos?`)) { alert("Cargando información..."); openForm(registroExistente); }
            else { e.target.value = ''; e.target.focus(); alert("Ingrese una CURP no registrada."); }
        }
    }
}

if ('serviceWorker' in navigator) { window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(err => console.error(err)); }); }

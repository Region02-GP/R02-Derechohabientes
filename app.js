// URL del Web App de Google Apps Script 
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzNgsF4oeoHz5r4V9pZH1UX8ib2hgiI-M4UFVPAah6SN-wCztnZBogcAhfGrhylJozN/exec";


if (typeof window.AUTHORIZED_CURPS === 'undefined') { window.AUTHORIZED_CURPS = {}; }

let pendingSync = JSON.parse(localStorage.getItem('pendingSync')) || [];
let syncedHistory = JSON.parse(localStorage.getItem('syncedHistory')) || [];
let currentUser = null;
let previousScreen = 'screen-welcome';
let currentEstatusVisita = "LOCALIZADO"; 
let motivoNoLocalizadoValue = "";        
window.currentTratoValue = ""; 

let expedienteDigitalTemporal = { doc_ine_frontal: "", doc_ine_trasera: "", doc_acta: "", doc_comprobante: "", doc_curp: "" };
const CATALOGO_MUNICIPIOS = [
    "GOMEZ PALACIO", "EL ORO", "MAPIMI", "INDE", "SAN BERNARDO", "HIDALGO", "TLAHUALILO", "GUANACEVI", "SAN PEDRO DEL GALLO", "OCAMPO"
];

const CATALOGO_COLONIAS = [
    "18 DE MARZO",
    "AMPLIACION AMPLIACION MIGUEL DE LA MADRID HURTADO",
    "AMPLIACION BELLA VISTA",
    "AMPLIACION BRITTINGHAM",
    "AMPLIACION CASA BLANCA",
    "AMPLIACION CINCO DE MAYO",
    "AMPLIACION FELIPE ANGELES",
    "AMPLIACION LA CENTRAL",
    "AMPLIACION LA FERIA",
    "AMPLIACION LA POPULAR",
    "AMPLIACION LAZARO CARDENAS",
    "AMPLIACION PARQUE INDUSTRIAL II",
    "AMPLIACION RICARDO FLORES MAGON",
    "AMPLIACION SACRAMENTO",
    "AMPLIACION SAN FELIPE",
    "AMPLIACION SANTA ROSA",
    "AMÉRICA UNO",
    "AQUILES SERDÁN",
    "ARCINAS",
    "ARTURO MARTÍNEZ ADAME",
    "BELLA UNIÓN",
    "BERLÍN",
    "BRITTINGHAM",
    "BUCARELI",
    "BUENDÍA",
    "CALIFORNIA",
    "CHIHUAHUITA (CHIHUAHUITA NUEVO)",
    "CHIHUAHUITA (CHIHUAHUITA VIEJO)",
    "COLONIA 14 DE NOVIEMBRE",
    "COLONIA 15 DE DICIEMBRE",
    "COLONIA 15 DE MAYO",
    "COLONIA 7 DE NOVIEMBRE",
    "COLONIA ABRAHAM ROSALES",
    "COLONIA AGRÍCOLA LA POPULAR",
    "COLONIA ARMANDO DEL CASTILLO FRANCO",
    "COLONIA BELLA VISTA",
    "COLONIA BICENTENARIO",
    "COLONIA BRITTINGHAM",
    "COLONIA CAMPESTRE",
    "COLONIA CARLOS HERRERA",
    "COLONIA CARRILLO PUERTO",
    "COLONIA CASA BLANCA",
    "COLONIA CERRO DE LA CRUZ",
    "COLONIA CERRO DE LA PILA",
    "COLONIA CINCO DE MAYO",
    "COLONIA DIVISION DEL NORTE",
    "COLONIA DOROTEO ARANGO",
    "COLONIA EL 28 DE NOVIEMBRE",
    "COLONIA EL AMIGO",
    "COLONIA EL CONSUELO",
    "COLONIA EL FOCE",
    "COLONIA EL MEZQUITAL",
    "COLONIA EL MEZQUITAL II",
    "COLONIA EL PARAISO",
    "COLONIA EL REFUGIO",
    "COLONIA EMILIANO ZAPATA",
    "COLONIA ERNESTO HERRERA ZAVALA",
    "COLONIA FCO ZARCO",
    "COLONIA FELIPE ANGELES",
    "COLONIA FIDEL VELAZQUEZ (CHAPALA)",
    "COLONIA FILADELFIA",
    "COLONIA FRANCISCO PEREZ RIOS",
    "COLONIA FRANCISCO VILLA",
    "COLONIA GENARO GARCIA",
    "COLONIA GONZALEZ DE LA VEGA",
    "COLONIA GUADALUPE VICTORIA",
    "COLONIA GUAYULERAS",
    "COLONIA HECTOR MAYAGOITIA DOMINGUEZ",
    "COLONIA HIJOS DE CAMPESINOS",
    "COLONIA HORTENCIA",
    "COLONIA INDEPENDENCIA",
    "COLONIA JACINTO CANEK",
    "COLONIA JERUSALEM",
    "COLONIA JOSE CAMPILLO SAINZ",
    "COLONIA JOSE REBOLLO ACOSTA",
    "COLONIA JOSE RODRIGUEZ RIOS",
    "COLONIA LA CENTRAL",
    "COLONIA LA DEPORTIVA",
    "COLONIA LA HERRADURA",
    "COLONIA LAS FLORES",
    "COLONIA LAS LUISAS",
    "COLONIA LAS ROSAS",
    "COLONIA LAZARO CARDENAS",
    "COLONIA LETICIA HERRERA",
    "COLONIA LOPEZ PORTILLO",
    "COLONIA LOS ALAMOS",
    "COLONIA LOS VIÑEDOS",
    "COLONIA LUIS D COLOSIO MURRIETA",
    "COLONIA MARIA INES MATA DE RENDON",
    "COLONIA MIGUEL DE LA MADRID HURTADO",
    "COLONIA MIGUEL HIDALGO",
    "COLONIA NICOLAS FERNANDEZ",
    "COLONIA NIÑOS HEROES",
    "COLONIA NOGALES",
    "COLONIA NUCLEO UNIVERSITARIO",
    "COLONIA NUEVA LOS ALAMOS",
    "COLONIA NUEVO GOMEZ",
    "COLONIA NUEVO REFUGIO",
    "COLONIA OCTAVIANO REDONDO ARCE",
    "COLONIA OTILIO MONTAÑO",
    "COLONIA PANFILO NATERA",
    "COLONIA PANFILO NATERA SECTOR 3",
    "COLONIA PARQUE HUNDIDO",
    "COLONIA PRIMAVERA",
    "COLONIA RESIDENCIAL EL CAMPANARIO (CDA ARANJUEZ)",
    "COLONIA RESIDENCIAL EL CAMPANARIO (CDA BARCELONA)",
    "COLONIA RESIDENCIAL EL CAMPANARIO (CERRADA BILBAO)",
    "COLONIA RESIDENCIAL EL CAMPANARIO CERRADA TOLEDO",
    "COLONIA REVOLUCION",
    "COLONIA RICARDO FLORES MAGON",
    "COLONIA RINCON CAMPESTRE",
    "COLONIA ROCIO REBOLLO",
    "COLONIA RODOLFO FIERRO",
    "COLONIA ROSALES",
    "COLONIA RUBEN JARAMILLO",
    "COLONIA SACRAMENTO",
    "COLONIA SAN ANGEL",
    "COLONIA SAN IGNACIO",
    "COLONIA SAN ISIDRO",
    "COLONIA SANTA ROSA",
    "COLONIA SANTA ROSA INFONAVIT",
    "COLONIA SANTA ROSALIA",
    "COLONIA SEIS DE JULIO (NUEVO NOÉ)",
    "COLONIA SIN NOMBRE",
    "COLONIA SOLIDARIDAD",
    "COLONIA TIERRA BLANCA",
    "COLONIA TIERRA Y LIBERTAD",
    "COLONIA VALLE AZUL",
    "COLONIA VALLE CAMPESTRE",
    "COLONIA VALLE DEL GUADIANA",
    "COLONIA VEITIUNO DE MARZO",
    "COLONIA VILLA DEL MAR",
    "COLONIA VILMA ALE DE HERRERA",
    "COLONIA ZONA CENTRO",
    "CUATRO DE DICIEMBRE (SAGUNDO)",
    "DINAMITA",
    "DOLORES",
    "EL BARRO",
    "EL BARRO 33 (EL TREINTA Y TRES)",
    "EL CARIÑO",
    "EL CASTILLO",
    "EL COMPÁS",
    "EL CONSUELO",
    "EL JUNCO",
    "EL PARAÍSO",
    "EL QUEMADO",
    "EL RECUERDO",
    "EL RETOÑO",
    "EL TRIUNFO",
    "EL VALLE DE EUREKA",
    "EL VEINTINUEVE DE AGOSTO",
    "EL VERGEL",
    "EL VERGELITO",
    "EL VOLADO",
    "ESMERALDA",
    "ESTACIÓN NOÉ",
    "ESTACIÓN VIÑEDO",
    "EUREKA DE MEDIA LUNA (EUREKA)",
    "FAMILIA RODRÍGUEZ CORDERO",
    "FRACCIONAMIENTO 11 DE SEPTIEMBRE",
    "FRACCIONAMIENTO AGAVIAS",
    "FRACCIONAMIENTO ALTOZANO",
    "FRACCIONAMIENTO LAS FLORES",
    "FRACCIONAMIENTO SAN ANTONIO",
    "FRACCIONAMIENTO BOSQUE REAL",
    "FRACCIONAMIENTO BUGAMBILIAS",
    "FRACCIONAMIENTO CASA BLANCA",
    "FRACCIONAMIENTO CDA DEL JAZMIN (CDAS MIRAVALLE)",
    "FRACCIONAMIENTO CDA PREMIER (MIRAVALLE)",
    "FRACCIONAMIENTO CDA SAN LUIS (CDAS MIRAVALLE)",
    "FRACCIONAMIENTO CDA STA LORENA (CDAS MIRAVALLE)",
    "FRACCIONAMIENTO CDA STA MARTHA (CDAS MIRAVALLE)",
    "FRACCIONAMIENTO CERRADA ANDALUCIA",
    "FRACCIONAMIENTO CERRADA DEL ROCIO C 16",
    "FRACCIONAMIENTO CERRADA ORALIA",
    "FRACCIONAMIENTO CERRADA SAN CARLOS (CDAS MIRAVALLE)",
    "FRACCIONAMIENTO CERRADA SAN MARCOS",
    "FRACCIONAMIENTO CERRADA SAN PATRICIO",
    "FRACCIONAMIENTO CERRADA SANTA DOLORES",
    "FRACCIONAMIENTO CERRADA SANTA ISABEL",
    "FRACCIONAMIENTO CERRADA SANTA LAURA",
    "FRACCIONAMIENTO CERRADA SANTA MARIA",
    "FRACCIONAMIENTO CERRADA SANTA TERESA (CDAS MIRAVALLE)",
    "FRACCIONAMIENTO CERRADA STA ANA (CDASMIRAVALLE)",
    "FRACCIONAMIENTO CERRADA VILLAS MIRAVALLE",
    "FRACCIONAMIENTO CERRADAS MIRAVALLE",
    "FRACCIONAMIENTO CERRADAS SAN LORENZO",
    "FRACCIONAMIENTO CERRADAS SAN VICENTE",
    "FRACCIONAMIENTO CERRO LINDO",
    "FRACCIONAMIENTO DE LOS PINOS (LOS ARRAYANES)",
    "FRACCIONAMIENTO DEL ALAMO (LOS ARRAYANES)",
    "FRACCIONAMIENTO DEL ALMENDRO (LOS ARRAYANES)",
    "FRACCIONAMIENTO DEL BOSQUE",
    "FRACCIONAMIENTO DEL CEDRO (LOS ARRAYANES)",
    "FRACCIONAMIENTO DEL OLIVO (LOS ARRAYANES)",
    "FRACCIONAMIENTO DEL ROBLE (LOS ARRAYANES)",
    "FRACCIONAMIENTO EL CENTENARIO",
    "FRACCIONAMIENTO EL DORADO",
    "FRACCIONAMIENTO EL REFUGIO",
    "FRACCIONAMIENTO EUCALIPTOS",
    "FRACCIONAMIENTO FILADELFIA",
    "FRACCIONAMIENTO FOVISSSTE",
    "FRACCIONAMIENTO GEOVILLAS SAN IGNACIO",
    "FRACCIONAMIENTO HACIENDA EL REFUGIO",
    "FRACCIONAMIENTO HAMBURGO",
    "FRACCIONAMIENTO JARDIN",
    "FRACCIONAMIENTO LA ESPERANZA",
    "FRACCIONAMIENTO LA FERIA",
    "FRACCIONAMIENTO LA FLORESTA",
    "FRACCIONAMIENTO LAS CARMELITAS",
    "FRACCIONAMIENTO LAS GRANJAS",
    "FRACCIONAMIENTO LAS GRANJAS 2",
    "FRACCIONAMIENTO LAS MISIONES MIRAVALLE",
    "FRACCIONAMIENTO LOMA REAL",
    "FRACCIONAMIENTO LOS ALAMOS",
    "FRACCIONAMIENTO LOS CEDROS",
    "FRACCIONAMIENTO LOS OLIVOS",
    "FRACCIONAMIENTO MARBELLA",
    "FRACCIONAMIENTO MIRAVALLE",
    "FRACCIONAMIENTO MIRAVALLE ORIENTE",
    "FRACCIONAMIENTO MORELOS I",
    "FRACCIONAMIENTO MORELOS II",
    "FRACCIONAMIENTO NUEVO CASTILLO",
    "FRACCIONAMIENTO NUEVO CUBA",
    "FRACCIONAMIENTO PARQUE HUNDIDO",
    "FRACCIONAMIENTO PEDREGAL I",
    "FRACCIONAMIENTO PEDREGAL II",
    "FRACCIONAMIENTO PRIVADA COLONIA LA ESPERANZA",
    "FRACCIONAMIENTO PUERTA DEL SOL",
    "FRACCIONAMIENTO QUINTA NAPOLES",
    "FRACCIONAMIENTO QUINTAS LAS NOAS",
    "FRACCIONAMIENTO RAFAEL CASTELLANOS",
    "FRACCIONAMIENTO RESIDENCIAL EL CAMPANARIO",
    "FRACCIONAMIENTO RESIDENCIAL EL CAMPANARIO II",
    "FRACCIONAMIENTO RESIDENCIAL SAN ALBERTO",
    "FRACCIONAMIENTO RINCON FILADELFIA",
    "FRACCIONAMIENTO RINCON LAS GRANJAS",
    "FRACCIONAMIENTO RINCON SAN ALBERTO",
    "FRACCIONAMIENTO RINCON SAN ANTONIO",
    "FRACCIONAMIENTO RINCONADA BUGAMBILIAS",
    "FRACCIONAMIENTO RINCONADA DEL PARQUE",
    "FRACCIONAMIENTO RINCONADA NAPOLES",
    "FRACCIONAMIENTO RINCONADA ROSALES",
    "FRACCIONAMIENTO RINCONADAS HAMBURGO",
    "FRACCIONAMIENTO SALVADOR NAVA MARTINEZ",
    "FRACCIONAMIENTO SAN ANTONIO",
    "FRACCIONAMIENTO SAN VICENTE",
    "FRACCIONAMIENTO SANTA ROSA",
    "FRACCIONAMIENTO SANTA SOFIA",
    "FRACCIONAMIENTO SANTA TERESA",
    "FRACCIONAMIENTO SANTO DOMINGO",
    "FRACCIONAMIENTO SEVILLA",
    "FRACCIONAMIENTO TORREMOLINOS CERRADA HUELVA",
    "FRACCIONAMIENTO TORREMOLINOS CERRADA JAEN",
    "FRACCIONAMIENTO TORREMOLINOS SAN SEBASTIAN",
    "FRACCIONAMIENTO URBIVILLAS DEL CEDRO",
    "FRACCIONAMIENTO VALLE DE CHAPALA",
    "FRACCIONAMIENTO VALLE DEL NAZAS",
    "FRACCIONAMIENTO VEREDAS DE SANTA RITA",
    "FRACCIONAMIENTO VILLA LAS MISIONES",
    "FRACCIONAMIENTO VILLA NAPOLES",
    "FRACCIONAMIENTO VILLAS DEL DESIERTO",
    "FRACCIONAMIENTO VILLAS DEL DESIERTO II",
    "FRACCIONAMIENTO VILLAS EL REFUGIO",
    "FRACCIONAMIENTO VILLAS LAS NOAS",
    "FRACCIONAMIENTO VILLAS SAN ANTONIO",
    "FRACCIONAMIENTO VILLAS SAN FERMIN",
    "FRANCISCO VILLA",
    "GLORIETA",
    "HACIENDA LA NORIA",
    "HUITRÓN",
    "INDEPENDENCIA",
    "JERUSALEM",
    "JIMÉNEZ (JIMÉNEZ UNO)",
    "JOLO (DIECINUEVE DE OCTUBRE)",
    "JOSÉ MARÍA MORELOS Y PAVÓN",
    "LA AURORA",
    "LA COMPETENCIA",
    "LA FLOR",
    "LA FORTUNA",
    "LA LUZ",
    "LA MAGDALENA (FRESNEDO) [GRANJA]",
    "LA PLATA",
    "LA TEHUA",
    "LAS LECHUZAS (LAS BRUJAS)",
    "LAS MACITAS",
    "LAS PLAYAS",
    "LOS ÁNGELES",
    "LÁZARO CÁRDENAS",
    "MANILA",
    "MARÍA ANTONIETA",
    "NAZAS (LAS LAGARTIJAS)",
    "NORIA SECTOR VEINTITRÉS",
    "NOÉ",
    "NUEVO BARRO",
    "NUMANCIA",
    "PALO BLANCO",
    "PARQUE INDUSTRIAL PARQUE INDUSTRIAL",
    "PASTOR ROUAIX (JABONCILLO)",
    "PASTOR ROUAIX (PÉNJAMO)",
    "POANAS",
    "PROVIDENCIA",
    "PUEBLO ABISINIA (DINAMITA)",
    "PUEBLO AHEDO",
    "PUEBLO AQUILES SERDAN",
    "PUEBLO ARCINAS",
    "PUEBLO ARTURO MARTINEZ ADAME",
    "PUEBLO BELLA UNION",
    "PUEBLO BERLIN",
    "PUEBLO BRITTINGHAM",
    "PUEBLO BUCARELI",
    "PUEBLO CALIFORNIA",
    "PUEBLO CHIHUAHUITA VIEJO",
    "PUEBLO COMPETENCIA",
    "PUEBLO CUATRO DE DICIEMBRE",
    "PUEBLO CUBA",
    "PUEBLO DIECINUEVE DE OCTUBRE",
    "PUEBLO DIECIOCHO DE MARZO",
    "PUEBLO DOLORES",
    "PUEBLO EL BARRO",
    "PUEBLO EL CARIÑO",
    "PUEBLO EL CASTILLO",
    "PUEBLO EL COMPAS",
    "PUEBLO EL CONSUELO",
    "PUEBLO EL FENIX",
    "PUEBLO EL JUNCO",
    "PUEBLO EL NUEVO CASTILLO",
    "PUEBLO EL PARAISO",
    "PUEBLO EL QUEMADO",
    "PUEBLO EL RECUERDO",
    "PUEBLO EL RETOÑO",
    "PUEBLO EL SIETE (PUEBLO NUEVO)",
    "PUEBLO EL TRIUNFO",
    "PUEBLO EL VERGEL",
    "PUEBLO EL VERGELITO",
    "PUEBLO EL VOLADO",
    "PUEBLO EMILIANO ZAPATA",
    "PUEBLO ESMERALDA",
    "PUEBLO EUREKA",
    "PUEBLO FILADELFIA",
    "PUEBLO GLORIETA",
    "PUEBLO GREGORIO A GARCIA",
    "PUEBLO HUITRON",
    "PUEBLO INDEPENDENCIA",
    "PUEBLO JABONOSO",
    "PUEBLO JERUSALEM",
    "PUEBLO JIMENEZ",
    "PUEBLO JOSE MARIA MORELOS Y PAVON",
    "PUEBLO LA AURORA",
    "PUEBLO LA FLOR",
    "PUEBLO LA FORTUNA",
    "PUEBLO LA LUZ",
    "PUEBLO LA PLATA",
    "PUEBLO LA TEHUA",
    "PUEBLO LAS CATALINAS",
    "PUEBLO LAS HUERTAS",
    "PUEBLO LAS LAGARTIJAS",
    "PUEBLO LAS LECHUZAS",
    "PUEBLO LAS LUISAS",
    "PUEBLO LAS MASITAS",
    "PUEBLO LAS PLAYAS",
    "PUEBLO LAZARO CARDENAS",
    "PUEBLO LOS ANGELES",
    "PUEBLO LUJAN (SANTA CRUZ)",
    "PUEBLO MADRID",
    "PUEBLO MANILA",
    "PUEBLO MARIA ANTONIETA",
    "PUEBLO NOE (EJIDO)",
    "PUEBLO NOE (EST FFCC)",
    "PUEBLO NUEVO (EL SIETE)",
    "PUEBLO NUMANCIA",
    "PUEBLO PALO BLANCO",
    "PUEBLO PASTOR ROUAIX",
    "PUEBLO PASTOR ROUAIX (JABONCILLO)",
    "PUEBLO PENJAMO",
    "PUEBLO POANAS",
    "PUEBLO PROVIDENCIA",
    "PUEBLO PUENTE DE LA TORREÑA",
    "PUEBLO REFORMA",
    "PUEBLO RINCON DE SANTA CRUZ",
    "PUEBLO RINCONADA",
    "PUEBLO SAN ALBERTO",
    "PUEBLO SAN JOSE DEL VIÑEDO",
    "PUEBLO SAN RAMON",
    "PUEBLO SAN SEBASTIAN",
    "PUEBLO SANTA CLARA",
    "PUEBLO SANTOÑA",
    "PUEBLO SEIS DE OCTUBRE",
    "PUEBLO TRANSPORTE",
    "PUEBLO VALLE DE EUREKA",
    "PUEBLO VENECIA",
    "PUEBLO VIÑEDO",
    "PUENTE DE LA TORREÑA",
    "REFORMA",
    "RINCONADA",
    "RINCÓN DE SANTA CRUZ",
    "SAN ALBERTO",
    "SAN ISIDRO",
    "SAN JOSÉ DE VIÑEDO",
    "SAN MARTÍN",
    "SAN RAMÓN",
    "SAN ROQUE",
    "SAN SEBASTIAN",
    "SANTA CLARA",
    "SANTA CRUZ LUJÁN",
    "SEIS DE OCTUBRE",
    "SIERRA HERMOSA",
    "TAJO VIEJO",
    "TRANSPORTE",
    "TRANSPORTE DOS",
    "TRECE DE MARZO",
    "UNIDAD HABITACIONAL ALEJANDRA",
    "VENECIA",
    "VICENTE NAVA",
    "VILLA GREGORIO GARCÍA",
    "VILMA ALE DE HERRERA (LAS CUADRITAS)"
];

const CATALOGO_LOCALIDADES = [
    "18 DE MARZO",
    "ACAPULCO",
    "ACAPULCO (PROPIEDAD PRIVADA)",
    "AMERICA UNO",
    "AMPARO (GRANJA)",
    "AMPLIACION BUCARELI",
    "AMPLIACION EL FENIX",
    "AMPLIACION EL VERGELITO SUR",
    "AMPLIACION VENECIA",
    "AMPUEROS",
    "ANDRES JIMENEZ",
    "ANTONIO TORRES",
    "AQUILES SERDAN",
    "ARCINAS",
    "ARREOLA HERNANDEZ",
    "ARTURO MARTINEZ ADAME",
    "ASCENSION CRUZ",
    "ASTILLERO",
    "AURELIO RODRIGUEZ",
    "AUTODROMO MARCO MAGAÑA (DE LA LAGUNA)",
    "AUTOTRANSPORTES TRANSBAP [TALLER]",
    "AVICOLA AURORA",
    "BELLA UNION",
    "BERLIN",
    "BETHEL",
    "BETHEL (GRANJA)",
    "BETHEL DOS",
    "BRITTINGHAM",
    "BUCARELI",
    "BUENDIA",
    "BUGAMBILIA (MARIA CRISTINA) (GRANJA)",
    "CAIRO DOS",
    "CALIFORNIA",
    "CALIFORNIA CRIANZA",
    "CAMILO CENICEROS",
    "CAMPO C",
    "CANTERAS NUEVA CARRARA [MARMOLERA]",
    "CARLOS GERARDO VALDES BOHIGAS",
    "CASA BLANCA",
    "CASETA KILOMETRO 11 MAS 458",
    "CASETA KILOMETRO 17 CANAL SACRAMENTO",
    "CEFERESO NUMERO 14",
    "CEMIX",
    "CENTRO DE ACOPIO (GRANJA BLANCA)",
    "CERDO REAL",
    "CHAPINGO",
    "CHAVEZ (GRANJA)",
    "CHIHUAHUITA (CHIHUAHUITA NUEVO)",
    "CHIHUAHUITA (CHIHUAHUITA VIEJO)",
    "COLONIA AGRICOLA BUENDIA",
    "COLONIA AGRICOLA LA POPULAR",
    "COLONIA ESTABLERA SAN FRANCISCO",
    "COLONIA SAN ANGEL",
    "COLONIA SEIS DE JULIO (NUEVO NOE)",
    "CONEJOS",
    "CONSUELO OROZCO",
    "CORDERO CASTRO",
    "COREA",
    "CORRALITOS",
    "CRUZ ARREOLA",
    "CUATRO DE DICIEMBRE (SAGUNDO)",
    "CUATRO DE JULIO",
    "CURVA DE CAMACHO",
    "DAGOBERTO RAMON ARELLANO",
    "DAVID GAUSIN",
    "DELGADO SANTA ROSA",
    "DESARROLLO DORADO DE MILAGROS A.C. [HOGAR DE PERSONAS DE LA TERCERA EDAD]",
    "DESARROLLO LACTEO (DESLAC) (PROPIEDAD PRIVADA)",
    "DINAMITA",
    "DOLORES",
    "DON MELY (GRANJA)",
    "DON RICARDO [QUINTA]",
    "DON ROBERTO",
    "DOS AMIGOS",
    "DULCE MARIA (LA LUZ)",
    "EJIDO BUENDIA (LA CASETA)",
    "EL AGUILA",
    "EL ALTO DEL CHIVO (ROMERO ROSAS)",
    "EL BARRO",
    "EL BARRO 33 (EL TREINTA Y TRES)",
    "EL BERCIAL",
    "EL BUEN PASTOR [IGLESIA]",
    "EL CAIRO DOS (GRANJA)",
    "EL CAIRO [DESPEPITE]",
    "EL CARIÑO",
    "EL CARMEN (PROPIEDAD PRIVADA)",
    "EL CASTILLO",
    "EL CELO",
    "EL CHAPARRAL",
    "EL CHIMAL",
    "EL CHORIZO (FAMILIA TORRES)",
    "EL COMPAS",
    "EL COMPAS (PROPIEDAD PRIVADA)",
    "EL CONSUELO",
    "EL CONSUELO TRES [NORIA]",
    "EL CORONEL",
    "EL CORTIJO",
    "EL DURAZNITO",
    "EL DURAZNO",
    "EL EMPAQUE",
    "EL ERIAZO",
    "EL ERIAZO (LA NORIA)",
    "EL ESFUERZO (GRANJA)",
    "EL FENIX",
    "EL FENIX (PROPIEDAD PRIVADA)",
    "EL GARCES",
    "EL GATO",
    "EL HERMANO [AUTOPARTES]",
    "EL INDIO",
    "EL JUNCO",
    "EL LABRADOR [ESTANCIA CANINA]",
    "EL LAGUNERO [RESTAURANTE]",
    "EL MANANTIAL (PROPIEDAD PRIVADA)",
    "EL MEZQUITE",
    "EL MEZQUITE (CANTU)",
    "EL NOGUERAL 555 (CAMPO REAL)",
    "EL OLIVO (NOMBRE DE DIOS)",
    "EL PARAISO",
    "EL PATO",
    "EL PILAR",
    "EL PITAYO",
    "EL POLVORON (RIVERA ZAPATA)",
    "EL PROGRESO",
    "EL PROGRESO [RANCHO]",
    "EL QUEMADO",
    "EL RECUERDO",
    "EL RECUERDO (PROPIEDAD PRIVADA)",
    "EL REFUGIO",
    "EL RETOÑO",
    "EL ROSARIO",
    "EL SOL (GRANJA)",
    "EL SOLITO",
    "EL TAJITO",
    "EL TREBOL",
    "EL TREINTA Y UNO",
    "EL TRIUNFILLO (EL TRIUNFITO)",
    "EL TRIUNFO",
    "EL TUANON (PROPIEDAD PRIVADA)",
    "EL VALLE DE EUREKA",
    "EL VEINTINUEVE DE AGOSTO",
    "EL VERGEL",
    "EL VERGEL [QUINTAS]",
    "EL VERGELITO",
    "EL VOLADO",
    "EL VUELO DEL AGUILA",
    "ELIAF (EL CHORIZO)",
    "ENSENADA",
    "ESMERALDA",
    "ESTABLO BREMEN",
    "ESTABLO BRITINGHAM",
    "ESTABLO CHILCHOTA",
    "ESTABLO EL COMPAS (NORIA NUMERO 5)",
    "ESTABLO EL PORVENIR",
    "ESTABLO EL VERGEL",
    "ESTABLO LA GALLEGA",
    "ESTABLO MADRID",
    "ESTACION NOE",
    "ESTACION VIÑEDO",
    "EUREKA DE MEDIA LUNA (EUREKA)",
    "FABRICACIONES ESPECIALIZADAS [FUNDIDORA]",
    "FAMILIA ALDAMA SANCHEZ",
    "FAMILIA BARBA GUTIERREZ",
    "FAMILIA CISNEROS CALZADA",
    "FAMILIA CORDERO FLORES",
    "FAMILIA CORDERO ROSALES",
    "FAMILIA COSIO CEPEDA",
    "FAMILIA ESQUIVEL",
    "FAMILIA GARCIA DELGADILLO",
    "FAMILIA GARCIA ESCOBEDO",
    "FAMILIA GUADARRAMA L.",
    "FAMILIA GUTIERREZ PARRA",
    "FAMILIA LLANES ONTIVEROS",
    "FAMILIA LOPEZ ZAPATA",
    "FAMILIA MARTINEZ ANDRADE",
    "FAMILIA MARTINEZ LOPEZ",
    "FAMILIA MOTA ANDRADE",
    "FAMILIA RAMIREZ PEREZ",
    "FAMILIA RESENDIZ MONTOYA",
    "FAMILIA RODRIGUEZ CORDERO",
    "FAMILIA SANCHEZ AGUILAR",
    "FAMILIA SANCHEZ MACIAS",
    "FAMILIA SANCHEZ MONTALVO",
    "FAMILIA SANCHEZ RAMIREZ",
    "FAMILIA TORRES",
    "FAMILIA VALDEZ FAVELA",
    "FAMILIA VARGAS AGUILAR",
    "FAMILIA VAZQUEZ",
    "FAMILIA ZAPATA ROSALES",
    "FERNANDO TURRUBIATES",
    "FILADELFIA",
    "FLORENCIO CASAS",
    "FRANCISCO ESPARZA A.",
    "FRANCISCO MERCADO",
    "FRANCISCO VILLA",
    "FRANCISCO VILLA (LOS SIERRA)",
    "FUENTE BELLA",
    "GABY (GRANJA)",
    "GANADERA GILIO",
    "GANADERA SOLORZANO",
    "GARCIA (GRANJA)",
    "GAUCIN ARAIZA",
    "GAUCIN LUJAN",
    "GEMA [ESTABLO]",
    "GLORIETA",
    "GOMEZ PALACIO",
    "GONZALEZ TOSCANO",
    "GOROSTI (GRANJA ESTHER) (GRANJA)",
    "GRANJA ALBORADA",
    "GRANJA ANA (PROPIEDAD PRIVADA)",
    "GRANJA CLAUDIA LETICIA (EL CASTILLO)",
    "GRANJA EL CASTILLO",
    "GRANJA EL ROCIO (PROPIEDAD PRIVADA)",
    "GRANJA ELVIRA",
    "GRANJA GUADALUPE",
    "GRANJA LA CANTABRA",
    "GRANJA PORCINA NOE",
    "GRANJA PUERTO ARTURO (EL SOLITO)",
    "GRUPO SOLIDARIO PAMPLONA (GRANJA HIDALGO)",
    "GUADALUPE BERLANGA",
    "GUERRERO (GRANJA)",
    "GUTIERREZ PARRA (PROPIEDAD PRIVADA)",
    "HERMANOS QUEZADA",
    "HOREB (PROPIEDAD PRIVADA)",
    "HOREB [RANCHO]",
    "HUERTO SOFIA",
    "HUITRON",
    "IDEAGEMA (GRANJA)",
    "IDEAL (GRANJA)",
    "ILHUICAMINA",
    "INDEPENDENCIA",
    "INDUSTRIAL GUAJARDO",
    "INDUSTRIAL MAFER [EMPACADORA]",
    "INTERNACIONAL TEXTIL DE SERVICIOS [MAQUILADORA]",
    "ISIDRO MORALES",
    "J. GUADALUPE RODRIGUEZ",
    "JA (LA HURAÑA) (GRANJA)",
    "JACINTO CAMACHO",
    "JAIME ROMERO",
    "JERICO (PROPIEDAD PRIVADA)",
    "JERUSALEM",
    "JEZALA",
    "JIMENEZ (JIMENEZ UNO)",
    "JIMENEZ 2-A (EL ARENAL)",
    "JOLO (DIECINUEVE DE OCTUBRE)",
    "JOLO (PROPIEDAD PRIVADA)",
    "JOSE ANTUNEZ",
    "JOSE GUADALUPE ANTUNEZ MEDINA",
    "JOSE MARIA MORELOS Y PAVON",
    "JOSE ROBLES",
    "JOSE SALDAÑA",
    "JUAN CARLOS SILVA BERNAL",
    "JUAN LARRIÑAGA",
    "JUAN LLANES",
    "JUAN MANUEL",
    "JUAN RODRIGUEZ",
    "LA AMPLIACION",
    "LA AURORA",
    "LA BECERRA",
    "LA BILLETERA",
    "LA CABAÑA (FAMILIA PADILLA)",
    "LA CAPILLA [GRANJA]",
    "LA CASA ROSA",
    "LA CHILLA",
    "LA COMPETENCIA",
    "LA DOÑA [RESTAURANTE]",
    "LA EMPRESA (PANFILO GAYTAN)",
    "LA ENCANTADA",
    "LA ESCONDIDA",
    "LA ESCONDIDA (CORDERO REYES)",
    "LA ESPERANZA",
    "LA ESTRELLA",
    "LA ESTRELLA (PROPIEDAD PRIVADA)",
    "LA FE",
    "LA FLOR",
    "LA FORTUNA",
    "LA FOSA",
    "LA GAVIA (POZO NUMERO 84) (GRANJA)",
    "LA HERMIDA",
    "LA HERRADURA",
    "LA ISLA (LOS AMAYA)",
    "LA JARITA",
    "LA LAGUNITA",
    "LA LUZ",
    "LA MAGDALENA (FRESNEDO) (GRANJA)",
    "LA NORIA DE JABONCILLO",
    "LA NORIA DEL GAVILAN",
    "LA PAZ (GRANJA)",
    "LA PEQUEÑA SANTANA",
    "LA PLATA",
    "LA PLATILLA (LA NUEVA) (NUEVO CENTRO DE POBLACION)",
    "LA POPULAR",
    "LA POPULAR (GRANJA)",
    "LA PROVIDENCIA (GIBRALTAR)",
    "LA REVANCHA",
    "LA RISUEÑA [ESTABLO]",
    "LA ROSITA (PROGRESO CHIQUITO)",
    "LA RUMOROSA (LAS CONCHAS)",
    "LA SOLEDAD",
    "LA TEHUA",
    "LA VEGA",
    "LA VEGA DEL PARAISO",
    "LAGUSOL",
    "LAS 3 MARIAS",
    "LAS CARMELAS",
    "LAS CARMELITAS",
    "LAS COYOTERAS",
    "LAS CRIBAS",
    "LAS CUATITAS",
    "LAS FLORES",
    "LAS LECHUZAS (LAS BRUJAS)",
    "LAS MACITAS",
    "LAS MARGARITAS",
    "LAS MERCEDES F2",
    "LAS PALMAS (GRANJA)",
    "LAS PLAYAS",
    "LAS TRES B",
    "LAS VIRGINIAS",
    "LAZARO CARDENAS",
    "LETICIA (GRANJA)",
    "LETICIAS (GRANJA)",
    "LOCALIDAD SIN NOMBRE (DAVID ESQUIVEL)",
    "LOCALIDAD SIN NOMBRE (JUAN LEYVA)",
    "LOPEZ ZAPATA",
    "RANCHO LOS 3 HERMANOS",
    "LOS ANDRADE",
    "LOS ANFIBIOS",
    "LOS ANGELES",
    "LOS CONTRERAS (EL CASTILLO) (GRANJA)",
    "LOS DELGADO",
    "RANCHO LOS DOS COMPADRES",
    "LOS DULCES NOMBRES (GUTIERREZ BARBA) (GRANJA)",
    "LOS EUCALIPTOS",
    "LOS MARTINEZ",
    "LOS MIRASOLES",
    "LOS NOGALES (GRANJA)",
    "LOS OLIVOS",
    "LOS ORGANOS (LA GLORIA)",
    "RANCHO LOS PAPIRINGOS",
    "LOS POTRILLOS",
    "RANCHO LOS REYES",
    "LOS TREINTA",
    "RANCHO LOS TRES CAMACHO",
    "LUPITA (GRANJA)",
    "MANILA",
    "MAPIMI (GRANJA)",
    "MAQUILAS Y MINERALES ALFERY",
    "MARIA ANTONIETA",
    "MARIA TERESA",
    "MARMOLERA MAURO LOZANO",
    "MARMOLERA PEREZ ANTUNEZ",
    "MARMOLES CASTRO",
    "MARTHA (EL COLORADO) (GRANJA)",
    "MARTINEZ LEYVA",
    "MI TUMBA",
    "MIGUEL MONTAÑEZ MEZA",
    "MIGUEL SAMANIEGO",
    "MOISES LOPEZ",
    "MOLINO LOS ANTUNEZ",
    "NATO HERNANDEZ",
    "NAZAS (LAS LAGARTIJAS)",
    "NEXTLALPAN",
    "NICOLAS ROQUE",
    "NINGUNO",
    "NOE",
    "NOEL GAUSIN",
    "NOELIE (GRANJA)",
    "NORIA 1919",
    "NORIA 1926",
    "NORIA 1981 (LOS RUIZ)",
    "NORIA 273",
    "NORIA DE JIMENEZ DOS",
    "NORIA DE LA TEHUA",
    "NORIA DE LA VIRGINIA",
    "NORIA DEL CONSUELO",
    "NORIA EL RECUERDO",
    "NORIA GREGORIO GARCIA",
    "NORIA LA CUATRO",
    "NORIA LA TRES",
    "NORIA LA TRES (CARLOS BERLANGAS)",
    "NORIA LA UNA",
    "NORIA PARAISO",
    "NORIA SAN GONZALO",
    "NORIA SAN MARTIN",
    "NORIA SECTOR DOS",
    "NORIA SECTOR VEINTITRES",
    "NORIA VENECIA CINCO",
    "NORIA VENECIA DE LA SOCIEDAD",
    "NUEVO AMANECER",
    "NUEVO BARRO",
    "NUEVO GOMEZ",
    "NUEVO GOMEZ DOS",
    "NUEVO JERICO",
    "NUMANCIA",
    "P.P. LOS RAMOS",
    "PABLO LARRIÑAGA",
    "PADILLA SALAS",
    "PALO BLANCO",
    "PALO HUECO",
    "PARAISO SECTOR 3 (LA TIJERA)",
    "PARAISO SECTOR TRES (LOS GORGOROS)",
    "PARCELA NUMERO TREINTA (HERNANDEZ GUTIERREZ)",
    "PASTOR ROUAIX",
    "PASTOR ROUAIX (JABONCILLO)",
    "PASTOR ROUAIX (PENJAMO)",
    "PATZCUARO",
    "PENJAMO",
    "PEQUEÑA BERLIN",
    "PEQUEÑA PROPIEDAD CALIFORNIA",
    "PEQUEÑA PROPIEDAD ESMERALDA",
    "PIMENTEL (EL SOCORRITO)",
    "POANAS",
    "PORVENIR",
    "PORVENIR TIFA-88 [PLANTA PROCESADORA]",
    "POZO NUMERO DOS",
    "POZO PANCHO VILLA",
    "GRANJA PREVEDEL",
    "PRODUCTOS AGROPECUARIOS 2 Y 2",
    "PROPIEDAD PRIVADA EL SOLITO",
    "PROVIDENCIA",
    "ESTABLO PROVIDENCIA",
    "PUEBLO NUEVO (EL SIETE)",
    "PUENTE DE LA TORREÑA",
    "PURISIMA",
    "QUINTA ALINA",
    "QUINTA ARMONIA",
    "QUINTA BAM BAM",
    "QUINTA EL CAPRICHO",
    "QUINTA EL RETIRO",
    "QUINTA ESPERANZA",
    "QUINTA LAS ILUSIONES",
    "QUINTA LILIAN",
    "QUINTA ROSY",
    "QUINTA SANTA MONICA",
    "RAMIRO CANALES",
    "RAMIRO ROJAS",
    "RAMONA HERMOSILLO",
    "RANCHITO NUEVO GOMEZ (HERNANDEZ BAUTISTA)",
    "RANCHO GORDO",
    "RANCHO GUADALUPE",
    "RANCHO LA HECTAREA",
    "RANCHO NUEVO",
    "RANCHO NUEVO (ZURITA)",
    "RANCHO ROSALBA",
    "RANCHO SAN LUIS (GRANJA RIOS)",
    "REAL DE SAN SEBASTIAN (PEDRO LUNA SOLIS)",
    "REFORMA",
    "REMIGIO CUEVAS GALINDO",
    "RESUMIDEROS",
    "REYES CASTRO (PROPIEDAD PRIVADA)",
    "REYES SANCHEZ (GRANJA AVICOLA)",
    "RIGOBERTO BECERRA",
    "RINCON DE SANTA CRUZ",
    "RINCONADA",
    "RIOS (GRANJA)",
    "RIVERA LLANES",
    "ROBERTO GARCIA",
    "ROBERTO RIOS",
    "RUTILIO GARCIA",
    "SAN AGUSTIN (CORRALES LAS LUISAS)",
    "SAN ALBERTO",
    "SAN ALBERTO (GRANJA)",
    "SAN ANTONIO",
    "SAN AURELIO",
    "SAN CARLOS",
    "SAN CARLOS (LA ESCONDIDA) (PROPIEDAD PRIVADA)",
    "SAN FELIPE",
    "SAN FELIPE (PROPIEDAD PRIVADA)",
    "SAN FERNANDO",
    "SAN FRANCISCO (GRANJA)",
    "SAN GABRIEL",
    "SAN GERARDO",
    "SAN ISIDRO",
    "SAN JOSE",
    "SAN JOSE (GRANJA)",
    "SAN JOSE (GRUPO AVICOLA)",
    "SAN JOSE (NORIA LA DOS)",
    "SAN JOSE DE VIÑEDO",
    "SAN JOSE DEL VIÑEDO (PROPIEDAD PRIVADA)",
    "SAN JOSE ENMIRA (PROPIEDAD PRIVADA)",
    "SAN JUAN",
    "SAN JUDAS TADEO",
    "SAN LORENZO",
    "SAN LUIS",
    "SAN LUISITO",
    "SAN MANUEL",
    "SAN MARTIN",
    "SAN MIGUEL",
    "SAN PEDRO (PROPIEDAD PRIVADA)",
    "SAN PEDRO DOS",
    "SAN RAMIRO",
    "SAN RAMON",
    "SAN ROQUE",
    "SAN SEBASTIAN",
    "SAN SERGIO",
    "SAN VICENTE",
    "SANTA ANGELICA",
    "SANTA CLARA",
    "SANTA CRUZ",
    "SANTA CRUZ (EL APARECIDO)",
    "SANTA CRUZ LUJAN",
    "SANTA FE",
    "SANTA GERTRUDIS",
    "SANTA HERMINIA",
    "SANTA INES",
    "SANTA JULIA",
    "SANTA LUCINA",
    "SANTA MARIA",
    "SANTA MARIA [FRACCIONAMIENTO]",
    "SANTA ROSA",
    "SANTA ROSITA",
    "SANTA SOFIA",
    "SANTA TERESA",
    "SECTOR II",
    "SEIS DE OCTUBRE",
    "SEPULVEDA",
    "SIERRA HERMOSA",
    "SIMSA INDUSTRIAL PARK",
    "SPR EL TRIANGULO",
    "TAJO VIEJO",
    "TIERRA LINDA",
    "TITO ESQUIVEL",
    "TOLEDO (PROPIEDAD PRIVADA)",
    "TRANSPORTE",
    "TRANSPORTE DOS",
    "TRANSPORTES ESPECIALIZADOS LUCERO",
    "TRECE DE MARZO",
    "TRES ESTRELLAS (GRANJA)",
    "TRES MARIAS",
    "TRES ROBLES",
    "TRES VICTORIAS",
    "VALDEZ (GRANJA)",
    "VAZQUEZ (GRANJA)",
    "VAZQUEZ (PROPIEDAD PRIVADA)",
    "VENECIA",
    "VENECIA (PROPIEDAD PRIVADA)",
    "VENUSTIANO CARRANZA",
    "VIANEY (GRANJA)",
    "VICENTE NAVA",
    "VICTOR CARRILLO HERNANDEZ",
    "VILLA GREGORIO GARCIA",
    "VILLAS URBI DEL CEDRO (VILLAS DEL CEDRO)",
    "VILMA ALE DE HERRERA (LAS CUADRITAS)",
    "VIÑASOL",
    "VIÑASOL II",
    "YOLANDA (GRANJA)",
    "ZOQUI (GRANJA)"
];

const DB_NAME = "R02_DB"; const DB_VERSION = 1; const STORE_NAME = "derechohabientes"; let db;
const request = indexedDB.open(DB_NAME, DB_VERSION);
request.onupgradeneeded = (e) => {
    db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "CURP" });
        store.createIndex("by_nombre", "NOMBRE", { unique: false }); store.createIndex("by_calle", "CALLE", { unique: false });
    }
};
request.onsuccess = (e) => { db = e.target.result; updateLocalCounter(); preloadDatabaseToMemory(); };
request.onerror = (e) => { console.error("Error IndexedDB:", e.target.error); };

function updateLocalCounter() {
    if (!db) return;
    const countRequest = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).count();
    countRequest.onsuccess = () => {
        const countElement = document.getElementById('local-db-count');
        if (countElement) countElement.innerText = countRequest.result;
    };
    const totalVisitasHoy = pendingSync.length + syncedHistory.length; const pendientesPorSubir = pendingSync.length;
    if (document.getElementById('metric-total-visitas')) document.getElementById('metric-total-visitas').innerText = totalVisitasHoy;
    if (document.getElementById('metric-pendientes-visitas')) document.getElementById('metric-pendientes-visitas').innerText = pendientesPorSubir;
    if (document.getElementById('pending-count')) document.getElementById('pending-count').innerText = pendientesPorSubir;
}
function changeScreen(screenId) {
    if (screenId !== 'screen-history') previousScreen = screenId;
    if (screenId === 'screen-search') preloadDatabaseToMemory();
    if (screenId === 'screen-welcome') updateLocalCounter(); // CORREGIDO
    
    if (screenId === 'screen-search' && currentUser) {
        const datosBrigadistaActivo = AUTHORIZED_CURPS[currentUser.curp];
        if (datosBrigadistaActivo) {
            if (document.getElementById('search-brigadista-name')) document.getElementById('search-brigadista-name').innerText = datosBrigadistaActivo.name;
            if (document.getElementById('search-brigadista-municipio')) document.getElementById('search-brigadista-municipio').innerText = datosBrigadistaActivo.municipio.toUpperCase().trim();
        }
    }
    
    document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
    const targetScreen = document.getElementById(screenId); if (targetScreen) targetScreen.classList.remove('hidden');

    const bottomNav = document.getElementById('app-bottom-nav'); if (!bottomNav) return;
    if (screenId === 'screen-login' || screenId === 'screen-form' || screenId === 'screen-docs') {
        bottomNav.style.setProperty('display', 'none', 'important'); bottomNav.classList.add('hidden');
    } else {
        bottomNav.style.setProperty('display', 'flex', 'important'); bottomNav.classList.remove('hidden');
        document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
        
        // CORREGIDO: Enlaces síncronos con los IDs reales de tu index.html para evitar que truene el hilo táctil
        if (screenId === 'screen-welcome') {
            const btnWel = document.getElementById('nav-welcome'); if (btnWel) btnWel.classList.add('active');
        }
        if (screenId === 'screen-search') {
            const btnSea = document.getElementById('nav-search'); if (btnSea) btnSea.classList.add('active');
        }
        if (screenId === 'screen-history') {
            const btnHis = document.getElementById('nav-history'); if (btnHis) btnHis.classList.add('active');
        }
    }
}
function login() {
    const curpInput = document.getElementById('login-curp').value.trim().toUpperCase();
    if (typeof AUTHORIZED_CURPS !== 'undefined' && AUTHORIZED_CURPS[curpInput]) {
        const brigadistaEncontrado = AUTHORIZED_CURPS[curpInput];
        currentUser = { curp: curpInput, name: brigadistaEncontrado.name };
        if (document.getElementById('welcome-message')) document.getElementById('welcome-message').innerText = `Bienvenido(a), ${currentUser.name}`;
        if (document.getElementById('welcome-message-search')) document.getElementById('welcome-message-search').innerText = `Bienvenido(a), ${currentUser.name}`;
        changeScreen('screen-welcome');
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
        
        preloadDatabaseToMemory(); 
        updateLocalCounter(); 
        alert(`✅ ÉXITO: Se descargaron ${totalCargados} registros en tu teléfono.`); 
        changeScreen('screen-search');
    } catch (error) { alert(`Error: ${error.message}`); } finally { btn.disabled = false; }
}

let localMemoryDatabase = [];
function preloadDatabaseToMemory() {
    if (!db) return;
    db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll().onsuccess = (e) => { localMemoryDatabase = e.target.result || []; };
}



function searchData() {
    const query = document.getElementById('search-input').value.toLowerCase().trim(); 
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = ""; 
    
    // Mantenemos tu inicio de búsqueda desde el segundo dígito o letra
    if (query.length < 2) return;

    const brigadistaActivo = AUTHORIZED_CURPS[currentUser.curp]; 
    const municipioBrigadista = brigadistaActivo ? brigadistaActivo.municipio.toUpperCase().trim() : "";
    const searchTokens = query.split(/\s+/); 
    let matchedRecords = [];

    for (let i = 0; i < localMemoryDatabase.length; i++) {
        const item = localMemoryDatabase[i]; 
        if (!item) continue;
        const municipioDerechohabiente = item['MUNICIPIO'] ? String(item['MUNICIPIO']).toUpperCase().trim() : "";
        if (municipioDerechohabiente !== municipioBrigadista) continue; 

        // Recupera el valor de la sección e ignora decimales .0 de Excel de forma matemática pura
        const seccionValor = item['SECCION'] || item['SECCION '] || item['Seccion'] || '';
        let seccionNumero = parseInt(seccionValor, 10);
        let seccionLimpia = isNaN(seccionNumero) ? "" : String(seccionNumero);

        // Tu misma cadena original concatenando la sección y las palabras clave al final
        const combinedText = `${item['NOMBRE'] || ''} ${item['AP PATERNO'] || ''} ${item['AP MATERNO'] || ''} ${item['CURP'] || ''} ${item['CALLE'] || ''} ${item['NUM EXT'] || ''} ${item['COLONIA'] || ''} ${seccionLimpia} seccion ${seccionLimpia} sección ${seccionLimpia}`.toLowerCase();
        
        if (searchTokens.every(t => combinedText.includes(t))) {
            item['SECCION_LIMPIA'] = seccionLimpia;
            matchedRecords.push(item);
        }
    }

    // Ordenamiento numérico estricto de menor a mayor por número de casa
    matchedRecords.sort((a, b) => {
        const numA = parseInt(String(a['NUM EXT']).replace(/\D/g, ""), 10) || 0;
        const numB = parseInt(String(b['NUM EXT']).replace(/\D/g, ""), 10) || 0;
        return numA - numB;
    });

    resultsContainer.innerHTML = "";
    matchedRecords.slice(0, 30).forEach(item => {
        const div = document.createElement('div'); 
        
        // Control de sincronización local
        const estaEnColaPendiente = pendingSync.some(p => p['CURP'] === item['CURP']); 
        const recordEnCola = pendingSync.find(p => p['CURP'] === item['CURP']);
        
        // Extraer valores reales sanitizados
        const estatusFinal = estaEnColaPendiente && recordEnCola ? recordEnCola['ESTATUS_VISITA'] : (item['ESTATUS_VISITA'] || "");
        const saludFinal = estaEnColaPendiente && recordEnCola ? recordEnCola['CUANTAS_VISITAS_SALUD'] : (item['CUANTAS_VISITAS_SALUD'] || "");

        const estatusLimpio = String(estatusFinal).toUpperCase().trim();
        const saludLimpia = String(saludFinal).toUpperCase().trim();

        // 🎨 VARIABLES DE ESTILO DINÁMICO (ESTILOS EN LÍNEA PARA NO DEPENDER DEL CSS)
        let fondoTarjeta = "#EDF4F9";      // Azul Glaciar Pastel por defecto
        let bordeIzquierdo = "5px solid #BC955C"; // Borde Dorado por defecto
        let colorTextoPrincipal = "#1F2937"; // Negro Antracita
        let colorSubtextos = "#555555";     // Gris oscuro
        let textoIndicador = "";

        // VALIDADORES DE REGLAS ESTRICTOS
        const esSaludVacioOVisitas = (saludLimpia === "" || saludLimpia === "1" || saludLimpia === "2" || saludLimpia === "3");

        if ((estatusLimpio === "" || estatusLimpio === "LOCALIZADO") && esSaludVacioOVisitas) {
            // 🟦 REGLA 1 y 2: PENDIENTES / LOCALIZADOS CON VISITAS (Azul Glaciar Pastel / Borde Dorado)
            fondoTarjeta = "#EDF4F9";
            bordeIzquierdo = "5px solid #BC955C";
            textoIndicador = estatusLimpio === "LOCALIZADO" 
                ? ' <span style="color:#137333; font-weight:bold; font-size:12px; margin-left:5px;">✓ Localizado</span>'
                : ' <span style="color:#718096; font-weight:bold; font-size:12px; margin-left:5px;">⏳ No Tocado</span>';
        } 
        else if (estatusLimpio === "NO LOCALIZADO" && saludLimpia !== "NO_QUIERE") {
            // 🟥 REGLA 3: NO LOCALIZADOS (Rojo Rosáceo / Borde Carmesí)
            fondoTarjeta = "#FCE8E6";
            bordeIzquierdo = "5px solid #b91c1c";
            textoIndicador = ' <span style="color:#C5221F; font-weight:bold; font-size:12px; margin-left:5px;">✗ No Localizado</span>';
        } 
        else if (estatusLimpio === "LOCALIZADO" && saludLimpia === "NO_QUIERE") {
            // 🟫 REGLA 4: RECHAZO DE SALUD (Guinda Oscuro / Borde Dorado de Advertencia)
            fondoTarjeta = "#4A0E25";
            bordeIzquierdo = "5px solid #BC955C";
            colorTextoPrincipal = "#FFFFFF"; // Contraste blanco obligatorio por fondo oscuro
            colorSubtextos = "#E5E7EB";
            textoIndicador = ' <span style="color:#BC955C; font-weight:bold; font-size:12px; margin-left:5px;">✓ Rechazo Salud</span>';
        } 
        else if (estatusLimpio === "" && saludLimpia === "NO_QUIERE") {
            // 🟪 REGLA 5: PENDIENTES CON RECHAZO PREVIO (Fondo Azul Pastel / Borde Lateral Guinda)
            fondoTarjeta = "#EDF4F9";
            bordeIzquierdo = "5px solid #621132"; // Borde Guinda
            textoIndicador = ' <span style="color:#621132; font-weight:bold; font-size:12px; margin-left:5px;">⏳ Pendiente con Rechazo</span>';
        }

        // Inyectamos de forma forzada los estilos calculados para pintar la tarjeta sí o sí
        div.className = "result-item";
        div.style.backgroundColor = fondoTarjeta;
        div.style.borderLeft = bordeIzquierdo;
        div.style.padding = "14px 16px";
        div.style.borderBottom = "1px solid #F3F4F6";
        div.style.cursor = "pointer";
        div.style.marginBottom = "8px";
        div.style.borderRadius = "4px";

        div.innerHTML = `<div style="font-size:16px; font-weight:700; color:${colorTextoPrincipal}; margin-bottom:2px;">${item['NOMBRE'] || ''} ${item['AP PATERNO'] || ''} ${item['AP MATERNO'] || ''}${textoIndicador}</div>
                         <div style="font-size:13px; font-weight:600; color:#621132; margin-bottom:4px; letter-spacing:0.3px;">
                             CURP: ${item['CURP'] || 'SIN CURP'} | <span style="background-color:#BC955C; color:#1F2937; padding: 2px 8px; border-radius: 4px; font-weight: 800; font-size: 11px; display:inline-block; margin-left:2px;">SECCIÓN: ${item['SECCION_LIMPIA'] || 'S/S'}</span>
                         </div>
                         <div style="font-size:13px; color:${colorSubtextos};">📍 Calle: ${item['CALLE'] || 'S/C'}, No. Ext: ${item['NUM EXT'] || 'S/N'}, Col. ${item['COLONIA'] || 'S/C'}</div>`;
                         
        div.onclick = () => openForm(item); 
        resultsContainer.appendChild(div);
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
        if (!mot || mot.trim() === "") { 
            alert("🛑 Operación cancelada."); 
            currentEstatusVisita = "LOCALIZADO"; 
            motivoNoLocalizadoValue = ""; 
            actualizarEstilosBotonesFormulario(); 
            return; 
        }
        // 🔥 CORREGIDO: Se fuerza a mayúsculas desde el momento de la captura
        motivoNoLocalizadoValue = mot.trim().toUpperCase();
        document.getElementById('f-recibio-salud').removeAttribute('required');
        actualizarEstilosBotonesFormulario();

        // VALIDACIÓN DE COORDENADAS PARA GUARDADO AUTOMÁTICO
        const latValue = document.getElementById('f-lat').value;
        if (latValue.includes("Buscando") || latValue === "" || latValue === "ERROR") {
            mostrarCargando("Esperando señal de satélite para georreferencia obligatoria...");
            window.pendienteGuardarNoLocalizado = true; 
        } else {
            saveData(null); 
        }
        return;
    } else { 
        motivoNoLocalizadoValue = ""; 
        document.getElementById('f-recibio-salud').setAttribute('required', 'required');
        window.pendienteGuardarNoLocalizado = false;
    }
    actualizarEstilosBotonesFormulario();
}

function evaluarFlujoSalud() {
    const recibio = document.getElementById('f-recibio-salud').value;
    const wrapperVisitas = document.getElementById('wrapper-cuantas-visitas');
    const selectCuantas = document.getElementById('f-cuantas-visitas');
    
    // Resetear valores de control ocultos previos
    document.getElementById('f-atencion-salud').value = "";
    document.getElementById('f-motivo-no-visita').value = "";
    document.getElementById('f-desea-visita-futura').value = "";
    selectCuantas.value = "";

    if (recibio === "SI") {
        wrapperVisitas.style.display = "block";
        if (currentEstatusVisita === "LOCALIZADO") {
            selectCuantas.setAttribute("required", "required");
        }
    } else if (recibio === "NO") {
        wrapperVisitas.style.display = "none";
        selectCuantas.removeAttribute("required");
        
        // 🔲 CUADRO DE DIÁLOGO CON OPCIONES DIRECTAS SÍ / NO (confirm)
        let deseaVisita = confirm("¿Le gustaría recibir la visita del personal de salud de manera futura?\n\n[Aceptar = SÍ]  /  [Cancelar = NO]");
        
        if (deseaVisita) {
            // Si selecciona SÍ
            document.getElementById('f-desea-visita-futura').value = "SI";
        } else {
            // Si selecciona NO
            document.getElementById('f-desea-visita-futura').value = "NO";
            
            // 🔄 AUTOMATIZACIÓN: Guarda "No quiero las visitas" en la columna de cantidad
            selectCuantas.value = "NO_QUIERE";
            
            // Hacemos visible el contenedor temporalmente para que se ejecute la lógica de guardado visual
            wrapperVisitas.style.display = "block";
            
            // Invoca de forma inmediata la pregunta del motivo del rechazo
            evaluarCantidadVisitas();
        }
    } else {
        wrapperVisitas.style.display = "none";
        selectCuantas.removeAttribute("required");
    }
}

function evaluarCantidadVisitas() {
    const cuantas = document.getElementById('f-cuantas-visitas').value;
    
    // Mantener limpios los campos si cambia de opinión en el select manual
    if (cuantas !== "NO_QUIERE") document.getElementById('f-motivo-no-visita').value = "";
    if (cuantas !== "1" && cuantas !== "2" && cuantas !== "3") document.getElementById('f-atencion-salud').value = "";

    if (cuantas === "1" || cuantas === "2" || cuantas === "3") {
        let opinion = prompt("¿Qué le pareció la atención del servidor de la salud?:");
        // 🔥 CORREGIDO: Guarda la opinión estrictamente en mayúsculas
        document.getElementById('f-atencion-salud').value = opinion ? opinion.trim().toUpperCase() : "SIN COMENTARIOS";
    } else if (cuantas === "NO_QUIERE") {
        let motivo = prompt("¿Cuál es el motivo por el que no desea la visita del personal de salud?:");
        // 🔥 CORREGIDO: Guarda el motivo del rechazo estrictamente en mayúsculas
        document.getElementById('f-motivo-no-visita').value = motivo ? motivo.trim().toUpperCase() : "SIN MOTIVO ESPECIFICADO";
    }
}


function actualizarEstilosBotonesFormulario() {
    const btnLoc = document.getElementById('btn-status-localizado'); 
    const btnNoLoc = document.getElementById('btn-status-nolocalizado');
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
    
    if (typeof resetearContenedoresYBotonesFotografias === 'function') {
        resetearContenedoresYBotonesFotografias();
    }

    // Usamos una función auxiliar interna para asignar valores de forma segura sin romper el código
    const setSafeValue = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
    };

    // Asignación segura de campos principales
    setSafeValue('f-curp', item['CURP']); 
    setSafeValue('f-id', item['ID']); 
    setSafeValue('f-nombre', item['NOMBRE']); 
    setSafeValue('f-paterno', item['AP PATERNO']); 
    setSafeValue('f-materno', item['AP MATERNO']); 
    setSafeValue('f-telfijo', item['TEL FIJO']); 
    setSafeValue('f-telcel', item['TEL CEL']); 
      // Extrae la sección que ya trae la palabra grabada desde tu hoja de cálculo
    let seccionOrigen = item['SECCION'] || item['SECCION '] || '';
    // Deja solo los números quitando las palabras de anclaje
    let numeroPuro = String(seccionOrigen).toUpperCase().replace("SECCION", "").replace("SECCIÓN", "").trim();
    setSafeValue('f-seccion', numeroPuro);


    setSafeValue('f-cp', item['CP']); 
    setSafeValue('f-calle', item['CALLE']); 
    setSafeValue('f-numext', item['NUM EXT']); 
    setSafeValue('f-referencia', item['REFERENCIA']); 
    setSafeValue('f-situacion', item['SITUACION']); 
    
    // Estos campos fallaban porque no existen en tu HTML actual (ahora son seguros)
    setSafeValue('f-causal', item['CAUSAL']);

    // Gestión de Estatus de Visita
    currentEstatusVisita = item['ESTATUS_VISITA'] || "LOCALIZADO"; 
    motivoNoLocalizadoValue = item['MOTIVO_NO_LOCALIZADO'] || ""; 
    actualizarEstilosBotonesFormulario(); 
    window.currentTratoValue = item['EVALUACION_TRATO'] || ""; 
    
    actualizarEstilosBotonesTrato(); 

    // Flujo de Servidores de la Salud (Validaciones de existencia)
    const fRecibioSalud = document.getElementById('f-recibio-salud');
    if (fRecibioSalud) {
        fRecibioSalud.value = item['RECIBIO_VISITA_SALUD'] || '';
    }

    const wrapperVisitas = document.getElementById('wrapper-cuantas-visitas');
    const fCuantasVisitas = document.getElementById('f-cuantas-visitas');
    
    if (item['RECIBIO_VISITA_SALUD'] === "SI") {
        if (wrapperVisitas) wrapperVisitas.style.display = "block";
        if (fCuantasVisitas) fCuantasVisitas.value = item['CUANTAS_VISITAS_SALUD'] || '';
    } else {
        if (wrapperVisitas) wrapperVisitas.style.display = "none";
    }

    // Campos condicionales o de control (Asignación segura)
    setSafeValue('f-atencion-salud', item['OPINION_ATENCION_SALUD']);
    setSafeValue('f-motivo-no-visita', item['MOTIVO_NO_VISITA_SALUD']);
    setSafeValue('f-desea-visita-futura', item['DESEA_VISITA_SALUD']);

       // Geolocalización
    const fLat = document.getElementById('f-lat');
    const fLon = document.getElementById('f-lon');
    if (fLat) fLat.value = "Buscando satélite..."; 
    if (fLon) fLon.value = "Buscando satélite...";

    // Reseteamos cualquier orden de guardado vieja al abrir un nuevo formulario
    window.pendienteGuardarNoLocalizado = false;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            if (fLat) fLat.value = String(position.coords.latitude.toFixed(6)).replace(",", "."); 
            if (fLon) fLon.value = String(position.coords.longitude.toFixed(6)).replace(",", ".");
            
            // 🛰️ DETECTOR DE GEOREFERENCIA EN TIEMPO REAL:
            // Si el brigadista ya presionó "NO LOCALIZADO" y estábamos esperando el GPS...
            if (window.pendienteGuardarNoLocalizado === true) {
                window.pendienteGuardarNoLocalizado = false; // Limpiamos la bandera
                ocultarCargando(); // Quitamos el aviso de carga
                saveData(null); // ¡Guarda automáticamente de forma exitosa!
            }
        }, () => { 
            if (fLat) fLat.value = "ERROR"; 
            if (fLon) fLon.value = "ERROR"; 
            if (window.pendienteGuardarNoLocalizado === true) {
                window.pendienteGuardarNoLocalizado = false;
                ocultarCargando();
                alert("🛑 No se pudo obtener la georreferencia. Por favor, guarde manualmente.");
            }
        }, {
            enableHighAccuracy: true, // Forzamos máxima precisión de antenas en campo
            timeout: 10000
        });
    }

    
    // 🚀 AHORA SÍ LLEGARÁ A ESTA LÍNEA SIN ERRORES Y CAMBIARÁ LA PANTALLA
    changeScreen('screen-form');

    // Limpieza de buscadores predictivos integrados en la pantalla 4
    if (document.getElementById('f-localidad-buscar')) document.getElementById('f-localidad-buscar').value = "";
    if (document.getElementById('localidad-search-results')) document.getElementById('localidad-search-results').style.display = "none";
    if (document.getElementById('f-municipio-buscar')) document.getElementById('f-municipio-buscar').value = "";
    if (document.getElementById('municipio-search-results')) document.getElementById('municipio-search-results').style.display = "none";
    if (document.getElementById('f-colonia-buscar')) document.getElementById('f-colonia-buscar').value = "";
    if (document.getElementById('colonia-search-results')) document.getElementById('colonia-search-results').style.display = "none";
    
    setSafeValue('f-localidad', item['LOCALIDAD'] ? String(item['LOCALIDAD']).toUpperCase().trim() : "");
    setSafeValue('f-municipio', item['MUNICIPIO'] ? String(item['MUNICIPIO']).toUpperCase().trim() : "");
    setSafeValue('f-colonia', item['COLONIA'] ? String(item['COLONIA']).toUpperCase().trim() : "");

    // Carga de Expediente Digital (Miniaturas base64)
    expedienteDigitalTemporal = { 
        doc_ine_frontal: item['DOC_INE_FRONTAL'] || "", 
        doc_ine_trasera: item['DOC_INE_TRASERA'] || "", 
        doc_acta: item['DOC_ACTA'] || "", 
        doc_comprobante: item['DOC_COMPROBANTE'] || "", 
        doc_curp: item['DOC_CURP'] || "" 
    };

    const mapeoMiniaturas = [
        { id: 'preview-ine-frontal', dato: expedienteDigitalTemporal.doc_ine_frontal }, 
        { id: 'preview-ine-trasera', dato: expedienteDigitalTemporal.doc_ine_trasera },
        { id: 'preview-acta', dato: expedienteDigitalTemporal.doc_acta }, 
        { id: 'preview-comprobante', dato: expedienteDigitalTemporal.doc_comprobante },
        { id: 'preview-curp', dato: expedienteDigitalTemporal.doc_curp }
    ];

    mapeoMiniaturas.forEach(m => {
        const img = document.getElementById(m.id);
        if (img) { 
            if (m.dato) { img.src = m.dato; img.style.display = "block"; } 
            else { img.src = ""; img.style.display = "none"; } 
        }
    });
}

function procesarFotoEvidencia(inputElement, previewId, claveDocumento, wrapperId, buttonId, textoNuevo) {
    if (inputElement && inputElement.files && inputElement.files[0]) {
        const file = inputElement.files[0];
        const reader = new FileReader();
        mostrarCargando("Procesando fotografía digital...");
        
        reader.onload = function(e) {
            const imgHtml = new Image();
            imgHtml.onload = function() {
                const MAX_WIDTH = 800;
                let width = imgHtml.width;
                let height = imgHtml.height;
                if (width > MAX_WIDTH) {
                    height = Math.round((height * MAX_WIDTH) / width);
                    width = MAX_WIDTH;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(imgHtml, 0, 0, width, height);
                
                const imagenComprimidaBase64 = canvas.toDataURL('image/jpeg', 0.6);
                const imgPreview = document.getElementById(previewId);
                if (imgPreview) { imgPreview.src = imagenComprimidaBase64; imgPreview.style.display = "block"; }
                
                expedienteDigitalTemporal[claveDocumento] = imagenComprimidaBase64;
                
                const contenedor = document.getElementById(wrapperId);
                const boton = document.getElementById(buttonId);
                if (contenedor && boton) {
                    contenedor.style.backgroundColor = "#E6F4EA";
                    contenedor.style.borderColor = "#236947";
                    boton.style.backgroundColor = "#236947";
                    boton.innerText = "✓ " + textoNuevo;
                }
                setTimeout(ocultarCargando, 300);
            };
            imgHtml.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function resetearContenedoresYBotonesFotografias() {
    const listadoMapeado = [
        { wrap: 'wrapper-ine-frontal', btn: 'btn-cam-ine-frontal', txt: '🪪 Capturar INE Frontal' },
        { wrap: 'wrapper-ine-trasera', btn: 'btn-cam-ine-trasera', txt: '🪪 Capturar INE Trasera' },
        { wrap: 'wrapper-acta', btn: 'btn-cam-acta', txt: '📜 Capturar Acta de Nacimiento' },
        { wrap: 'wrapper-comprobante', btn: 'btn-cam-comprobante', txt: '🏠 Capturar Comprobante Domicilio' },
        { wrap: 'wrapper-curp', btn: 'btn-cam-curp', txt: '🆔 Capturar CURP Oficial' }
    ];
    listadoMapeado.forEach(item => {
        const c = document.getElementById(item.wrap); const b = document.getElementById(item.btn);
        if (c && b) {
            c.style.backgroundColor = "#F3F4F6"; c.style.borderColor = "#CBD5E0";
            b.style.backgroundColor = "#5A6A80"; b.innerText = item.txt;
        }
    });
}

function mostrarCargando(mensaje) {
    const loader = document.getElementById('global-loader');
    const txt = document.getElementById('loader-text');
    if (loader && txt) { txt.innerText = mensaje; loader.style.display = "flex"; }
}

function ocultarCargando() {
    const loader = document.getElementById('global-loader');
    if (loader) { loader.style.display = "none"; }
}
function saveData(event) {
    // Evita errores si la función se invoca manualmente con null
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    
    const fCurp = document.getElementById('f-curp');
    const targetCurp = fCurp ? fCurp.value.replace(/[\s\u200B-\u200D\uFEFF]/g, "").toUpperCase().trim() : "";

    
    // 🆔 VALIDACIÓN OFICIAL DE CURP (Expresión Regular de SEGOB)
    const regexCurpOficial = /^[A-Z]{4}\d{6}[HM][A-Z]{5}[A-Z\d]\d$/;
    
    if (!targetCurp || targetCurp.length !== 18) {
        alert("🛑 ERROR EN CAMPO: La CURP debe tener exactamente 18 caracteres obligatorios.");
        if (fCurp) fCurp.focus();
        return;
    }
    
    if (!regexCurpOficial.test(targetCurp)) {
        alert("🛑 ESTRUCTURA INVÁLIDA: La CURP ingresada no tiene un formato oficial válido.\n\nPor favor, revise las letras, la fecha de nacimiento o el sexo (H/M) e intente de nuevo.");
        if (fCurp) fCurp.focus();
        return;
    }

    const latValue = document.getElementById('f-lat').value; 
    const lonValue = document.getElementById('f-lon').value;
    if (latValue.includes("Buscando") || latValue === "" || latValue === "ERROR") {
        return alert("🛑 Georreferencia incompleta: Espere a que el satélite asigne coordenadas GPS antes de guardar.");
    }

    const idValue = document.getElementById('f-id').value; 
    const evaluacionTratoActual = window.currentTratoValue || "";
    if (currentEstatusVisita === "LOCALIZADO") {
        if (evaluacionTratoActual === "" || evaluacionTratoActual === "SIN_EVALUACION") {
            alert("🛑 REGLA OBLIGATORIA: Debe seleccionar una de las 5 opciones de trato.");
            changeScreen('screen-form');
            return;
        }
    }

    const memoryIndex = localMemoryDatabase.findIndex(r => r.CURP === targetCurp); 
    const originalRecord = memoryIndex !== -1 ? localMemoryDatabase[memoryIndex] : {};
    
    // Captura el número puro del cuadro de texto e inyecta el prefijo de anclaje para la Sheets
    let seccionCapturada = document.getElementById('f-seccion').value.toUpperCase().trim();
    let seccionFinalParaGuardar = seccionCapturada;

    if (seccionCapturada !== "" && !seccionCapturada.startsWith("SECCION") && !seccionCapturada.startsWith("SECCIÓN")) {
        seccionFinalParaGuardar = "SECCION " + seccionCapturada;
    }

    // Mantenemos los valores de control del select exactamente como los espera el flujo original
    const valorRecibioSalud = document.getElementById('f-recibio-salud').value;
    const valorCuantasVisitas = document.getElementById('f-cuantas-visitas').value;

    // Formateo dinámico: Pasa todo a mayúsculas estrictas antes de guardar
    const record = {
        'CURP': targetCurp,
        'ID': String(idValue).toUpperCase().trim(), 
        'NOMBRE': String(document.getElementById('f-nombre').value).toUpperCase().trim(), 
        'AP PATERNO': String(document.getElementById('f-paterno').value).toUpperCase().trim(), 
        'AP MATERNO': String(document.getElementById('f-materno').value).toUpperCase().trim(), 
        'TEL FIJO': String(document.getElementById('f-telfijo').value).toUpperCase().trim(), 
        'TEL CEL': String(document.getElementById('f-telcel').value).toUpperCase().trim(), 
        'MUNICIPIO': String(document.getElementById('f-municipio').value).toUpperCase().trim(), 
        'LOCALIDAD': String(document.getElementById('f-localidad').value).toUpperCase().trim(), 
        'SECCION': String(seccionFinalParaGuardar).toUpperCase().trim(), 
        'COLONIA': String(document.getElementById('f-colonia').value).toUpperCase().trim(), 
        'CP': String(document.getElementById('f-cp').value).toUpperCase().trim(), 
        'CALLE': String(document.getElementById('f-calle').value).toUpperCase().trim(), 
        'NUM EXT': String(document.getElementById('f-numext').value).toUpperCase().trim(), 
        'REFERENCIA': String(document.getElementById('f-referencia').value).toUpperCase().trim(), 
        'SITUACION': String(document.getElementById('f-situacion').value).toUpperCase().trim(), 
        'CAUSAL': String(document.getElementById('f-causal').value).toUpperCase().trim(), 
        'ESTATUS_VISITA': String(currentEstatusVisita).toUpperCase().trim(), 
        'MOTIVO_NO_LOCALIZADO': String(motivoNoLocalizadoValue).toUpperCase().trim(), 
        'EVALUACION_TRATO': currentEstatusVisita === "NO LOCALIZADO" ? "" : String(evaluacionTratoActual).toUpperCase().trim(), 
                // 🔥 SOLUCIÓN DEFINITIVA: Inyecta un apóstrofo "'" al inicio para obligar a Google Sheets a leerlo como texto con punto decimal
        'Latitud': "'" + String(latValue).trim(), 
        'Longitud': "'" + String(lonValue).trim(), 

        'FECHA_MODIFICACION': new Date().toLocaleString("es-MX").toUpperCase(), 
        'USUARIO_MODIFICA': String(currentUser.name).toUpperCase().trim(), 
        'SHEETS_ROW_INDEX': originalRecord.SHEETS_ROW_INDEX || "",
        
        // CORREGIDO: Valores limpios para que no se rompan las condicionales de tu formulario
        'RECIBIO_VISITA_SALUD': valorRecibioSalud,
        'CUANTAS_VISITAS_SALUD': valorCuantasVisitas,
        
        'OPINION_ATENCION_SALUD': String(document.getElementById('f-atencion-salud').value).toUpperCase().trim(),
        'MOTIVO_NO_VISITA_SALUD': String(document.getElementById('f-motivo-no-visita').value).toUpperCase().trim(),
        'DESEA_VISITA_SALUD': String(document.getElementById('f-desea-visita-futura').value).toUpperCase().trim(),

        'DOC_INE_FRONTAL': expedienteDigitalTemporal.doc_ine_frontal || originalRecord.doc_ine_frontal || originalRecord.DOC_INE_FRONTAL || "", 
        'DOC_INE_TRASERA': expedienteDigitalTemporal.doc_ine_trasera || originalRecord.doc_ine_trasera || originalRecord.DOC_INE_TRASERA || "", 
        'DOC_ACTA': expedienteDigitalTemporal.doc_acta || originalRecord.doc_acta || originalRecord.DOC_ACTA || "", 
        'DOC_COMPROBANTE': expedienteDigitalTemporal.doc_comprobante || originalRecord.doc_comprobante || originalRecord.DOC_COMPROBANTE || "", 
        'DOC_CURP': expedienteDigitalTemporal.doc_curp || originalRecord.doc_curp || originalRecord.DOC_CURP || ""
    };

    const tx = db.transaction(STORE_NAME, "readwrite"); 
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = function() {
        if (memoryIndex !== -1) localMemoryDatabase[memoryIndex] = record; else localMemoryDatabase.push(record);
        pendingSync.push(record); 
        localStorage.setItem('pendingSync', JSON.stringify(pendingSync));
        
        alert("✅ ÉXITO: Expediente guardado en el teléfono."); 
        document.getElementById('search-input').value = ""; 
        document.getElementById('search-results').innerHTML = ""; 
        changeScreen('screen-search');
    };
}


function abrirFormularioVacioAltaNueva() {
    if (!currentUser) { alert("🚨 ERROR OPERATIVO: Inicie sesión primero."); changeScreen('screen-login'); return; }
    document.getElementById('f-curp').removeAttribute('readonly'); document.getElementById('f-nombre').removeAttribute('readonly'); document.getElementById('f-paterno').removeAttribute('readonly'); document.getElementById('f-materno').removeAttribute('readonly');
    
    resetearContenedoresYBotonesFotografias();

    const inputs = ['f-curp', 'f-nombre', 'f-paterno', 'f-materno', 'f-telfijo', 'f-telcel', 'f-localidad', 'f-seccion', 'f-colonia', 'f-cp', 'f-calle', 'f-numext', 'f-referencia', 'f-causal', 'f-recibio-salud', 'f-cuantas-visitas', 'f-atencion-salud', 'f-motivo-no-visita', 'f-desea-visita-futura'];
    inputs.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('wrapper-cuantas-visitas').style.display = "none";

    let municipioAsignado = 'GOMEZ PALACIO'; if (typeof AUTHORIZED_CURPS !== 'undefined' && AUTHORIZED_CURPS[currentUser.curp]) { municipioAsignado = AUTHORIZED_CURPS[currentUser.curp].municipio || 'GOMEZ PALACIO'; }
    const fMun = document.getElementById('f-municipio'); if (fMun) fMun.value = municipioAsignado.toUpperCase().trim();
    const fId = document.getElementById('f-id'); if (fId) fId.value = 'NUEVO';
    const fSit = document.getElementById('f-situacion'); if (fSit) fSit.value = 'SIN_REGISTRO';
    currentEstatusVisita = "LOCALIZADO"; motivoNoLocalizadoValue = ""; window.currentTratoValue = ""; actualizarEstilosBotonesFormulario(); actualizarEstilosBotonesTrato();
    
    const fLat = document.getElementById('f-lat'); if (fLat) fLat.value = "Buscando satélite...";
    const fLon = document.getElementById('f-lon'); if (fLon) fLon.value = "Buscando satélite...";
    
    // 🛰️ AQUÍ ESTÁ EL CAMBIO DEL PASO 3: Apaga cualquier orden de guardado automático anterior al abrir un registro en blanco
    window.pendienteGuardarNoLocalizado = false;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => { 
            if (fLat) fLat.value = String(position.coords.latitude.toFixed(6)).replace(",", "."); 
            if (fLon) fLon.value = String(position.coords.longitude.toFixed(6)).replace(",", ".");
            
            // Si el brigadista presionó "NO LOCALIZADO" demasiado rápido en una alta nueva
            if (window.pendienteGuardarNoLocalizado === true) {
                window.pendienteGuardarNoLocalizado = false;
                ocultarCargando();
                saveData(null);
            }
        }, () => { 
            if (fLat) fLat.value = "ERROR"; if (fLon) fLon.value = "ERROR"; 
            if (window.pendienteGuardarNoLocalizado === true) {
                window.pendienteGuardarNoLocalizado = false;
                ocultarCargando();
                alert("🛑 No se pudo obtener la georreferencia. Por favor, guarde manualmente.");
            }
        }, {
            enableHighAccuracy: true,
            timeout: 10000
        });
    }
    const curpInputEl = document.getElementById('f-curp'); if (curpInputEl) { curpInputEl.removeEventListener('input', verificarCurpDuplicadaEnTiempoReal); curpInputEl.addEventListener('input', verificarCurpDuplicadaEnTiempoReal); }
    
    changeScreen('screen-form');
    
    expedienteDigitalTemporal = { doc_ine_frontal: "", doc_ine_trasera: "", doc_acta: "", doc_comprobante: "", doc_curp: "" };
    const miniaturas = ['preview-ine-frontal', 'preview-ine-trasera', 'preview-acta', 'preview-comprobante', 'preview-curp'];
    miniaturas.forEach(id => { const img = document.getElementById(id); if (img) { img.src = ""; img.style.display = "none"; } });
}

function verificarCurpDuplicadaEnTiempoReal(e) {
    const valorLimpio = e.target.value.replace(/[\s\u200B-\u200D\uFEFF]/g, "").toUpperCase(); e.target.value = valorLimpio; 
    if (valorLimpio.length === 18 && typeof localMemoryDatabase !== 'undefined') {
        const registroExistente = localMemoryDatabase.find(r => r.CURP === valorLimpio);
        if (registroExistente) {
            if (confirm(`📢 DETECTOR DE DUPLICADOS: La CURP [${valorLimpio}] ya existe (Municipio: ${registroExistente.MUNICIPIO || 'SIN MUNICIPIO'}).\n\n¿Desea cargar sus datos antiguos?`)) { alert("Cargando información..."); openForm(registroExistente); }
            else { e.target.value = ''; e.target.focus(); alert("Ingrese una CURP no registrada."); }
        }
    }
}
function openHistoryScreen() {
    changeScreen('screen-history'); 
    
    if (document.getElementById('pending-count')) {
        document.getElementById('pending-count').innerText = pendingSync.length;
    }
    
    const logList = document.getElementById('history-log'); 
    if (!logList) return;
    logList.innerHTML = ""; 

    // 1. FILTRADO ESTRICTO: Creamos un array que combina SOLO las CURPs guardadas por ti hoy
    const curpsGuardadasHoy = [
        ...pendingSync.map(p => p.CURP),
        ...syncedHistory.map(s => s.CURP)
    ];

    // Extraemos los registros reales de la memoria RAM local que coincidan con lo capturado hoy
    let visitasTuyo = localMemoryDatabase.filter(item => curpsGuardadasHoy.includes(item.CURP));

    if (visitasTuyo.length === 0) {
        logList.innerHTML = '<div style="padding:16px; text-align:center; color:#718096; font-weight:600;">📋 No tienes visitas capturadas en la memoria del teléfono hoy.</div>';
        return;
    }

    // 2. ORDENACIÓN CRÓNICA DESCENDENTE: Invertimos el array para que aparezca del ÚLTIMO guardado al PRIMERO
    visitasTuyo.reverse();

    // 3. RENDERIZADO CON SEMÁFORO IDÉNTICO AL BUSCADOR
    visitasTuyo.forEach((item) => {
        const estatusActual = item['ESTATUS_VISITA'] || "";
        const estaEnColaPendiente = pendingSync.some(p => p['CURP'] === item['CURP']);
        
        // Asignación de colores del semáforo blando
        let claseColor = "result-item";
        if (estatusActual === "LOCALIZADO") claseColor = "result-item status-localizado";
        if (estatusActual === "NO LOCALIZADO") claseColor = "result-item status-nolocalizado";

        let textoIndicador = "";
        if (estatusActual === "LOCALIZADO") {
            textoIndicador = ' <span style="color:#137333; font-weight:bold; font-size:12px; margin-left:5px;">✓ Localizado</span>';
        } else if (estatusActual === "NO LOCALIZADO") {
            textoIndicador = ' <span style="color:#C5221F; font-weight:bold; font-size:12px; margin-left:5px;">✗ No Localizado</span>';
        }

        // Insignia de Red flotante a la derecha
        let distintivoSincronizacion = estaEnColaPendiente 
            ? '<span style="float:right; background-color:#FFF3CD; color:#664D03; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700;">⏳ Pendiente</span>' 
            : '<span style="float:right; background-color:#E6F4EA; color:#137333; font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700;">☁️ Sincronizado</span>';

        const div = document.createElement('div'); 
        div.className = claseColor;
        div.innerHTML = `
            ${distintivoSincronizacion}
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
        
        // ENLACE DE EDICIÓN: Abre el formulario de la Pantalla 4 al dar clic
        div.onclick = () => openForm(item); 
        logList.appendChild(div);
    });
}

async function syncWithSheets() {
    if (pendingSync.length === 0) return alert("No tienes registros pendientes de sincronizar en este momento.");
    const confirmarSincronizacion = confirm(`🔄 TRANSMISIÓN EN CURSO: Se van a sincronizar ${pendingSync.length} registros y fotos.\n\nPor favor, no bloquees la pantalla durante el envío.`);
    if(!confirmarSincronizacion) return;
    
    mostrarCargando(`Sincronizando ${pendingSync.length} expedientes...`);

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, { 
            method: 'POST', 
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json;charset=utf-8' }, 
            body: JSON.stringify({ action: "sync", records: pendingSync }) 
        });
        
        // Pasar la cola temporal al historial permanente de sesión
        syncedHistory = syncedHistory.concat(pendingSync); 
        localStorage.setItem('syncedHistory', JSON.stringify(syncedHistory)); 
        
        // Vaciar la cola de pendientes sin alterar IndexedDB ni la RAM local
        pendingSync = []; 
        localStorage.removeItem('pendingSync'); 
        
        // Actualizar contadores métricos de la pantalla de bienvenida
        updateLocalCounter();
        ocultarCargando();
        
        // RE-RENDERIZADO SÍNCRONO: Redibuja el historial manteniendo los registros intactos para edición
        openHistoryScreen(); 
        alert("🎉 ¡ÉXITO!: Sus expedientes se han sincronizado de forma correcta."); 
    } catch (e) { 
        ocultarCargando();
        alert("🛑 Error en transmisión: Verifique que su Apps Script esté publicado correctamente o revise su conexión a internet."); 
    }
}


function downloadBackupCSV() {
    const allVisitsOfDay = pendingSync.concat(syncedHistory); 
    if (allVisitsOfDay.length === 0) return alert("No hay datos.");
    
    const headers = [
        "CURP", "ID", "NOMBRE", "AP PATERNO", "AP MATERNO", "TEL FIJO", "TEL CEL", 
        "MUNICIPIO", "LOCALIDAD", "SECCION", "COLONIA", "CP", "CALLE", "NUM EXT", 
        "REFERENCIA", "SITUACION", "CAUSAL", "ESTATUS_VISITA", "MOTIVO_NO_LOCALIZADO", "EVALUACION_TRATO",
        "Latitud", "Longitud", "FECHA_MODIFICACION", "USUARIO_MODIFICA",
        "RECIBIO_VISITA_SALUD", "CUANTAS_VISITAS_SALUD", "OPINION_ATENCION_SALUD", "MOTIVO_NO_VISITA_SALUD", "DESEA_VISITA_SALUD"
    ];
    
    let csvRows = [headers.join(",")];
    allVisitsOfDay.forEach(r => { 
        const rowValues = headers.map(h => { 
            let v = r[h] !== undefined ? String(r[h]).trim() : ""; 
            if (v.includes(",") || v.includes("\n")) { v = `"${v.replace(/"/g, '""')}"`; }
            return v; 
        });
        csvRows.push(rowValues.join(",")); 
    });
    
    const csvContent = "\ufeff" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const downloadAnchor = document.createElement('a'); 
    downloadAnchor.setAttribute("href", URL.createObjectURL(blob)); 
    downloadAnchor.setAttribute("download", `R02_Reporte_Visitas_${new Date().toISOString().slice(0, 10)}.csv`); 
    document.body.appendChild(downloadAnchor); downloadAnchor.click(); document.body.removeChild(downloadAnchor);
}

function clearLocalStorage() {
    if (confirm("🚨 ADVERTENCIA: ¿Vaciamos la memoria?")) {
        pendingSync = []; syncedHistory = []; localMemoryDatabase = []; localStorage.clear();
        if (db) { db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).clear().onsuccess = () => { document.getElementById('search-input').value = ""; document.getElementById('search-results').innerHTML = ""; alert("Limpiado."); changeScreen('screen-welcome'); }; } else { changeScreen('screen-welcome'); }
    }
}

function seleccionarTrato(opcion) { 
    window.currentTratoValue = opcion.toUpperCase(); 
    actualizarEstilosBotonesTrato(); // Cambiado a "Estilos" en español
}

function actualizarEstilosBotonesTrato() {
    const btnEx = document.getElementById('btn-trato-excelente'); 
    const btnAm = document.getElementById('btn-trato-amable'); 
    const btnNe = document.getElementById('btn-trato-neutral'); 
    const btnIn = document.getElementById('btn-trato-incomodo'); 
    const btnHo = document.getElementById('btn-trato-hostil');
    if (!btnEx || !btnAm || !btnNe || !btnIn || !btnHo) return;

    [btnEx, btnAm, btnNe, btnIn, btnHo].forEach(btn => { 
        btn.style.backgroundColor = "#F3F4F6"; btn.style.borderColor = "#CBD5E0"; btn.style.color = "#4B5563"; 
    });

    if (window.currentTratoValue === "EXCELENTE") { 
        btnEx.style.backgroundColor = "#D1E7DD"; btnEx.style.borderColor = "#0F5132"; btnEx.style.color = "#0F5132"; 
    } else if (window.currentTratoValue === "AMABLE") { 
        btnAm.style.backgroundColor = "#E6F4EA"; btnAm.style.borderColor = "#236947"; btnAm.style.color = "#236947"; 
    } else if (window.currentTratoValue === "NEUTRAL") { 
        btnNe.style.backgroundColor = "#EDF4F9"; btnNe.style.borderColor = "#BC955C"; btnNe.style.color = "#1F2937"; 
    } else if (window.currentTratoValue === "INCOMODO") { 
        btnIn.style.backgroundColor = "#FFF3CD"; btnIn.style.borderColor = "#664D03"; btnIn.style.color = "#664D03"; 
    } else if (window.currentTratoValue === "HOSTIL") { 
        btnHo.style.backgroundColor = "#FCE8E6"; btnHo.style.borderColor = "#b91c1c"; btnHo.style.color = "#b91c1c"; 
    }
}

function vincularEventosProgresoFormulario() {
    // Función desactivada de forma segura
}

function calcularPorcentajeProgresoFormulario() {
    // Función desactivada de forma segura
}

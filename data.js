/* ===========================================================================
   data.js  ·  DATOS EDITABLES A MANO
   ---------------------------------------------------------------------------
   Estudio acotado a UN corredor: Acceso Norte / camino a Valle Escondido.
   Tres niveles (sub-zonas), nada mas:
     A) Cerro crudo: Cerro 20 de Febrero / Virgen del Cerro, afuera de barrios.
     B) Barrio Privado El Portico (Acceso Norte).
     C) Club de campo La Lucinda Norte / I / II (Acceso Norte).
   X) Valle Escondido (dentro del country) entra SOLO como contraste, 1 o 2 filas.

   ALLOWLIST de zonas (lo unico que puede entrar a la tabla):
     "El Portico", "La Lucinda Norte", "La Lucinda I", "La Lucinda II",
     "Cerro 20 de Febrero", "Virgen del Cerro", "camino a Valle Escondido".
   BLOCKLIST (jamas, aunque el aviso sea lindo): Tres Cerritos, Vaqueros,
     San Lorenzo, La Caldera, Cerrillos, zona sur, aeropuerto, La Verbena,
     El Aybal, El Tipal, Grand Bourg, Las Canadas, El Capricho, La Finca,
     centro, Castanares. Si no se puede verificar que esta en A, B o C, NO va.

   Convenciones de servicios:
     agua  : 'red' | 'pozo' | 'no' | null
     luz   : 'red' (en el lote) | 'cerca' | 'no' | null
     gas   : 'natural' | 'envasado' | 'no' | null
     cloaca: true (desague cloacal REAL, leido en el cuerpo) | false | null
     titulo: 'escritura' | 'boleto' | 'posesion' | null
     pendiente: 'plano' | 'suave' | 'fuerte' | null
     acceso : 'asfalto' | 'ripio' | null
     nivel  : 'A' | 'B' | 'C' | 'X'

   REGLA DE INTEGRIDAD: el tag "Servicios: Cloacas, Gas" de Argenprop es un
   default automatico y miente. Cloaca real solo si el CUERPO del aviso lo dice.
   Lo que no se sabe va null (se muestra "s/d"), no se adivina. URLs verificadas
   (responden, sin 404) en junio 2026.
   =========================================================================== */

const DATA = {

  actualizado: "2026-06-29",

  /* MEP venta al 29-jun-2026 (InfoDolar / Cronista). Editá cuando cambie. */
  dolar: { tipo: "MEP", valor: 1510, fecha: "2026-06-29", fuente: "InfoDolar / Cronista" },

  /* ----------  BANDAS POR NIVEL (USD/m2)  ----------
     Cada nivel tiene su banda y su perfil. La tesis del costo oculto pega en A. */
  bandas: [
    { nivel:"A", tag:"Cerro crudo, sin servicios", titulo:"Tierra cruda, posesion", min:5, max:20,
      li:["Afuera de barrios, sobre el cerro","Sin servicios de red (agua + luz = costo oculto)","Posesion comun, lo mas barato","Estimacion: comps flojos"] },
    { nivel:"B", tag:"Barrio privado", titulo:"El Portico (lotes chicos)", min:50, max:75,
      li:["Agua, luz, gas y seguridad","Cloaca segun el lote","Acceso de ripio","Caro por m2: lotes de 800 a 1.150 m2"] },
    { nivel:"C", tag:"Club de campo", titulo:"La Lucinda (lotes grandes)", min:15, max:41,
      li:["Servicios completos + seguridad 24h","Escritura","Lotes de 2.500 a 4.700 m2","m2 mas barato por ser lotes grandes"] },
    { nivel:"X", tag:"Contraste, no es la zona", titulo:"Valle Escondido (country)", min:20, max:40,
      li:["Dentro del country","Cloaca + gas + amenities","Solo de referencia"] },
  ],

  /* ----------  CONSTANTES DE COSTO DE DESARROLLO (USD)  ----------
     Para la CALCULADORA. Junio 2026 (ver Fuentes). VERIFICAR = estimacion de
     orden de magnitud, pedi presupuesto local. Editá libremente. */
  costos: {
    septica:           { usd: 2200, min: 1500, max: 3000, verificar: true },
    perforacionPorM:   { usd: 100, verificar: false },
    perforacionMetros: { def: 55, min: 30, max: 80, verificar: true },
    bomba:             { usd: 800, min: 400, max: 1200, verificar: false },
    perforacionExtras: { usd: 500, verificar: true },
    aljibe:            { usd: 1300, min: 900, max: 1800, verificar: true },
    tendidoPorM:       { usd: 25, min: 15, max: 40, verificar: true },
    conexionLuz:       { usd: 350, verificar: true },
    sueloPorM2:        { plano: 0, suave: 8, fuerte: 25, verificar: true },
    sueloPlataformaM2: 200,
    construccionM2:    { usd: 1350, min: 1000, max: 1430, verificar: false },
  },

  /* ----------  HITOS DEL MAPA (coordenadas)  ----------
     Virgen y Valle Escondido verificados (OSM/GolfPass). El Portico y La Lucinda
     sobre el Acceso Norte, ubicacion de referencia del acceso. */
  coords: {
    virgen:   { lat: -24.759198, lng: -65.384452, label: "Santuario Virgen del Cerro (cerro crudo)" },
    valleEsc: { lat: -24.764967, lng: -65.355386, label: "Country Valle Escondido (contraste)" },
    portico:  { lat: -24.741500, lng: -65.398000, label: "Barrio Privado El Portico (Acceso Norte)" },
    lucinda:  { lat: -24.730000, lng: -65.404000, label: "La Lucinda Norte (Acceso Norte)" },
  },
  /* Poligono aprox. de la franja de cerro crudo (Nivel A). Referencia visual. */
  zonaObjetivo: [
    [-24.7600, -65.3835], [-24.7605, -65.3705], [-24.7680, -65.3625],
    [-24.7705, -65.3730], [-24.7660, -65.3835],
  ],

  /* ----------  COMPARABLES  ----------
     coord: ubicacion APROXIMADA dentro de la zona (los portales no publican
     lat/lng del lote). coordAprox:true lo aclara en el popup. */
  comparables: [

    /* =====  A · CERRO CRUDO  =====
       Links vivos verificados (jun-2026). El cerro crudo casi no publica precio. */
    { id:"A1", nivel:"A", objetivo:true,
      zona:"Virgen del Cerro / Cerro 20 de Febrero (camino a Valle Escondido)",
      m2:2050, usd:null,
      agua:"pozo", luz:"no", gas:"envasado", cloaca:false, titulo:"posesion",
      pendiente:"suave", acceso:"ripio",
      coord:[-24.7588,-65.3808], coordAprox:true,
      fuente:"Zonaprop (clasificado)", fecha:"2026-06", esEstimacion:true,
      url:"https://www.zonaprop.com.ar/propiedades/clasificado/veclcain-quincho-cabana-y-terreno-en-virgen-del-cerro-salta-54526172.html",
      notas:"EL LOTE OBJETIVO del cerro crudo. Ladera de la Virgen del Cerro, afuera de barrios, con quincho y cabana. Se vende o permuta por casa en macrocentro. Tierra de cerro: probable pozo/sin red, posesion. Precio a consultar. Verificar titulo y ubicacion en persona." },

    { id:"A2", nivel:"A",
      zona:"Cerro crudo con luz + agua + escritura (estimacion banda alta A)",
      m2:1000, usd:15000,
      agua:"red", luz:"cerca", gas:"envasado", cloaca:false, titulo:"escritura",
      pendiente:"suave", acceso:"ripio",
      coord:[-24.7565,-65.3770], coordAprox:true,
      fuente:"Estimacion propia", fecha:"2026-06", esEstimacion:true,
      url:"",
      notas:"Estimacion (no es un aviso): si el lote crudo ya tiene luz y agua de red y escritura, el orden es 10 a 20 USD/m2. Comps flojos." },

    { id:"A3", nivel:"A",
      zona:"Cerro crudo, posesion y servicios minimos (estimacion banda baja A)",
      m2:1000, usd:9000,
      agua:"pozo", luz:"no", gas:"envasado", cloaca:false, titulo:"posesion",
      pendiente:"fuerte", acceso:"ripio",
      coord:[-24.7548,-65.3742], coordAprox:true,
      fuente:"Estimacion propia", fecha:"2026-06", esEstimacion:true,
      url:"",
      notas:"Estimacion (no es un aviso): posesion, sin luz ni agua de red, pendiente fuerte. Orden de 5 a 12 USD/m2. Comps flojos." },

    /* =====  B · EL PORTICO  (Acceso Norte) ===== */
    { id:"B1", nivel:"B",
      zona:"El Portico, Acceso Norte (dueno directo)",
      m2:800, usd:45000,
      agua:"red", luz:"red", gas:"natural", cloaca:null, titulo:"escritura",
      pendiente:"plano", acceso:"ripio",
      coord:[-24.7414,-65.3982], coordAprox:true,
      fuente:"MercadoLibre (dueno directo)", fecha:"2026-06", esEstimacion:false,
      url:"https://terreno.mercadolibre.com.ar/MLA-1470496851-terreno-lote-barrio-el-portico-salta-acceso-norte-dueno-directo-_JM",
      notas:"56 USD/m2. Agua, luz, gas y seguridad de barrio privado. Acceso de ripio. Lote chico: caro por m2 por el tamano. Cloaca segun lote (s/d)." },

    { id:"B2", nivel:"B",
      zona:"El Portico, Acceso Norte (1.156 m2)",
      m2:1156, usd:82000,
      agua:"red", luz:"red", gas:"natural", cloaca:null, titulo:null,
      pendiente:"plano", acceso:"ripio",
      coord:[-24.7421,-65.3990], coordAprox:true,
      fuente:"Lucio Lopez Fleming", fecha:"2026-06", esEstimacion:false,
      url:"https://www.luciolopezfleming.com.ar/luciolopez-2513",
      notas:"71 USD/m2. Lote de 1.156 m2 en barrio privado. Agua, luz y gas de red (cuerpo leido). Cloaca no mencionada en el aviso. Marca 'no apto credito'. Titulo s/d." },

    { id:"B3", nivel:"B",
      zona:"El Portico, Acceso Norte (800 m2, plano)",
      m2:800, usd:null,
      agua:"red", luz:"red", gas:"natural", cloaca:null, titulo:null,
      pendiente:"plano", acceso:"ripio",
      coord:[-24.7408,-65.3975], coordAprox:true,
      fuente:"Zonaprop", fecha:"2026-06", esEstimacion:false,
      url:"https://www.zonaprop.com.ar/propiedades/venta-terreno-acceso-norte-el-portico-800-47581003.html",
      notas:"Lote de 800 m2 plano sobre la avenida del barrio. Servicios de barrio privado. 15 min del centro, 5 de la salida de la ciudad. Precio a consultar." },

    { id:"B4", nivel:"B",
      zona:"El Portico, Acceso Norte (955 m2, desague cloacal)",
      m2:955, usd:null,
      agua:"red", luz:"red", gas:"natural", cloaca:true, titulo:null,
      pendiente:"suave", acceso:"ripio",
      coord:[-24.7427,-65.3998], coordAprox:true,
      fuente:"Logros Inmob. (via Argenprop/icasas)", fecha:"2026-06", esEstimacion:false,
      url:"",
      notas:"Unico El Portico cuyo CUERPO dice 'desague cloacal' (cloaca real, no tag). Agua + luz + gas de red, acceso de ripio, vistas. Sin link directo verificable: buscar manualmente. Precio a consultar." },

    /* =====  C · LA LUCINDA (club de campo, Acceso Norte) =====
       Varios lotes del seed se dieron de baja (Coldwell 6.099, Grupo Vesta):
       reemplazados por avisos VIVOS verificados. Ningun cuerpo confirma cloaca
       (el country va con pozo/camara): cloaca = s/d, no el tag de Argenprop. */
    { id:"C1", nivel:"C",
      zona:"La Lucinda (club de campo), 4.726 m2 escriturado",
      m2:4726, usd:71000,
      agua:"red", luz:"red", gas:"natural", cloaca:null, titulo:"escritura",
      pendiente:"plano", acceso:"asfalto",
      coord:[-24.7300,-65.4040], coordAprox:true,
      fuente:"icasas / GAN Inmobiliaria", fecha:"2026-06", esEstimacion:false,
      url:"https://www.icasas.com.ar/inmueble/c40c-a368-19f023e-c2d4f28bf785-752b",
      notas:"15 USD/m2: el m2 mas barato del corredor. A 300 m del portico, sobre RN9, escriturado, agua/luz/gas de red. Subseccion (Norte/I/II) no especificada: confirmar." },

    { id:"C2", nivel:"C",
      zona:"La Lucinda I (Zona Norte), 4.048 m2",
      m2:4048, usd:65000,
      agua:"red", luz:"red", gas:"natural", cloaca:null, titulo:null,
      pendiente:"suave", acceso:"asfalto",
      coord:[-24.7308,-65.4048], coordAprox:true,
      fuente:"Coldwell Banker", fecha:"2026-06", esEstimacion:false,
      url:"https://coldwellbanker.com.ar/propiedad/terreno-en-venta-en-club-de-campo-la-lucinda-zona-norte-salta-capital--4548768",
      notas:"16 USD/m2. La Lucinda I, Zona Norte. Cuerpo: luz, agua, gas, calles pavimentadas; el terreno TIENE pendiente. Expensas ~$330.000/mes. (El seed lo tenia a 88k: bajo a 65k)." },

    { id:"C3", nivel:"C",
      zona:"La Lucinda I, 4.055 m2",
      m2:4055, usd:100000,
      agua:null, luz:null, gas:null, cloaca:null, titulo:null,
      pendiente:"plano", acceso:"asfalto",
      coord:[-24.7295,-65.4032], coordAprox:true,
      fuente:"Argenprop / Lucio Lopez Fleming", fecha:"2026-06", esEstimacion:false,
      url:"https://www.argenprop.com/terreno-en-venta-en-la-lucinda--19720547",
      notas:"25 USD/m2. La Lucinda I, sobre el camino a la salida de la ciudad. El cuerpo describe el club pero no detalla servicios (s/d)." },

    { id:"C4", nivel:"C",
      zona:"La Lucinda (club de campo), 4.000 m2 en altura",
      m2:4000, usd:100000,
      agua:"red", luz:"red", gas:"natural", cloaca:null, titulo:null,
      pendiente:"fuerte", acceso:"asfalto",
      coord:[-24.7312,-65.4052], coordAprox:true,
      fuente:"icasas / Casa Baron", fecha:"2026-06", esEstimacion:false,
      url:"https://www.icasas.com.ar/inmueble/5dc9-9442-19d35a5-2fadb7de1370-7c08",
      notas:"25 USD/m2. Lote alto con pendiente y vistas 360, frente 80 m / fondo 50 m. Servicios del club. Subseccion no especificada." },

    { id:"C5", nivel:"C",
      zona:"La Lucinda Norte (Platinum), 2.795 m2 plano",
      m2:2795, usd:80000,
      agua:"red", luz:"red", gas:"natural", cloaca:null, titulo:"escritura",
      pendiente:"plano", acceso:"asfalto",
      coord:[-24.7303,-65.4060], coordAprox:true,
      fuente:"MercadoLibre (Platinum)", fecha:"2026-06", esEstimacion:false,
      url:"https://terreno.mercadolibre.com.ar/MLA-2088195718-terreno-venta-club-de-campo-la-lucinda-norte-_JM",
      notas:"29 USD/m2. La Lucinda Norte, todo plano, todos los servicios, escritura. A minutos de UNSa/UCASAL." },

    { id:"C6", nivel:"C",
      zona:"La Lucinda, 2.800 m2 (matricula)",
      m2:2800, usd:115000,
      agua:null, luz:null, gas:null, cloaca:null, titulo:"escritura",
      pendiente:"plano", acceso:"asfalto",
      coord:[-24.7290,-65.4055], coordAprox:true,
      fuente:"Argenprop (Casiana Severio)", fecha:"2026-06", esEstimacion:false,
      url:"https://www.argenprop.com/terreno-en-venta-en-la-lucinda--17965998",
      notas:"41 USD/m2: el mas caro por m2 del nivel C. Matricula 125, sujeto a Reg.2371/COTI (indicios de escritura). Subseccion (Norte/I/II) no especificada." },

    /* =====  X · CONTRASTE (Valle Escondido, dentro del country) ===== */
    { id:"X1", nivel:"X",
      zona:"Valle Escondido (country), cloaca confirmada",
      m2:2560, usd:89600,
      agua:"red", luz:"red", gas:"natural", cloaca:true, titulo:"escritura",
      pendiente:"plano", acceso:"asfalto",
      coord:[-24.7641,-65.3548], coordAprox:true,
      fuente:"Argenprop", fecha:"2026-06", esEstimacion:false,
      url:"https://www.argenprop.com/terreno-en-venta-en-valle-escondido--19731883",
      notas:"CONTRASTE, no es la zona objetivo. El cuerpo dice: agua corriente, cloacas, electricidad, gas natural, fibra optica. 35 USD/m2." },

    { id:"X2", nivel:"X",
      zona:"Valle Escondido (club de campo), 3.683 m2",
      m2:3683, usd:82000,
      agua:null, luz:"red", gas:"natural", cloaca:null, titulo:null,
      pendiente:"plano", acceso:"asfalto",
      coord:[-24.7662,-65.3540], coordAprox:true,
      fuente:"icasas", fecha:"2026-06", esEstimacion:false,
      url:"https://www.icasas.com.ar/inmueble/ecb0-bc43-62bd0fc7-28b77e449631-32e3",
      notas:"CONTRASTE. Gas natural, alumbrado, seguridad 24h, club house, golf, tenis. 22 USD/m2." },
  ],

  /* ----------  PROS Y CONTRAS POR NIVEL  ---------- */
  proscontras: [
    { nivel:"A", titulo:"A · Cerro crudo",
      pros:["Lo mas barato por m2 si es posesion","Vistas abiertas a la ciudad y el cerro","Lote grande posible","Naturaleza y silencio"],
      contras:["Sin servicios: agua y luz son un costo oculto fuerte","Posesion comun: riesgo de titulo","Acceso de ripio y pendiente","Cerca del santuario: trafico de peregrinacion los sabados"] },
    { nivel:"B", titulo:"B · El Portico",
      pros:["Agua, luz, gas y seguridad ya resueltos","Algunos lotes con desague cloacal","Barrio privado, entrada controlada","A 10 a 15 min del centro"],
      contras:["Lotes chicos: caro por m2 (~56 USD/m2)","Acceso de ripio","Expensas del barrio","Menos privacidad que un lote grande"] },
    { nivel:"C", titulo:"C · La Lucinda",
      pros:["Servicios completos + seguridad 24h","Escritura, titulo limpio","Lotes grandes: m2 mas barato del corredor","Plano, listo para construir"],
      contras:["Ticket total alto (lotes de 2.500 a 6.100 m2)","Expensas de club de campo","Reglamento de construccion del barrio","Mas lejos del centro que Tres Cerritos"] },
  ],

  /* ----------  NORMATIVA / FACTIBILIDAD  ----------
     Sin ordenanzas firmes online para la ladera: queda como guia + TODOs con la
     oficina concreta a llamar. Completá cuando confirmes en la reparticion. */
  normativa: [
    { tema:"Uso de suelo y zonificacion (FOS, FOT, altura, retiros)", estado:"todo",
      texto:"El Codigo de Planeamiento Urbano Ambiental de la Municipalidad de Salta fija indicadores por zona. En el cerro crudo pueden aplicar zonas de preservacion o restriccion de pendiente. En El Portico y La Lucinda manda el reglamento interno del barrio.",
      consultar:"Direccion General de Obras Particulares, Municipalidad de Salta (por nro de catastro) y la administracion del barrio en B y C." },
    { tema:"Restriccion por pendiente / preservacion de cerros (Nivel A)", estado:"todo",
      texto:"Construir en ladera suele exigir estudio de suelo y muro de contencion, y puede limitar el FOS. Verificar si el lote cae en area de preservacion de cerros.",
      consultar:"Subsecretaria de Ambiente municipal + Obras Particulares." },
    { tema:"Factibilidad de AGUA (Nivel A)", estado:"todo",
      texto:"En el cerro crudo no hay red: se resuelve con perforacion o cisterna. En El Portico y La Lucinda el agua ya viene del barrio.",
      consultar:"Aguas del Norte (Co.S.A.Ya), area Factibilidad, para el cerro crudo." },
    { tema:"Factibilidad de LUZ (Nivel A)", estado:"todo",
      texto:"Si el lote crudo no esta bajo red, la extension desde el ultimo poste la paga el solicitante; si requiere transformador, el costo se dispara. Pedir la distancia real al ultimo poste.",
      consultar:"EDESA, area Factibilidad / Nuevos Suministros." },
    { tema:"Titulo: posesion vs escritura", estado:"todo",
      texto:"En el cerro crudo abunda la posesion (riesgo de titulo). El Portico y La Lucinda se venden con escritura. Pedir matricula y estado de dominio.",
      consultar:"Escribania de confianza + Direccion General de Inmuebles de Salta." },
    { tema:"Restricciones por cercania al Santuario (Nivel A)", estado:"todo",
      texto:"Zona de peregrinacion los sabados, con afluencia y cortes. Verificar si hay ordenanza de uso de suelo o restriccion especifica por cercania al santuario.",
      consultar:"Municipalidad de Salta (Obras Particulares) y centro vecinal de la zona." },
  ],

  /* ----------  CHECKLIST DE VISITA (imprimible)  ---------- */
  checklist: [
    "Confirmar que el lote esta en El Portico, La Lucinda o el cerro crudo (no otra zona).",
    "Pedir matricula / escritura y estado de dominio (ojo posesion en el cerro crudo).",
    "Servicios reales del lote: agua de red o pozo, luz en el lote o al poste, gas natural o envasado, cloaca.",
    "En el cerro crudo: distancia al ultimo poste de luz y factibilidad de agua (perforacion a que profundidad).",
    "Pendiente y necesidad de muro de contencion / movimiento de suelo.",
    "Tipo de acceso: asfalto o ripio, transitable con lluvia.",
    "Expensas del barrio (B y C) y reglamento interno de construccion.",
    "Normativa municipal: uso de suelo, FOS / FOT, altura y retiros por catastro.",
    "Deudas e impuestos: inmobiliario, tasas, expensas atrasadas.",
    "Servidumbres de paso, electroducto o agua sobre el lote.",
  ],

  /* ----------  GALERIA  ---------- */
  galeria: [
    { src:"assets/virgen-del-cerro.jpg", alt:"Santuario de la Virgen del Cerro, Cerro 20 de Febrero, Salta", rotulo:"Virgen del Cerro (Nivel A)" },
    { src:"assets/cerro-ciudad.jpg",     alt:"Vista de la ciudad de Salta desde el cerro",                    rotulo:"Ciudad desde el cerro" },
    { src:"assets/tres-cerritos.jpg",    alt:"Imagen de la Virgen del Cerro, Salta",                          rotulo:"Virgen del Cerro" },
    { src:"assets/cerros-salta.jpg",     alt:"Panoramica de Salta desde la cima del cerro San Bernardo",      rotulo:"Salta desde el cerro" },
    { src:"assets/valle-vista.jpg",      alt:"Vista panoramica de la ciudad de Salta y el valle de Lerma",    rotulo:"Panoramica de Salta" },
    { src:"assets/camino-cerro.jpg",     alt:"Camino subiendo el cerro hacia la Virgen / Valle Escondido",    rotulo:"Camino al cerro" },
  ],

  /* ----------  FUENTES  ---------- */
  fuentes: [
    { txt:"MercadoLibre: terreno en Barrio El Portico, Acceso Norte (dueno directo)", url:"https://terreno.mercadolibre.com.ar/MLA-1470496851-terreno-lote-barrio-el-portico-salta-acceso-norte-dueno-directo-_JM", fecha:"2026-06" },
    { txt:"Argenprop: terrenos en El Portico, Salta", url:"https://www.argenprop.com/terrenos/venta/el-portico-salta", fecha:"2026-06" },
    { txt:"Nuroa: terrenos en El Portico, Salta", url:"https://www.nuroa.com.ar/venta/terreno-el-portico-salta", fecha:"2026-06" },
    { txt:"Argenprop: terrenos en La Lucinda, Salta", url:"https://www.argenprop.com/terrenos/venta/la-lucinda-salta", fecha:"2026-06" },
    { txt:"icasas: terrenos en La Lucinda, Salta", url:"https://www.icasas.com.ar/venta/terrenos/salta/la-lucinda", fecha:"2026-06" },
    { txt:"Nuroa: lote sobre Cerro 20 de Febrero, camino a Valle Escondido (cerro crudo)", url:"https://www.nuroa.com.ar/venta/terreno-valle-escondido-salta", fecha:"2026-06" },
    { txt:"Argenprop: Valle Escondido, cloaca confirmada en el cuerpo (contraste)", url:"https://www.argenprop.com/terreno-en-venta-en-valle-escondido--19731883", fecha:"2026-06" },
    { txt:"icasas: Valle Escondido club de campo (contraste)", url:"https://www.icasas.com.ar/inmueble/ecb0-bc43-62bd0fc7-28b77e449631-32e3", fecha:"2026-06" },
    { txt:"Perforaciones de agua, precios 2026 (GranPerforista): USD ~100/m", url:"https://granperforista.ar/agua/pozos-de-agua/perforaciones/precios/", fecha:"2026-06" },
    { txt:"EDESA: requisitos de nuevos suministros electricos", url:"https://www.edesa.com.ar/wp-content/uploads/2023/11/Requisitos-NNSS-y-Reconexiones-.pdf", fecha:"2026-06" },
    { txt:"Costo de construccion en Salta, mayo 2026 (Que Pasa Salta)", url:"https://www.quepasasalta.com.ar/salta/cuanto-sale-construir-una-casa-en-salta-en-mayo-2026/", fecha:"2026-06" },
    { txt:"Dolar MEP / blue al 29-jun-2026 (InfoDolar)", url:"https://www.infodolar.com/", fecha:"2026-06-29" },
    { txt:"Fotos: Wikimedia Commons (CC0 / CC BY / CC BY-SA), santuario y vistas de Salta", url:"https://commons.wikimedia.org/wiki/Category:Salta", fecha:"2026-06" },
  ],
};

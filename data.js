/* ===========================================================================
   data.js  ·  DATOS EDITABLES A MANO
   ---------------------------------------------------------------------------
   Todo lo que la página muestra sale de este archivo. Editá los valores acá
   y recargá. No hay build ni base de datos: es JS plano.

   Convenciones de servicios (leelas antes de cargar un comparable):
     agua  : 'red'  (agua corriente de red)
             'pozo' (perforación, aljibe o cisterna, NO hay red)
             'no'   (sin solución de agua)
             null   (s/d, no sabemos)
     luz   : 'red'  (con conexión / red en el lote)
             'cerca'(red pasa cerca, falta extender)
             'no'   (sin luz, lejos de la red)
             null   (s/d)
     gas   : 'natural' (gas natural de red)
             'envasado'(garrafa o zeppelin)
             'no' | null
     cloaca: true (desague cloacal REAL, leido en el cuerpo del aviso)
             false (sin cloaca, pozo septico)
             null  (s/d)
     titulo: 'escritura' | 'boleto' | 'posesion' | null
     pendiente: 'plano' | 'suave' | 'fuerte' | null  (inferido si no se aclara)
     acceso : 'asfalto' | 'ripio' | null
     sector : 'cerro'  (ZONA OBJETIVO, afuera del country)
              'country'(CONTRASTE: countries o barrio consolidado con servicios)

   REGLA DE INTEGRIDAD: la etiqueta "Servicios: Cloacas, Gas" de Argenprop es un
   default automatico y miente. Nunca se usa como dato. Cloaca real solo si el
   CUERPO del aviso dice "desague cloacal" o "cloacas". Si dice "agua de pozo" o
   "gas envasado", entonces cloaca=false y agua='pozo'. Lo que no se sabe va null
   (se muestra "s/d"), no se adivina. No hay avisos ni links inventados: todos los
   url fueron verificados (responden, ninguno 404) en junio 2026.
   =========================================================================== */

const DATA = {

  /* Ultima actualizacion real del dataset (se muestra en el hero). */
  actualizado: "2026-06-29",

  /* ----------  DOLAR (para mostrar precios tambien en ARS)  ----------
     MEP venta al 29-jun-2026. Fuente: InfoDolar / Cronista. El blue estaba
     casi igual ($1.510). Editá el numero y la fecha cuando cambie. Los ARS
     son orientativos: una operacion se pesifica al cambio del dia de la sena. */
  dolar: { tipo: "MEP", valor: 1510, fecha: "2026-06-29", fuente: "InfoDolar / Cronista" },

  /* ----------  BANDAS DE PRECIO (USD/m2)  ----------
     Se usan en las tarjetas de resumen y en el veredicto de la calculadora. */
  bandas: {
    country:        { min: 20, max: 40, label: "Dentro del country (contraste)" },
    cerroServicios: { min: 10, max: 20, label: "Cerro con servicios (objetivo)" },
    cerroPosesion:  { min: 5,  max: 12, label: "Cerro posesion / boleto" },
  },

  /* ----------  CONSTANTES DE COSTO DE DESARROLLO (USD)  ----------
     Para la CALCULADORA. Valores defendibles a junio 2026 (ver Fuentes).
     Los marcados VERIFICAR son estimaciones de orden de magnitud: pedí 1 o 2
     presupuestos locales antes de cerrar numeros. Editalos libremente. */
  costos: {
    // Camara septica + pozo absorbente, instalacion completa (no solo el componente).
    // Componente de hormigon ~USD 107; biodigestor ~USD 1.960. Instalacion total estimada.
    septica:           { usd: 2200, min: 1500, max: 3000, verificar: true },

    // Perforacion de agua: USD por metro de profundidad. Dato firme (GranPerforista 2026).
    perforacionPorM:   { usd: 100, verificar: false },
    // Profundidad de napa tipica en cerro/Salta: NO hay dato firme. Estimacion.
    perforacionMetros: { def: 55, min: 30, max: 80, verificar: true },
    // Bomba sumergible.
    bomba:             { usd: 800, min: 400, max: 1200, verificar: false },
    // Estudio geoelectrico + permisos provinciales (se suma una vez si se perfora).
    perforacionExtras: { usd: 500, verificar: true },

    // Alternativa al pozo: cisterna/aljibe 5.000 L enterrada + instalacion.
    aljibe:            { usd: 1300, min: 900, max: 1800, verificar: true },

    // Tendido electrico desde el ultimo poste: USD por metro de extension de red
    // de baja tension (poste + conductor + mano de obra). Estimacion de orden de
    // magnitud; si requiere transformador puede irse a USD 10.000+. VERIFICAR con
    // EDESA Factibilidad. Vano tipico entre postes ~30 a 40 m.
    tendidoPorM:       { usd: 25, min: 15, max: 40, verificar: true },
    // Cargo base de conexion + medidor + tablero (se suma una vez si hay que traer luz).
    conexionLuz:       { usd: 350, verificar: true },

    // Movimiento de suelo / nivelacion / muro de contencion, USD por m2, segun
    // pendiente. OJO: se aplica sobre la PLATAFORMA a construir/nivelar, NO sobre
    // todo el lote (no se nivela una hectarea para una casa). Referencias
    // internacionales convertidas a orden de magnitud. En cerro con roca, ir al
    // extremo alto. VERIFICAR con empresa de movimiento de suelo local.
    sueloPorM2: { plano: 0, suave: 8, fuerte: 25, verificar: true },
    // Superficie tipica de plataforma (huella de casa + accesos) sobre la que se
    // calcula el movimiento de suelo. Editala segun lo que pienses construir.
    sueloPlataformaM2: 200,

    // Referencia general (NO entra al calculo): costo de construir, USD/m2.
    construccionM2:    { usd: 1350, min: 1000, max: 1430, verificar: false },
  },

  /* ----------  COORDENADAS FIJAS DEL MAPA  ----------
     Verificadas contra OpenStreetMap/Nominatim y GolfPass. */
  coords: {
    virgen:  { lat: -24.759198, lng: -65.384452, label: "Santuario Virgen del Cerro" },
    country: { lat: -24.764967, lng: -65.355386, label: "Country Valle Escondido (golf)" },
    tresC:   { lat: -24.768420, lng: -65.392610, label: "Barrio Tres Cerritos (centro)" },
  },
  /* Poligono aprox. de la zona objetivo: la ladera AFUERA del country, entre
     Tres Cerritos / la Virgen y el acceso a Valle Escondido. Referencia visual,
     no un limite catastral. Ajustá los vertices a mano si conocés los reales. */
  zonaObjetivo: [
    [-24.7600, -65.3835], [-24.7605, -65.3705], [-24.7680, -65.3625],
    [-24.7705, -65.3730], [-24.7660, -65.3835],
  ],

  /* ----------  COMPARABLES  ----------
     coord: ubicacion APROXIMADA del aviso (los portales no publican lat/lng).
     Los pines del cerro estan colocados por sector sobre la ladera; los del
     country cerca del acceso. coordAprox:true lo aclara en el popup. */
  comparables: [

    /* =====  ZONA OBJETIVO  ·  cerro, afuera del country  ===== */

    { id: "L1", objetivo: true,
      zona: "Cerro 20 de Febrero, camino a Valle Escondido",
      calle: "Cerca de la Virgen del Cerro (sin numeracion, camino de tierra)",
      m2: 2050, usd: null,
      agua: "pozo", luz: "no", gas: "envasado", cloaca: false, titulo: "posesion",
      pendiente: "suave", acceso: "ripio",
      sector: "cerro", esEstimacion: false,
      coord: [-24.7588, -65.3808], coordAprox: true,
      fuente: "Zonaprop / Nuroa", fecha: "2026-06",
      url: "https://www.nuroa.com.ar/venta/terreno-valle-escondido-salta",
      notas: "EL LOTE OBJETIVO. Afuera del country, ladera con vista a la ciudad y al cerro. Agua de cisterna, luz solar (sin red), gas envasado, camino de tierra. Incluye quincho y 3 modulos. Precio a consultar (Alianza / Nikin). OJO: un portal lo ubica en La Isla / Cerrillos: verificar ubicacion y titulo en persona." },

    { id: "L2",
      zona: "Tres Cerritos alto / ladera del cerro",
      calle: "Los Juncos al 1100",
      m2: 430, usd: null,
      agua: null, luz: null, gas: null, cloaca: false, titulo: "escritura",
      pendiente: "fuerte", acceso: null,
      sector: "cerro", esEstimacion: true,
      coord: [-24.7636, -65.3884], coordAprox: true,
      fuente: "Argenprop / icasas", fecha: "2026-06",
      url: "https://www.icasas.com.ar/venta/terrenos/salta/tres-cerritos",
      notas: "Falda del cerro, ~22 m de frente, vista panoramica. Documentacion lista para escriturar. Sin precio publicado; servicios s/d." },

    { id: "L3",
      zona: "Tres Cerritos, zona elevada / ladera (vista al valle)",
      calle: "s/d",
      m2: 814, usd: 150000,
      agua: null, luz: null, gas: null, cloaca: false, titulo: "escritura",
      pendiente: "fuerte", acceso: null,
      sector: "cerro", esEstimacion: false,
      coord: [-24.7622, -65.3858], coordAprox: true,
      fuente: "icasas", fecha: "2026-06",
      url: "https://www.icasas.com.ar/inmueble/1200-971c-198c6cc-54dc69877776-7dca",
      notas: "Pendiente, vistas abiertas al valle, 38x21 m. ~184 USD/m2: caro, lo paga la vista. Servicios no especificados." },

    { id: "L4",
      zona: "Vaqueros (rural, sin servicios de red)",
      calle: "A 150 m de ruta, zona norte",
      m2: 1067, usd: 45000,
      agua: "pozo", luz: "red", gas: "envasado", cloaca: false, titulo: "posesion",
      pendiente: "plano", acceso: "ripio",
      sector: "cerro", esEstimacion: false,
      coord: [-24.6945, -65.4095], coordAprox: true,
      fuente: "icasas", fecha: "2026-06",
      url: "https://www.icasas.com.ar/inmueble/76eb-be63-19d3362-37584e1ad9-7ac7",
      notas: "Lote rural fuera de country (Vaqueros, mas al norte). Agua de pozo, en subdivision catastral (sin titulo individual aun). ~42 USD/m2. Referencia de tierra sin red." },

    { id: "L5",
      zona: "Loteo Mirador Oeste (falda)",
      calle: "Grand Bourg / Tres Cerritos oeste",
      m2: 400, usd: 45000,
      agua: null, luz: null, gas: null, cloaca: false, titulo: null,
      pendiente: "suave", acceso: null,
      sector: "cerro", esEstimacion: true,
      coord: [-24.7775, -65.4285], coordAprox: true,
      fuente: "icasas / Adinco", fecha: "2026-06",
      url: "https://www.icasas.com.ar/inmueble/db88-8da4-19715d4-645d407e2d2a-721f",
      notas: "Loteo en pendiente sobre la falda oeste. ~113 USD/m2. Confirmar servicios y titulo en el cuerpo del aviso." },

    { id: "L6",
      zona: "Cerro, sector alto (estimacion banda baja)",
      calle: "Referencia, no es un aviso puntual",
      m2: 1000, usd: 9000,
      agua: "pozo", luz: "no", gas: "envasado", cloaca: false, titulo: "posesion",
      pendiente: "fuerte", acceso: "ripio",
      sector: "cerro", esEstimacion: true,
      coord: [-24.7560, -65.3760], coordAprox: true,
      fuente: "Estimacion propia", fecha: "2026-06",
      url: "",
      notas: "Banda baja orientativa: orden de USD 5 a 12/m2. Posesion / boleto, sin luz ni agua de red, pendiente fuerte." },

    /* =====  CONTRASTE  ·  countries / barrio con servicios de red  ===== */

    { id: "C1",
      zona: "Valle Escondido (country): cloaca CONFIRMADA en el texto",
      calle: "Interior del barrio cerrado",
      m2: 2560, usd: 89600,
      agua: "red", luz: "red", gas: "natural", cloaca: true, titulo: "escritura",
      pendiente: "plano", acceso: "asfalto",
      sector: "country", esEstimacion: false,
      coord: [-24.7641, -65.3548], coordAprox: true,
      fuente: "Argenprop", fecha: "2026-06",
      url: "https://www.argenprop.com/terreno-en-venta-en-valle-escondido--19731883",
      notas: "El cuerpo dice textual: 'agua corriente, cloacas, electricidad, gas natural, fibra optica'. Cloaca REAL, no tag. ~35 USD/m2. Apto credito." },

    { id: "C2",
      zona: "Valle Escondido (country): todos los servicios + amenities",
      calle: "Interior del barrio cerrado",
      m2: 2525, usd: 140000,
      agua: "red", luz: "red", gas: "natural", cloaca: null, titulo: "escritura",
      pendiente: "plano", acceso: "asfalto",
      sector: "country", esEstimacion: false,
      coord: [-24.7655, -65.3560], coordAprox: true,
      fuente: "Argenprop", fecha: "2026-06",
      url: "https://www.argenprop.com/terreno-en-venta-en-valle-escondido--17299103",
      notas: "Lote 100% plano, golf / tenis / gym, 10' del centro, escritura inmediata. ~55 USD/m2 (premium)." },

    { id: "C3",
      zona: "Valle Escondido (club de campo), 3.683 m2",
      calle: "Interior del club de campo",
      m2: 3683, usd: 82000,
      agua: null, luz: "red", gas: "natural", cloaca: null, titulo: null,
      pendiente: "plano", acceso: "asfalto",
      sector: "country", esEstimacion: false,
      coord: [-24.7662, -65.3540], coordAprox: true,
      fuente: "icasas", fecha: "2026-06",
      url: "https://www.icasas.com.ar/inmueble/ecb0-bc43-62bd0fc7-28b77e449631-32e3",
      notas: "Gas natural, alumbrado, seguridad 24h, club house, golf, tenis. ~22 USD/m2. Cloaca / agua no detallados." },

    { id: "C4",
      zona: "Country El Encon (zona Valle Escondido), 2.095 m2",
      calle: "Interior del country gated",
      m2: 2095, usd: 42000,
      agua: "red", luz: "red", gas: "natural", cloaca: null, titulo: "escritura",
      pendiente: "plano", acceso: "asfalto",
      sector: "country", esEstimacion: false,
      coord: [-24.7628, -65.3568], coordAprox: true,
      fuente: "icasas", fecha: "2026-06",
      url: "https://www.icasas.com.ar/inmueble/b411-b63e-19bb64a-3333c884e130-7e20",
      notas: "Country gated. Luz / gas / agua de red, listo para escriturar. ~20 USD/m2. Cloaca no especificada." },

    { id: "C5",
      zona: "Country Capiasu (camino San Agustin), 2.538 m2",
      calle: "Ruta Provincial 26, a 13 km de Salta",
      m2: 2538, usd: 30000,
      agua: null, luz: "red", gas: null, cloaca: false, titulo: "boleto",
      pendiente: "plano", acceso: "asfalto",
      sector: "country", esEstimacion: false,
      coord: [-24.7690, -65.3500], coordAprox: true,
      fuente: "icasas", fecha: "2026-06",
      url: "https://www.icasas.com.ar/inmueble/7499-b576-292a988-bb4194ecc883-3b12",
      notas: "Country economico, asfalto a 13 km. ~12 USD/m2. Se transfiere por boleto. Gas / cloaca no mencionados." },

    { id: "C6",
      zona: "Tres Cerritos consolidado: todos los servicios + cloaca",
      calle: "Ex Gob. Biella, entre Av. Los Molles y Los Canelos",
      m2: 583, usd: 105000,
      agua: "red", luz: "red", gas: "natural", cloaca: true, titulo: null,
      pendiente: "plano", acceso: "asfalto",
      sector: "country", esEstimacion: false,
      coord: [-24.7662, -65.3905], coordAprox: true,
      fuente: "Argenprop", fecha: "2026-06",
      url: "https://www.argenprop.com/terreno-en-venta-en-barrio-tres-cerritos--10317213",
      notas: "Barrio urbano consolidado (no el cerro abierto). Agua / luz / gas / cloacas + pavimento, hermosa vista. ~180 USD/m2. Muestra el techo: lote chico con todo cuesta caro por m2." },
  ],

  /* ----------  PROS Y CONTRAS  ---------- */
  pros: [
    "Vistas abiertas a la ciudad y los cerros.",
    "A 10 a 15 min del centro de Salta.",
    "Naturaleza y tranquilidad.",
    "Precio de tierra bajo frente a barrios consolidados.",
    "Potencial de revalorizacion.",
    "Posibilidad de lotes grandes.",
  ],
  contras: [
    "Sin cloaca: pozo septico obligado (igual, es lo normal aca).",
    "Agua de pozo y gas envasado suben el costo de desarrollo.",
    "Acceso a veces de ripio y con pendiente fuerte.",
    "Mucho lote en posesion / boleto y no escritura: riesgo de titulo.",
    "Posibles restricciones de construccion por zona de cerro y cercania al santuario.",
    "Trafico de peregrinacion los sabados a la Virgen del Cerro.",
  ],

  /* ----------  NORMATIVA / FACTIBILIDAD  ----------
     La investigacion automatica no devolvio ordenanzas firmes para la ladera,
     asi que esto queda como guia + TODOs con la oficina concreta a llamar.
     Completá cada item cuando confirmes en la reparticion. */
  normativa: [
    { tema: "Uso de suelo y zonificacion (FOS, FOT, altura, retiros)",
      estado: "todo",
      texto: "El Codigo de Planeamiento Urbano Ambiental de la Municipalidad de Salta fija indicadores por zona (FOS, FOT, altura, retiros). Para la ladera del cerro pueden aplicar zonas de preservacion o restriccion de pendiente.",
      consultar: "Direccion General de Obras Particulares / Secretaria de Obras Publicas y Planeamiento, Municipalidad de Salta. Pedir la zonificacion por nro de catastro del lote." },
    { tema: "Restriccion por pendiente / preservacion de cerros",
      estado: "todo",
      texto: "Construir en ladera suele exigir estudio de suelo, muro de contencion y a veces limita el FOS. Verificar si el lote cae en area de preservacion de cerros.",
      consultar: "Subsecretaria de Ambiente municipal + Obras Particulares. Pedir factibilidad de construccion por catastro." },
    { tema: "Factibilidad de AGUA",
      estado: "todo",
      texto: "Si no hay red, se resuelve con perforacion o cisterna. Confirmar si Aguas del Norte presta servicio sobre el camino al cerro o hasta donde llega la red.",
      consultar: "Aguas del Norte (Co.S.A.Ya), area Factibilidad. Pedir factibilidad de conexion por direccion / catastro." },
    { tema: "Factibilidad de LUZ",
      estado: "todo",
      texto: "Si el lote no esta bajo red, la extension desde el ultimo poste la paga el solicitante; si requiere transformador, el costo se dispara. Pedir la distancia real al ultimo poste.",
      consultar: "EDESA, area Factibilidad / Nuevos Suministros. Tramite de nuevo suministro requiere habilitacion electrica municipal, plano y nro de catastro." },
    { tema: "Factibilidad de GAS",
      estado: "todo",
      texto: "En zona de cerro lo normal es gas envasado (garrafa o zeppelin). Confirmar si hay red de gas natural sobre el camino.",
      consultar: "Gasnor, area Factibilidad / nuevas conexiones." },
    { tema: "Restricciones por cercania al Santuario de la Virgen del Cerro",
      estado: "todo",
      texto: "Zona de peregrinacion los sabados, con corte y afluencia de gente. Verificar si hay ordenanza de uso de suelo o restriccion especifica por cercania al santuario.",
      consultar: "Municipalidad de Salta (Obras Particulares) y Centro Vecinal de la zona." },
  ],

  /* ----------  CHECKLIST DE VISITA (imprimible)  ---------- */
  checklist: [
    "Pedir la matricula / escritura y verificar titularidad (no boleto ni posesion sin respaldo).",
    "Medir la distancia real al ultimo poste de luz (define el costo de tendido).",
    "Factibilidad de agua: hay red? aljibe? perforacion: a que profundidad estimada?",
    "Evaluar la pendiente y si hace falta muro de contencion / movimiento de suelo.",
    "Tipo de acceso: asfalto o ripio? Es transitable con lluvia?",
    "Normativa municipal: uso de suelo, FOS / FOT, altura y retiros por catastro.",
    "Restricciones por cercania al santuario (cortes, afluencia los sabados).",
    "Deudas e impuestos: inmobiliario, tasas, expensas si aplica.",
    "Servidumbres de paso, de electroducto o de agua sobre el lote.",
    "Orientacion, asoleamiento y exposicion al viento del lote.",
  ],

  /* ----------  GALERIA  ---------- */
  galeria: [
    { src: "assets/virgen-del-cerro.jpg", alt: "Santuario de la Virgen del Cerro, Cerro 20 de Febrero, Salta", rotulo: "Virgen del Cerro" },
    { src: "assets/cerro-ciudad.jpg",     alt: "Vista de la ciudad de Salta desde el cerro",                    rotulo: "Ciudad desde el cerro" },
    { src: "assets/tres-cerritos.jpg",    alt: "Imagen de la Virgen del Cerro, barrio Tres Cerritos, Salta",    rotulo: "Virgen, Tres Cerritos" },
    { src: "assets/cerros-salta.jpg",     alt: "Panoramica de Salta desde la cima del cerro San Bernardo",      rotulo: "Salta desde el cerro" },
    { src: "assets/valle-vista.jpg",      alt: "Vista panoramica de la ciudad de Salta y el valle de Lerma",    rotulo: "Panoramica de Salta" },
    { src: "assets/camino-cerro.jpg",     alt: "Camino subiendo el cerro hacia la Virgen / Valle Escondido",    rotulo: "Camino al cerro" },
  ],

  /* ----------  FUENTES  ---------- */
  fuentes: [
    { txt: "Nuroa: lote sobre Cerro 20 de Febrero, camino a Valle Escondido (lote objetivo)", url: "https://www.nuroa.com.ar/venta/terreno-valle-escondido-salta", fecha: "2026-06" },
    { txt: "Zonaprop: quincho / cabana y terreno 'Virgen del Cerro' (verificar ubicacion real)", url: "https://www.zonaprop.com.ar/propiedades/clasificado/veclcain-quincho-cabana-y-terreno-en-virgen-del-cerro-salta-54526172.html", fecha: "2026-06" },
    { txt: "icasas: terreno en ladera de Tres Cerritos, 814 m2 con vista", url: "https://www.icasas.com.ar/inmueble/1200-971c-198c6cc-54dc69877776-7dca", fecha: "2026-06" },
    { txt: "icasas: lote rural en Vaqueros, agua de pozo (referencia sin red)", url: "https://www.icasas.com.ar/inmueble/76eb-be63-19d3362-37584e1ad9-7ac7", fecha: "2026-06" },
    { txt: "icasas: Loteo Mirador Oeste (falda Grand Bourg / Tres Cerritos)", url: "https://www.icasas.com.ar/inmueble/db88-8da4-19715d4-645d407e2d2a-721f", fecha: "2026-06" },
    { txt: "Argenprop: Valle Escondido, cloaca CONFIRMADA en el cuerpo (~35 USD/m2)", url: "https://www.argenprop.com/terreno-en-venta-en-valle-escondido--19731883", fecha: "2026-06" },
    { txt: "Argenprop: Valle Escondido, todos los servicios + amenities (~55 USD/m2)", url: "https://www.argenprop.com/terreno-en-venta-en-valle-escondido--17299103", fecha: "2026-06" },
    { txt: "Argenprop: Tres Cerritos consolidado, todos los servicios (Ex Gob. Biella)", url: "https://www.argenprop.com/terreno-en-venta-en-barrio-tres-cerritos--10317213", fecha: "2026-06" },
    { txt: "icasas: Country Valle Escondido club, 3.683 m2", url: "https://www.icasas.com.ar/inmueble/ecb0-bc43-62bd0fc7-28b77e449631-32e3", fecha: "2026-06" },
    { txt: "icasas: Country El Encon, 2.095 m2", url: "https://www.icasas.com.ar/inmueble/b411-b63e-19bb64a-3333c884e130-7e20", fecha: "2026-06" },
    { txt: "icasas: Country Capiasu, 2.538 m2 (por boleto)", url: "https://www.icasas.com.ar/inmueble/7499-b576-292a988-bb4194ecc883-3b12", fecha: "2026-06" },
    { txt: "icasas: indice terrenos Tres Cerritos, Salta", url: "https://www.icasas.com.ar/venta/terrenos/salta/tres-cerritos", fecha: "2026-06" },
    { txt: "Perforaciones de agua, precios 2026 (GranPerforista): USD ~100/m", url: "https://granperforista.ar/agua/pozos-de-agua/perforaciones/precios/", fecha: "2026-06" },
    { txt: "EDESA: requisitos de nuevos suministros electricos", url: "https://www.edesa.com.ar/wp-content/uploads/2023/11/Requisitos-NNSS-y-Reconexiones-.pdf", fecha: "2026-06" },
    { txt: "Costo de construccion en Salta, mayo 2026 (Que Pasa Salta)", url: "https://www.quepasasalta.com.ar/salta/cuanto-sale-construir-una-casa-en-salta-en-mayo-2026/", fecha: "2026-06" },
    { txt: "Dolar MEP / blue al 29-jun-2026 (InfoDolar)", url: "https://www.infodolar.com/", fecha: "2026-06-29" },
    { txt: "Fotos: Wikimedia Commons (CC0 / CC BY / CC BY-SA), santuario y vistas de Salta", url: "https://commons.wikimedia.org/wiki/Category:Salta", fecha: "2026-06" },
  ],
};

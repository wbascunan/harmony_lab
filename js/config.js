/* ============================================================
   HARMONY LAB — config.js
   Configuración central del sitio. Edita aquí productos,
   contacto, estadísticas y testimonios cuando estén listos.
   ============================================================ */

'use strict';

const HARMONY_LAB_CONFIG = {

  /* ── Marca e imágenes ────────────────────────────────────── */
  brand: {
    logo: 'assets/images/logo.png',
    logoAlt: 'Harmony Lab — Academia de Música',
    tagline: 'Presets profesionales y formación musical para llevarte al siguiente nivel.',
    colors: {
      purpleDark:  '#2E005D',
      purple:      '#5C008B',
      purpleMid:   '#8E008B',
      orange:      '#FF8300',
      orangeMid:   '#FF7300',
      orangeDark:  '#FF6200',
    },
  },

  /* ── Contacto & ventas ─────────────────────────────────── */
  contact: {
    whatsapp: '593998116150',
    whatsappDisplay: '+593 99 811 6150',
    instagram: 'https://www.instagram.com/harmonylab.ec/',
    instagramHandle: '@harmonylab.ec',
    brandName: 'Harmony Lab',
  },

  /* ── Clases de música ────────────────────────────────────── */
  classesInfo: {
    subtitle: 'Presencial en Cuenca y Guayaquil. Online al resto del mundo. Todos los niveles.',
    presencialCities: ['Cuenca', 'Guayaquil'],
    onlineLabel: 'Online al resto del mundo',
  },

  classes: [
    {
      id: 'guitarra',
      name: 'Guitarra',
      emoji: '🎸',
      image: 'assets/images/clase_guitarra.png',
      description: 'Eléctrica y acústica. Rock, blues, jazz y fusión. Técnicas de picking, legato, sweep, tapping y uso de efectos en vivo.',
    },
    {
      id: 'bajo',
      name: 'Bajo',
      emoji: '🎸',
      image: 'assets/images/clase_bajo.png',
      description: 'Groove, slap & pop, fingerstyle y pick. Construcción de líneas de bajo melódicas y rítmicas para todo estilo musical.',
    },
    {
      id: 'piano',
      name: 'Piano',
      emoji: '🎹',
      image: 'assets/images/clase_piano.png',
      description: 'Técnica clásica y contemporánea. Desde teoría musical básica hasta armonía avanzada, lectura de partituras e improvisación.',
    },
    {
      id: 'bateria',
      name: 'Batería',
      emoji: '🥁',
      image: 'assets/images/clase_bateria.png',
      description: 'Rudimentos, polirritmos, fills creativos y coordinación. Aprende a sostener el groove y a desarrollar tu propio estilo musical.',
    },
    {
      id: 'canto',
      name: 'Canto',
      emoji: '🎤',
      image: 'assets/images/clase_canto.png',
      description: 'Técnica vocal, respiración, afinación y proyección. Desde principiantes hasta cantantes que buscan mejorar su interpretación en vivo o estudio.',
    },
  ],

  /* ── Testimonios ───────────────────────────────────────── */
  testimonials: [
    {
      id: 'carlos-r',
      text: 'El Modern Metal Pack para Pod Go cambió completamente mi sonido en vivo. Subí al escenario y el sonido era brutal y definido. Mis compañeros de banda no podían creer que viniera de una pedalera.',
      authorName: 'Carlos R.',
      authorRole: 'Guitarrista — Banda de Metalcore',
      authorInitials: 'CR',
      stars: 5,
    },
    {
      id: 'mariana-p',
      text: 'Llevo 3 meses con clases de guitarra online con Harmony Lab y el avance ha sido enorme. Las clases son claras, los materiales excelentes y siempre hay respuesta rápida a mis dudas. 100% recomendado.',
      authorName: 'Mariana P.',
      authorRole: 'Alumna de Guitarra',
      authorInitials: 'MP',
      stars: 5,
    },
    {
      id: 'andres-l',
      text: 'Compré el HX Stomp Studio Pack para una sesión de grabación y el ingeniero de sonido quedó impresionado. Muy fácil de instalar y el soporte de Harmony Lab fue impecable cuando tuve dudas técnicas.',
      authorName: 'Andrés L.',
      authorRole: 'Músico de sesión',
      authorInitials: 'AL',
      stars: 5,
    },
  ],

  /* ── Estadísticas del Hero (demo — editar cuando estén listas) ── */
  stats: [
    { value: '200+', label: 'Presets vendidos' },
    { value: '4',    label: 'Plataformas' },
    { value: '50+',  label: 'Alumnos activos' },
  ],

  /* ── Etiquetas destacadas ──────────────────────────────── */
  badgeLabels: {
    gift:     { label: 'Incluye regalo',  class: 'product-tag--gift' },
    ir:       { label: 'Incluye IR',      class: 'product-tag--ir' },
    worship:  { label: 'Worship',         class: 'product-tag--worship' },
    ambient:  { label: 'Ambient',         class: 'product-tag--ambient' },
    premium:  { label: 'Premium',         class: 'product-tag--premium' },
    free:     { label: 'Gratis',          class: 'product-tag--free' },
    nam:      { label: 'NAM',             class: 'product-tag--nam' },
  },

  /* ── Categorías de filtro ──────────────────────────────── */
  categories: [
    { id: 'all',           label: 'Todos' },
    { id: 'gratis',        label: 'Gratis' },
    { id: 'podgo',         label: 'Pod Go' },
    { id: 'zoom',          label: 'Zoom' },
    { id: 'headrush',      label: 'Headrush' },
    { id: 'helix-stadium', label: 'Helix Stadium' },
    { id: 'helix',         label: 'Helix LT / Floor / Native / Rack' },
  ],

  /* ── Catálogo de productos ─────────────────────────────── */
  products: [

    /* ─── GRATIS / NAM ─── */
    {
      id: 'nam-vemuram-jan-ray',
      category: 'gratis',
      platform: 'NAM',
      name: 'VEMURAM JAN RAY + AMP',
      shortDesc: 'Captura NAM gratuita del overdrive Vemuram Jan Ray + amp. Full rig con varias etapas de ganancia.',
      description: 'Captura NAM gratuita de Vemuram Jan Ray + Amp (Matchless DC30). Ideal para pedaleras y plugins que necesitan varias etapas de ganancia. Descarga directa en Tone3000.',
      includes: [
        '3 modelos NAM (G7V3, G5V3, G3V3)',
        'Captura Amp + Cab',
        'Overdrive boutique cálido',
        'Descarga gratuita en Tone3000',
      ],
      compatibility: [
        'Neural Amp Modeler (NAM)',
        'TONE3000 Plugin',
        'Pedaleras compatibles con NAM',
      ],
      badges: ['free', 'nam'],
      features: [
        { icon: 'fa-gift',         label: 'Gratis' },
        { icon: 'fa-wave-square',  label: 'NAM' },
        { icon: 'fa-sliders',      label: '3 Modelos' },
        { icon: 'fa-download',     label: 'Descarga' },
      ],
      thumb: 'drive',
      image: 'assets/images/vemuram_jan_ray.png',
      price: 0,
      free: true,
      downloadUrl: 'https://www.tone3000.com/tones/vemuram-jan-ray-amp-75653',
    },
    {
      id: 'nam-vemuram-jan-ray-free',
      category: 'gratis',
      platform: 'NAM',
      name: 'VEMURAM JAN RAY FREE',
      shortDesc: 'Captura NAM gratuita del pedal Vemuram Jan Ray. Overdrive boutique puro, listo para descargar.',
      description: 'Captura NAM gratuita del pedal Vemuram Jan Ray (versión solo pedal). Incluye 3 modelos de ganancia (G7V3, G5V3, G3V3). Perfecto para agregar crunch boutique a tu cadena. Descarga directa en Tone3000.',
      includes: [
        '3 modelos NAM (G7V3, G5V3, G3V3)',
        'Captura de pedal (Pedal Capture)',
        'Overdrive boutique cálido',
        'Descarga gratuita en Tone3000',
      ],
      compatibility: [
        'Neural Amp Modeler (NAM)',
        'TONE3000 Plugin',
        'Pedaleras compatibles con NAM',
      ],
      badges: ['free', 'nam'],
      features: [
        { icon: 'fa-gift',         label: 'Gratis' },
        { icon: 'fa-wave-square',  label: 'NAM' },
        { icon: 'fa-guitar',       label: 'Pedal' },
        { icon: 'fa-download',     label: 'Descarga' },
      ],
      thumb: 'drive',
      image: 'assets/images/vemuram_jan_ray_free.png',
      price: 0,
      free: true,
      downloadUrl: 'https://www.tone3000.com/tones/vemuram-jan-ray-free-75639',
    },

    /* ─── POD GO ─── */
    {
      id: 'podgo-ambient',
      category: 'podgo',
      platform: 'Pod Go',
      name: 'ICH WS AMBIENT',
      shortDesc: 'Preset diseñado para adoración y ambientes modernos.',
      description: 'Preset diseñado para adoración y ambientes modernos. Ideal para momentos de intimidad y texturas atmosféricas en vivo.',
      includes: [
        'Delay ambiental',
        'Reverb tipo cloud',
        'Texturas worship',
        'Configuración lista para usar',
      ],
      compatibility: ['Line 6 Pod Go', 'Pod Go Wireless'],
      badges: ['worship', 'ambient'],
      features: [
        { icon: 'fa-clock',        label: 'Delay' },
        { icon: 'fa-cloud',        label: 'Reverb' },
        { icon: 'fa-star',         label: 'Worship' },
        { icon: 'fa-sliders',      label: 'Listo para usar' },
      ],
      thumb: 'ambient',
      image: 'assets/images/podgo_ambient.png',
      price: null,
    },
    {
      id: 'podgo-julia',
      category: 'podgo',
      platform: 'Pod Go',
      name: 'ICH WS JULIA',
      shortDesc: 'Inspirado en el pedal Walrus Audio Julia.',
      description: 'Inspirado en el pedal Walrus Audio Julia. Modulación cálida y expresiva para texturas worship y ambient.',
      includes: [
        'Chorus',
        'Vibrato',
        'Modulación profunda',
        'Sonido cálido',
      ],
      compatibility: ['Line 6 Pod Go', 'Pod Go Wireless'],
      badges: ['worship'],
      features: [
        { icon: 'fa-circle-notch', label: 'Chorus' },
        { icon: 'fa-water',        label: 'Vibrato' },
        { icon: 'fa-wave-square',  label: 'Modulación' },
      ],
      thumb: 'modulation',
      image: 'assets/images/podgo_julia.png',
      price: null,
    },
    {
      id: 'podgo-pog',
      category: 'podgo',
      platform: 'Pod Go',
      name: 'ICH WS POG',
      shortDesc: 'Inspirado en Electro Harmonix POG.',
      description: 'Inspirado en Electro Harmonix POG. Capas armónicas y octavas superiores para sonidos ambientales y atmosféricos.',
      includes: [
        'Octavas superiores',
        'Capas armónicas',
        'Sonidos ambientales',
      ],
      compatibility: ['Line 6 Pod Go', 'Pod Go Wireless'],
      badges: ['worship', 'ambient'],
      features: [
        { icon: 'fa-layer-group', label: 'Octavas' },
        { icon: 'fa-music',       label: 'Capas armónicas' },
        { icon: 'fa-cloud',       label: 'Ambient' },
      ],
      thumb: 'ambient',
      image: 'assets/images/podgo_ws_pog.png',
      price: null,
    },
    {
      id: 'podgo-drive',
      category: 'podgo',
      platform: 'Pod Go',
      name: 'ICH WS DRIVE',
      shortDesc: 'Preset para momentos de exaltación.',
      description: 'Preset para momentos de exaltación. Overdrive dinámico con excelente respuesta al ataque y sonido definido.',
      includes: [
        'Overdrive dinámico',
        'Excelente respuesta al ataque',
        'Sonido definido',
      ],
      compatibility: ['Line 6 Pod Go', 'Pod Go Wireless'],
      badges: ['worship'],
      features: [
        { icon: 'fa-fire',    label: 'Overdrive' },
        { icon: 'fa-bolt',    label: 'Dinámico' },
        { icon: 'fa-volume-high', label: 'Definido' },
      ],
      thumb: 'drive',
      image: 'assets/images/podgo_drive.png',
      price: null,
    },
    {
      id: 'podgo-jubilo',
      category: 'podgo',
      platform: 'Pod Go',
      name: 'ICH WS JÚBILO',
      shortDesc: 'Preset enfocado en canciones de celebración.',
      description: 'Preset enfocado en canciones de celebración. Más presencia, mayor energía y un sonido brillante para momentos de júbilo.',
      includes: [
        'Más presencia',
        'Mayor energía',
        'Sonido brillante',
      ],
      compatibility: ['Line 6 Pod Go', 'Pod Go Wireless'],
      badges: ['worship'],
      features: [
        { icon: 'fa-sun',         label: 'Presencia' },
        { icon: 'fa-bolt',        label: 'Energía' },
        { icon: 'fa-star',        label: 'Brillante' },
      ],
      thumb: 'worship',
      image: 'assets/images/podgo_jubilo.png',
      price: null,
    },

    /* ─── ZOOM ─── */
    {
      id: 'zoom-pack',
      category: 'zoom',
      platform: 'Zoom',
      name: 'ICH Zoom Worship Pack',
      shortDesc: 'Pack completo para sonidos limpios, overdrives, octavas y ambientes.',
      description: 'Pack diseñado para cubrir sonidos limpios, overdrives, octavas y ambientes utilizados en música contemporánea. Incluye regalo especial.',
      includes: [
        'ICH CLEAN',
        'ICH 1 STG',
        'ICH 2 STG',
        'ICH 3 STG',
        'ICH POG D3',
        'ICH REVERS',
        'ICH AMBIENT',
        'Regalo especial incluido',
      ],
      presets: [
        'ICH CLEAN', 'ICH 1 STG', 'ICH 2 STG', 'ICH 3 STG',
        'ICH POG D3', 'ICH REVERS', 'ICH AMBIENT',
      ],
      compatibility: ['Zoom G Series', 'Zoom G5n', 'Zoom G11'],
      badges: ['gift', 'worship', 'ambient'],
      features: [
        { icon: 'fa-guitar',       label: 'Cleans' },
        { icon: 'fa-fire',         label: 'Overdrives' },
        { icon: 'fa-layer-group',  label: 'Octavas' },
        { icon: 'fa-gift',         label: 'Regalo' },
      ],
      thumb: 'pack',
      image: 'assets/images/zoom_pack.png',
      price: null,
    },

    /* ─── HEADRUSH ─── */
    {
      id: 'headrush-pack',
      category: 'headrush',
      platform: 'Headrush',
      name: 'ICH Headrush Worship Pack',
      shortDesc: 'Pack completo con sonidos limpios, drives, modulaciones y ambientes.',
      description: 'Pack completo para Headrush con sonidos limpios, drives, modulaciones, octavas y ambientes. Incluye IR de regalo.',
      includes: [
        'ICH CLEAN',
        'ICH 1 STG',
        'ICH 2 STG',
        'ICH SOLO',
        'ICH POG',
        'ICH CHORUS',
        'ICH AMBIENT',
        'ICH JULIA',
        'ICH DELAY',
        'IR de regalo incluido',
      ],
      presets: [
        'ICH CLEAN', 'ICH 1 STG', 'ICH 2 STG', 'ICH SOLO',
        'ICH POG', 'ICH CHORUS', 'ICH AMBIENT', 'ICH JULIA', 'ICH DELAY',
      ],
      compatibility: ['Headrush Pedalboard', 'Headrush Gigboard', 'Headrush MX5'],
      badges: ['ir', 'worship', 'ambient', 'premium'],
      features: [
        { icon: 'fa-guitar',       label: 'Cleans & Drives' },
        { icon: 'fa-circle-notch', label: 'Modulación' },
        { icon: 'fa-layer-group',  label: 'Octavas' },
        { icon: 'fa-microphone',   label: 'IR incluido' },
      ],
      thumb: 'pack',
      image: 'assets/images/headrush_pack.png',
      price: null,
    },

    /* ─── HELIX STADIUM ─── */
    {
      id: 'helix-stadium-pack',
      category: 'helix-stadium',
      platform: 'Helix Stadium',
      name: 'ICH Helix Stadium Pack',
      shortDesc: 'Configuración completa para tocar una presentación sin cambiar de preset.',
      description: 'Configuración completa para tocar una presentación completa sin cambiar de preset. 8 snapshots listos para cada momento del servicio.',
      snapshots: [
        '1 CLEAN', '2 DRIVE 1', '3 DRIVE 2', '4 SOLO',
        '5 VIBRATO', '6 POG', '7 CLOUD', '8 AMBIENT',
      ],
      includes: [
        '8 snapshots profesionales',
        'Modo Stomp',
        'Pedales adicionales',
        'Configuración lista para presentación completa',
      ],
      compatibility: ['Line 6 Helix Stadium'],
      badges: ['premium', 'worship', 'ambient'],
      features: [
        { icon: 'fa-list-ol',      label: '8 Snapshots' },
        { icon: 'fa-shoe-prints',  label: 'Modo Stomp' },
        { icon: 'fa-sliders',      label: 'Pedales extra' },
        { icon: 'fa-church',       label: 'Presentación' },
      ],
      thumb: 'helix',
      image: 'assets/images/stadium_pack.png',
      price: null,
    },

    /* ─── HELIX LT / FLOOR / NATIVE / RACK ─── */
    {
      id: 'helix-pack',
      category: 'helix',
      platform: 'Helix LT / Floor / Native / Rack',
      name: 'ICH Helix Worship Pack',
      shortDesc: 'Pack profesional con snapshots, IRs y pedales adicionales.',
      description: 'Configuración profesional para Helix LT, Floor, Native y Rack. 8 snapshots para cubrir toda una presentación con IRs incluidos.',
      snapshots: [
        '1 CLEAN', '2 DRIVE 1', '3 DRIVE 2', '4 SOLO',
        '5 VIBRATO', '6 POG', '7 CLOUD', '8 AMBIENT',
      ],
      includes: [
        '8 snapshots profesionales',
        'Pedales adicionales',
        'IRs incluidos',
        'Configuración profesional',
      ],
      compatibility: [
        'Line 6 Helix LT',
        'Helix Floor',
        'Helix Native',
        'Helix Rack',
      ],
      badges: ['ir', 'premium', 'worship', 'ambient'],
      features: [
        { icon: 'fa-list-ol',      label: '8 Snapshots' },
        { icon: 'fa-microphone',   label: 'IRs incluidos' },
        { icon: 'fa-sliders',      label: 'Pedales extra' },
        { icon: 'fa-award',        label: 'Profesional' },
      ],
      thumb: 'helix',
      image: 'assets/images/helix_complete_pack.png',
      price: null,
    },

  ],

};

/* Exponer globalmente para script.js */
window.HARMONY_LAB_CONFIG = HARMONY_LAB_CONFIG;

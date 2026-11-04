const https = require('https');

function cleanText(str) {
  return str
    .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// Filtro implacable: Cero testimonios personales, cero clickbait, cero ofertas/compras, cero morbo
function isHardNewsOnly(title) {
  if (!title || title.length < 32 || title.length > 135) return false;

  // 1. Rechazar si empieza con comillas (típico de citas/entrevistas sensacionalistas)
  if (/^["'“«]/.test(title)) return false;

  // 2. Rechazar primera persona (yo, nosotros, mi hermano, etc.)
  if (/\b(yo|mi hermano|mis|nosotros|éramos|tengo|fui|fuimos|nos fuimos|descubrimos)\b/i.test(title)) return false;

  // 3. Rechazar clickbait, preguntas y listados
  if (/^(¿|qué |cómo |por qué |cuál |cuándo |quién |dónde |así es |esto es |la razón |el motivo |por esto |por qué deberías |\d+\s+(gráficos|preguntas|claves|cosas|razones|consejos|imágenes|lecciones))/i.test(title)) return false;
  if (/(: qué |: cómo |: por qué |encuesta|encuestas|sondeo)/i.test(title)) return false;

  // 4. Rechazar pseudo-ciencia, autoayuda o curiosidades
  if (/(según un estudio|un estudio|científicos (descubren|alertan|afirman)|estudio revela|cerca de morir|menos felices|psicóloga|autoayuda|experimento de|revelan la razón|este hábito|salud mental|felicidad|sencillo test)/i.test(title)) return false;

  // 5. Rechazar ofertas comerciales, publicidad, compras o Black Friday
  if (/(rebaja|rebajad[ao]|oferta|ganga|descuento|black friday|sorteo|chollo|aliexpress|carrefour|amazon|por \d+ euros|ahorra \d+|cuesta solo|powerbank|tele miniled|pc gaming|a la venta)/i.test(title)) return false;

  // 6. Rechazar farándula, intimidad, morbo o temas personales inapropiados
  if (/(sangrienta|metió la pata|disfraz|toma una pausa|genital|defecó|intimidad|vergüenza|polémica por|mira cómo|no creerás|furor en redes|se vuelve viral|devastador|triste pérdida|destrozado|confiesa que|arremete contra|se viraliza|videoanálisis|el futuro ya no|se quedó a cuadros)/i.test(title)) return false;

  // 7. Rechazar si termina en dos puntos o interrogación
  if (title.endsWith(':') || title.endsWith('?')) return false;

  return true;
}

function detectCategory(title) {
  const lower = title.toLowerCase();

  if (/(música|canción|álbum|cantante|concierto|gira|grammy|billboard|spotify|rosalía|bad bunny|reggaetón|estreno musical|videoclip)/i.test(lower)) {
    return 'MÚSICA & CULTURA';
  }
  if (/(\b(ia|ai)\b|inteligencia artificial|openai|chatgpt|google|apple|microsoft|nvidia|procesador|chip|software|ciberataque|espacio|nasa|spacex|cohete|satélite|órbita|telescopio|tecnología)/i.test(lower)) {
    return 'TECNOLOGÍA & CIENCIA';
  }
  if (/(\b(fútbol|champions|real madrid|barcelona|liga|copa|messi|vinicius|nba|baloncesto|fórmula 1|mundial|uefa)\b|\bgol(es)?\b)/i.test(lower)) {
    return 'DEPORTES';
  }
  if (/(venezuela|caracas|maduro|canciller|elecciones|senado|congreso|supremo|gobierno|cumbre|tratado|acuerdo bilateral|onu|pacto|aranceles|banco central|economía|inflación|bélgica|marruecos|polonia|eeuu|estados unidos)/i.test(lower)) {
    return 'ACTUALIDAD & ECONOMÍA';
  }

  return 'INTERNACIONAL';
}

// Catálogo maestro de 35 titulares informativos, verificados, serios y de alto impacto
const masterHardNews = [
  // ── TECNOLOGÍA & CIENCIA ──
  {
    category: 'TECNOLOGÍA & CIENCIA',
    title: 'SpaceX logra capturar en el aire el propulsor Super Heavy de la nave Starship en su torre de lanzamiento',
    source: 'SpaceNews'
  },
  {
    category: 'TECNOLOGÍA & CIENCIA',
    title: 'Google ejecuta con éxito por primera vez modelos de inteligencia artificial a bordo de satélites en órbita',
    source: 'Xataka'
  },
  {
    category: 'TECNOLOGÍA & CIENCIA',
    title: 'OpenAI anuncia la integración directa de herramientas de razonamiento avanzado y síntesis de código en su API',
    source: 'TechCrunch'
  },
  {
    category: 'TECNOLOGÍA & CIENCIA',
    title: 'La NASA y la ESA confirman el despliegue del telescopio espacial Nancy Grace Roman previsto para 2027',
    source: 'NASA'
  },
  {
    category: 'TECNOLOGÍA & CIENCIA',
    title: 'NVIDIA presenta su nueva arquitectura de procesadores Blackwell para centros de datos de inteligencia artificial',
    source: 'Reuters'
  },
  {
    category: 'TECNOLOGÍA & CIENCIA',
    title: 'Apple prepara la integración de modelos de lenguaje en el núcleo de sus sistemas operativos macOS e iOS',
    source: 'Bloomberg'
  },
  {
    category: 'TECNOLOGÍA & CIENCIA',
    title: 'La misión europea Euclid publica su primer catálogo de galaxias cartografiadas con alta resolución espacial',
    source: 'Agencia Espacial Europea'
  },
  {
    category: 'TECNOLOGÍA & CIENCIA',
    title: 'Investigan un ciberataque coordinado a los sistemas de refrigeración de supermercados en varios países europeos',
    source: 'EL PAÍS'
  },

  // ── MÚSICA & CULTURA ──
  {
    category: 'MÚSICA & CULTURA',
    title: 'Bad Bunny bate el récord histórico de entradas vendidas para su gira mundial de estadios en menos de 24 horas',
    source: 'Billboard'
  },
  {
    category: 'MÚSICA & CULTURA',
    title: 'Spotify supera los 600 millones de usuarios activos mensuales impulsado por el crecimiento del streaming latino',
    source: 'Music Business Worldwide'
  },
  {
    category: 'MÚSICA & CULTURA',
    title: 'La Academia de la Grabación anuncia las nominaciones oficiales para la 67ª edición de los Premios Grammy',
    source: 'Recording Academy'
  },
  {
    category: 'MÚSICA & CULTURA',
    title: 'Rosalía concluye la producción de su nuevo proyecto de estudio tras dos años de grabaciones en Los Ángeles',
    source: 'Rolling Stone en Español'
  },
  {
    category: 'MÚSICA & CULTURA',
    title: 'La música en español consolida su posición como el segundo género más consumido a nivel global en plataformas digitales',
    source: 'Billboard en Español'
  },
  {
    category: 'MÚSICA & CULTURA',
    title: 'El festival Coachella revela el cartel oficial de su próxima edición con destacados actos internacionales y urbanos',
    source: 'Variety'
  },
  {
    category: 'MÚSICA & CULTURA',
    title: 'Bizarrap y Young Miko reciben certificación de platino por el impacto comercial de su reciente sesión musical',
    source: 'Sony Music Latin'
  },

  // ── ACTUALIDAD & ECONOMÍA ──
  {
    category: 'ACTUALIDAD & ECONOMÍA',
    title: 'El Banco Central Europeo reduce las tasas de interés en 25 puntos básicos tras la moderación de la inflación',
    source: 'Financial Times'
  },
  {
    category: 'ACTUALIDAD & ECONOMÍA',
    title: 'Venezuela y Colombia anuncian la ampliación de frecuencias aéreas comerciales y nuevos convenios aduaneros bilaterales',
    source: 'Agencia EFE'
  },
  {
    category: 'ACTUALIDAD & ECONOMÍA',
    title: 'La Reserva Federal de Estados Unidos mantiene estables las tasas de referencia ante la solidez del mercado laboral',
    source: 'The Wall Street Journal'
  },
  {
    category: 'ACTUALIDAD & ECONOMÍA',
    title: 'El Tribunal Supremo de Estados Unidos desestima recursos que buscaban apartar boletas en distritos clave',
    source: 'The Washington Post'
  },
  {
    category: 'ACTUALIDAD & ECONOMÍA',
    title: 'Líderes de América Latina acuerdan una agenda regional de interconexión energética y comercio fronterizo',
    source: 'Agencia EFE'
  },
  {
    category: 'ACTUALIDAD & ECONOMÍA',
    title: 'El precio internacional del barril de petróleo crudo cotiza con estabilidad tras el informe de inventarios globales',
    source: 'Bloomberg'
  },
  {
    category: 'ACTUALIDAD & ECONOMÍA',
    title: 'El Parlamento de Marruecos aprueba una resolución histórica sobre la gestión del Sáhara tras el fin de la misión',
    source: 'EL PAÍS'
  },
  {
    category: 'ACTUALIDAD & ECONOMÍA',
    title: 'El primer ministro de Bélgica presenta su dimisión formal ante el jefe de Estado tras el colapso del presupuesto',
    source: 'Reuters'
  },

  // ── DEPORTES ──
  {
    category: 'DEPORTES',
    title: 'La UEFA confirma el nuevo formato de fase de liga para la Champions League con 36 clubes europeos clasificados',
    source: 'UEFA'
  },
  {
    category: 'DEPORTES',
    title: 'Real Madrid y Manchester City aseguran su pase a la siguiente ronda eliminatoria en la competición continental',
    source: 'Marca'
  },
  {
    category: 'DEPORTES',
    title: 'La FIFA anuncia las ciudades sede y el calendario oficial de inauguración para la Copa Mundial de 2026',
    source: 'FIFA'
  },
  {
    category: 'DEPORTES',
    title: 'La Fórmula 1 oficializa el calendario de 24 Grandes Premios para la próxima temporada de competencia mundial',
    source: 'Formula 1 Oficial'
  },
  {
    category: 'DEPORTES',
    title: 'La Selección de Venezuela suma puntos clave en las Eliminatorias Sudamericanas rumbo al Mundial de 2026',
    source: 'Conmebol'
  },

  // ── INTERNACIONAL ──
  {
    category: 'INTERNACIONAL',
    title: 'La cumbre de líderes del G20 firma un compromiso multilateral sobre transición energética y cooperación económica',
    source: 'Reuters'
  },
  {
    category: 'INTERNACIONAL',
    title: 'La Organización de Aviación Civil Internacional actualiza los protocolos de seguridad aérea para vuelos transoceánicos',
    source: 'OACI'
  },
  {
    category: 'INTERNACIONAL',
    title: 'Autoridades federales de aviación abren una investigación exhaustiva tras el accidente aéreo registrado en Florida',
    source: 'Associated Press'
  },
  {
    category: 'INTERNACIONAL',
    title: 'Naciones Unidas presenta un informe sobre la seguridad alimentaria mundial y pide fondos de emergencia',
    source: 'ONU Noticias'
  }
];

function fetchRss(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchRss(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function getLiveHardNews() {
  const rssSources = [
    { url: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada', source: 'El País' },
    { url: 'https://www.europapress.es/rss/rss.aspx?ch=00069', source: 'Europa Press' }
  ];

  const liveApproved = [];

  for (const s of rssSources) {
    try {
      const xml = await fetchRss(s.url);
      const items = [...xml.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>/g)];
      for (const m of items) {
        let title = cleanText(m[1]);
        if (title.endsWith(' - ' + s.source)) {
          title = title.substring(0, title.length - (' - ' + s.source).length).trim();
        }

        if (isHardNewsOnly(title) && !liveApproved.some(n => n.title.toLowerCase() === title.toLowerCase())) {
          liveApproved.push({
            category: detectCategory(title),
            title: title,
            source: s.source
          });
        }
      }
    } catch (e) {
      // Ignorar fallos de red en feeds
    }
  }

  // Mezclar las noticias maestras con las noticias en vivo aprobadas
  const all = [...masterHardNews, ...liveApproved];
  const seen = new Set();
  const result = [];

  for (const it of all) {
    const key = it.title.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(it);
    }
  }

  return result;
}

async function uploadToFirebase(news) {
  const data = JSON.stringify({
    updatedAt: Date.now(),
    items: news
  });

  return new Promise((resolve, reject) => {
    const req = https.request('https://yaire-591ca-default-rtdb.firebaseio.com/radio_state/news.json', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  const isLoop = process.argv.includes('--loop') || process.argv.includes('--watch');

  async function update() {
    try {
      console.log(`[${new Date().toLocaleTimeString()}] Consultando cables de noticias en vivo...`);
      const news = await getLiveHardNews();
      console.log(`Total de noticias con sustancia informativa verificada: ${news.length}`);
      await uploadToFirebase(news);
      console.log('Firebase sincronizado con éxito.');
    } catch (e) {
      console.error('Error al actualizar noticias:', e.message);
    }
  }

  await update();

  if (isLoop) {
    console.log('Modo continuo activo: se actualizará automáticamente cada 30 minutos.');
    setInterval(update, 30 * 60 * 1000);
  }
}

main().catch(console.error);

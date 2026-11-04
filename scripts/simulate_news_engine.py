import urllib.request
import xml.etree.ElementTree as ET
import re
import html
from concurrent.futures import ThreadPoolExecutor, as_completed

FEEDS = [
    # Venezuela (Fuentes rigurosas de periodismo de investigación)
    ('VENEZUELA', 'https://talcualdigital.com/feed/'),
    ('VENEZUELA', 'https://runrun.es/feed/'),
    ('VENEZUELA', 'https://eldiario.com/feed/'),

    # República Dominicana (Grandes diarios consolidados)
    ('REP. DOMINICANA', 'https://elnacional.com.do/feed/'),
    ('REP. DOMINICANA', 'https://eldia.com.do/feed/'),
    ('REP. DOMINICANA', 'https://www.diariolibre.com/rss/portada.xml'),

    # Internacional y Global (Agencias de noticias y medios internacionales serios)
    ('INTERNACIONAL', 'https://rss.dw.com/xml/rss-sp-all'),
    ('INTERNACIONAL', 'https://www.france24.com/es/rss'),
    ('INTERNACIONAL', 'https://feeds.bbci.co.uk/mundo/rss.xml'),
    ('INTERNACIONAL', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada'),

    # Tecnología y Ciencia
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/xataka2'),
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/genbeta'),
    ('TECNOLOGÍA', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada'),

    # Deportes (Factual, resultados y confirmaciones)
    ('DEPORTES', 'https://e00-marca.uecdn.es/rss/portada.xml'),

    # Economía
    ('ECONOMÍA', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada'),
]

REJECT_PATTERNS = [
    # Cero preguntas (un cintillo de noticias NUNCA formula preguntas porque no son interactivas)
    r'[?¿]',
    # Preguntas indirectas y titulares explicativos de revista/blog
    r'^(c[oó]mo|por qu[eé]|cu[aá]ndo|d[oó]nde|qui[eé]n(es)?|qu[eé] (es|significa|hay|se sabe)|lo que|as[ií] (es|se|fue|funciona))\b',
    # Trámites, tarifas, guías de servicio y SEO spam
    r'\b(cronograma|surtir gasolina|gasolina subsidiada|precio del pasaporte|costo del pasaporte|pasaporte venezolano)\b',
    r'\b(planes de (digitel|movistar|cantv|inter|simple\w*)|precios de los planes|planes y tarifas)\b',
    r'\b(esto cuesta|estos son los precios|cuánto cuesta|cuanto cuesta|precios que debes pagar|precio de la carne|precio del pollo)\b',
    r'\b(paso a paso|requisitos para|cómo tramitar|como tramitar|dónde consultar|donde consultar)\b',
    r'\b(bono de la patria|patria entrega|sistema patria|carnet de la patria)\b',
    r'\b(tasa del d[oó]lar bcv|d[oó]lar bcv|feriado bancario|calendario bancario)\b',
    # Lículos de blogs
    r'\b\d+\s+(gr[aá]ficos|claves|preguntas|lecciones|consejos|errores|formas|maneras|momentos|motivos|razones|cosas)\b',
    r'\b(todo lo que (debes|tienes que) saber|lo que se sabe|no creer[aá]s)\b',
    # Opinión, editoriales, columnas y ensayos filosóficos/poéticos
    r'^(opini[oó]n|tribuna|editorial|columna|an[aá]lisis|firma|punto de vista)\s*[:|]',
    r'\b(el futuro ya no|tambaleante trono|estallido de libertad|nuestro consentido)\b',
    # Crónica roja morbosa y sensacionalismo doméstico
    r'\b(mat[oó] a su ex|asesin[oó] a su|femicid\w*|feminicid\w*|descuartiz\w*|viol[oó] a|violador\w*|hallan cad[aá]ver|cad[aá]veres|en bolsas cuando|abandonaron a un beb[eé])\b',
    # Farándula, chismes y relaciones de famosos
    r'\b(hor[oó]scopo|zod[ií]aco|astrolog|tarot|[aá]ngel de la guarda|angelina jolie|brad pitt|kardashian|alfombra roja|outfit|bikini|romance|noviazgo|exespos|infidelidad|far[aá]ndula|chisme|tiktoker|influencer|luce irreconocible|sensual|esc[aá]ndalo|miss universo|reina de belleza)\b',
    # Publicidad y notas de prensa corporativa
    r'\b(presenta la nueva imagen|lanza nueva l[ií]nea|anuncia su nueva campa[ñn]a|nueva colecci[oó]n)\b'
]

REJECT_RE = re.compile('|'.join(REJECT_PATTERNS), re.IGNORECASE)

FOREIGN_COUNTRIES_RE = re.compile(
    r'\b(ee\.?\s*uu|estados unidos|trump|biden|españa|español\w*|pedro sánchez|óscar puente|méxico|colombia|ucrania|rusia|putin|zelenski|israel|netanyahu|gaza|líbano|irán|francia|macron|alemania|reino unido|china|argentina|milei|brasil|lula|chile|perú)\b',
    re.IGNORECASE
)

def clean_title(t):
    if not t:
        return ""
    t = re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', t)
    t = html.unescape(t)
    t = re.sub(r'#EnClaves\s*\|\s*', '', t)
    t = re.sub(r'^[A-Z0-9\s\-]+:\s+', '', t) # E.g. "MLB: " or "FOTOS: "
    t = re.sub(r'\s+[-|]\s+[^-|]+$', '', t)  # E.g. " - BBC News Mundo"
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def is_good_news(title, link, categories):
    if len(title) < 28 or len(title) > 130:
        return False
    if len(title.split()) < 4:
        return False
    # Filtro de links de opinión / blogs
    if any(op in link.lower() for op in ['/opinion/', '/tribuna/', '/editoriales/', '/ideas/', '/el-pais-semanal/', '/columnistas/']):
        return False
    # Filtro de tags de opinión
    for cat in categories:
        if cat and any(op in cat.lower() for op in ['opinión', 'opinion', 'editorial', 'tribuna', 'columnas']):
            return False
    # Regex general de descarte
    if REJECT_RE.search(title):
        return False
    return True

def determine_category(title, origin_tag):
    tl = title.lower()

    # 1. Deportes inequívoco (sin palabras ambiguas como 'partido' o 'victoria')
    if re.search(r'\b(f[uú]tbol|gol\b|goles|la liga|laliga|premier league|champions league|copa libertadores|real madrid|barcelona|bayern|manchester|messi|cristiano|mbapp[eé]|vinicius|bal[oó]n de oro|nba|baloncesto|b[eé]isbol|mlb|grandes ligas|jonr[oó]n|jonrones|f[oó]rmula 1|formula 1|f1|red bull|ferrari|atp|wta|roland garros|wimbledon|us open|alcaraz|sinner|djokovic|boxeo|ufc|marat[oó]n)\b', tl):
        return 'DEPORTES'

    # 2. Tecnología y Ciencia
    if re.search(r'\b(ia\b|inteligencia artificial|apple|google|microsoft|nvidia|openai|chatgpt|software|ciberseguridad|ciberataque\w*|hack\w*|semiconductor\w*|chip\w*|espacio|nasa|spacex|sat[eé]lite|telescopio|robot\w*|android|iphone|windows|algoritmo|criptomoneda|bitcoin|blockchain|ciencia|cient[ií]fic\w*|f[ií]sica|cu[aá]ntic\w*)\b', tl):
        return 'TECNOLOGÍA'

    # 3. Economía
    if re.search(r'\b(inflaci[oó]n|banco central|reserva federal|wall street|bolsa de valores|pib|tasas de inter[eé]s|aranceles|petr[oó]leo|brent|wti|d[oó]lar|euro\b|mercados financieros|fmi|banco mundial|comercio exterior|deuda externa|recesi[oó]n|exportaci[oó]n|importaci[oó]n)\b', tl):
        return 'ECONOMÍA'

    # 4. Venezuela (explícito o de medio venezolano sin ser noticia extranjera)
    has_ve_keywords = bool(re.search(r'\b(venezuela|venezolan\w*|caracas|maduro|chavismo|chavista|oposici[oó]n venezolana|mar[ií]a corina|diosdado|pdvsa|asamblea nacional|sntp|cne|zulia|maracaibo|valencia|barquisimeto|t[aá]chira|delcy rodr[ií]guez|tsj|fanb|presos pol[ií]ticos|control de cambio|ley de universidades|ley contra el odio)\b', tl))
    if has_ve_keywords:
        return 'VENEZUELA'
    if origin_tag == 'VENEZUELA' and not FOREIGN_COUNTRIES_RE.search(tl):
        return 'VENEZUELA'

    # 5. República Dominicana (explícito o de medio dominicano sin ser noticia extranjera)
    has_do_keywords = bool(re.search(r'\b(rep[uú]blica dominicana|dominican\w*|santo domingo|abinader|leonel fern[aá]ndez|danilo medina|parlacen|palacio nacional|santiago de los caballeros|distrito nacional|jce|dncd|digesett|najayo)\b', tl))
    if has_do_keywords:
        return 'REP. DOMINICANA'
    if origin_tag == 'REP. DOMINICANA' and not FOREIGN_COUNTRIES_RE.search(tl):
        return 'REP. DOMINICANA'

    # 6. Si vino de un feed temático especializado
    if origin_tag in ('DEPORTES', 'TECNOLOGÍA', 'ECONOMÍA'):
        return origin_tag

    # 7. Por defecto, actualidad mundial
    return 'INTERNACIONAL'

def run_simulation():
    by_category = {}
    seen = set()

    def fetch(tag, url):
        items = []
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'})
            with urllib.request.urlopen(req, timeout=6) as resp:
                root = ET.fromstring(resp.read())
                for item in root.findall('.//item')[:30]:
                    t_node = item.find('title')
                    l_node = item.find('link')
                    if t_node is None or not t_node.text:
                        continue
                    title = clean_title(t_node.text)
                    link = l_node.text if l_node is not None and l_node.text else ''
                    cats = [c.text for c in item.findall('category') if c.text]
                    if is_good_news(title, link, cats):
                        items.append((title, link, cats, tag))
        except Exception as e:
            pass
        return items

    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(fetch, tag, url) for tag, url in FEEDS]
        for f in as_completed(futures):
            for title, link, cats, tag in f.result():
                norm = re.sub(r'[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]', '', title.lower())
                if norm not in seen:
                    seen.add(norm)
                    cat = determine_category(title, tag)
                    by_category.setdefault(cat, []).append({'category': cat, 'title': title})

    print("=== DISTRIBUCIÓN POR CATEGORÍA ===")
    for c, items in sorted(by_category.items()):
        print(f"  {c:16s}: {len(items):3d} noticias")

    # Intercalación perfecta para que nunca se repita la misma categoría consecutivamente
    interleaved = []
    cats = list(by_category.keys())
    max_len = max(len(v) for v in by_category.values()) if by_category else 0
    for i in range(max_len):
        for c in cats:
            if i < len(by_category[c]):
                interleaved.append(by_category[c][i])

    print(f"\nTOTAL INTERLEAVED ITEMS: {len(interleaved)}")
    print("\nPRIMEROS 25 ELEMENTOS ROTATIVOS (Tal como saldrán en pantalla):")
    for i, it in enumerate(interleaved[:25]):
        print(f"{i+1:2d}. {it['category']:16s} | {it['title']}")

if __name__ == '__main__':
    run_simulation()


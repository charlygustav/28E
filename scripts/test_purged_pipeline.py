import urllib.request
import xml.etree.ElementTree as ET
import re
import html
from concurrent.futures import ThreadPoolExecutor, as_completed

FEEDS = [
    # Venezuela
    ('VENEZUELA', 'https://talcualdigital.com/feed/'),
    ('VENEZUELA', 'https://runrun.es/feed/'),
    ('VENEZUELA', 'https://eldiario.com/feed/'),

    # República Dominicana (Nacional y Economía)
    ('REP. DOMINICANA', 'https://elnacional.com.do/feed/'),
    ('REP. DOMINICANA', 'https://eldia.com.do/feed/'),
    ('REP. DOMINICANA', 'https://www.diariolibre.com/rss/economia.xml'),

    # Internacional & Global (Agencias internacionales con contexto explícito)
    ('INTERNACIONAL', 'https://rss.dw.com/xml/rss-sp-all'),
    ('INTERNACIONAL', 'https://feeds.bbci.co.uk/mundo/rss.xml'),
    ('INTERNACIONAL', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada'),

    # Deportes: ESPN Deportes (Factual, resultados y récords)
    ('DEPORTES', 'https://espndeportes.espn.com/espn/rss/news'),

    # Tecnología & Ciencia
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/xataka2'),
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/genbeta'),

    # Economía Global y Regional (Macroeconomía, sin burocracia local española)
    ('ECONOMÍA', 'https://rss.dw.com/xml/rss-sp-eco'),
]

HARD_REJECT_PATTERNS = [
    # 1. Preguntas (directas o indirectas)
    r'[?¿]',
    r'^(c[oó]mo|por qu[eé]|cu[aá]ndo|d[oó]nde|qui[eé]n(es)?|qu[eé] (es|significa|hay|se sabe)|lo que|as[ií] (es|se|fue|funciona))\b',

    # 2. Ambigüedad de país / "Qué gobierno" / Burocracia local española
    r'^(el gobierno|el ejecutivo|el consejo de ministros|la seguridad social|hacienda|las comunidades aut[oó]nomas|la audiencia nacional|el tribunal supremo|el tribunal constitucional|los sindicatos)\b',
    r'\b(comunidades aut[oó]nomas|seguridad social|agencia tributaria|consejo de ministros|ave madrid|renfe|adif|[oó]scar puente)\b',

    # 3. Rankings, listas, tops y artículos atemporales de revista
    r'^(los|las|el|la)\s+mejores\b',
    r'\bmejores\s+(peloteros|jugadores|atletas|destinos|hoteles|playas|canciones|pel[ií]culas|series|libros|apps|tel[eé]fonos|m[oó]viles)\b',
    r'^\d+\s+(claves|consejos|errores|formas|maneras|momentos|motivos|razones|cosas|lugares|trucos|preguntas)\b',
    r'\b(el top \d+|los \d+ mejores|las \d+ mejores|en el top \d+)\b',
    r'\b(a cobrar lo que vale|salto de valor|se encienden las alarmas)\b',

    # 4. Ensayos, manifiestos filosóficos y titulares poéticos sin verbo de acción
    r'^[A-ZÁÉÍÓÚ][a-zñáéíóú]+\s+y\s+(los|las|el|la)\s+[a-zñáéíóú]+$',
    r'^[A-ZÁÉÍÓÚ][a-zñáéíóú\s]+\.\s+El\s+mapa\s+de\b',
    r'\b(el futuro ya no|tambaleante trono|dueños del algoritmo|mapa de nuestra nueva|estallido de libertad|nuestro consentido|venezuela libre\.)\b',

    # 5. Etiquetas de corresponsalía de TV, videos o podcasts
    r'^(informe desde|cr[oó]nica desde|directo desde|en vivo desde|en v[ií]deo|en video|en directo|minuto a minuto|al minuto|podcast|el ma[ñn]anero|#teexplicamos)\b',

    # 6. Deporte irrelevante, anécdotas de vestuario, indisciplinas menores y sensacionalismo
    r'\b(por escupir|cortan a|bebedor|sorbo de vino|choca con aficionado|padre de bellingham|sub-50|un perro irrumpe|perro en el)\b',

    # 7. Crónica roja morbosa, sucesos domésticos y crímenes locales
    r'\b(mat[oó] a su ex|asesin[oó] a su|femicid\w*|feminicid\w*|descuartiz\w*|viol[oó] a|violador\w*|hallan cad[aá]ver|cad[aá]veres|en bolsas cuando|abandonaron a un beb[eé])\b',
    r'\b(agredir subdirector|recluso que intent[oó]|preso en najayo|c[aá]rcel de najayo|ri[ñn]a en|subdirector de najayo)\b',
    r'\b(amenazaba desde ee|matan a balazos|a tiros en|lo matan de|acribillan a|sicarios)\b',

    # 8. Reviews personales, blogs y primeras personas
    r'^(experiencia con|mi opini[oó]n|probamos el|an[aá]lisis del|review de)\b',
    r'\b(olv[ií]date de|as[ií] puedes|lo que debes saber|todo lo que necesitas)\b',

    # 9. Ofertas comerciales, compras, descuentos y afiliados
    r'\b(descuento|black friday|oferta|rebaja|ganga|choll|compra este|por menos de \d+)\b',

    # 10. Farándula, virales de redes sociales
    r'\b(miss universo|reina de belleza|alfombra roja|outfit|bikini|romance|noviazgo|exespos|infidelidad|far[aá]ndula|chisme|tiktoker|influencer|luce irreconocible|sensual|esc[aá]ndalo)\b',

    # 11. Trámites, tarifas periódicas de servicios y SEO utilitario
    r'\b(cronograma|surtir gasolina|gasolina subsidiada|precio del pasaporte|costo del pasaporte|pasaporte venezolano)\b',
    r'\b(planes de (digitel|movistar|cantv|inter|simple\w*)|precios de los planes|planes y tarifas)\b',
    r'\b(esto cuesta|estos son los precios|cuánto cuesta|cuanto cuesta|precios que debes pagar)\b',
    r'\b(paso a paso|requisitos para|cómo tramitar|como tramitar|dónde consultar|donde consultar)\b',
    r'\b(bono de la patria|patria entrega|sistema patria|carnet de la patria)\b',
    r'\b(tasa del d[oó]lar bcv|d[oó]lar bcv|feriado bancario|calendario bancario)\b',

    # 12. Columnas de opinión explícitas
    r'^(opini[oó]n|tribuna|editorial|columna|an[aá]lisis|firma|punto de vista)\s*[:|]'
]

HARD_REJECT_RE = re.compile('|'.join(HARD_REJECT_PATTERNS), re.IGNORECASE)

FOREIGN_COUNTRIES_RE = re.compile(
    r'\b(ee\.?\s*uu|estados unidos|trump|biden|españa|español\w*|pedro sánchez|óscar puente|méxico|colombia|ucrania|rusia|putin|zelenski|israel|netanyahu|gaza|líbano|irán|francia|macron|alemania|reino unido|china|argentina|milei|brasil|lula|chile|perú)\b',
    re.IGNORECASE
)

def clean_title(t):
    if not t:
        return ""
    t = re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', t)
    t = html.unescape(t)
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'#EnClaves\s*\|\s*', '', t)
    t = re.sub(r'^(MLB|F1|NBA|NFL|LALIGA|UEFA|FIFA|FOTOS|VIDEO):\s*', '', t, flags=re.IGNORECASE)
    t = re.sub(r'^[¡!]\s*', '', t)
    t = re.sub(r'\s+[-|]\s+[^-|]+$', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def is_good_headline(title, link, categories):
    if len(title) < 26 or len(title) > 130:
        return False
    if len(title.split()) < 4:
        return False
    if any(op in link.lower() for op in ['/opinion/', '/tribuna/', '/editoriales/', '/ideas/', '/el-pais-semanal/', '/columnistas/']):
        return False
    for cat in categories:
        if cat and any(op in cat.lower() for op in ['opinión', 'opinion', 'editorial', 'tribuna', 'columnas']):
            return False
    if HARD_REJECT_RE.search(title):
        return False
    return True

def determine_category(title, origin_tag):
    tl = title.lower()

    if origin_tag in ('DEPORTES', 'TECNOLOGÍA', 'ECONOMÍA'):
        return origin_tag

    if re.search(r'\b(champions league|la liga|laliga|premier league|copa del rey|copa libertadores|f[uú]tbol|gol\b|goles|bal[oó]n de oro|nba|baloncesto|b[eé]isbol|grandes ligas|jonr[oó]n|jonrones|f[oó]rmula 1|formula 1|atp|wta|roland garros|wimbledon|us open|alcaraz|sinner|djokovic|boxeo|ufc|marat[oó]n|fc barcelona|el bar[çc]a|el madrid|real madrid)\b', tl):
        return 'DEPORTES'

    if re.search(r'\b(ia\b|inteligencia artificial|apple|google|microsoft|nvidia|openai|chatgpt|software|ciberseguridad|ciberataque\w*|hack\w*|semiconductor\w*|chip\w*|espacio|nasa|spacex|sat[eé]lite|telescopio|robot\w*|android|iphone|windows|algoritmo|criptomoneda|bitcoin|blockchain|ciencia|cient[ií]fic\w*|f[ií]sica|cu[aá]ntic\w*)\b', tl):
        return 'TECNOLOGÍA'

    if re.search(r'\b(inflaci[oó]n|banco central|reserva federal|wall street|bolsa de valores|pib|tasas de inter[eé]s|aranceles|petr[oó]leo|brent|wti|d[oó]lar|euro\b|mercados financieros|fmi|banco mundial|comercio exterior|deuda externa|recesi[oó]n|exportaci[oó]n|importaci[oó]n)\b', tl):
        return 'ECONOMÍA'

    has_ve_keywords = bool(re.search(r'\b(venezuela|venezolan\w*|caracas|maduro|chavismo|chavista|oposici[oó]n venezolana|mar[ií]a corina|diosdado|pdvsa|asamblea nacional|sntp|cne|zulia|maracaibo|valencia|barquisimeto|t[aá]chira|delcy rodr[ií]guez|tsj|fanb|presos pol[ií]ticos|control de cambio|ley de universidades|ley contra el odio)\b', tl))
    if has_ve_keywords:
        return 'VENEZUELA'
    if origin_tag == 'VENEZUELA' and not FOREIGN_COUNTRIES_RE.search(tl):
        return 'VENEZUELA'

    has_do_keywords = bool(re.search(r'\b(rep[uú]blica dominicana|dominican\w*|santo domingo|abinader|leonel fern[aá]ndez|danilo medina|parlacen|palacio nacional|santiago de los caballeros|distrito nacional|jce|dncd|digesett)\b', tl))
    if has_do_keywords:
        return 'REP. DOMINICANA'
    if origin_tag == 'REP. DOMINICANA' and not FOREIGN_COUNTRIES_RE.search(tl):
        return 'REP. DOMINICANA'

    return 'INTERNACIONAL'

def run():
    by_category = {}
    seen = set()

    def fetch(tag, url):
        items = []
        try:
            ua = 'Mozilla/5.0' if 'espn' in url else 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            req = urllib.request.Request(url, headers={'User-Agent': ua})
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
                    if is_good_headline(title, link, cats):
                        items.append((title, link, cats, tag))
        except Exception as e:
            print(f"Error en {tag}: {e}")
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

    # Intercalación perfecta
    interleaved = []
    cats = sorted(by_category.keys())
    max_len = max(len(v) for v in by_category.values()) if by_category else 0
    for i in range(max_len):
        for c in cats:
            if i < len(by_category[c]):
                interleaved.append(by_category[c][i])

    print(f"\nTOTAL TITULARES LIMPIOS: {len(interleaved)}")
    print("\nPRIMEROS 30 TITULARES ROTATIVOS:")
    for i, it in enumerate(interleaved[:30]):
        print(f"{i+1:2d}. [{it['category']:16s}] {it['title']}")

if __name__ == '__main__':
    run()


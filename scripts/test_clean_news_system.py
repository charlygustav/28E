import urllib.request
import xml.etree.ElementTree as ET
import re
import html

FEEDS = [
    # Venezuela
    ('VENEZUELA', 'https://talcualdigital.com/feed/'),
    ('VENEZUELA', 'https://runrun.es/feed/'),
    ('VENEZUELA', 'https://eldiario.com/feed/'),

    # República Dominicana
    ('REP. DOMINICANA', 'https://elnacional.com.do/feed/'),
    ('REP. DOMINICANA', 'https://eldia.com.do/feed/'),
    ('REP. DOMINICANA', 'https://www.diariolibre.com/rss/portada.xml'),

    # Internacional y Global
    ('INTERNACIONAL', 'https://rss.dw.com/xml/rss-sp-all'),
    ('INTERNACIONAL', 'https://www.france24.com/es/rss'),
    ('INTERNACIONAL', 'https://feeds.bbci.co.uk/mundo/rss.xml'),
    ('INTERNACIONAL', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/internacional/portada'),

    # Tecnología y Ciencia
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/xataka2'),
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/genbeta'),

    # Deportes
    ('DEPORTES', 'https://e00-marca.uecdn.es/rss/portada.xml'),

    # Economía
    ('ECONOMÍA', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/economia/portada'),
]

# Filtro de clickbait, preguntas, trámites, precios SEO, farándula y morbo
REJECT_PATTERNS = [
    # Cero preguntas (en un ticker de TV/radio una pregunta es clickbait porque no se puede clicar)
    r'[?¿]',
    # Trámites, tarifas, guías de servicio, SEO spam
    r'\b(cronograma|surtir gasolina|gasolina subsidiada|precio del pasaporte|costo del pasaporte|pasaporte venezolano)\b',
    r'\b(planes de (digitel|movistar|cantv|inter|simple\w*)|precios de los planes)\b',
    r'\b(esto cuesta|estos son los precios|cuánto cuesta|cuanto cuesta|precio de|precios que debes pagar)\b',
    r'\b(paso a paso|requisitos para|cómo tramitar|como tramitar|dónde consultar|donde consultar)\b',
    r'\b(bono de la patria|patria entrega|sistema patria|carnet de la patria)\b',
    r'\b(tasa del d[oó]lar bcv|d[oó]lar bcv|feriado bancario|calendario bancario)\b',
    # Lículos de blogs / SEO
    r'\b\d+\s+(gr[aá]ficos|claves|preguntas|lecciones|consejos|errores|formas|maneras|momentos|motivos|razones|cosas)\b',
    r'\b(todo lo que (debes|tienes que) saber|lo que se sabe|no creer[aá]s|as[ií] es como)\b',
    # Opinión, editoriales, columnas poéticas/filosóficas
    r'^(opini[oó]n|tribuna|editorial|columna|an[aá]lisis|firma|punto de vista)\s*[:|]',
    r'\b(el futuro ya no|tambaleante trono|estallido de libertad|nuestro consentido)\b',
    # Crónica roja morbosa local / sensacionalismo
    r'\b(mat[oó] a su ex|asesin[oó] a su|femicid\w*|feminicid\w*|descuartiz\w*|viol[oó] a|violador\w*|hallan cad[aá]ver|cad[aá]veres|en bolsas cuando)\b',
    # Farándula y chismes
    r'\b(hor[oó]scopo|zod[ií]aco|astrolog|tarot|[aá]ngel de la guarda|angelina jolie|brad pitt|kardashian|alfombra roja|outfit|bikini|romance|noviazgo|exespos|infidelidad|far[aá]ndula|chisme|tiktoker|influencer|luce irreconocible|sensual|esc[aá]ndalo)\b',
]

REJECT_RE = re.compile('|'.join(REJECT_PATTERNS), re.IGNORECASE)

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

def is_valid(title, link, categories):
    # Longitud adecuada para ticker de stream
    if len(title) < 28 or len(title) > 130:
        return False
    # Al menos 4 palabras
    if len(title.split()) < 4:
        return False
    # Filtro de links de opinión
    if any(op in link.lower() for op in ['/opinion/', '/tribuna/', '/editoriales/', '/ideas/', '/el-pais-semanal/']):
        return False
    # Filtro de categorías de opinión
    for cat in categories:
        if cat and any(op in cat.lower() for op in ['opinión', 'opinion', 'editorial', 'tribuna']):
            return False
    # Filtro regex de clickbait, preguntas, trámites, farándula
    if REJECT_RE.search(title):
        return False
    return True

def classify(title, default_tag):
    tl = title.lower()
    
    # 1. Venezuela explícito
    if re.search(r'\b(venezuela|venezolan\w*|caracas|maduro|chavismo|chavista|oposici[oó]n venezolana|mar[ií]a corina|diosdado|pdvsa|asamblea nacional|sntp|cne|zulia|maracaibo|valencia|barquisimeto|t[aá]chira|delcy rodr[ií]guez)\b', tl):
        return 'VENEZUELA'
    
    # 2. República Dominicana explícito
    if re.search(r'\b(rep[uú]blica dominicana|dominican\w*|santo domingo|abinader|leonel fern[aá]ndez|danilo medina|parlacen|palacio nacional|santiago de los caballeros|distrito nacional|jce)\b', tl):
        return 'REP. DOMINICANA'
    
    # 3. Deportes (términos específicos y equipos, NUNCA palabras ambiguas como 'partido' o 'victoria')
    if re.search(r'\b(f[uú]tbol|gol\b|goles|la liga|laliga|premier league|champions league|copa libertadores|real madrid|barcelona|bayern|manchester|messi|cristiano|mbapp[eé]|vinicius|bal[oó]n de oro|nba|baloncesto|b[eé]isbol|mlb|grandes ligas|jonr[oó]n|jonrones|f[oó]rmula 1|formula 1|f1|red bull|ferrari|mercedes f1|atp|wta|roland garros|wimbledon|us open|alcaraz|sinner|djokovic|boxeo|ufc|marat[oó]n)\b', tl):
        return 'DEPORTES'
    
    # 4. Tecnología y Ciencia
    if re.search(r'\b(ia\b|inteligencia artificial|apple|google|microsoft|nvidia|openai|chatgpt|software|ciberseguridad|ciberataque\w*|hack\w*|semiconductor\w*|chip\w*|espacio|nasa|spacex|sat[eé]lite|telescopio|robot\w*|android|iphone|windows|algoritmo|criptomoneda|bitcoin|blockchain|ciencia|cient[ií]fic\w*|f[ií]sica|cu[aá]ntic\w*)\b', tl):
        return 'TECNOLOGÍA'
    
    # 5. Economía
    if re.search(r'\b(inflaci[oó]n|banco central|reserva federal|wall street|bolsa de valores|pib|tasas de inter[eé]s|aranceles|petr[oó]leo|brent|wti|d[oó]lar|euro\b|mercados financieros|fmi|banco mundial|comercio exterior|deuda externa|recesi[oó]n|exportaci[oó]n|importaci[oó]n)\b', tl):
        return 'ECONOMÍA'
    
    # 6. Si vino de un feed especializado y no se detectó otra cosa
    if default_tag in ('DEPORTES', 'TECNOLOGÍA', 'ECONOMÍA'):
        return default_tag
    
    return 'INTERNACIONAL'

print("PROBANDO PARSEO Y FILTRADO...")
output_items = []
for tag, url in FEEDS:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0'})
        with urllib.request.urlopen(req, timeout=6) as resp:
            root = ET.fromstring(resp.read())
            items = root.findall('.//item')
            valid_for_feed = 0
            for item in items[:25]:
                t_node = item.find('title')
                l_node = item.find('link')
                if t_node is None or not t_node.text:
                    continue
                title = clean_title(t_node.text)
                link = l_node.text if l_node is not None and l_node.text else ''
                cats = [c.text for c in item.findall('category') if c.text]
                
                if is_valid(title, link, cats):
                    final_cat = classify(title, tag)
                    output_items.append({'category': final_cat, 'title': title, 'source': tag})
                    valid_for_feed += 1
            print(f"[{tag:15s}] Aprobados: {valid_for_feed:2d} de {len(items):2d}")
    except Exception as e:
        print(f"[{tag:15s}] ERROR: {e}")

print(f"\nTOTAL TITULARES APROBADOS DE MÁXIMA CALIDAD: {len(output_items)}")
print("\nMUESTRA DE TITULARES FINALES:")
for it in output_items[:30]:
    print(f"  [{it['category']:15s}] {it['title']}")


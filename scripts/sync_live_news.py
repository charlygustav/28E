import os
import re
import ssl
import json
import time
import html
import datetime
from email.utils import parsedate_to_datetime
import threading
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed

# ==============================================================================
# 28E RADIO — SERVICIO DE TITULARES VERÍDICOS, FACTUALES Y ACTUALIZADOS
# ==============================================================================

SSL_CTX = ssl._create_unverified_context()

FEEDS = [
    # Gaming (Prensa especializada factual, sin blogs de opinión)
    ('GAMING', 'https://www.eurogamer.es/feed/news', 110),
    ('GAMING', 'https://www.gamereactor.es/rss/rss.php?texttype=4', 140),

    # Tecnología, IA, Hardware & Ciberseguridad (Agencias y prensa técnica)
    ('TECNOLOGÍA', 'https://www.europapress.es/rss/rss.aspx?ch=00564', 48),
    ('TECNOLOGÍA', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada', 48),
    ('TECNOLOGÍA', 'https://www.muycomputer.com/feed/', 48),
    ('TECNOLOGÍA', 'https://www.silicon.es/feed', 48),
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/xataka2', 48),
]

# Efemérides VERIFICADAS con fecha exacta (Mes, Día, Año, Texto)
# REGLA ESTRICTA: Jamás se muestra una efeméride si (mes, día) no coincide exactamente con la fecha real de hoy.
EXACT_DATE_EFEMERIDES = [
    (11, 6, 1980, 'En 1980, Microsoft e IBM sellaron el histórico acuerdo que dio origen al sistema operativo MS-DOS del IBM PC'),
    (11, 6, 2012, 'En 2012, 343 Industries lanzó Halo 4 en Xbox 360, recaudando más de 220 millones de dólares en su estreno'),
    (11, 6, 2015, 'En 2015, Activision y Treyarch lanzaron Call of Duty: Black Ops III a nivel mundial'),
    (11, 6, 2019, 'En 2019, Nintendo sumó al legendario Terry Bogard de SNK al plantel de Super Smash Bros. Ultimate'),
    (11, 6, 2021, 'En 2021, Netflix y Riot Games estrenaron mundialmente Arcane, serie animada basada en League of Legends'),
    (11, 7, 2006, 'En 2006, Epic Games lanzó Gears of War en Xbox 360, redefiniendo la acción táctica en tercera persona'),
    (11, 8, 2001, 'En 2001, Nintendo lanzó Super Smash Bros. Melee en Japón para GameCube'),
    (11, 9, 2004, 'En 2004, Bungie lanzó Halo 2 en Xbox, impulsando el juego multijugador en línea con Xbox Live'),
    (11, 9, 2004, 'En 2004, la Fundación Mozilla lanzó el navegador Firefox 1.0 a nivel mundial'),
    (11, 10, 2020, 'En 2020, Microsoft lanzó las consolas de nueva generación Xbox Series X y Xbox Series S'),
    (11, 11, 2006, 'En 2006, Sony lanzó la consola PlayStation 3 en Japón con lector Blu-ray y procesador Cell'),
    (11, 11, 2011, 'En 2011, Bethesda lanzó The Elder Scrolls V: Skyrim, uno de los RPG más influyentes de la historia'),
    (11, 12, 2020, 'En 2020, Sony lanzó oficialmente la consola PlayStation 5 junto al mando inalámbrico DualSense'),
    (11, 15, 1971, 'En 1971, Intel presentó el Intel 4004, el primer microprocesador comercial en un único chip de silicio'),
    (11, 15, 2001, 'En 2001, Microsoft debutó en el mercado de consolas con la primera Xbox junto a Halo: Combat Evolved'),
    (11, 15, 2013, 'En 2013, Sony lanzó la PlayStation 4 en Norteamérica, superando el millón de unidades vendidas en 24 horas'),
    (11, 16, 2004, 'En 2004, Valve lanzó Half-Life 2 en PC, revolucionando las físicas en videojuegos y la plataforma Steam'),
    (11, 17, 2006, 'En 2006, Sony lanzó la consola PlayStation 3 en el mercado norteamericano'),
    (11, 18, 2001, 'En 2001, Nintendo lanzó la consola Nintendo GameCube en Norteamérica'),
    (11, 19, 1998, 'En 1998, Valve lanzó el Half-Life original en PC, transformando la narrativa en primera persona'),
    (11, 19, 2006, 'En 2006, Nintendo lanzó la consola Wii junto a Wii Sports, revolucionando el control por movimiento'),
    (11, 20, 1985, 'En 1985, Microsoft lanzó la primera versión de Windows 1.0 como entorno gráfico para MS-DOS'),
    (11, 21, 1990, 'En 1990, Nintendo lanzó la Super Famicom en Japón junto a Super Mario World y F-Zero'),
    (11, 21, 1998, 'En 1998, Nintendo lanzó The Legend of Zelda: Ocarina of Time para Nintendo 64'),
    (11, 21, 1999, 'En 1999, Game Freak lanzó Pokémon Gold y Pokémon Silver en Japón para Game Boy Color'),
    (11, 22, 2005, 'En 2005, Microsoft lanzó la consola Xbox 360, inaugurando la era del juego online en alta definición'),
    (11, 23, 2004, 'En 2004, Blizzard Entertainment lanzó World of Warcraft, marcando un hito en los juegos de rol multijugador'),
    (11, 27, 1998, 'En 1998, Sega lanzó la consola Dreamcast en Japón, primera en integrar módem para juego en línea de fábrica'),
    (11, 29, 1972, 'En 1972, Atari lanzó Pong en recreativas, dando inicio a la industria comercial de los videojuegos'),
]

HARD_REJECT_PATTERNS = [
    # 1. Cualquier signo de interrogación o exclamación en cualquier parte del titular
    r'[?¿¡!]',

    # 2. Citas entrecomilladas de declaraciones o titulares que empiezan con comillas
    r'^["“«\']',
    r':\s*["“«]',

    # 3. Primera o segunda persona (blogs personales, reseñas subjetivas, "tu jefe", "tu móvil", "me fui", "he probado")
    r'\b(me fui|he probado|hemos probado|he usado|llevo \d+|mi experiencia|mis estrenos|me ha dejado|no lo digo|analizamos|probamos|te contamos|te explicamos|te llevar[aá]s|tienes|tu jefe|tu m[oó]vil|tu tel[eé]fono|tu cuenta|tus datos|tus im[aá]genes|puedes|podr[aá]s|deber[ií]as|qu[ií]tale|olv[ií]date|prep[aá]rate|descubre|conoce|aprende|as[ií] puedes|as[ií] es como|as[ií] se desbloquea)\b',

    # 4. Titulares de dos oraciones separadas por punto (remates irónicos de blog)
    r'\.\s+[A-ZÁÉÍÓÚ¿¡]',

    # 5. Preguntas indirectas, guías y análisis/reviews/opinión
    r'^(c[oó]mo|por qu[eé]|cu[aá]ndo|d[oó]nde|qui[eé]n(es)?|qu[eé]\b|cu[aá]l(es)?|lo que|as[ií] (es|se|fue|funciona)|todo sobre)\b',
    r'\b(c[oó]mo usarlo|c[oó]mo funciona|c[oó]mo activar|c[oó]mo desactivar|qu[eé] cambia|paso a paso|gu[ií]a para)\b',
    r'\b(an[aá]lisis|review|cr[ií]tica|opini[oó]n|editorial|columna|primer contacto|impresiones)\b',

    # 6. Clickbait ambiguo o adivinanzas
    r'^(uno de los|una de las|este es el|esta es la|el secreto de|el men[uú] secreto|la raz[oó]n por|el motivo por|hay un|hay una|del escritorio al)\b',
    r'\b(abre la puerta a|pone sobre la mesa|buena excusa para|no te pierdas|se cobra as[ií] su venganza|por culpa de|no recomienda usarlos|da un golpe de|una pesadilla|lente fija)\b',

    # 7. Ofertas comerciales, descuentos, compras, precios y afiliados
    r'\b(descuento\w*|black friday|black november|oferta\w*|rebaja\w*|ganga|choll\w*|compra este|por menos de|ahorra\w*|barat[oa]\w*|funda\w*|accesorio\w*|cuestan|gratis|regalo|promoci[oó]n|merchandising|altavoz|vatios de calor)\b',

    # 8. Política local española, burocracia, tribunales laborales o temas ajenos
    r'\b(abogado|jefe|sepe|paro|hacienda|seguridad social|alquiler|hipoteca|pensiones|sindicato\w*|pedro s[aá]nchez|ayuntamiento|vigo|madrid|espa[ñn]a|espa[ñn]ol\w*|comunidades aut[oó]nomas|izquierda europea|derecha|elecciones|dem[oó]cratas|republicanos|ata[uú]d|denuncia\w*|sentencia|impuesto\w*|iva\b|ong|toros)\b',

    # 9. Farándula, crímenes, violencia o temas sensibles
    r'\b(abuso|pornograf\w*|violencia|muerto\w*|muere\w*|fallece\w*|asesin\w*|cad[aá]ver\w*|mortaja|bomba|amenaza\w*|autodestrucci[oó]n|bigote|venganza)\b',

    # 10. Listas numeradas al inicio
    r'^\d+\s+'
]

HARD_REJECT_RE = re.compile('|'.join(HARD_REJECT_PATTERNS), re.IGNORECASE)

TECH_VALID_RE = re.compile(
    r'\b(ia\b|inteligencia artificial|apple|google|microsoft|nvidia|amd|intel|openai|chatgpt|claude|anthropic|perplexity|gemini|deepseek|meta|xai|software|ciberseguridad|ciberataque\w*|hack\w*|malware|vulnerabilidad\w*|semiconductor\w*|chip\w*|espacio|nasa|spacex|blue origin|starlink|sat[eé]lite\w*|telescopio|robot\w*|android|iphone|ipad|mac\b|macos|windows|linux|algoritmo\w*|computaci[oó]n|cu[aá]ntic\w*|procesador\w*|smartphone\w*|redes|internet|navegador|c[oó]digo abierto|open source|gpu\w*|cpu\w*|oled|wifi|bluetooth|servidor\w*|nube|cloud|tableta\w*)\b',
    re.IGNORECASE
)

GAMING_VALID_RE = re.compile(
    r'\b(playstation|ps5|ps6|xbox|nintendo|switch|steam|epic games|gog|valve|unity|unreal engine|gta|rockstar|ubisoft|ea\b|electronic arts|activision|blizzard|bethesda|square enix|capcom|sega|konami|bandai namco|fromsoftware|remedy|kojima|sony|halo|zelda|mario|pok[eé]mon|pikmin|call of duty|warzone|battlefield|minecraft|fortnite|roblox|league of legends|valorant|overwatch|god of war|spider-man|wolverine|lobezno|the witcher|cyberpunk|elder scrolls|skyrim|fallout|starfield|final fantasy|resident evil|silent hill|metal gear|assassins creed|stardew valley|honkai|genshin|bloodborne|forza|stronghold|thief|dragon\'s dogma|soulframe|juego\w*|videojuego\w*|consola\w*|jugador\w*|gamer\w*|dlc|expansi[oó]n|parche|actualizaci[oó]n|lanzamiento|ventas|copias|estreno|remake|remaster|fps|rpg)\b',
    re.IGNORECASE
)

TOPIC_STOPWORDS = {
    'para', 'como', 'este', 'esta', 'estos', 'estas', 'pero', 'mas', 'más', 'sobre',
    'entre', 'hasta', 'desde', 'tras', 'ante', 'bajo', 'contra', 'segun', 'según',
    'nuevo', 'nueva', 'nuevos', 'nuevas', 'primer', 'primera', 'puede', 'pueden',
    'podria', 'podría', 'sera', 'será', 'años', 'anos', 'millones', 'mundo',
    'lanza', 'presenta', 'anuncia', 'confirma', 'asegura', 'supera', 'llega',
    'juego', 'juegos', 'videojuego', 'videojuegos', 'inteligencia', 'artificial'
}

def clean_title(t):
    if not t:
        return ""
    t = re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', t)
    t = html.unescape(t)
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'^(FOTOS|VIDEO|EN IMÁGENES|EN FOTOS|TRÁILER|TRAILER|INFORME|OFICIAL|NOTICIA):\s*', '', t, flags=re.IGNORECASE)
    t = re.sub(r'\s+[-|]\s+[^-|]+$', '', t)
    t = re.sub(r'\.{2,}$', '', t)
    t = re.sub(r'\.$', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def is_good_headline(title, tag, categories):
    if len(title) < 34 or len(title) > 125:
        return False
    if len(title.split()) < 6:
        return False
    if tag == 'GAMING' and categories == ['Tecnología']:
        return False
    if HARD_REJECT_RE.search(title):
        return False
    if tag == 'TECNOLOGÍA' and not TECH_VALID_RE.search(title):
        return False
    if tag == 'GAMING' and not GAMING_VALID_RE.search(title):
        return False
    return True

def extract_topic_tokens(title):
    words = re.findall(r'[a-záéíóúñ0-9]{4,}', title.lower())
    return {w for w in words if w not in TOPIC_STOPWORDS}

def is_duplicate_topic(title, existing_token_sets):
    tokens = extract_topic_tokens(title)
    if not tokens:
        return False
    for prev_tokens in existing_token_sets:
        overlap = len(tokens & prev_tokens)
        if overlap >= 3 or (len(tokens) >= 3 and overlap / min(len(tokens), len(prev_tokens)) >= 0.6):
            return True
    existing_token_sets.append(tokens)
    return False

def fetch_feed(tag, url, max_age_hours):
    feed_items = []
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    try:
        ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        req = urllib.request.Request(url, headers={'User-Agent': ua})
        with urllib.request.urlopen(req, timeout=8, context=SSL_CTX) as resp:
            root = ET.fromstring(resp.read())
            for item in root.findall('.//item')[:40]:
                raw_title = item.find('title')
                if raw_title is None or not raw_title.text:
                    continue

                p_date = item.find('pubDate')
                if p_date is not None and p_date.text:
                    try:
                        pub_dt = parsedate_to_datetime(p_date.text)
                        age_hours = (now_utc - pub_dt).total_seconds() / 3600
                        if age_hours > max_age_hours:
                            continue
                    except Exception:
                        pass

                cats = [c.text.strip() for c in item.findall('category') if c.text]
                title = clean_title(raw_title.text)
                if is_good_headline(title, tag, cats):
                    final_tag = tag
                    if tag == 'TECNOLOGÍA' and re.search(r'\b(ps5|ps6|playstation|xbox|nintendo|switch|gta|videojuego|gaming|steam|valve|capcom|sega|zelda|mario|resident evil)\b', title.lower()):
                        final_tag = 'GAMING'
                    feed_items.append((title, final_tag))
    except Exception as e:
        print(f'[NEWS_SERVICE] Error en feed {tag} ({url}): {e}', flush=True)
    return feed_items

def get_efemerides():
    today = datetime.date.today()
    now_m = today.month
    now_d = today.day

    matching_today = []
    for m, d, y, txt in EXACT_DATE_EFEMERIDES:
        if m == now_m and d == now_d:
            clean_txt = re.sub(r'\.+$', '', txt.strip())
            matching_today.append({'category': 'UN DÍA COMO HOY', 'title': clean_txt})

    return matching_today

def fetch_fresh_ticker():
    news_by_cat = {'GAMING': [], 'TECNOLOGÍA': []}
    topic_sets = []

    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {executor.submit(fetch_feed, tag, url, max_h): (tag, url) for tag, url, max_h in FEEDS}
        for future in as_completed(futures):
            for title, tag in future.result():
                if not is_duplicate_topic(title, topic_sets):
                    news_by_cat.setdefault(tag, []).append({'category': tag, 'title': title})

    gaming_items = news_by_cat.get('GAMING', [])
    tech_items = news_by_cat.get('TECNOLOGÍA', [])
    efemerides = get_efemerides()

    interleaved = []
    g_idx, t_idx, e_idx = 0, 0, 0
    pair_count = 0
    max_total = 60

    while len(interleaved) < max_total and (g_idx < len(gaming_items) or t_idx < len(tech_items)):
        if g_idx < len(gaming_items):
            interleaved.append(gaming_items[g_idx])
            g_idx += 1
        if t_idx < len(tech_items):
            interleaved.append(tech_items[t_idx])
            t_idx += 1
        pair_count += 1
        if pair_count % 2 == 0 and e_idx < len(efemerides):
            interleaved.append(efemerides[e_idx])
            e_idx += 1

    return interleaved

def upload_to_firebase(items):
    for it in items:
        if 'title' in it and it['title']:
            it['title'] = re.sub(r'\.+$', '', it['title'].strip())

    data = json.dumps({
        'updatedAt': int(time.time() * 1000),
        'items': items
    }, ensure_ascii=False).encode('utf-8')

    req = urllib.request.Request(
        'https://yaire-591ca-default-rtdb.firebaseio.com/radio_state/news.json',
        data=data,
        method='PUT',
        headers={'Content-Type': 'application/json; charset=utf-8'}
    )

    with urllib.request.urlopen(req, timeout=10, context=SSL_CTX) as resp:
        return resp.read().decode('utf-8')

def news_worker_loop():
    print('[NEWS_SERVICE] Loop de noticias verídicas (Gaming, Tecnología y Efemérides exactas) iniciado.', flush=True)
    time.sleep(5)
    while True:
        try:
            print('[NEWS_SERVICE] Recopilando titulares verificados...', flush=True)
            items = fetch_fresh_ticker()
            if items:
                upload_to_firebase(items)
                print(f'[NEWS_SERVICE] Éxito: {len(items)} titulares subidos a Firebase.', flush=True)
            else:
                print('[NEWS_SERVICE] Aviso: No se pudieron recolectar titulares.', flush=True)
        except Exception as e:
            print(f'[NEWS_SERVICE] Error actualizando noticias: {e}', flush=True)

        time.sleep(1800)

def start_news_updater():
    t = threading.Thread(target=news_worker_loop, daemon=True)
    t.start()
    return t

if __name__ == '__main__':
    print("Ejecutando recopilación y sincronización manual...")
    items = fetch_fresh_ticker()
    if items:
        upload_to_firebase(items)
        print(f"¡Sincronización completada! {len(items)} titulares subidos a Firebase.")
        print("\nTitulares sincronizados:")
        for idx, it in enumerate(items):
            print(f"  {idx+1:2d}. [{it['category']:15s}] | {it['title']}")

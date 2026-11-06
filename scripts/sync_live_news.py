import os
import re
import json
import time
import html
import random
import datetime
from email.utils import parsedate_to_datetime
import threading
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed

# ==============================================================================
# 28E RADIO — SERVICIO DE TITULARES: GAMING, TECNOLOGÍA, UN DÍA COMO HOY Y CULTURA
# ==============================================================================

FEEDS = [
    # Gaming & Videojuegos
    ('GAMING', 'https://www.eurogamer.es/feed/news'),
    ('GAMING', 'https://feeds.weblogssl.com/vidaextra'),
    ('GAMING', 'https://es.ign.com/feed.xml'),

    # Tecnología, Software, IA, Computación & Espacio
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/genbeta'),
    ('TECNOLOGÍA', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/tecnologia/portada'),
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/xataka2'),
    ('TECNOLOGÍA', 'https://feeds.weblogssl.com/xatakamovil'),
]

EFEMERIDES_DB = [
    # Efemérides con fecha exacta de Noviembre
    (11, 6, 1980, 'UN DÍA COMO HOY', 'En 1980, Microsoft e IBM sellaron el histórico acuerdo que dio origen al sistema operativo MS-DOS del IBM PC.'),
    (11, 6, 2012, 'UN DÍA COMO HOY', 'En 2012, 343 Industries lanzó Halo 4 en Xbox 360, recaudando más de 220 millones de dólares en sus primeras 24 horas.'),
    (11, 6, 2015, 'UN DÍA COMO HOY', 'En 2015, Activision y Treyarch lanzaron Call of Duty: Black Ops III, marcando récords de juego multijugador.'),
    (11, 7, 2006, 'UN DÍA COMO HOY', 'En 2006, Epic Games lanzó Gears of War en Xbox 360, revolucionando la cobertura táctica en tercera persona.'),
    (11, 8, 2001, 'UN DÍA COMO HOY', 'En 2001, Nintendo lanzó Super Smash Bros. Melee en Japón para GameCube, forjando una comunidad competitiva legendaria.'),
    (11, 9, 2004, 'UN DÍA COMO HOY', 'En 2004, Bungie lanzó Halo 2 en Xbox, revolucionando el juego multijugador online en consolas con Xbox Live.'),
    (11, 9, 2004, 'UN DÍA COMO HOY', 'En 2004, la Fundación Mozilla lanzó Firefox 1.0, transformando la navegación web y los estándares abiertos.'),
    (11, 10, 2020, 'UN DÍA COMO HOY', 'En 2020, Microsoft lanzó las consolas Xbox Series X y Xbox Series S a nivel mundial.'),
    (11, 11, 2006, 'UN DÍA COMO HOY', 'En 2006, Sony lanzó la PlayStation 3 en Japón con retrocompatibilidad y procesador Cell.'),
    (11, 11, 2011, 'UN DÍA COMO HOY', 'En 2011, Bethesda lanzó The Elder Scrolls V: Skyrim, convirtiéndose en un fenómeno cultural masivo.'),
    (11, 12, 2020, 'UN DÍA COMO HOY', 'En 2020, Sony lanzó la PlayStation 5 con audio 3D Tempest y el innovador mando DualSense.'),
    (11, 15, 1990, 'UN DÍA COMO HOY', 'En 1990, Tim Berners-Lee y Robert Cailliau publicaron la propuesta formal de la World Wide Web en el CERN.'),
    (11, 15, 2001, 'UN DÍA COMO HOY', 'En 2001, Microsoft desafió a la industria lanzando la primera Xbox junto a la revolución de Halo: Combat Evolved.'),
    (11, 15, 2013, 'UN DÍA COMO HOY', 'En 2013, Sony lanzó la PlayStation 4 en Norteamérica, vendiendo más de un millón de unidades en sus primeras 24 horas.'),
    (11, 16, 2004, 'UN DÍA COMO HOY', 'En 2004, Valve lanzó Half-Life 2, impresionando con su motor de físicas Havok y la arquitectura de Steam.'),
    (11, 17, 2006, 'UN DÍA COMO HOY', 'En 2006, Sony lanzó la PlayStation 3 en Norteamérica apostando por la alta definición en formato Blu-Ray.'),
    (11, 18, 2001, 'UN DÍA COMO HOY', 'En 2001, Nintendo lanzó la GameCube, una de las consolas de sobremesa con diseño más emblemático de la marca.'),
    (11, 19, 1998, 'UN DÍA COMO HOY', 'En 1998, Valve redefinió la narrativa en primera persona y la inteligencia artificial en PC con Half-Life.'),
    (11, 19, 2006, 'UN DÍA COMO HOY', 'En 2006, Nintendo lanzó la Wii, transformando el control por movimiento con el fenómeno global de Wii Sports.'),
    (11, 21, 1990, 'UN DÍA COMO HOY', 'En 1990, debutó la Super Famicom en Japón, inaugurando una era dorada del videojuego en 16 bits.'),
    (11, 21, 1998, 'UN DÍA COMO HOY', 'En 1998, Nintendo lanzó The Legend of Zelda: Ocarina of Time en N64, considerado el cenit del diseño de aventuras en 3D.'),
    (11, 21, 1999, 'UN DÍA COMO HOY', 'En 1999, Game Freak lanzó Pokémon Gold & Silver en Game Boy Color, introduciendo la región de Johto y reloj interno.'),
    (11, 22, 2005, 'UN DÍA COMO HOY', 'En 2005, Xbox 360 definió la era moderna con juego online masivo en alta definición y el sistema de logros.'),
    (11, 23, 2004, 'UN DÍA COMO HOY', 'En 2004, Blizzard lanzó World of Warcraft, transformando el videojuego en un espacio social interactivo a escala global.'),
    (11, 27, 1998, 'UN DÍA COMO HOY', 'En 1998, Sega lanzó la Dreamcast en Japón: fue la primera consola doméstica en incorporar conexión nativa a internet.'),
    (11, 30, 1992, 'UN DÍA COMO HOY', 'En 1992, id Software liberó Wolfenstein 3D, sentando las bases fundacionales de los shooters en primera persona.'),

    # Efemérides & Archivo Histórico Landmark
    (None, None, 1971, 'UN DÍA COMO HOY', 'En 1971, Intel presentó el 4004, el primer microprocesador comercial en un único chip de silicio del mundo.'),
    (None, None, 1977, 'UN DÍA COMO HOY', 'En 1977, Apple lanzó el Apple II, una de las primeras computadoras personales de éxito masivo con gráficos en color.'),
    (None, None, 1979, 'UN DÍA COMO HOY', 'En 1979, Sony lanzó el Walkman TPS-L2, permitiendo por primera vez en la historia llevar la música personal en movimiento.'),
    (None, None, 1984, 'UN DÍA COMO HOY', 'En 1984, Apple presentó la Macintosh original con interfaz gráfica y ratón durante el Super Bowl XVIII.'),
    (None, None, 1985, 'UN DÍA COMO HOY', 'En 1985, Nintendo lanzó Super Mario Bros. en NES, rescatando a la industria del videojuego tras el colapso de 1983.'),
    (None, None, 1989, 'UN DÍA COMO HOY', 'En 1989, Nintendo lanzó la Game Boy original creada por Gunpei Yokoi; junto a Tetris superó las 118 millones de unidades.'),
    (None, None, 1991, 'UN DÍA COMO HOY', 'En 1991, Linus Torvalds presentó el núcleo de Linux como un experimento personal; hoy sostiene la infraestructura de internet.'),
    (None, None, 1993, 'UN DÍA COMO HOY', 'En 1993, John Carmack y John Romero liberaron DOOM, revolucionando la computación gráfica y las partidas multijugador en LAN.'),
    (None, None, 1994, 'UN DÍA COMO HOY', 'En 1994, Sony lanzó la PlayStation original en Japón, masificando el formato en disco y los entornos poligonales 3D.'),
    (None, None, 1995, 'UN DÍA COMO HOY', 'En 1995, Microsoft lanzó Windows 95, introduciendo el menú Inicio y la arquitectura de escritorio moderna.'),
    (None, None, 1996, 'UN DÍA COMO HOY', 'En 1996, Nintendo 64 y Super Mario 64 establecieron el estándar del control analógico y la cámara libre en mundos 3D.'),
    (None, None, 1996, 'UN DÍA COMO HOY', 'En 1996, Satoshi Tajiri creó el fenómeno global de Pokémon con el estreno de Pokémon Red & Green en Game Boy.'),
    (None, None, 1997, 'UN DÍA COMO HOY', 'En 1997, Square lanzó Final Fantasy VII en PS1, marcando un antes y un después en la narrativa cinemática de los RPGs.'),
    (None, None, 1998, 'UN DÍA COMO HOY', 'En 1998, Hideo Kojima lanzó Metal Gear Solid en PlayStation, elevando el sigilo y la dirección cinematográfica.'),
    (None, None, 1998, 'UN DÍA COMO HOY', 'En 1998, Larry Page y Sergey Brin fundaron Google en California, redefiniendo la búsqueda y organización de información.'),
    (None, None, 1999, 'UN DÍA COMO HOY', 'En 1999, Sega lanzó la Dreamcast en Occidente el legendario 9/9/99, convirtiéndose en una consola de culto inmortal.'),
    (None, None, 2000, 'UN DÍA COMO HOY', 'En 2000, Sony lanzó la PlayStation 2: vendió más de 160 millones de unidades y se consolidó como la consola más exitosa de la historia.'),
    (None, None, 2001, 'UN DÍA COMO HOY', 'En 2001, Steve Jobs presentó el iPod original con el lema "1.000 canciones en tu bolsillo" y su icónica rueda de control.'),
    (None, None, 2001, 'UN DÍA COMO HOY', 'En 2001, Rockstar Games revolucionó la industria con GTA III, definiendo el concepto de mundo abierto contemporáneo.'),
    (None, None, 2004, 'UN DÍA COMO HOY', 'En 2004, Grand Theft Auto: San Andreas debutó en PS2, consagrándose como una de las obras cumbres del género sandbox.'),
    (None, None, 2004, 'UN DÍA COMO HOY', 'En 2004, Nintendo lanzó la Nintendo DS con pantalla táctil dual, alcanzando más de 154 millones de consolas vendidas.'),
    (None, None, 2007, 'UN DÍA COMO HOY', 'En 2007, Apple presentó el iPhone original, redefiniendo la telefonía móvil y la computación de bolsillo.'),
    (None, None, 2011, 'UN DÍA COMO HOY', 'Hace más de una década, Mojang liberó Minecraft: hoy supera los 300 millones de copias vendidas como el juego más vendido de la historia.'),
    (None, None, 2011, 'UN DÍA COMO HOY', 'En 2011, Hidetaka Miyazaki y FromSoftware forjaron el género Soulsborne con el lanzamiento de Dark Souls.'),

    # Cultura: Cine Sci-Fi, Anime de Culto & Música
    (None, None, 1977, 'CULTURA', 'En 1977, George Lucas estrenó Star Wars: Una Nueva Esperanza, redefiniendo la escala del cine de aventuras en el espacio.'),
    (None, None, 1982, 'CULTURA', 'En 1982, Michael Jackson lanzó "Thriller", el álbum más vendido de la historia con una producción discográfica insuperable.'),
    (None, None, 1982, 'CULTURA', 'En 1982, Ridley Scott esculpió la atmósfera visual del cyberpunk y el cine distópico con el estreno de Blade Runner.'),
    (None, None, 1984, 'CULTURA', 'En 1984, James Cameron estrenó The Terminator, consagrando a Arnold Schwarzenegger como icono del cine de acción.'),
    (None, None, 1985, 'CULTURA', 'En 1985, Robert Zemeckis estrenó Back to the Future, convirtiendo el viaje temporal del DeLorean en un clásico imperecedero.'),
    (None, None, 1986, 'CULTURA', 'En 1986, Toei Animation emitió el primer episodio de Dragon Ball, expandiendo la obra de Akira Toriyama por todo el mundo.'),
    (None, None, 1988, 'CULTURA', 'En 1988, Katsuhiro Otomo deslumbró al cine internacional con Akira y su visión de Neo-Tokyo a 24 cuadros por segundo.'),
    (None, None, 1988, 'CULTURA', 'En 1988, Hayao Miyazaki y Studio Ghibli estrenaron Mi Vecino Totoro, consagrando una nueva era en el cine animado tradicional.'),
    (None, None, 1989, 'CULTURA', 'En 1989, Matt Groening estrenó la serie animada Los Simpson, convertida en un pilar del humor y la televisión moderna.'),
    (None, None, 1991, 'CULTURA', 'En 1991, James Cameron marcó un antes y un después en los efectos digitales de Hollywood con Terminator 2: El Juicio Final.'),
    (None, None, 1993, 'CULTURA', 'En 1993, Steven Spielberg combinó robótica y animación digital para dar vida a los dinosaurios de Jurassic Park.'),
    (None, None, 1994, 'CULTURA', 'En 1994, Quentin Tarantino conquistó el Festival de Cannes con la narrativa no lineal de Pulp Fiction.'),
    (None, None, 1995, 'CULTURA', 'En 1995, Pixar estrenó Toy Story, el primer largometraje animado íntegramente por ordenador en la historia del cine.'),
    (None, None, 1995, 'CULTURA', 'En 1995, Hideaki Anno transformó la animación contemporánea con el impacto psicológico de Neon Genesis Evangelion.'),
    (None, None, 1995, 'CULTURA', 'En 1995, Mamoru Oshii estrenó Ghost in the Shell, una influyente reflexión sobre la conciencia y la identidad artificial.'),
    (None, None, 1997, 'CULTURA', 'En 1997, Daft Punk irrumpió con "Homework", catapultando el sonido del french house en las pistas globales.'),
    (None, None, 1998, 'CULTURA', 'En 1998, Shinichirō Watanabe y Yoko Kanno fusionaron jazz, cine negro y ciencia ficción en la obra maestra Cowboy Bebop.'),
    (None, None, 1999, 'CULTURA', 'En 1999, The Matrix llegó a las salas combinando filosofía existencial, artes marciales y la técnica del bullet time.'),
    (None, None, 1999, 'CULTURA', 'En 1999, David Fincher dirigió Fight Club, una de las películas más analizadas y debatidas del cine contemporáneo.'),
    (None, None, 2000, 'CULTURA', 'En 2000, OutKast lanzó "Stankonia", expandiendo los límites creativos del hip-hop con temas como "Ms. Jackson".'),
    (None, None, 2000, 'CULTURA', 'En 2000, Linkin Park lanzó "Hybrid Theory", consolidando el sonido más exitoso del rock y el nu-metal de los 2000.'),
    (None, None, 2001, 'CULTURA', 'En 2001, Daft Punk lanzó "Discovery", fusionando música electrónica, nostalgia setentera y anime con Interstella 5555.'),
    (None, None, 2001, 'CULTURA', 'En 2001, Damon Albarn y Jamie Hewlett crearon Gorillaz, la primera gran banda virtual multimedia del siglo XXI.'),
    (None, None, 2001, 'CULTURA', 'En 2001, Peter Jackson llevó a la pantalla La Comunidad del Anillo, iniciando una de las trilogías más premiadas de la historia.'),
    (None, None, 2001, 'CULTURA', 'En 2001, El Viaje de Chihiro conquistó el Oso de Oro en Berlín y el Premio Óscar a la mejor película animada.'),
    (None, None, 2003, 'CULTURA', 'En 2003, Linkin Park lanzó "Meteora", dejando himnos generacionales inolvidables como "Numb" e "In the End".')
]

HARD_REJECT_PATTERNS = [
    r'^[?¿]',
    r'^(c[oó]mo|por qu[eé]|cu[aá]ndo|d[oó]nde|qui[eé]n(es)?|qu[eé]|cu[aá]l(es)?|lo que|as[ií] (es|se|fue|funciona))\b',
    r'^(im[aá]genes de|tr[aá]iler de|fotos de|gameplay de)\b',
    r'\b(descuento|black friday|oferta|rebaja|ganga|choll|compra este|por menos de \d+|ahorra|hazte con|llévate|llevate|funda|accesorio|chollo|cuestan|ladrillo en el bolsillo)\b',
    r'\b(n[oó]mada digital|furgoneta|camperizada|alquiler|seguridad social|hacienda|elecciones|votar|pensiones|paro|sindicatos)\b',
    r'\b(hijos|padres|beb[eé]s|cenar sin ellos|dormir|dieta|psicolog\w*|matrimonio|divorcio)\b',
    r'\b(miss universo|reina de belleza|alfombra roja|outfit|bikini|romance|noviazgo|exespos|infidelidad|far[aá]ndula|chisme)\b',
    r'\b(cronograma|surtir gasolina|precio del pasaporte|tasa del d[oó]lar|d[oó]lar bcv)\b',
    r'^(an[aá]lisis|review|opini[oó]n|editorial|columna)\s*[:|]'
]

HARD_REJECT_RE = re.compile('|'.join(HARD_REJECT_PATTERNS), re.IGNORECASE)

TECH_KEYWORD_RE = re.compile(
    r'\b(ia\b|inteligencia artificial|apple|google|microsoft|nvidia|openai|chatgpt|deepseek|software|ciberseguridad|ciberataque\w*|hack\w*|semiconductor\w*|chip\w*|espacio|nasa|spacex|starlink|sat[eé]lite|telescopio|robot\w*|android|iphone|windows|mac\b|macos|linux|algoritmo|criptomoneda|bitcoin|blockchain|ciencia|cient[ií]fic\w*|f[ií]sica|cu[aá]ntic\w*|procesador|m[oó]vil|smartphone|bater[ií]a|redes|internet|sistema operativo|navegador|c[oó]digo|programaci[oó]n|gpu|cpu|pantalla|oled|tecnolog\w*|cu[aá]ntic\w*|supercomputador\w*)\b',
    re.IGNORECASE
)

def clean_title(t):
    if not t:
        return ""
    t = re.sub(r'<!\[CDATA\[(.*?)\]\]>', r'\1', t)
    t = html.unescape(t)
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'^(FOTOS|VIDEO|EN IMÁGENES|EN FOTOS|TRÁILER|TRAILER):\s*', '', t, flags=re.IGNORECASE)
    t = re.sub(r'^[¡!]\s*', '', t)
    t = re.sub(r'\s+[-|]\s+[^-|]+$', '', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return t

def is_good_headline(title, tag):
    if len(title) < 26 or len(title) > 135:
        return False
    if len(title.split()) < 4:
        return False
    if HARD_REJECT_RE.search(title):
        return False
    
    if tag == 'TECNOLOGÍA' and not TECH_KEYWORD_RE.search(title):
        return False

    return True

def fetch_feed(tag, url):
    feed_items = []
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    try:
        ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        req = urllib.request.Request(url, headers={'User-Agent': ua})
        with urllib.request.urlopen(req, timeout=6) as resp:
            root = ET.fromstring(resp.read())
            for item in root.findall('.//item')[:30]:
                raw_title = item.find('title')
                if raw_title is None or not raw_title.text:
                    continue

                # Filtrar estrictamente: solo noticias de las últimas 36 horas
                p_date = item.find('pubDate')
                if p_date is not None and p_date.text:
                    try:
                        pub_dt = parsedate_to_datetime(p_date.text)
                        age_hours = (now_utc - pub_dt).total_seconds() / 3600
                        if age_hours > 36:
                            continue
                    except Exception:
                        pass

                title = clean_title(raw_title.text)
                if is_good_headline(title, tag):
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
    general_pool = []

    for m, d, y, cat, txt in EFEMERIDES_DB:
        # Texto limpio sin fechas de almanaque en el cuerpo
        clean_txt = re.sub(r'^(Un d[ií]a como hoy\s*(\([^)]+\))?[:\-]?\s*)', '', txt, flags=re.IGNORECASE).strip()
        if m == now_m and d == now_d:
            matching_today.append({'category': cat, 'title': clean_txt})
        else:
            general_pool.append({'category': cat, 'title': clean_txt})

    # Shuffle general pool dinámicamente cada 30 minutos
    random.seed(int(time.time() // 1800))
    shuffled = general_pool[:]
    random.shuffle(shuffled)

    return matching_today + shuffled

def fetch_fresh_ticker():
    news_by_cat = {'GAMING': [], 'TECNOLOGÍA': []}
    seen = set()

    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = [executor.submit(fetch_feed, tag, url) for tag, url in FEEDS]
        for future in as_completed(futures):
            for title, tag in future.result():
                norm = re.sub(r'[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]', '', title.lower())
                if norm not in seen:
                    seen.add(norm)
                    news_by_cat.setdefault(tag, []).append({'category': tag, 'title': title})

    gaming_items = news_by_cat.get('GAMING', [])
    tech_items = news_by_cat.get('TECNOLOGÍA', [])
    efemerides = get_efemerides()

    # Interleave limpiamente: GAMING, TECNOLOGÍA, UN DÍA COMO HOY / CULTURA
    interleaved = []
    g_idx, t_idx, e_idx = 0, 0, 0
    max_total = 65

    while len(interleaved) < max_total:
        added = False
        if g_idx < len(gaming_items):
            interleaved.append(gaming_items[g_idx])
            g_idx += 1
            added = True
        if t_idx < len(tech_items):
            interleaved.append(tech_items[t_idx])
            t_idx += 1
            added = True
        if e_idx < len(efemerides):
            interleaved.append(efemerides[e_idx])
            e_idx += 1
            added = True
        if not added:
            break

    return interleaved

def upload_to_firebase(items):
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

    with urllib.request.urlopen(req, timeout=10) as resp:
        return resp.read().decode('utf-8')

def news_worker_loop():
    print('[NEWS_SERVICE] Loop de noticias Gaming, Tecnología y Un Día Como Hoy iniciado.', flush=True)
    time.sleep(5)
    while True:
        try:
            print('[NEWS_SERVICE] Recopilando titulares...', flush=True)
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
        print("\nPrimeros 15 titulares sincronizados:")
        for idx, it in enumerate(items[:15]):
            print(f"  {idx+1:2d}. [{it['category']:15s}] | {it['title']}")

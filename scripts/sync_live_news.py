import os
import re
import json
import time
import html
import random
import datetime
import threading
import urllib.request
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed

# ==============================================================================
# 28E RADIO — SERVICIO DE NOTICIAS TECH & GAMING + EFEMÉRIDES GEEK / POP CULTURE
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
    # Efemérides de Noviembre con fecha exacta
    (11, 15, 1990, 'EFEMÉRIDE GEEK', 'En 1990, Tim Berners-Lee y Robert Cailliau publicaron la propuesta formal de la World Wide Web (WWW).'),
    (11, 15, 2001, 'EFEMÉRIDE GEEK', 'En 2001, Microsoft lanzó la primera consola Xbox junto a "Halo: Combat Evolved", cambiando el FPS en consolas.'),
    (11, 16, 2004, 'EFEMÉRIDE GEEK', 'En 2004, Valve lanzó "Half-Life 2", impresionando al mundo con su motor de físicas Havok y la Gravity Gun.'),
    (11, 17, 2006, 'EFEMÉRIDE GEEK', 'En 2006, Sony lanzó la PlayStation 3 en Norteamérica con lector Blu-Ray y el procesador Cell.'),
    (11, 18, 2001, 'EFEMÉRIDE GEEK', 'En 2001, Nintendo lanzó la GameCube en Norteamérica con su inolvidable diseño compacto y "Luigi\'s Mansion".'),
    (11, 19, 1998, 'EFEMÉRIDE GEEK', 'En 1998, Valve lanzó "Half-Life" en PC, redefiniendo la narrativa ambiental y la inteligencia artificial en juegos.'),
    (11, 19, 2006, 'EFEMÉRIDE GEEK', 'En 2006, Nintendo lanzó la Wii al mercado, revolucionando el juego con sensores de movimiento y "Wii Sports".'),
    (11, 21, 1990, 'EFEMÉRIDE GEEK', 'En 1990, Nintendo lanzó la Super Famicom (SNES) en Japón junto a "Super Mario World" y "F-Zero".'),
    (11, 21, 1998, 'EFEMÉRIDE GEEK', 'En 1998, se lanzó "The Legend of Zelda: Ocarina of Time" para Nintendo 64, catalogado como una obra maestra inmortal.'),
    (11, 21, 1999, 'EFEMÉRIDE GEEK', 'En 1999, Game Freak lanzó "Pokémon Gold & Silver" en Game Boy Color, introduciendo la región de Johto y ciclo día/noche.'),
    (11, 22, 2005, 'EFEMÉRIDE GEEK', 'En 2005, Microsoft lanzó la Xbox 360, popularizando la era de los logros, Xbox Live y la alta definición.'),
    (11, 23, 2004, 'EFEMÉRIDE GEEK', 'En 2004, Blizzard Entertainment lanzó "World of Warcraft", el MMORPG que definiría a toda una generación.'),
    (11, 27, 1998, 'EFEMÉRIDE GEEK', 'En 1998, Sega lanzó la Dreamcast en Japón, la primera consola de 128 bits con módem integrado para internet.'),
    (11, 30, 1992, 'EFEMÉRIDE GEEK', 'En 1992, id Software lanzó "Wolfenstein 3D", estableciendo las raíces del género first-person shooter.'),

    # Efemérides Geek & Computación Landmark
    (None, None, 1971, 'EFEMÉRIDE GEEK', 'En 1971, Intel presentó el 4004, el primer microprocesador comercial en un solo chip de silicio del mundo.'),
    (None, None, 1977, 'EFEMÉRIDE GEEK', 'En 1977, Apple lanzó el Apple II, una de las primeras computadoras personales producidas en masa con gráficos en color.'),
    (None, None, 1979, 'EFEMÉRIDE GEEK', 'En 1979, Sony lanzó el Walkman TPS-L2, permitiendo a las personas escuchar música de forma portátil por primera vez.'),
    (None, None, 1984, 'EFEMÉRIDE GEEK', 'En 1984, Apple presentó la Macintosh original con interfaz gráfica y ratón durante el Super Bowl XVIII.'),
    (None, None, 1985, 'EFEMÉRIDE GEEK', 'En 1985, Nintendo lanzó "Super Mario Bros." en NES, salvando a la industria de los videojuegos del colapso de 1983.'),
    (None, None, 1989, 'EFEMÉRIDE GEEK', 'En 1989, Nintendo lanzó la Game Boy original creada por Gunpei Yokoi, vendiendo más de 118 millones de unidades.'),
    (None, None, 1991, 'EFEMÉRIDE GEEK', 'En 1991, Linus Torvalds publicó el núcleo de Linux con un mensaje libre en Usenet: "solo un hobby, no será grande".'),
    (None, None, 1993, 'EFEMÉRIDE GEEK', 'En 1993, John Carmack y John Romero liberaron "DOOM", revolucionando la computación gráfica y el juego en red LAN.'),
    (None, None, 1994, 'EFEMÉRIDE GEEK', 'En 1994, Sony lanzó la PlayStation original (PS1) en Japón, popularizando los CDs de audio y gráficos 3D.'),
    (None, None, 1995, 'EFEMÉRIDE GEEK', 'En 1995, Microsoft lanzó Windows 95 con el botón Inicio y la barra de tareas, vendiendo 7 millones de copias en 5 semanas.'),
    (None, None, 1996, 'EFEMÉRIDE GEEK', 'En 1996, Nintendo lanzó la Nintendo 64 y "Super Mario 64", sentando los cimientos de la cámara libre en 3D.'),
    (None, None, 1996, 'EFEMÉRIDE GEEK', 'En 1996, Satoshi Tajiri creó Pokémon con el debut de "Pokémon Red & Green" en Japón para la Game Boy.'),
    (None, None, 1997, 'EFEMÉRIDE GEEK', 'En 1997, Square lanzó "Final Fantasy VII" en PS1, convirtiéndose en un fenómeno cultural y cinemático global.'),
    (None, None, 1998, 'EFEMÉRIDE GEEK', 'En 1998, Hideo Kojima lanzó "Metal Gear Solid" en PlayStation, elevando el sigilo y la cinematografía en videojuegos.'),
    (None, None, 1998, 'EFEMÉRIDE GEEK', 'En 1998, Larry Page y Sergey Brin fundaron Google en un garaje de Menlo Park, California.'),
    (None, None, 1999, 'EFEMÉRIDE GEEK', 'En 1999, Sega lanzó la Dreamcast en Occidente el legendario 9/9/99, convirtiéndose en consola de culto.'),
    (None, None, 2000, 'EFEMÉRIDE GEEK', 'En 2000, Sony lanzó la PlayStation 2, que llegaría a vender más de 160 millones de consolas en todo el mundo.'),
    (None, None, 2001, 'EFEMÉRIDE GEEK', 'En 2001, Apple lanzó el primer iPod bajo el lema "1.000 canciones en tu bolsillo" con rueda de desplazamiento físico.'),
    (None, None, 2001, 'EFEMÉRIDE GEEK', 'En 2001, Rockstar Games lanzó "Grand Theft Auto III", creando el estándar de los mundos abiertos en 3D.'),
    (None, None, 2004, 'EFEMÉRIDE GEEK', 'En 2004, Rockstar Games lanzó "GTA: San Andreas", uno de los videojuegos más influyentes y queridos de la historia.'),
    (None, None, 2004, 'EFEMÉRIDE GEEK', 'En 2004, Nintendo lanzó la Nintendo DS con doble pantalla táctil, vendiendo más de 154 millones de consolas.'),
    (None, None, 2007, 'EFEMÉRIDE GEEK', 'En 2007, Steve Jobs presentó el iPhone diciendo: "un iPod de pantalla ancha, un teléfono y un navegador de internet".'),
    (None, None, 2011, 'EFEMÉRIDE GEEK', 'En 2011, Mojang lanzó la versión final de "Minecraft", convirtiéndose en el videojuego más vendido de la historia (300M+).'),
    (None, None, 2011, 'EFEMÉRIDE GEEK', 'En 2011, FromSoftware y Hidetaka Miyazaki lanzaron "Dark Souls", forjando el género Soulsborne.'),

    # Cultura Pop, Anime & Cine Clásico
    (None, None, 1977, 'CULTURA POP', 'En 1977, George Lucas estrenó "Star Wars: Una Nueva Esperanza", transformando el cine de ciencia ficción para siempre.'),
    (None, None, 1982, 'CULTURA POP', 'En 1982, Michael Jackson lanzó "Thriller", el álbum musical más vendido de todos los tiempos con más de 70M de copias.'),
    (None, None, 1982, 'CULTURA POP', 'En 1982, Ridley Scott estrenó "Blade Runner", definiendo la atmósfera visual y estética cyberpunk moderna.'),
    (None, None, 1984, 'CULTURA POP', 'En 1984, James Cameron estrenó "The Terminator", consagrando a Arnold Schwarzenegger como icono del cine de acción.'),
    (None, None, 1985, 'CULTURA POP', 'En 1985, Robert Zemeckis estrenó "Back to the Future", convirtiendo al DeLorean y a Doc Brown en mitos del cine.'),
    (None, None, 1986, 'CULTURA POP', 'En 1986, Toei Animation emitió el primer episodio del anime "Dragon Ball" basado en el manga de Akira Toriyama.'),
    (None, None, 1988, 'CULTURA POP', 'En 1988, Katsuhiro Otomo estrenó la película animada "Akira", deslumbrando al mundo con su animación cyberpunk a 24 fps.'),
    (None, None, 1988, 'CULTURA POP', 'En 1988, Studio Ghibli y Hayao Miyazaki estrenaron "Mi Vecino Totoro", obra cumbre de la animación japonesa.'),
    (None, None, 1989, 'CULTURA POP', 'En 1989, Matt Groening estrenó la serie "Los Simpson" en la televisión estadounidense.'),
    (None, None, 1991, 'CULTURA POP', 'En 1991, James Cameron estrenó "Terminator 2: El Juicio Final", marcando un hito en efectos especiales por CGI con el T-1000.'),
    (None, None, 1993, 'CULTURA POP', 'En 1993, Steven Spielberg estrenó "Jurassic Park", fascinando al planeta con dinosaurios mecánicos y computarizados.'),
    (None, None, 1994, 'CULTURA POP', 'En 1994, Quentin Tarantino estrenó "Pulp Fiction", ganando la Palma de Oro con sus diálogos no lineales de culto.'),
    (None, None, 1995, 'CULTURA POP', 'En 1995, Pixar estrenó "Toy Story", el primer largometraje animado íntegramente por ordenador.'),
    (None, None, 1995, 'CULTURA POP', 'En 1995, Hideaki Anno estrenó "Neon Genesis Evangelion", revolucionando la narrativa del anime psicológico y de mechas.'),
    (None, None, 1995, 'CULTURA POP', 'En 1995, Mamoru Oshii estrenó "Ghost in the Shell", una profunda exploración sobre la identidad artificial y la cibernética.'),
    (None, None, 1997, 'CULTURA POP', 'En 1997, Daft Punk lanzó su álbum debut "Homework", catapultando el french house con himnos como "Around the World".'),
    (None, None, 1998, 'CULTURA POP', 'En 1998, Shinichirō Watanabe estrenó "Cowboy Bebop", fusionando el jazz de Yoko Kanno, el cine noir y el espacio.'),
    (None, None, 1999, 'CULTURA POP', 'En 1999, las hermanas Wachowski estrenaron "The Matrix", popularizando el "bullet time" y la filosofía cyberpunk.'),
    (None, None, 1999, 'CULTURA POP', 'En 1999, David Fincher estrenó "Fight Club", basada en la novela de Chuck Palahniuk y convertida en cinta de culto.'),
    (None, None, 2000, 'CULTURA POP', 'En 2000, OutKast lanzó su icónico álbum "Stankonia", reinventando el sonido del hip-hop con temas como "Ms. Jackson".'),
    (None, None, 2000, 'CULTURA POP', 'En 2000, Linkin Park lanzó "Hybrid Theory", uno de los álbumes debut de rock y nu-metal más vendidos de la historia.'),
    (None, None, 2001, 'CULTURA POP', 'En 2001, Daft Punk lanzó "Discovery", con pistas maestras como "One More Time" y "Harder, Better, Faster, Stronger".'),
    (None, None, 2001, 'CULTURA POP', 'En 2001, Damon Albarn y Jamie Hewlett crearon "Gorillaz", presentando a la banda animada más icónica del siglo XXI.'),
    (None, None, 2001, 'CULTURA POP', 'En 2001, Peter Jackson estrenó "El Señor de los Anillos: La Comunidad del Anillo", redefiniendo la fantasía épica en el cine.'),
    (None, None, 2001, 'CULTURA POP', 'En 2001, Hayao Miyazaki estrenó "El Viaje de Chihiro", la única película animada japonesa en ganar el Premio Óscar.'),
    (None, None, 2003, 'CULTURA POP', 'En 2003, Linkin Park lanzó "Meteora", dejando himnos generacionales inolvidables como "Numb" e "In the End".')
]

HARD_REJECT_PATTERNS = [
    r'^[?¿]',
    r'^(c[oó]mo|por qu[eé]|cu[aá]ndo|d[oó]nde|qui[eé]n(es)?|qu[eé]|cu[aá]l(es)?|lo que|as[ií] (es|se|fue|funciona))\b',
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
    if len(title) < 22 or len(title) > 135:
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
    try:
        ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        req = urllib.request.Request(url, headers={'User-Agent': ua})
        with urllib.request.urlopen(req, timeout=6) as resp:
            root = ET.fromstring(resp.read())
            for item in root.findall('.//item')[:30]:
                raw_title = item.find('title')
                if raw_title is None or not raw_title.text:
                    continue
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
        if m == now_m and d == now_d:
            matching_today.append({'category': cat, 'title': f'Un día como hoy ({now_d}/{now_m}): {txt}'})
        else:
            general_pool.append({'category': cat, 'title': txt})

    # Shuffle general pool dynamically
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
    print('[NEWS_SERVICE] Loop de noticias Tech, Gaming y Efemérides iniciado.', flush=True)
    time.sleep(5)
    while True:
        try:
            print('[NEWS_SERVICE] Recopilando titulares Tech, Gaming y Efemérides...', flush=True)
            items = fetch_fresh_ticker()
            if items:
                upload_to_firebase(items)
                print(f'[NEWS_SERVICE] Éxito: {len(items)} titulares Tech, Gaming y Efemérides subidos a Firebase.', flush=True)
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
    print("Ejecutando recopilación y sincronización manual de noticias...")
    items = fetch_fresh_ticker()
    if items:
        upload_to_firebase(items)
        print(f"¡Sincronización completada! {len(items)} titulares subidos a Firebase.")
        print("\nPrimeros 15 titulares sincronizados:")
        for idx, it in enumerate(items[:15]):
            print(f"  {idx+1:2d}. [{it['category']:16s}] {it['title']}")

import re

# Reglas de descarte total
HARD_REJECT_PATTERNS = [
    # 1. Preguntas (directas o indirectas)
    r'[?¿]',
    r'^(c[oó]mo|por qu[eé]|cu[aá]ndo|d[oó]nde|qui[eé]n(es)?|qu[eé] (es|significa|hay|se sabe)|lo que|as[ií] (es|se|fue|funciona))\b',

    # 2. Rankings, listas, tops y artículos atemporales de revista
    r'^(los|las|el|la)\s+mejores\b',
    r'\bmejores\s+(peloteros|jugadores|destinos|hoteles|playas|restaurantes|coches|autos|canciones|pel[ií]culas|series|libros|apps|tel[eé]fonos)\b',
    r'^\d+\s+(claves|consejos|errores|formas|maneras|momentos|motivos|razones|cosas|lugares|trucos|preguntas)\b',
    r'\b(el top \d+|los \d+ mejores|las \d+ mejores)\b',

    # 3. Crónica roja morbosa, sucesos domésticos, riñas carcelarias y femicidios
    r'\b(mat[oó] a su ex|asesin[oó] a su|femicid\w*|feminicid\w*|descuartiz\w*|viol[oó] a|violador\w*|hallan cad[aá]ver|cad[aá]veres|en bolsas cuando|abandonaron a un beb[eé])\b',
    r'\b(agredir subdirector|recluso que intent[oó]|preso en najayo|c[aá]rcel de najayo|ri[ñn]a en)\b',
    r'\b(amenazaba desde ee|matan a balazos|a tiros en|lo matan de|acribillan a|sicarios asesinan)\b',

    # 4. Reviews personales, blogs y primeras personas
    r'^(experiencia con|mi opini[oó]n|probamos el|an[aá]lisis del|review de)\b',
    r'\b(olv[ií]date de|as[ií] puedes|lo que debes saber|todo lo que necesitas)\b',

    # 5. Etiquetas de corresponsalía de TV, videos o podcasts
    r'^(informe desde|en v[ií]deo|en video|en directo|minuto a minuto|al minuto|podcast|el ma[ñn]anero|#teexplicamos)\b',

    # 6. Ofertas comerciales, compras, descuentos y afiliados
    r'\b(descuento|black friday|oferta|rebaja|ganga|choll|compra este|por menos de \d+ euros|por menos de \d+ d[oó]lares)\b',

    # 7. Farándula, virales de redes sociales, mascotas graciosas
    r'\b(un perro irrumpe|perro en el campo|gato|ins[oó]lito|curioso|viral|en tiktok|furor en redes|se hace viral|hijo de santi cazorla|hijo de)\b',
    r'\b(miss universo|reina de belleza|alfombra roja|outfit|bikini|romance|noviazgo|exespos|infidelidad|far[aá]ndula|chisme|tiktoker|influencer|luce irreconocible|sensual|esc[aá]ndalo)\b',

    # 8. Trámites, tarifas periódicas de servicios y SEO utilitario
    r'\b(cronograma|surtir gasolina|gasolina subsidiada|precio del pasaporte|costo del pasaporte|pasaporte venezolano)\b',
    r'\b(planes de (digitel|movistar|cantv|inter|simple\w*)|precios de los planes|planes y tarifas)\b',
    r'\b(esto cuesta|estos son los precios|cuánto cuesta|cuanto cuesta|precios que debes pagar)\b',
    r'\b(paso a paso|requisitos para|cómo tramitar|como tramitar|dónde consultar|donde consultar)\b',
    r'\b(bono de la patria|patria entrega|sistema patria|carnet de la patria)\b',
    r'\b(tasa del d[oó]lar bcv|d[oó]lar bcv|feriado bancario|calendario bancario)\b',

    # 9. Basura HTML y caracteres rotos
    r'(<br\s*/?>|&lt;|&gt;|&quot;)',
]

HARD_REJECT_RE = re.compile('|'.join(HARD_REJECT_PATTERNS), re.IGNORECASE)

# Lista de verbos y acciones noticiosas (Una noticia real afirma una acción concreta)
VERB_ACTION_RE = re.compile(
    r'\b(anuncia|anunci[oó]|aprueba|aprob[oó]|avanza|abre|acuerda|acord[oó]|alcanza|alcanz[oó]|asume|asumi[oó]|'
    r'busca|bloquea|bloque[oó]|cae|caen|cancela|cancel[oó]|cierra|cierran|confirma|confirm[oó]|condena|conden[oó]|'
    r'crece|cumple|declara|declar[oó]|defiende|denuncia|denunci[oó]|deroga|derog[oó]|derrota|derrot[oó]|'
    r'desmiente|destaca|destac[oó]|detiene|detienen|dimite|dimiti[oó]|elimina|elimin[oó]|emite|emiti[oó]|'
    r'empata|enfrenta|entrega|entreg[oó]|establece|estableci[oó]|exige|exigi[oó]|expulsa|expuls[oó]|'
    r'fallece|firma|firm[oó]|frena|fren[oó]|gana|ganan|garantiza|hace|halla|hallan|impone|impuso|'
    r'inicia|inician|investiga|investigan|lanza|lanz[oó]|lidera|llega|llegan|logra|logr[oó]|muere|'
    r'nombra|nombr[oó]|ordena|orden[oó]|pacta|pact[oó]|pide|piden|plantea|presenta|present[oó]|'
    r'proh[ií]be|prohibi[oó]|propone|propuso|ratifica|ratific[oó]|rechaza|rechaz[oó]|recibe|recibi[oó]|'
    r'recorta|recort[oó]|reduce|redujo|reitera|reiter[oó]|renuncia|renunci[oó]|rescata|rescat[oó]|'
    r'revela|revel[oó]|rompe|rompi[oó]|sanciona|sancion[oó]|solicita|solicit[oó]|supera|super[oó]|'
    r'suspende|suspendi[oó]|toma|toman|vence|vencen|viaja|viajan|visita|visit[oó])\b',
    re.IGNORECASE
)

sample_tests = [
    ("Los mejores peloteros latinos en el béisbol de Japón", False),
    ("Hombre que mató a su expareja en santiago rodríguez la amenazaba desde ee uu", False),
    ("Controlan recluso que intentó agredir subdirector de Najayo", False),
    ("Experiencia con Uber Black en Santo Domingo", False),
    ("¡Ladrando al campo equivocado! Un perro irrumpe en un partido...", False),
    ("El anti Infantino cobra fuerza<br>", False),
    ("Informe desde Miami: el respaldo de Trump a la congresista...", False),
    ("Cronograma para surtir gasolina subsidiada en Venezuela...", False),
    ("El futuro ya no es lo que era antes", False),
    ("Almacenamiento en la nube con un 87 % de descuento", False),
    ("MLB propone aplazar hasta 2028 el tope salarial", True),
    ("SNTP advierte que reforma de Ley Contra el Odio mantiene censura a periodistas", True),
    ("Diputados aprueban reducir a 18 meses el plazo para la responsabilidad penal", True),
    ("Google recibe un revés ante el TJUE por el uso de noticias en Gemini", True),
    ("La UE autoriza la compra de la matriz de MediaMarkt por 2.200 millones", True),
    ("Cierran primeros centros de votación en Indiana y Kentucky", True),
    ("Establecen nuevo requisito a pasajeros que viajan a EEUU desde RD", True),
    ("Delcy Rodríguez prevé tener lista la reforma fiscal y tributaria", True),
    ("Alemania busca culpables tras los disturbios de la Generación Z", True),
]

print("PROBANDO CRITERIO DE VERIFICACIÓN...")
passed_all = True
for title, expected in sample_tests:
    rejected_by_hard = bool(HARD_REJECT_RE.search(title))
    has_verb = bool(VERB_ACTION_RE.search(title))
    is_valid = (not rejected_by_hard) and has_verb
    if is_valid != expected:
        print(f"FAILED on '{title}' -> Got {is_valid}, expected {expected} (rejected={rejected_by_hard}, verb={has_verb})")
        passed_all = False
    else:
        status = "KEEP" if is_valid else "DROP"
        print(f"[{status:4s}] {title[:65]}")

print(f"\nRESULTADO DE LA PRUEBA: {'¡PERFECTO!' if passed_all else 'HAY ERRORES'}")


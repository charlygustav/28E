import urllib.request
import xml.etree.ElementTree as ET
import re
import html
from concurrent.futures import ThreadPoolExecutor, as_completed

import sys, os
sys.path.insert(0, os.path.abspath('.'))
from hf_radio28e.news_service import FEEDS, clean_title

# 1. Filtros de ambigüedad de país / "Qué gobierno"
AMBIGUOUS_GOV_RE = re.compile(
    r'^(el gobierno|el ejecutivo|el consejo de ministros|la seguridad social|hacienda|las comunidades aut[oó]nomas|la audiencia nacional|el supremo)\s+(aprueba|avanza|tramita|prepara|estudia|acuerda|reduce|registra|publica|anula|fija|dicta|exige|sube|baja|congela)\b',
    re.IGNORECASE
)

# 2. Ensayos, manifiestos y títulos sin acción
ESSAY_TITLE_PATTERNS = [
    r'^[A-ZÁÉÍÓÚ][a-zñáéíóú]+\s+y\s+(los|las|el|la)\s+[a-zñáéíóú]+$', # E.g. "Brasil y los dueños del algoritmo"
    r'^[A-ZÁÉÍÓÚ][a-zñáéíóú\s]+\.\s+El\s+mapa\s+de\b',              # E.g. "Venezuela libre. El mapa de..."
    r'\b(el futuro ya no|tambaleante trono|dueños del algoritmo|mapa de nuestra nueva)\b',
    r'^(informe desde|cr[oó]nica desde|directo desde|en vivo desde)\b',
    r'\b(por escupir|se encienden las alarmas|a cobrar lo que vale)\b'
]
ESSAY_RE = re.compile('|'.join(ESSAY_TITLE_PATTERNS), re.IGNORECASE)

# 3. Filtro de deportes no relevantes / anécdotas absurdas de NFL
IRRELEVANT_SPORTS_RE = re.compile(
    r'\b(por escupir|cortan a|bebedor|sorbo de vino|choca con aficionado|padre de bellingham|sub-50)\b',
    re.IGNORECASE
)

test_titles = [
    "Informe desde Detroit: Michigan, un estado afectado por las políticas arancelarias de Trump",
    "Venezuela libre. El mapa de nuestra nueva democracia",
    "El Gobierno aprueba el decreto para la implantación definitiva de la radio digital tras dos décadas de retraso",
    "Brasil y los dueños del algoritmo",
    "Bills cortan a Gardner-Johnson por escupir",
    "Lamine Yamal bate un récord de goles de Mbappé",
    "Diputados aprueban reducir a 18 meses el plazo para la responsabilidad penal",
    "SNTP rechazó la aprobación de la reforma de la Ley contra el Odio",
    "Cierran primeros centros de votación en Indiana y Kentucky",
    "Los Ángeles dice adiós al petróleo tras años de lucha vecinal"
]

print("=== VERIFICANDO LOS 5 TITULARES REPORTADOS POR EL USUARIO ===")
for t in test_titles:
    rej_gov = bool(AMBIGUOUS_GOV_RE.search(t))
    rej_essay = bool(ESSAY_RE.search(t))
    rej_sport = bool(IRRELEVANT_SPORTS_RE.search(t))
    is_rejected = rej_gov or rej_essay or rej_sport
    reasons = []
    if rej_gov: reasons.append("Gobierno ambiguo")
    if rej_essay: reasons.append("Ensayo/Slogan/Informe")
    if rej_sport: reasons.append("Deporte irrelevante/absurdo")
    status = "REJECT" if is_rejected else "ACCEPT"
    print(f"[{status:6s}] {t[:60]} -> {', '.join(reasons) if reasons else 'Válido'}")

import re

narrative_re = re.compile(
    r'^(c[oó]mo|por qu[eé]|cu[aá]ndo|d[oó]nde|qui[eé]n(es)?|qu[eé] (es|significa|hay|se sabe)|lo que|as[ií] (es|se|fue|funciona))\b',
    re.IGNORECASE
)

tests = [
    "Cómo se vive en un campamento que pide la liberación de presos políticos",
    "Por qué la segunda oleada de hackeos a las neveras en supermercados avisa de los riesgos",
    "Qué es el zeptoverso, el mundo más pequeño jamás detectado en la naturaleza",
    "Así es como los piratas informáticos vaciaron las cuentas de Binance",
    "Lo que se sabe del accidente aéreo en Florida",
    "SNTP advierte que reforma de Ley Contra el Odio mantiene censura a periodistas",
    "Cierran primeros centros de votación en Indiana y Kentucky",
    "Hansi Flick: Siempre buscaremos lo mejor para el equipo",
    "Nvidia supera a Apple como la empresa más valiosa del mundo"
]

for t in tests:
    rejected = bool(narrative_re.search(t))
    print(f"[{'REJECT' if rejected else 'KEEP  '}] {t}")


#!/usr/bin/env python3
"""Static packaging checks only; not a build, QA pass or claim of commerce readiness."""
import json,hashlib,unicodedata
from pathlib import Path
r=Path(__file__).resolve().parent.parent
v=json.loads((r/'data/v2/authentic_gita_seed.json').read_text(encoding='utf-8'))
o=json.loads((r/'data/v2/original_slogans_seed.json').read_text(encoding='utf-8'))
assert len(v)==5 and len(o)>=25
assert len({x['id'] for x in v})==len(v)
assert len({x['id'] for x in o})==len(o)
assert len({unicodedata.normalize('NFC',x['text']).casefold().strip() for x in o})==len(o)
for x in v:
 assert x['sourceUrl'].startswith('https://heritage.iitk.ac.in/SBG/')
 assert x['chapterVerse'] in x['sourceUrl']
 assert '\n' in x['originalSanskrit']
 assert 'NEEDS_HUMAN_LANGUAGE_REVIEW'==x['translationStatus']
for n in ['karma-editorial-front-back.webp','karma-editorial-front.webp','karma-editorial-back.webp']:
 assert (r/'public/images'/n).exists()
p=(r/'src/app/shop/[slug]/page.tsx').read_text(encoding='utf-8')
assert 'NOT AVAILABLE FOR PURCHASE' in p and 'EditorialGallery' in p
q=(r/'src/lib/catalog.ts').read_text(encoding='utf-8')
assert 'karma-action-oversized-tee' in q and 'quiet-is-a-power-move' in q
print('PASS: static curated source records, distinct original drafts, local image assets, hard-closed concept checkout, routes')
print('NOT TESTED: Next.js compile, Prisma migration, payments, shipping, user experience, production supplier readiness')

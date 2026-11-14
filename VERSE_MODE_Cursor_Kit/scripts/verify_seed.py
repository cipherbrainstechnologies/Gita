import csv, pathlib, re, hashlib, sys
root=pathlib.Path(__file__).resolve().parents[1]
with (root/'data/verses_1000_drafts.csv').open(encoding='utf-8',newline='') as f: verses=list(csv.DictReader(f))
with (root/'data/design_briefs_1000.csv').open(encoding='utf-8',newline='') as f: briefs=list(csv.DictReader(f))
assert len(verses)==1000, f'Expected 1000 verses, got {len(verses)}'
assert len(briefs)==1000, f'Expected 1000 briefs, got {len(briefs)}'
for data,field in [(verses,'fingerprint'),(verses,'text'),(briefs,'fingerprint')]:
    assert len(set(row[field] for row in data))==1000,(field,'duplicate')
assert all(q['status'] in {'DRAFT_ORIGINAL','AI_EDITORIAL_REVIEW_REQUIRED'} for q in verses)
assert all(q['origin_type']=='ORIGINAL_DRAFT_NOT_AUTHENTICATED_CLASSICAL' for q in verses)
quote_keys={q['fingerprint'] for q in verses}
assert all(b['quote_fingerprint'] in quote_keys for b in briefs)
print('PASS: 1,000 original *draft* verse records + 1,000 unique draft design briefs; 0 authorised sales designs')

"""Author *draft ideation candidates*, not verified classical verses or production apparel.
Deterministic and easy for human editorial replacement. Run only in development.
"""
import csv, pathlib, hashlib, re
from itertools import product
root=pathlib.Path(__file__).resolve().parents[1]
THEMES=[
 ('FOCUS','focus','distraction','attention','move with purpose','the next hour','calm concentration'),
 ('QUIET REBEL','quiet confidence','public approval','inner strength','trust your pace','the empty room','the thoughtful person'),
 ('FRIENDSHIP','honest friendship','easy applause','trust','speak the truth','the long conversation','the brave friend'),
 ('GROWTH','growth','perfection','progress','practice again','the awkward beginning','your future self'),
 ('DISCIPLINE','discipline','temporary hype','consistency','show up again','an ordinary Tuesday','the patient athlete'),
 ('MOTION','movement','a perfect plan','momentum','take the first step','the open road','a moving mind'),
 ('BOUNDARIES','clear boundaries','people pleasing','self respect','say no kindly','a quiet weekend','your own voice'),
 ('COURAGE','everyday courage','certainty','bravery','start before ready','the unknown room','the curious heart'),
 ('PATIENCE','patience','the shortcut','steadiness','stay with the work','the long season','a growing root'),
 ('AUTHENTICITY','being yourself','the performance','honesty','keep your edge','the unfiltered mirror','the original mind'),
 ('CHANGE','meaningful change','old habits','renewal','change one thing','the next chapter','the new version'),
 ('ENERGY','protected energy','empty obligations','balance','rest deliberately','your best hours','the rested mind'),
 ('CREATIVITY','unusual ideas','safe formulas','imagination','make something new','the messy notebook','the maker'),
 ('RESILIENCE','resilience','the easy exit','recovery','try once more','the hard mile','the returning runner'),
 ('CAMPUS LIFE','curiosity','the grade alone','learning','ask better questions','the last classroom','the student who experiments'),
 ('TRUTH','honest truth','comfortable fiction','integrity','question assumptions','the honest debate','the independent thinker'),
 ('JOY','real joy','performative happiness','delight','find your small win','an unexpected morning','the laughing friend'),
 ('TIME','unhurried time','urgent noise','presence','protect one moment','the last sunset','the mindful person'),
 ('BALANCE','healthy balance','constant comparison','perspective','choose what matters','your off day','the whole person'),
 ('AMBITION','grounded ambition','empty status','purpose','build quietly','the next milestone','the persistent builder'),
]
# 50 distinct phrase structures. The generated content is deliberately marked editorial review.
TEMPLATES=[
 'Less {bad}. More {good}.',
 'Choose {good} over {bad}.',
 '{good_title} looks better than {bad}.',
 'The real flex is {good}.',
 'Let {bad} fade; keep {good}.',
 'A little {good} beats a lot of {bad}.',
 '{good_title} deserves more space.',
 'No applause required for {good}.',
 '{good_title} is not a spectator sport.',
 'Never outsource your {good}.',
 'Make room for {good}, not {bad}.',
 'Good things grow from {good}.',
 'More {good}, fewer borrowed opinions.',
 'Wear the mindset: {good}.',
 'Not every day needs {bad}.',
 'Keep {good}; lose the noise.',
 'Consider this your reminder to {act}.',
 'Your next move: {act}.',
 'When in doubt, {act}.',
 'The plan is simple: {act}.',
 'Even on Monday, {act}.',
 'This week, {act}.',
 'Try the brave version: {act}.',
 'Reset the day; {act}.',
 'No audience needed: {act}.',
 'One honest decision: {act}.',
 'Start with {place}.',
 'There is room for {good} in {place}.',
 'Leave {bad} outside {place}.',
 '{place_title} can change a perspective.',
 'Some days are built in {place}.',
 'The best ideas visit {place}.',
 'Find your rhythm in {place}.',
 'You can begin again in {place}.',
 'The next story starts in {place}.',
 'A fresh perspective waits in {place}.',
 'Be more like {person}.',
 '{person_title} does not need a spotlight.',
 'Let {person} lead for a day.',
 'The world needs more of {person}.',
 'Make space for {person}.',
 'The quiet hero is {person}.',
 'Behind every breakthrough: {person}.',
 'Respect the journey of {person}.',
 'Not all heroes wear capes; some are {person}.',
 'Remember the work of {person}.',
 'A stronger tomorrow begins with {good}.',
 'The future could use more {good}.',
 'Today is enough for {act}.',
 'Keep the story moving with {good}.',
]
assert len(THEMES)==20 and len(TEMPLATES)==50

def normalize(t):return re.sub(r'\s+',' ',re.sub(r'[^a-z0-9\s]',' ',t.lower())).strip()
def sha(t):return hashlib.sha256(t.encode()).hexdigest()
verse=[]
for ti,(theme,good,bad,quality,act,place,person) in enumerate(THEMES):
 for j,tpl in enumerate(TEMPLATES):
  content=tpl.format(good=good,bad=bad,quality=quality,act=act,place=place,person=person,good_title=good[:1].upper()+good[1:],place_title=place[:1].upper()+place[1:],person_title=person[:1].upper()+person[1:])
  normalized=normalize(content)
  fingerprint=sha('en::'+normalized)
  verse.append(dict(id=f'VMQ-{len(verse)+1:04d}',language='en',theme=theme,text=content,fingerprint=fingerprint,
    origin_type='ORIGINAL_DRAFT_NOT_AUTHENTICATED_CLASSICAL',status='AI_EDITORIAL_REVIEW_REQUIRED',source='deterministic_original_prompt_structures',review_notes='Do not publish. Editorial/language, originality and trademark review required.'))
assert len(verse)==len(set(q['fingerprint'] for q in verse))==1000
brief=[]
art_families=['BOLD TYPE','TYPE + MICRO ICON','VERTICAL TYPE','ARCHED LETTERING','BACK PANEL','TINY CHEST','HALFTONE MOTIF','MONOSPACED BLOCK','GEOMETRIC GRID','HAND LETTERED']
placements_tees=['CENTER CHEST','LEFT CHEST','BACK LARGE','SLEEVE MINI']
placements_pants=['LEFT THIGH','RIGHT THIGH','SIDE LEG','ANKLE MINI']
motifs=['BROKEN CIRCLE','LINEWORK SUN','PIXEL STAR','UNDERLINE','TINY COMPASS','OFFSET BOX','SHADOW ARC','SINGLE DOT','PARALLEL LINES','NO MOTIF']
palettes=['INK/BONE','MOSS/CREAM','BERRY/SMOKE','BONE/COBALT','BLACK/LIME','ASH/LILAC','CLAY/MILK','MIDNIGHT/RED','SAGE/CHARCOAL','OAT/INK']
fits_tees=['OVERSIZED','RELAXED','REGULAR','BOXY']
fits_pants=['STRAIGHT','TAPERED','LOOSE','ATHLETIC']
for n,q in enumerate(verse):
 garment='TEES' if n%2==0 else 'PANTS'
 art=art_families[n//20%len(art_families)]
 fingerprint=sha('::'.join([q['fingerprint'],garment.lower(),art.lower()]))
 brief.append(dict(id=f'VMB-{n+1:04d}',quote_fingerprint=q['fingerprint'],quote_text=q['text'],theme=q['theme'],garment_family=garment,
  art_family=art,placement=(placements_tees if garment=='TEES' else placements_pants)[n%4],motif=motifs[n%10],palette=palettes[(n//5)%10],
  fit=(fits_tees if garment=='TEES' else fits_pants)[(n//20)%4],fingerprint=fingerprint,
  state='DRAFT',image_status='NOT_GENERATED',print_ready='NO',editorial_approval='REQUIRED',vendor_approval='REQUIRED'))
assert len(brief)==len(set(b['fingerprint'] for b in brief))==1000
for path,rows in [('verses_1000_drafts.csv',verse),('design_briefs_1000.csv',brief)]:
 with (root/'data'/path).open('w',encoding='utf-8',newline='') as f:
  out=csv.DictWriter(f,fieldnames=list(rows[0].keys()));out.writeheader();out.writerows(rows)
print('Generated',len(verse),'creative text drafts and',len(brief),'unique print-art briefs')

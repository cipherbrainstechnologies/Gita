import Link from 'next/link';
import {verseLibrary,originalSloganLibrary} from '@/lib/verse-library';
export const metadata={title:'The Verse Library | VERSE//MODE',description:'Verified Sanskrit source passages, modern editorial interpretations, and original streetwear slogan concepts.'};
export default function Inspiration(){return <div className="page-wrap inspiration">
  <p className="kicker dark">SCRIPTURE / CULTURE / ORIGINAL EDITORIAL</p><h1 className="page-title">Wear the <span>words.</span></h1>
  <p className="page-lead">Real Sanskrit verse references sit alongside brand-new modern writing. They are different types of content: we never present a new slogan as an ancient quotation.</p>
  <div className="inspiration-top-note">SOURCE VERIFIED ≠ TRANSLATION APPROVED ≠ PRINT-READY DESIGN. Every language and final artwork must pass editorial, typography and manufacturer review.</div>
  <div className="verse-grid">{verseLibrary.map(v=><article key={v.id} className="verse-card">
      <div className="verse-card-top"><span>BHAGAVAD GITA {v.chapterVerse}</span><span>AUTHENTIC SANSKRIT SOURCE</span></div>
      <h2 lang="sa">{v.shortExcerpt}</h2><p lang="sa" className="verse-original">{v.originalSanskrit}</p>
      <p className="verse-editorial">{v.fashionTaglineOriginalEnglish}</p>
      <dl><dt>ENGLISH INTERPRETATION · DRAFT</dt><dd>{v.draftInterpretations.en}</dd><dt>HINDI INTERPRETATION · DRAFT</dt><dd lang="hi">{v.draftInterpretations.hi}</dd><dt>GUJARATI INTERPRETATION · DRAFT</dt><dd lang="gu">{v.draftInterpretations.gu}</dd></dl>
      <a href={v.sourceUrl} target="_blank" rel="noreferrer" className="text-link">VIEW TEXT SOURCE</a>
    </article>)}</div>
  <section className="original-slogans"><div className="section-head"><h2>Original statements<span>.</span></h2><Link href="/shop" className="text-link">SEE GARMENT CONCEPTS</Link></div><p>Made for the gym, campus, friendship, streetwear and cinematic storytelling. These are original editorial drafts, not quotations from anime, movies or public figures.</p><div className="original-grid">{originalSloganLibrary.map(s=><div className="original-card" key={s.id}><span>{s.collection} / {s.theme}</span><strong>{s.text}</strong></div>)}</div></section>
</div>}

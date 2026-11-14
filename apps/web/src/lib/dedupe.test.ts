import {describe,it,expect} from 'vitest';
import {quoteFingerprint,designFingerprint,normalizeText,jaccard} from './dedupe';
describe('design memory',()=>{
 it('collapses punctuation/case',()=>expect(quoteFingerprint('Quiet, Is Power!','en')).toEqual(quoteFingerprint('quiet is power','en')));
 it('preserves Unicode normalized strings',()=>expect(normalizeText('  FOR   YOU   ')).toBe('for you'));
 it('does not confuse variants of same art identity',()=>expect(designFingerprint('hash','tee','center')).toEqual(designFingerprint('hash','TEE','center')));
 it('produces shared word similarity 1 for exact wording',()=>expect(jaccard('Real friends argue','real friends argue')).toBe(1));
});

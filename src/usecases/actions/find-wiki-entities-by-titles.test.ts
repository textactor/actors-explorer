
import { FindWikiEntitiesByTitles } from './find-wiki-entities-by-titles';
import test from 'ava';
import { IKnownNameService } from '../../services/known-names-service';

test('ro-md', async t => {
    const finder = new FindWikiEntitiesByTitles({ lang: 'ro', country: 'md' }, new KnownNamesService());

    const ilanShorEntities = await finder.execute(['Ilan Șor']);
    t.is(ilanShorEntities.length, 1);
    // t.log(JSON.stringify(ilanShorEntities[0]));
    t.is(ilanShorEntities[0].wikiPageTitle, 'Ilan Șor');
    t.true(Object.keys(ilanShorEntities[0].links).length > 1);
});

class KnownNamesService implements IKnownNameService {
    getKnownName(_name: string, _lang: string, _country: string): { name: string; countryCodes?: string[]; } | null {
        return null;
    }
}

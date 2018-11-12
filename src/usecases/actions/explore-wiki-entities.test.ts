
import test from 'ava';
import {
    MemoryConceptRepository,
    MemoryWikiEntityRepository,
    MemoryWikiSearchNameRepository,
    MemoryWikiTitleRepository,
} from '@textactor/concept-domain/dest/repositories/memory';

import { ILocale } from '../../types';
import { ExploreWikiEntities } from './explore-wiki-entities';
import { PushContextConcepts } from './push-context-concepts';
import { ICountryTagsService } from './find-wiki-titles';
import { PopularConceptNamesEnumerator } from '../../services/popular-concept-names-enumerator';
import { IKnownNameService } from '../../services/known-names-service';
import { ConceptContainer, ConceptContainerHelper, ConceptHelper } from '@textactor/concept-domain';

test('ro-md', async t => {
    const conceptRepository = new MemoryConceptRepository();
    const wikiEntityRepository = new MemoryWikiEntityRepository();
    const wikiSearchNameRepository = new MemoryWikiSearchNameRepository();
    const wikiTitleRepository = new MemoryWikiTitleRepository();
    const pushConcepts = new PushContextConcepts(conceptRepository, new KnownNamesService());
    const locale: ILocale = { lang: 'ro', country: 'md' };
    const container: ConceptContainer = ConceptContainerHelper.build({
        ...locale,
        name: 'test',
        uniqueName: 'test',
        ownerId: 'test',
    });
    const namesEnumerator = new PopularConceptNamesEnumerator({ mutable: false }, container, conceptRepository);
    const exploreWikiEntities = new ExploreWikiEntities(container,
        namesEnumerator,
        wikiEntityRepository,
        wikiSearchNameRepository,
        wikiTitleRepository,
        new CountryTags(),
        new KnownNamesService());

    const conceptTexts: string[] = ['R. Moldova', 'Chișinău', 'Chisinau', 'Republica Moldova', 'Moldova', 'Chisinau'];

    const concepts = conceptTexts
        .map(name => ConceptHelper.build({ name, containerId: container.id, ...locale }));

    await pushConcepts.execute(concepts);

    t.is(await wikiEntityRepository.count(), 0, 'no wiki entities in DB');

    await exploreWikiEntities.execute(undefined);

    let countEntities = await wikiEntityRepository.count();

    t.log(`count entities=${countEntities}`);

    t.true(countEntities > 0, 'many wiki entities in DB');
});

class CountryTags implements ICountryTagsService {
    getTags(country: string, lang: string): string[] {

        const LOCALE_COUNTRY_TAGS: { [country: string]: { [lang: string]: string[] } } = {
            md: {
                ro: ['republica moldova', 'moldova'],
            },
            ro: {
                ro: ['românia', 'româniei'],
            },
            ru: {
                ru: ['Россия', 'РФ', 'России', 'Российской'],
            },
        }

        if (LOCALE_COUNTRY_TAGS[country]) {
            return LOCALE_COUNTRY_TAGS[country][lang];
        }

        return []
    }
}

class KnownNamesService implements IKnownNameService {
    getKnownName(_name: string, _lang: string, _country: string): { name: string; countryCodes?: string[]; } | null {
        return null;
    }
}

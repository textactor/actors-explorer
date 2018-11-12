
import { ExploreName } from './explore-name';
import test from 'ava';

import {
    MemoryWikiEntityRepository,
    MemoryWikiSearchNameRepository,
    MemoryWikiTitleRepository,
} from '@textactor/concept-domain/dest/repositories/memory';
import { ICountryTagsService } from './actions/find-wiki-titles';
import { IKnownNameService } from '../services/known-names-service';
import { ConceptContainerHelper } from '@textactor/concept-domain';




test(`ro-md: Moldova`, async t => {
    const container = ConceptContainerHelper.build({
        lang: 'ro',
        country: 'md',
        name: 'test',
        uniqueName: 'test',
        ownerId: 'test',
    })
    const entityRep = new MemoryWikiEntityRepository();
    const searchName = new MemoryWikiSearchNameRepository();
    const titleService = new MemoryWikiTitleRepository();
    const tagsService = new CountryTags();

    const processName = new ExploreName(container, entityRep, searchName, titleService, tagsService, new KnownNamesService());

    const actor1 = await processName.execute('Moldova');
    t.is(!!actor1, true);
    t.is(actor1 && actor1.wikiEntity && actor1.wikiEntity.wikiDataId, 'Q21095978');
    t.is(actor1 && actor1.name, 'Moldova');

    const actor2 = await processName.execute('R. Moldova');
    t.is(!!actor2, true);
    t.is(actor2 && actor2.name, 'Republica Moldova');
});

test(`ro-ro: Botoșani`, async t => {
    const container = ConceptContainerHelper.build({
        lang: 'ro',
        country: 'ro',
        name: 'test',
        uniqueName: 'test',
        ownerId: 'test',
    });
    const entityRep = new MemoryWikiEntityRepository();
    const searchName = new MemoryWikiSearchNameRepository();
    const titleService = new MemoryWikiTitleRepository();
    const tagsService = new CountryTags();

    const processName = new ExploreName(container, entityRep, searchName, titleService, tagsService, new KnownNamesService());

    const actor1 = await processName.execute('Botoșani');
    t.is(!!actor1, true);
    t.is(actor1 && actor1.name, 'Botoșani');
});

test(`ro-ro: Județul Botoșani`, async t => {
    const container = ConceptContainerHelper.build({
        lang: 'ro',
        country: 'ro',
        name: 'test',
        uniqueName: 'test',
        ownerId: 'test',
    });
    const entityRep = new MemoryWikiEntityRepository();
    const searchName = new MemoryWikiSearchNameRepository();
    const titleService = new MemoryWikiTitleRepository();
    const tagsService = new CountryTags();

    const processName = new ExploreName(container, entityRep, searchName, titleService, tagsService, new KnownNamesService());

    const actor1 = await processName.execute('Județul Botoșani');
    t.is(!!actor1, true);
    t.is(actor1 && actor1.name, 'Județul Botoșani');
});

test(`ro-ro: unexisting name`, async t => {
    const container = ConceptContainerHelper.build({
        lang: 'ro',
        country: 'ro',
        name: 'test',
        uniqueName: 'test',
        ownerId: 'test',
    });
    const entityRep = new MemoryWikiEntityRepository();
    const searchName = new MemoryWikiSearchNameRepository();
    const titleService = new MemoryWikiTitleRepository();
    const tagsService = new CountryTags();

    const processName = new ExploreName(container, entityRep, searchName, titleService, tagsService, new KnownNamesService());

    const actor1 = await processName.execute('vdterywnteunrtur rtjhrt');
    t.is(actor1 && actor1.wikiEntity, undefined);
});

test(`ro-md: Ministerul Afacerilor Externe`, async t => {
    const container = ConceptContainerHelper.build({
        lang: 'ro',
        country: 'md',
        name: 'test',
        uniqueName: 'test',
        ownerId: 'test',
    });
    const entityRep = new MemoryWikiEntityRepository();
    const searchName = new MemoryWikiSearchNameRepository();
    const titleService = new MemoryWikiTitleRepository();
    const tagsService = new CountryTags();

    const processName = new ExploreName(container, entityRep, searchName, titleService, tagsService, new KnownNamesService());

    const actor1 = await processName.execute('Ministerul Afacerilor Externe');
    t.is(actor1 && actor1.wikiEntity && actor1.wikiEntity.name, 'Ministerul Afacerilor Externe și Integrării Europene (Republica Moldova)');
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

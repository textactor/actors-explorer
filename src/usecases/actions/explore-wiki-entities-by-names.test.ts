
import test from 'ava';
import { ExploreWikiEntitiesByNames } from './explore-wiki-entities-by-names';

import {
    MemoryWikiEntityRepository,
    MemoryWikiTitleRepository,
    MemoryWikiSearchNameRepository
} from '@textactor/concept-domain/dest/repositories/memory';
import { CountryTagsService } from '../../services/country-tags-service';
import { KnownNameService } from '@textactor/known-names';
import { Locale, WikiSearchNameHelper, WikiTitleHelper, WikiEntityHelper } from '@textactor/concept-domain';

test('Moscow multi names', async t => {
    const locale: Locale = { lang: 'ru', country: 'ru' };
    const entityRepository = new MemoryWikiEntityRepository();
    const titleRepository = new MemoryWikiTitleRepository();
    const searchRepository = new MemoryWikiSearchNameRepository();
    const exploreByNames = new ExploreWikiEntitiesByNames(
        locale,
        entityRepository,
        searchRepository,
        titleRepository,
        new CountryTagsService(),
        new KnownNameService()
    );

    const names = ["Москва", "Москвы", "Москве", "Москву", "Москвой"];

    const titles = await exploreByNames.execute(names);

    t.log(JSON.stringify(titles));

    t.true(titles.length > names.length);

    const moscowSearch = await searchRepository.getById(WikiSearchNameHelper.createId('Москва', locale.lang, locale.country));
    t.truthy(moscowSearch);

    const moscowTitle = await titleRepository.getById(WikiTitleHelper.createId('Москва', locale.lang));
    t.truthy(moscowTitle);

    const moscowEntity = await entityRepository.getByNameHash(WikiEntityHelper.nameHash('Москва', locale.lang));
    t.is(moscowEntity.length, 1);
    t.is(moscowEntity[0].name, 'Москва');
});

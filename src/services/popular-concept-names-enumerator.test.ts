
import test from 'ava';
import { PopularConceptNamesEnumerator } from './popular-concept-names-enumerator';
import { PushContextConcepts } from '../usecases/actions/push-context-concepts';
import { KnownNameService } from '@textactor/known-names';
import { MemoryConceptRepository } from '@textactor/concept-domain/dest/repositories/memory';
import { ConceptContainerHelper, ConceptHelper } from '@textactor/concept-domain';


test('empty list', async t => {
    const container = ConceptContainerHelper.build({
        lang: 'ro',
        country: 'ro',
        name: 'Name',
        uniqueName: 'name',
        ownerId: 'id',
    });

    const conceptRep = new MemoryConceptRepository();

    const enumerator = new PopularConceptNamesEnumerator({ mutable: false }, container, conceptRep);

    t.is(enumerator.atEnd(), false);
    const names = await enumerator.next();
    t.deepEqual(names.list(), [], 'no names');
    t.is(enumerator.atEnd(), true);
});

test('names with root name', async t => {
    const lang = 'ro';
    const country = 'ro';
    const container = ConceptContainerHelper.build({
        lang,
        country,
        name: 'Name',
        uniqueName: 'name',
        ownerId: 'id',
    });

    const containerId = container.id;

    const conceptRep = new MemoryConceptRepository();

    const pushConcepts = new PushContextConcepts(conceptRep, new KnownNameService());

    await pushConcepts.execute([
        ConceptHelper.build({ containerId, lang, country, name: 'Maia Sandu' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Maiei Sandu' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Partidul Liberal' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Facebook' }),
    ]);

    const enumerator = new PopularConceptNamesEnumerator({ mutable: false }, container, conceptRep);

    t.is(enumerator.atEnd(), false);
    let names = (await enumerator.next()).list();

    t.log(JSON.stringify(names));
    t.is(names.length, 2, 'Maia Sandu 2 names');
    t.true(['Maia Sandu', 'Maiei Sandu'].indexOf(names[0].name) > -1);
    t.true(['Maia Sandu', 'Maiei Sandu'].indexOf(names[1].name) > -1);
    t.is(enumerator.atEnd(), false);

    await enumerator.next();
    names = (await enumerator.next()).list();

    t.log(JSON.stringify(names));
    t.is(names.length, 1);
    t.is(names[0].name, 'Partidul Liberal');
    t.is(enumerator.atEnd(), false);

    names = (await enumerator.next()).list();
    t.log(JSON.stringify(names));
    t.is(names.length, 1);
    t.is(names[0].name, 'Facebook');
    t.is(enumerator.atEnd(), false);
    names = (await enumerator.next()).list();
    t.is(names.length, 0);

    t.is(enumerator.atEnd(), true);
});

test('mutable', async t => {
    const lang = 'ro';
    const country = 'ro';
    const container = ConceptContainerHelper.build({
        lang,
        country,
        name: 'Name',
        uniqueName: 'name',
        ownerId: 'id',
    });

    const containerId = container.id;

    const conceptRep = new MemoryConceptRepository();

    const pushConcepts = new PushContextConcepts(conceptRep, new KnownNameService());

    await pushConcepts.execute([
        ConceptHelper.build({ containerId, lang, country, name: 'Maia Sandu' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Maiei Sandu' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Partidul Liberal' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Facebook' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Moldova' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Chisinau' }),
        ConceptHelper.build({ containerId, lang, country, name: 'Moscova' }),
    ]);

    const orderedNames = [
        ['Maia Sandu', 'Maiei Sandu'],
        ['Partidul Liberal'],
        ['Facebook'],
        ['Moldova'],
        ['Chisinau'],
        ['Moscova'],
    ];

    const enumerator = new PopularConceptNamesEnumerator({ mutable: true }, container, conceptRep);

    for (const knownNames of orderedNames) {
        const actorNames = (await enumerator.next()).list();
        const names = actorNames.map(item => item.name);
        t.deepEqual(names, knownNames);
        await conceptRep.deleteByRootNameIds(ConceptHelper.rootIds(names, lang, country, containerId));
    }

    t.deepEqual((await enumerator.next()).list(), []);

    t.is(enumerator.atEnd(), true);
});

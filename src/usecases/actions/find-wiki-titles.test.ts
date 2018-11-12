
import { FindWikiTitles, ICountryTagsService } from './find-wiki-titles';
import test from 'ava';

test('ro-md', async t => {
    const finder = new FindWikiTitles({ lang: 'ro', country: 'md' }, new CountryTags());

    const ilanShorTitles = await finder.execute(['Ilan Șor']);

    t.is(ilanShorTitles.length, 1);
    t.is(ilanShorTitles[0], 'Ilan Șor');
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

        return [];
    }
}

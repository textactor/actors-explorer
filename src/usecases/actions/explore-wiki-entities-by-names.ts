
const debug = require('debug')('textactor:actors-explorer');

import { ILocale } from '../../types';
import { FindWikiEntitiesByTitles } from './find-wiki-entities-by-titles';
import { SaveWikiEntities } from './save-wiki-entities';
import { FindWikiTitles } from './find-wiki-titles';
import { KnownNameService } from '../../services/known-names-service';
import { UseCase } from '../usecase';
import ms = require('ms');
import {
    WikiSearchNameHelper,
    WikiTitleHelper,
    WikiTitleRepository,
    WikiSearchNameRepository,
    WikiEntityRepository,
    CreateOrUpdateWikiTitle,
    CreateOrUpdateWikiSearchName,
} from '@textactor/concept-domain';
import { uniq } from '@textactor/domain';
import { CountryTagsService } from '../../services/country-tags-service';

export class ExploreWikiEntitiesByNames extends UseCase<string[], string[], void> {
    private exploreWikiEntitiesByTitles: FindWikiEntitiesByTitles;
    private saveWikiEntities: SaveWikiEntities;
    private findWikiTitles: FindWikiTitles;
    private createOrUpdateWikiTitle: CreateOrUpdateWikiTitle;
    private createOrUpdateWikiSearchName: CreateOrUpdateWikiSearchName;

    constructor(private locale: ILocale,
        entityRep: WikiEntityRepository,
        private wikiSearchNameRep: WikiSearchNameRepository,
        private wikiTitleRep: WikiTitleRepository,
        countryTags: CountryTagsService,
        knownNames: KnownNameService) {
        super();

        this.createOrUpdateWikiTitle = new CreateOrUpdateWikiTitle(wikiTitleRep);
        this.createOrUpdateWikiSearchName = new CreateOrUpdateWikiSearchName(wikiSearchNameRep);

        this.exploreWikiEntitiesByTitles = new FindWikiEntitiesByTitles(locale, knownNames);
        this.saveWikiEntities = new SaveWikiEntities(entityRep);
        this.findWikiTitles = new FindWikiTitles(locale, countryTags);
    }

    protected async innerExecute(names: string[]): Promise<string[]> {
        const lang = this.locale.lang;
        const country = this.locale.country;

        names = uniq(names);

        const unknownNames: string[] = []

        for (let name of names) {
            const searchName = await this.wikiSearchNameRep.getById(WikiSearchNameHelper.createId(name, lang, country));
            if (searchName && searchName.updatedAt && searchName.updatedAt * 1000 > Date.now() - ms('7days')) {
                debug(`WikiSearchName=${name} exists!`);
                continue;
            }

            unknownNames.push(name);

            await this.createOrUpdateWikiSearchName.execute(WikiSearchNameHelper.build({
                name,
                lang,
                country,
            }));
        }

        // debug(`unknownNames ${JSON.stringify(unknownNames)}`)

        if (unknownNames.length === 0) {
            return [];
        }

        const initalTitles = await this.findWikiTitles.execute(unknownNames);

        // debug(`initalTitles ${JSON.stringify(initalTitles)}`)

        if (!initalTitles.length) {
            return [];
        }

        const titles: string[] = [];

        for (let title of initalTitles) {
            const wikiTitle = await this.wikiTitleRep.getById(WikiTitleHelper.createId(title, lang));
            if (wikiTitle && wikiTitle.updatedAt && wikiTitle.updatedAt * 1000 > Date.now() - ms('10days')) {
                debug(`WikiTitle=${title} exists!`);
                continue;
            }
            titles.push(title);
        }

        // debug(`titles ${JSON.stringify(titles)}`)

        if (titles.length === 0) {
            return [];
        }

        const wikiEntities = await this.exploreWikiEntitiesByTitles.execute(titles);

        if (wikiEntities.length) {
            debug(`found wiki entities for ${names[0]}==${wikiEntities.length}`);
            await this.saveWikiEntities.execute(wikiEntities);
        } else {
            debug(`Not found wiki entities for ${names[0]}`);
        }

        for (let title of titles) {
            await this.createOrUpdateWikiTitle.execute(WikiTitleHelper.build({ title, lang, }))
        }

        return titles;
    }
}

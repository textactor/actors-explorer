
const debug = require('debug')('textactor:actors-explorer');

import { UseCase } from './usecase';
import { ExploreWikiEntitiesByNames } from './actions/explore-wiki-entities-by-names';
import { BuildActorByNames } from './actions/build-actor-by-names';
import { KnownNameService } from '../services/known-names-service';
import { Actor } from '../entities/actor';
import { ILocale } from '../types';
import { ActorNameCollection } from '../entities/actor-name-collection';
import { WikiEntityRepository, WikiSearchNameRepository, WikiTitleRepository } from '@textactor/concept-domain';
import { CountryTagsService } from '../services/country-tags-service';

export class ExploreName extends UseCase<string | string[], Actor | null, void> {
    private actorBuilder: BuildActorByNames;
    private exploreWikiEntities: ExploreWikiEntitiesByNames;

    constructor(private locale: ILocale,
        private entityRep: WikiEntityRepository,
        private wikiSearchNameRep: WikiSearchNameRepository,
        private wikiTitleRep: WikiTitleRepository,
        private countryTags: CountryTagsService,
        private knownNames: KnownNameService) {
        super()

        if (!locale.lang || !locale.country) {
            throw new Error(`Locale is not valid: ${locale.lang}-${locale.country}`);
        }

        this.actorBuilder = new BuildActorByNames(locale,
            entityRep);
        this.exploreWikiEntities = new ExploreWikiEntitiesByNames(locale,
            this.entityRep,
            this.wikiSearchNameRep,
            this.wikiTitleRep,
            this.countryTags,
            this.knownNames);
    }

    protected async innerExecute(name: string | string[]): Promise<Actor | null> {

        name = Array.isArray(name) ? name : [name];

        const lang = this.locale.lang;

        debug(`Start processing: ${name}`);

        debug(`=====> Start exploreWikiEntities`);
        await this.exploreWikiEntities.execute(name);
        debug(`<===== End exploreWikiEntities`);

        debug(`=====> Start generateActors`);
        const actor = await this.actorBuilder.execute(ActorNameCollection.fromArray(name, lang));
        debug(`<===== End generateActors`);

        debug(`End processing name: ${name}`);

        return actor;
    }
}

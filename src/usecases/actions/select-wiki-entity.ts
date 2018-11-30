
const debug = require('debug')('textactor:actors-explorer');

import { UseCase } from "../usecase";
import { ILocale } from "../../types";
import { WikiEntity, WikiEntityHelper, EntityPopularity, WikiEntityRepository } from "@textactor/concept-domain";
import { uniqByProperty } from "@textactor/domain";



export class SelectWikiEntity extends UseCase<string[], WikiEntity | null, void> {
    constructor(private locale: ILocale,
        private wikiEntityRepository: WikiEntityRepository) {
        super()
    }

    protected async innerExecute(names: string[]): Promise<WikiEntity | null> {
        const nameHashes = WikiEntityHelper.namesHashes(names, this.locale.lang);

        let entities: WikiEntity[] = []
        for (let nameHash of nameHashes) {
            const list = await this.wikiEntityRepository.getByNameHash(nameHash);
            entities = entities.concat(list);
        }
        if (entities.length) {
            debug(`Found wikientity by names: ${JSON.stringify(names)}`);
        } else {
            debug(`NOT Found wikientity by names: ${JSON.stringify(names)}`);
        }

        if (entities.length === 0 || countryWikiEntities(entities, this.locale.country).length === 0) {
            let entitiesByPartialNames: WikiEntity[] = []
            for (let nameHash of nameHashes) {
                const list = await this.wikiEntityRepository.getByPartialNameHash(nameHash);
                entitiesByPartialNames = entitiesByPartialNames.concat(list)
            }

            entitiesByPartialNames = countryWikiEntities(entitiesByPartialNames, this.locale.country);
            if (entitiesByPartialNames.length) {
                debug(`found locale entities by partial name: ${entitiesByPartialNames.map(item => item.name)}`);
                entities = entities.concat(entitiesByPartialNames);
            }

            if (entities.length === 0) {
                debug(`NOT Found wikientity by partial names: ${JSON.stringify(names)}`);
                return null;
            }
        }

        entities = uniqByProperty(entities, 'id');

        entities = sortWikiEntities(entities, this.locale.country);

        const entity = entities[0];

        return entity;
    }
}

export function sortWikiEntities(entities: WikiEntity[], country: string): WikiEntity[] {
    if (!entities.length) {
        return entities;
    }

    entities = entities.sort((a, b) => b.rank - a.rank);

    const topEntity = entities[0];

    if (topEntity.countryCodes && topEntity.countryCodes.includes(country)) {
        debug(`Top entity has country=${country}: ${topEntity.name}`);
        return entities;
    }


    const countryEntities = countryWikiEntities(entities, country);
    if (countryEntities.length) {
        let useCountryEntity = false;
        const topEntityPopularity = WikiEntityHelper.getPopularity(topEntity.rank);
        const countryEntityPopularity = WikiEntityHelper.getPopularity(countryEntities[0].rank);

        useCountryEntity = topEntityPopularity < EntityPopularity.POPULAR || countryEntityPopularity > EntityPopularity.LOW;

        if (useCountryEntity && isPriorityEntity(topEntity)) {
            useCountryEntity = false;
            debug(`using PRIORITY entity: ${topEntity.name}`)
        } else {
            debug(`using POPULAR entity: ${topEntity.name}(${topEntity.rank}-${topEntityPopularity})>${countryEntities[0].rank}-(${countryEntityPopularity})`);
        }

        if (useCountryEntity) {
            entities = countryEntities.concat(entities);
            debug(`using country entity: ${entities[0].name}`);
        }
        entities = uniqByProperty(entities, 'id');
    }

    return entities;
}

export function isPriorityEntity(entity: WikiEntity) {
    return entity.data && (entity.data['P31'] || []).includes('Q6256');
}

function countryWikiEntities(entities: WikiEntity[], country: string): WikiEntity[] {
    if (!entities.length) {
        return entities;
    }
    return entities.filter(item => item.countryCodes && item.countryCodes.includes(country));
}

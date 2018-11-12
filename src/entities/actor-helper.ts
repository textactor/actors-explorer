
import { Actor, ActorName } from "./actor";
import { ILocale } from "../types";
import { ActorNameCollection } from "./actor-name-collection";
import { WikiEntity, ConceptHelper } from "@textactor/concept-domain";
import { NameHelper } from "@textactor/domain";

export class ActorHelper {
    static build(locale: ILocale, actorNames: ActorNameCollection, wikiEntity?: WikiEntity): Actor {

        const lang = locale.lang.trim().toLowerCase();
        const country = locale.country.trim().toLowerCase();
        actorNames = ActorHelper.buildNames(lang, actorNames, wikiEntity && wikiEntity.names);

        const names = actorNames.list();

        if (!names.length) {
            throw new Error(`Invalid ConceptActor: no names!`);
        }

        const name = wikiEntity && wikiEntity.name || names[0].name;

        const actor: Actor = {
            lang,
            country,
            name,
            wikiEntity,
            names,
        };

        const commonName = ActorHelper.findCommonName(name, names);

        if (commonName) {
            actor.commonName = commonName;
        }

        const abbr = ActorHelper.findAbbr(name, names);

        if (abbr) {
            actor.abbr = abbr;
        }

        return actor;
    }

    static findAbbr(name: string, names: ActorName[]) {
        const abbr = names.find(item => item.isAbbr && item.popularity > 1 && item.type === 'WIKI' && name.length > item.name.length);
        if (abbr) {
            return abbr.name;
        }
        return null;
    }

    static findCommonName(name: string, names: ActorName[]) {
        const nameCountWords = NameHelper.countWords(name);
        if (nameCountWords < 3) {
            return null;
        }

        const popularName = names.find(item => !item.isAbbr && item.popularity > 1 && ActorHelper.isValidCommonName(item.name));

        if (!popularName || popularName.popularity < 10) {
            return null;
        }

        const popularNameCountWords = NameHelper.countWords(names[0].name);

        if (popularNameCountWords < 2) {
            return null;
        }

        if (nameCountWords <= popularNameCountWords) {
            return null;
        }

        return popularName.name;
    }

    static buildNames(lang: string, nameCollection: ActorNameCollection, entityNames?: string[]) {
        if (entityNames) {
            const collection = new ActorNameCollection(lang);
            for (const name of nameCollection.list()) {
                collection.add(name);
            }
            for (const name of entityNames) {
                collection.add({ name, popularity: 0, type: 'WIKI' });
            }
            nameCollection = collection;
        }
        return nameCollection;
    }

    static validate(entity: Partial<Actor>) {
        if (!entity) {
            throw new Error(`Invalid ConceptActor: null or undefined`);
        }
        if (!entity.lang) {
            throw new Error(`Invalid ConceptActor: invalid lang`);
        }
        if (!entity.country) {
            throw new Error(`Invalid ConceptActor: invalid country`);
        }
        if (!ConceptHelper.isValidName(entity.name, entity.lang)) {
            throw new Error(`Invalid ConceptActor: invalid name: ${entity.name}`);
        }
        if (!entity.names || !entity.names.length) {
            throw new Error(`Invalid ConceptActor: no names`);
        }
        const invalidName = entity.names.find(item => !ConceptHelper.isValidName(item.name, entity.lang as string));
        if (invalidName) {
            throw new Error(`Invalid ConceptActor: names contains invalid names: ${invalidName}`);
        }
    }

    static isValidCommonName(name: string) {
        return !/[,(‒–—―«»"“”‘’;:]/.test(name);
    }
}

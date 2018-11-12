
const debug = require('debug')('textactor:actors-explorer');

import { INamesEnumerator } from "./names-enumerator";
import { ActorNameCollection } from "../entities/actor-name-collection";
import { ConceptRepository, Concept, ConceptContainer } from "@textactor/concept-domain";
import { uniq, uniqByProperty } from "@textactor/domain";

const START_MIN_COUNT_WORDS = 2;

export type PopularConceptNamesEnumeratorOptions = {
    mutable: boolean
}

export class PopularConceptNamesEnumerator implements INamesEnumerator {
    private skip = 0;
    private limit = 10;
    private currentIndex = -1;
    private currentData: Concept[] | null = null;
    private end = false;
    private minCountWords = START_MIN_COUNT_WORDS;
    private maxCountWords: number | undefined
    private pagesize: number = 10

    constructor(
        private options: PopularConceptNamesEnumeratorOptions,
        private container: ConceptContainer,
        private conceptRep: ConceptRepository) {
        if (options.mutable) {
            this.limit = this.pagesize = 1;
        }
    }

    private reset() {
        this.skip = 0;
        this.limit = this.pagesize;
        this.currentIndex = -1;
        this.currentData = null;
    }

    atEnd(): boolean {
        return this.end;
    }

    async next(): Promise<ActorNameCollection> {
        if (this.end) {
            debug(`END`)
            return new ActorNameCollection(this.container.lang);
        }
        if (this.currentData && this.currentIndex < this.currentData.length) {
            return await this.getConceptNames(this.currentData[this.currentIndex++]);
        }
        const concepts = await this.conceptRep.getMostPopular(this.container.id, this.limit, this.skip,
            { minCountWords: this.minCountWords, maxCountWords: this.maxCountWords });

        if (concepts.length === 0) {
            if (this.minCountWords === START_MIN_COUNT_WORDS) {
                this.minCountWords = 0;
                this.maxCountWords = 1;
                this.reset();
                return this.next();
            }
            this.end = true;
            return new ActorNameCollection(this.container.lang);
        }
        if (this.options.mutable) {
            if (this.currentData && this.currentData.length && concepts.length && this.currentData[0].id === concepts[0].id) {
                throw new Error(`Got the same concept: ${concepts[0].name}`);
            }
        }
        else {
            this.skip += this.limit;
        }

        this.currentData = concepts;
        this.currentIndex = 0;

        return await this.getConceptNames(this.currentData[this.currentIndex++]);
    }

    protected async getConceptNames(concept: Concept) {
        let concepts = await this.conceptRep.getByRootNameIds(concept.rootNameIds);

        const rootIds = uniq(concepts.reduce<string[]>((ids, current) => ids.concat(current.rootNameIds), []));

        if (rootIds.length > concept.rootNameIds.length) {
            concepts = uniqByProperty(await this.conceptRep.getByRootNameIds(rootIds), 'id');
            debug(`Found more concepts by ${concept.name}: ${JSON.stringify(concepts.map(item => item.name))}`);
        }

        const names = ActorNameCollection.fromConcepts(concept.lang, [concept].concat(concepts));

        return names;
    }
}

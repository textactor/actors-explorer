
const debug = require('debug')('textactor:actors-explorer');

import { UseCase } from '../usecase';
import { IKnownNameService } from '../../services/known-names-service';
import getSameNames from 'same-names';
import { Concept, ConceptRepository, ConceptHelper, CreateOrUpdateConcept } from '@textactor/concept-domain';
import { uniq } from '@textactor/domain';

export class PushContextConcepts extends UseCase<Concept[], Concept[], void> {
    private createOrUpdateConcept: CreateOrUpdateConcept;

    constructor(conceptRep: ConceptRepository,
        private knownNames: IKnownNameService) {
        super()

        this.createOrUpdateConcept = new CreateOrUpdateConcept(conceptRep);
    }

    protected async innerExecute(concepts: Concept[]): Promise<Concept[]> {
        concepts = concepts.filter(concept => ConceptHelper.isValid(concept));
        setSameIds(concepts);

        const newConcepts: Concept[] = [];
        for (const concept of concepts) {
            newConcepts.push(await this.pushConcept(concept));
        }

        return newConcepts;
    }

    private async pushConcept(concept: Concept): Promise<Concept> {
        ConceptHelper.setRootIds(concept);

        const knownName = this.knownNames.getKnownName(concept.name, concept.lang, concept.country);
        if (knownName && knownName.name) {
            concept.knownName = knownName.name;
            debug(`set concept known name: ${concept.name}=>${concept.knownName}`);
        }

        return await this.createOrUpdateConcept.execute(concept);
    }
}

function setSameIds(concepts: Concept[]) {
    concepts = concepts.filter(concept => !concept.isAbbr && concept.nameLength > 4);
    const names = concepts.map(concept => concept.name)
        .concat(concepts.filter(concept => !!concept.knownName).map(concept => concept.knownName as string));

    for (let concept of concepts) {
        let sameNames = getSameNames(concept.name, names, { lang: concept.lang });

        if (sameNames && sameNames.length) {
            sameNames = sameNames.filter(item => item.name !== concept.name && item.rating > 0.5);
            if (concept.countWords === 1) {
                sameNames = sameNames.filter(item => item.rating > 0.7);
            }
            const sameIds = sameNames.map(item => ConceptHelper.rootId(item.name, concept.lang, concept.country, concept.containerId));
            concept.rootNameIds = concept.rootNameIds.concat(sameIds);
        }
        concept.rootNameIds = uniq(concept.rootNameIds);
    }
}

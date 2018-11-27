
// const debug = require('debug')('textactor:actors-explorer');

import { UseCase } from "../usecase";
import { ConceptContainer, ConceptRepository, ConceptHelper } from "@textactor/concept-domain";

export class DeleteActorConcepts extends UseCase<string[], void, void> {

    constructor(
        private container: ConceptContainer,
        private conceptRep: ConceptRepository) {
        super()
    }

    protected async innerExecute(names: string[]): Promise<void> {

        // debug(`deleting names: ${names}`)

        const lang = this.container.lang;
        const country = this.container.country;
        const containerId = this.container.id;

        const conceptIds = ConceptHelper.ids(names, lang, country, containerId);
        const rootIds = ConceptHelper.rootIds(names, lang, country, containerId);

        await this.conceptRep.deleteIds(conceptIds);
        await this.conceptRep.deleteByRootNameIds(rootIds);
    }
}

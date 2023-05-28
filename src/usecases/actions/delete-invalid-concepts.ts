const debug = require("debug")("textactor:actors-explorer");

import { UseCase } from "../usecase";
import {
  ConceptContainer,
  ConceptRepository,
  WikiEntityRepository,
  ConceptHelper
} from "@textactor/concept-domain";

export class DeleteInvalidConcepts extends UseCase<void, void, void> {
  constructor(
    private container: ConceptContainer,
    private conceptRep: ConceptRepository,
    private wikiEntityRep: WikiEntityRepository
  ) {
    super();
  }

  protected async innerExecute(): Promise<void> {
    const lang = this.container.lang;
    const country = this.container.country;
    const containerId = this.container.id;
    const invalidNames = await this.wikiEntityRep.getInvalidPartialNames(lang);
    debug(`Deleting invalid names: ${JSON.stringify(invalidNames)}`);

    const invalidNamesIds = ConceptHelper.ids(
      invalidNames,
      lang,
      country,
      containerId
    );
    const invalidNamesRootIds = ConceptHelper.rootIds(
      invalidNames,
      lang,
      country,
      containerId
    );

    await this.conceptRep.deleteIds(invalidNamesIds);
    await this.conceptRep.deleteByRootNameIds(invalidNamesRootIds);
  }
}

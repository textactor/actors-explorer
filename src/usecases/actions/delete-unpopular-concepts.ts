const debug = require("debug")("textactor:actors-explorer");

import { UseCase } from "../usecase";
import { ConceptContainer, ConceptRepository } from "@textactor/concept-domain";

export interface DeleteUnpopularConceptsOptions {
  minConceptPopularity: number;
  minAbbrConceptPopularity: number;
  minOneWordConceptPopularity: number;
}

export class DeleteUnpopularConcepts extends UseCase<
  DeleteUnpopularConceptsOptions,
  void,
  void
> {
  constructor(
    private container: ConceptContainer,
    private conceptRep: ConceptRepository
  ) {
    super();
  }

  protected async innerExecute(
    options: DeleteUnpopularConceptsOptions
  ): Promise<void> {
    debug(`Deleting unpopular concepts: ${JSON.stringify(options)}`);

    await this.conceptRep.deleteUnpopular(
      this.container.id,
      options.minConceptPopularity
    );
    await this.conceptRep.deleteUnpopularAbbreviations(
      this.container.id,
      options.minAbbrConceptPopularity
    );
    await this.conceptRep.deleteUnpopularOneWorlds(
      this.container.id,
      options.minOneWordConceptPopularity
    );
  }
}

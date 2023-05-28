import { UseCase } from "../usecase";
import { ConceptContainer, ConceptRepository } from "@textactor/concept-domain";

export class CleanConceptContainer extends UseCase<
  ConceptContainer,
  void,
  void
> {
  constructor(private conceptRep: ConceptRepository) {
    super();
  }

  protected async innerExecute(container: ConceptContainer): Promise<void> {
    await this.conceptRep.deleteAll(container.id);
  }
}

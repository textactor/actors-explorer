const debug = require("debug")("textactor:actors-explorer");

import { UseCase } from "./usecase";
import {
  OnGenerateActorCallback,
  GenerateActors
} from "./actions/generate-actors";
import {
  DeleteUnpopularConcepts,
  DeleteUnpopularConceptsOptions
} from "./actions/delete-unpopular-concepts";
import { ExploreWikiEntities } from "./actions/explore-wiki-entities";
import { DeleteInvalidConcepts } from "./actions/delete-invalid-concepts";
import { PopularConceptNamesEnumerator } from "../services/popular-concept-names-enumerator";
import { DeleteActorConcepts } from "./actions/delete-actor-concepts";
import { CleanConceptContainer } from "./actions/clean-concept-container";
import { KnownNameService } from "../services/known-names-service";
import {
  ConceptContainer,
  ConceptContainerRepository,
  ConceptRepository,
  WikiEntityRepository,
  WikiSearchNameRepository,
  WikiTitleRepository,
  ConceptContainerHelper,
  ConceptContainerStatus
} from "@textactor/concept-domain";
import { CountryTagsService } from "../services/country-tags-service";

export interface ExploreContainerOptions
  extends DeleteUnpopularConceptsOptions {}

export class ExploreContainer extends UseCase<
  OnGenerateActorCallback,
  void,
  ExploreContainerOptions
> {
  constructor(
    private container: ConceptContainer,
    private containerRep: ConceptContainerRepository,
    private conceptRep: ConceptRepository,
    private entityRep: WikiEntityRepository,
    private wikiSearchNameRep: WikiSearchNameRepository,
    private wikiTitleRep: WikiTitleRepository,
    private countryTags: CountryTagsService,
    private knownNames: KnownNameService
  ) {
    super();

    if (!container.lang || !container.country) {
      throw new Error(
        `ConceptContainer is not valid: ${container.lang}-${container.country}`
      );
    }
  }

  protected async innerExecute(
    callback: OnGenerateActorCallback,
    options: ExploreContainerOptions
  ): Promise<void> {
    const container = this.container;

    debug(`Start processing concepts... ${JSON.stringify(options)}`);

    if (!ConceptContainerHelper.canStartGenerate(container.status)) {
      return Promise.reject(
        new Error(`ConceptContainer is not generateable: ${container.status}`)
      );
    }

    const deleteUnpopularConcepts = new DeleteUnpopularConcepts(
      container,
      this.conceptRep
    );
    const deleteInvalidConcepts = new DeleteInvalidConcepts(
      container,
      this.conceptRep,
      this.entityRep
    );
    const exploreWikiEntities = new ExploreWikiEntities(
      container,
      new PopularConceptNamesEnumerator(
        { mutable: false },
        container,
        this.conceptRep
      ),
      this.entityRep,
      this.wikiSearchNameRep,
      this.wikiTitleRep,
      this.countryTags,
      this.knownNames
    );
    const generateActors = new GenerateActors(
      this.container,
      new PopularConceptNamesEnumerator(
        { mutable: true },
        container,
        this.conceptRep
      ),
      new DeleteActorConcepts(container, this.conceptRep),
      this.entityRep
    );
    const cleanContainer = new CleanConceptContainer(this.conceptRep);

    await this.containerRep.update({
      id: this.container.id,
      set: {
        status: ConceptContainerStatus.GENERATING
      }
    });

    try {
      debug(`<===== Start deleteInvalidConcepts`);
      await deleteInvalidConcepts.execute(undefined);
      debug(`<===== End deleteInvalidConcepts`);

      debug(`=====> Start deleteUnpopularConcepts`);
      await deleteUnpopularConcepts.execute(options);
      debug(`<===== End deleteUnpopularConcepts`);

      debug(`=====> Start exploreWikiEntities`);
      await exploreWikiEntities.execute(undefined);
      debug(`<===== End exploreWikiEntities`);

      debug(`<===== Start deleteInvalidConcepts`);
      await deleteInvalidConcepts.execute(undefined);
      debug(`<===== End deleteInvalidConcepts`);

      debug(`=====> Start generateActors`);
      await generateActors.execute(callback);
      debug(`<===== End generateActors`);
      await cleanContainer.execute(container);
    } catch (e) {
      const error = e.message;
      await this.containerRep.update({
        id: this.container.id,
        set: {
          status: ConceptContainerStatus.GENERATE_ERROR,
          lastError: error
        }
      });
      throw e;
    }

    await this.containerRep.update({
      id: this.container.id,
      set: {
        status: ConceptContainerStatus.EMPTY
      }
    });
  }
}

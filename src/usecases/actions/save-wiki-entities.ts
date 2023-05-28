// const debug = require('debug')('textactor:actors-explorer');

import { UseCase } from "../usecase";
import {
  WikiEntity,
  WikiEntityRepository,
  CreateOrUpdateWikiEntity
} from "@textactor/concept-domain";

export class SaveWikiEntities extends UseCase<WikiEntity[], boolean, null> {
  private createOrUpdateWikiEntity: CreateOrUpdateWikiEntity;

  constructor(wikiEntityRep: WikiEntityRepository) {
    super();

    this.createOrUpdateWikiEntity = new CreateOrUpdateWikiEntity(wikiEntityRep);
  }

  protected async innerExecute(entities: WikiEntity[]): Promise<boolean> {
    for (let entity of entities) {
      await this.createOrUpdateWikiEntity.execute(entity);
    }
    return true;
  }
}

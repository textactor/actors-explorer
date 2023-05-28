const debug = require("debug")("textactor:actors-explorer");

import { INamesEnumerator } from "../../services/names-enumerator";
import { ExploreWikiEntitiesByNames } from "./explore-wiki-entities-by-names";
import { KnownNameService } from "../../services/known-names-service";
import { UseCase } from "../usecase";
import { ILocale } from "../../types";
import {
  WikiEntityRepository,
  WikiSearchNameRepository,
  WikiTitleRepository
} from "@textactor/concept-domain";
import { CountryTagsService } from "../../services/country-tags-service";

export class ExploreWikiEntities extends UseCase<void, void, void> {
  private exploreByNames: ExploreWikiEntitiesByNames;

  constructor(
    locale: ILocale,
    private namesEnumerator: INamesEnumerator,
    entityRep: WikiEntityRepository,
    wikiSearchNameRep: WikiSearchNameRepository,
    wikiTitleRep: WikiTitleRepository,
    countryTags: CountryTagsService,
    knownNames: KnownNameService
  ) {
    super();

    this.exploreByNames = new ExploreWikiEntitiesByNames(
      locale,
      entityRep,
      wikiSearchNameRep,
      wikiTitleRep,
      countryTags,
      knownNames
    );
  }

  protected async innerExecute(): Promise<void> {
    while (!this.namesEnumerator.atEnd()) {
      const names = await this.namesEnumerator.next();
      if (names && names.length) {
        debug(`exploring wiki entity by names: ${names}`);

        await this.exploreByNames.execute(names.nameList());
      } else {
        debug(`ExploreWikiEntities: no names!`);
      }
    }
  }
}

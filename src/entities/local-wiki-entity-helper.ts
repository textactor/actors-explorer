import { SimpleEntityType, SimpleEntity } from "wiki-entity";
import { partialName } from "partial-name";
import { WikiEntity, WikiEntityType } from "@textactor/concept-domain";
import { NameHelper } from "@textactor/domain";

export class LocalWikiEntityHelper {
  static getPartialName(
    name: string,
    lang: string,
    entityName: string
  ): string | null {
    if (!name || NameHelper.countWords(name) < 2) {
      return null;
    }

    const exResult = /\(([^)]+)\)$/.exec(name);
    let partial: string | null = null;
    if (exResult) {
      partial = name.substr(0, exResult.index).trim();
      if (NameHelper.countWords(partial) < 2) {
        partial = null;
      }
    }

    if (!partial) {
      partial = partialName(name, { lang });
      if (partial && NameHelper.countWords(partial) < 2) {
        partial = null;
      }
    }

    if (partial) {
      // const partialWords = partial.split(/\s+/g);
      // const entityNameWords = entityName.split(/\s+/g);
      // if (partialWords.length >= entityNameWords.length) {
      //     return partial;
      // }
      const partialFirstWord = NameHelper.atonic(
        partial.split(/\s+/)[0].toLowerCase()
      );
      const entityNameFirstWord = NameHelper.atonic(
        entityName.split(/\s+/)[0].toLowerCase()
      );

      if (partialFirstWord !== entityNameFirstWord) {
        return null;
      }
    }

    return partial;
  }

  static getName(entity: SimpleEntity): string {
    if (!entity.wikiPageTitle) {
      throw new Error(`wikiPageTitle is required!`);
    }
    return entity.wikiPageTitle as string;
  }

  static convertSimpleEntityType(type: SimpleEntityType): WikiEntityType {
    switch (type) {
      case SimpleEntityType.EVENT:
        return WikiEntityType.EVENT;
      case SimpleEntityType.ORG:
        return WikiEntityType.ORG;
      case SimpleEntityType.PERSON:
        return WikiEntityType.PERSON;
      case SimpleEntityType.PLACE:
        return WikiEntityType.PLACE;
      case SimpleEntityType.PRODUCT:
        return WikiEntityType.PRODUCT;
      case SimpleEntityType.WORK:
        return WikiEntityType.WORK;
    }
  }

  static isDisambiguation(entity: WikiEntity) {
    return (
      entity &&
      entity.data &&
      entity.data.P31 &&
      entity.data.P31.indexOf("Q4167410") > -1
    );
  }
}

const debug = require("debug")("textactor:actors-explorer");

import { ILocale } from "../../types";
import { findTitles } from "entity-finder";
import { delay, isTimeoutError } from "../../utils";
import { UseCase } from "../usecase";
import { uniq } from "@textactor/domain";
import { CountryTagsService } from "../../services/country-tags-service";

export class FindWikiTitles extends UseCase<string[], string[], null> {
  private tags: string[];
  constructor(private locale: ILocale, countryTags: CountryTagsService) {
    super();
    this.tags = countryTags.getTags(locale.country, locale.lang);
  }

  protected async innerExecute(names: string[]): Promise<string[]> {
    names = uniq(names);

    let allTitles: string[] = [];
    const tags = this.tags;

    for (let name of names) {
      debug(`finding wiki titles for ${name}...`);
      let titles: {
        title: string;
        simple?: string;
        special?: string;
        description?: string;
        categories?: string[];
      }[];
      const findOptions = { limit: 5, tags, orderByTagsLimit: 2 };
      try {
        titles = await findTitles(name, this.locale.lang, findOptions);
      } catch (e) {
        if (isTimeoutError(e)) {
          debug(`ETIMEDOUT retring after 3 sec...`);
          await delay(1000 * 3);
          titles = await findTitles(name, this.locale.lang, findOptions);
        } else {
          throw e;
        }
      }
      if (titles && titles.length) {
        const titleNames = titles
          .map((item) => item.title)
          .filter((item) => item && item.trim().length >= 2);
        debug(`found wiki titles for ${name}: ${titleNames}`);
        allTitles = allTitles.concat(titleNames);
      } else {
        debug(`NOT found wiki titles for ${name}`);
      }
      if (names.length > 1) {
        await delay(500 * 1);
      }
    }

    return uniq(allTitles);
  }
}

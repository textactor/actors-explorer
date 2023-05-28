import test from "ava";
import { isPriorityEntity, sortWikiEntities } from "./select-wiki-entity";
import { FindWikiEntitiesByTitles } from "./find-wiki-entities-by-titles";
import { KnownNameService } from "../../services/known-names-service";

test("isPriorityEntity", async (t) => {
  const locale = { lang: "ro", country: "ro" };
  const finder = new FindWikiEntitiesByTitles(locale, new LocaleKnownNames());
  let entities = await finder.execute(["Siria"]);

  // t.true(entities.length > 1, 'more then 1 entities');
  entities = sortWikiEntities(entities, "ro");
  const siria = entities[0];

  t.is(siria.wikiDataId, "Q858", "first entity is Siria");
  t.true(isPriorityEntity(siria), "Siria is a priority entity");
  // t.false(isPriorityEntity(entities[1]), 'Second entity is not a priority one');
});

class LocaleKnownNames implements KnownNameService {
  getKnownName(_name: string, _lang: string, _country: string) {
    return null;
  }
}

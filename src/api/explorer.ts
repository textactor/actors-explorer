import { DataCollectorApi, createDataContainerApi } from "./data-collector";
import { DataExplorerApi, createDataExplorerApi } from "./data-explorer";
import {
    ConceptContainerRepository,
    ConceptRepository,
    WikiEntityRepository,
    WikiSearchNameRepository,
    WikiTitleRepository,
} from "@textactor/concept-domain";
import { CountryTagsService } from "../services/country-tags-service";
import { KnownNameService } from "../services/known-names-service";


export interface ExplorerApi extends DataCollectorApi, DataExplorerApi {
    // closeDatabase(): Promise<void>
}

export type ExplorerOptions = {
    containerRep: ConceptContainerRepository
    conceptRep: ConceptRepository
    entityRep: WikiEntityRepository
    searchNameRep: WikiSearchNameRepository
    wikiTitleRep: WikiTitleRepository
    countryTagsService: CountryTagsService,
    knownNameService: KnownNameService,
}

export function createExplorer(options: ExplorerOptions): ExplorerApi {
    const api: ExplorerApi = {
        ...createDataContainerApi(options.containerRep, options.conceptRep),
        ...createDataExplorerApi(
            options.containerRep,
            options.conceptRep,
            options.entityRep,
            options.searchNameRep,
            options.wikiTitleRep,
            options.countryTagsService,
            options.knownNameService),
        // closeDatabase() {
        //     return Promise.resolve();
        // }
    }

    return api;
}

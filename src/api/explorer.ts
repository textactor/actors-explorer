import { DataCollectorApi, createDataContainerApi } from "./data-collector";
import { DataExplorerApi, createDataExplorerApi } from "./data-explorer";
import {
    ConceptContainerRepository,
    ConceptRepository,
    WikiEntityRepository,
    WikiSearchNameRepository,
    WikiTitleRepository,
} from "@textactor/concept-domain";


export interface ExplorerApi extends DataCollectorApi, DataExplorerApi {
    // closeDatabase(): Promise<void>
}

export type ExplorerOptions = {
    containerRep: ConceptContainerRepository
    conceptRep: ConceptRepository
    entityRep: WikiEntityRepository
    searchNameRep: WikiSearchNameRepository
    wikiTitleRep: WikiTitleRepository
}

export function createExplorer(options: ExplorerOptions): ExplorerApi {
    const api: ExplorerApi = {
        ...createDataContainerApi(options.containerRep, options.conceptRep),
        ...createDataExplorerApi(
            options.containerRep,
            options.conceptRep,
            options.entityRep,
            options.searchNameRep,
            options.wikiTitleRep),
        // closeDatabase() {
        //     return Promise.resolve();
        // }
    }

    return api;
}

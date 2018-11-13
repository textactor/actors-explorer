
import { ContainerExplorerOptions, ContainerExplorer } from "./container-explorer";
import {
    ConceptContainerRepository,
    ConceptRepository,
    WikiEntityRepository,
    WikiSearchNameRepository,
    WikiTitleRepository,
} from "@textactor/concept-domain";

export interface DataExplorerApi {
    createContainerExplorer(containerId: string, options: ContainerExplorerOptions): ContainerExplorer
}

export function createDataExplorerApi(
    containerRep: ConceptContainerRepository,
    conceptRep: ConceptRepository,
    entityRep: WikiEntityRepository,
    searchNameRep: WikiSearchNameRepository,
    wikiTitleRep: WikiTitleRepository,
): DataExplorerApi {
    return {
        createContainerExplorer(containerId: string, options: ContainerExplorerOptions) {
            return new ContainerExplorer(containerId, options,
                containerRep,
                conceptRep,
                entityRep,
                searchNameRep,
                wikiTitleRep);
        }
    }
}
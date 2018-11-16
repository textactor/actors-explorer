
const debug = require('debug')('textactor:actors-explorer');

import { parse } from 'concepts-parser';
import { PushContextConcepts } from "../usecases/actions/push-context-concepts";
import { ConceptContainerRepository, ConceptRepository, ConceptContainerHelper, ConceptContainerStatus, ConceptHelper, ConceptContainer } from '@textactor/concept-domain';
import { KnownNameService } from '../services/known-names-service';

export interface DataCollectorApi {
    createCollector(data: NewContainerParams): Promise<DataCollector>
    findConceptContainer(data: FindContainerParams): Promise<ConceptContainer[]>
}

export function createDataContainerApi(containerRep: ConceptContainerRepository, conceptRep: ConceptRepository)
    : DataCollectorApi {

    const knownNames = new LocalKnownNamesService();

    const pushConcepts = new PushContextConcepts(conceptRep, knownNames);

    return {
        async createCollector(data: NewContainerParams): Promise<DataCollector> {
            const container = await containerRep.create(ConceptContainerHelper.build(data));

            return {
                container() { return container },
                async pushText(text: string): Promise<void> {
                    if (container.status === ConceptContainerStatus.NEW) {
                        debug(`settings container status to COLLECTING`)
                        await containerRep.update({ id: container.id, set: { status: ConceptContainerStatus.COLLECTING } });
                        container.status = ConceptContainerStatus.COLLECTING;
                    }
                    const context = {
                        text,
                        lang: container.lang,
                        country: container.country,
                    };

                    const items = parse(context, { mode: 'collect' });
                    if (!items || !items.length) {
                        return;
                    }

                    const concepts = items.map(item => {
                        return ConceptHelper.build({
                            name: item.value, abbr: item.abbr, lang: context.lang,
                            country: context.country,
                            containerId: container.id,
                        });
                    }).filter(item => ConceptHelper.isValid(item));

                    await pushConcepts.execute(concepts);
                },

                async pushTextNames(names: string[]): Promise<void> {
                    const concepts = names.map(name => {
                        return ConceptHelper.build({
                            name, lang: container.lang,
                            country: container.country,
                            containerId: container.id,
                            popularity: 1,
                        });
                    }).filter(item => ConceptHelper.isValid(item));

                    await pushConcepts.execute(concepts);

                },
                
                async end(): Promise<void> {
                    container.status = ConceptContainerStatus.COLLECT_DONE;
                    await containerRep.update({ id: container.id, set: { status: ConceptContainerStatus.COLLECT_DONE } });
                }
            }
        },
        findConceptContainer(data: FindContainerParams): Promise<ConceptContainer[]> {
            return containerRep.list(data);
        }
    }
}

//--------- Find Data Container

export type FindContainerParams = {
    lang: string
    country: string
    limit: number
    offset?: number
    status?: ConceptContainerStatus[]
    ownerId?: string
    uniqueName?: string
}

//--------- New Data Container

export type NewContainerParams = {
    name: string
    uniqueName: string
    ownerId: string
    lang: string
    country: string
}

export interface DataCollector {
    pushText(text: string): Promise<void>
    pushTextNames(names: string[]): Promise<void>
    end(): Promise<void>
    container(): ConceptContainer
}

class LocalKnownNamesService implements KnownNameService {
    getKnownName(_name: string, _lang: string, _country: string): { name: string; countryCodes?: string[]; } | null {
        return null;
    }
}


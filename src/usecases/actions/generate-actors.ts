
const debug = require('debug')('textactor:actors-explorer');

import { Actor } from '../../entities/actor';
import { INamesEnumerator } from '../../services/names-enumerator';
import { BuildActorByNames } from './build-actor-by-names';
import { UseCase, IUseCase } from '../usecase';
import { ILocale } from '../../types';
import { WikiEntityRepository } from '@textactor/concept-domain';

export interface OnGenerateActorCallback {
    (actor: Actor): Promise<any>
}

export class GenerateActors extends UseCase<OnGenerateActorCallback, void, void> {
    private buildActor: BuildActorByNames

    constructor(locale: ILocale,
        private namesEnumerator: INamesEnumerator,
        private postNamesProcess: IUseCase<string[], void, void>,
        wikiEntityRep: WikiEntityRepository) {
        super()

        this.buildActor = new BuildActorByNames(locale, wikiEntityRep);
    }

    protected async innerExecute(callback: OnGenerateActorCallback): Promise<void> {
        let actor: Actor;

        while (!this.namesEnumerator.atEnd()) {
            try {
                const actorNames = await this.namesEnumerator.next();
                if (!actorNames.length) {
                    debug(`GenerateActors: no names!`);
                    continue;
                }

                const names = actorNames.nameList();

                actor = await this.buildActor.execute(actorNames);
                if (this.postNamesProcess) {
                    await this.postNamesProcess.execute(names);
                }
                if (actor) {
                    if (this.postNamesProcess) {
                        await this.postNamesProcess.execute(actor.names.map(item => item.name));
                    }
                }
            } catch (e) {
                return Promise.reject(e);
            }

            if (callback && actor) {
                await callback(actor);
            }
        }
    }
}

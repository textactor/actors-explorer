import { Actor } from "../entities/actor";
import { notFound } from "@hapi/boom";
import {
  ExploreContainer,
  ExploreContainerOptions
} from "../usecases/explore-container";
import {
  WikiTitleRepository,
  WikiSearchNameRepository,
  WikiEntityRepository,
  ConceptRepository,
  ConceptContainerRepository
} from "@textactor/concept-domain";
import { CountryTagsService } from "../services/country-tags-service";
import { KnownNameService } from "../services/known-names-service";

export type OnDataCallback = (data: Actor) => Promise<void>;
export type OnErrorCallback = (error: Error) => void;
export type OnEndCallback = () => void;

export interface ContainerExplorer {
  onData(callback: OnDataCallback): void;
  onError(callback: OnErrorCallback): void;
  onEnd(callback: OnEndCallback): void;
  start(): ContainerExplorer;
}

export interface ContainerExplorerOptions extends ExploreContainerOptions {}

export class ContainerExplorer implements ContainerExplorer {
  private started = false;
  // private ended = false;
  private dataCallbacks: OnDataCallback[] = [];
  private errorCallbacks: OnErrorCallback[] = [];
  private endCallbacks: OnEndCallback[] = [];

  constructor(
    private containerId: string,
    private options: ContainerExplorerOptions,
    private containerRep: ConceptContainerRepository,
    private conceptRep: ConceptRepository,
    private entityRep: WikiEntityRepository,
    private searchNameRep: WikiSearchNameRepository,
    private wikiTitleRep: WikiTitleRepository,
    private countryTags: CountryTagsService,
    private knownNames: KnownNameService
  ) {}

  start() {
    if (this.started) {
      throw new Error(`Already started!`);
    }
    this.started = true;

    this.internalStart()
      .catch((error) => this.emitError(error))
      .then(() => this.emitEnd());

    return this;
  }

  private async internalStart() {
    const container = await this.containerRep.getById(this.containerId);

    if (!container) {
      throw notFound(`Not found container id=${this.containerId}`);
    }

    const processConcepts = new ExploreContainer(
      container,
      this.containerRep,
      this.conceptRep,
      this.entityRep,
      this.searchNameRep,
      this.wikiTitleRep,
      this.countryTags,
      this.knownNames
    );

    await processConcepts.execute(
      (actor: Actor) => this.emitData(actor),
      this.options
    );
  }

  onData(callback: OnDataCallback) {
    this.dataCallbacks.push(callback);
  }
  private async emitData(data: Actor): Promise<void> {
    await Promise.all(this.dataCallbacks.map((callback) => callback(data)));
  }
  onError(callback: OnErrorCallback) {
    this.errorCallbacks.push(callback);
  }
  private emitError(error: Error): void {
    this.errorCallbacks.map((callback) => callback(error));
  }
  onEnd(callback: OnEndCallback) {
    this.endCallbacks.push(callback);
  }
  private emitEnd(): void {
    // this.ended = true;
    this.endCallbacks.map((callback) => callback());
  }
}

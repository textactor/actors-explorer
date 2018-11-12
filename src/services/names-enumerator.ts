import { ActorNameCollection } from "../entities/actor-name-collection";

export interface INamesEnumerator {
    next(): Promise<ActorNameCollection>
    /**
     * Returns true if the current item is the last one in the collection, or the collection is empty,
     * or the current item is undefined.
     */
    atEnd(): boolean
}

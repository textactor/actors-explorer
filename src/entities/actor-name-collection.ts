import { ActorNameType, ActorName } from "./actor";
import { NameHelper } from "@textactor/domain";
import { Concept } from "@textactor/concept-domain";

type ActorNameCollectionItem = ActorName & { id: string, order: number, isKnown: boolean };

export class ActorNameCollection {
    private map: { [id: string]: ActorNameCollectionItem } = {}

    constructor(private lang: string) { }

    get length() {
        return Object.keys(this.map).length;
    }

    add({ name, popularity, type, isKnown }: { name: string, popularity: number, type: ActorNameType, isKnown?: boolean }) {
        name = name.trim();
        const id = NameHelper.normalizeName(name, this.lang);
        if (name.length < 2 || id.length < 2) {
            return this;
        }
        const item = this.map[id];
        if (item) {
            if (item.popularity < popularity) {
                item.popularity = popularity;
            }
            if (item.type === 'SAME' && type === 'WIKI') {
                item.type = type;
            }
        } else {
            const isAbbr = NameHelper.isAbbr(name);
            this.map[id] = { name, popularity, id, type, isAbbr, order: this.length, isKnown: isKnown === true };
        }

        return this;
    }

    list() {
        return Object.keys(this.map)
            .reduce<ActorNameCollectionItem[]>((list, id) => {
                list.push(this.map[id]);
                return list;
            }, [])
            .sort((a, b) => {
                const d = b.popularity - a.popularity
                if (d === 0) {
                    return a.order - b.order;
                }
                return d;
            });
    }

    nameList() {
        return this.list().map(item => item.name);
    }

    static fromConcepts(lang: string, concepts: Concept[]) {
        const collection = new ActorNameCollection(lang);

        concepts = concepts.sort((a, b) => b.popularity - a.popularity);

        for (const item of concepts) {
            if (item.knownName) {
                collection.add({ name: item.knownName, type: 'SAME', popularity: item.popularity, isKnown: true });
            }
            if (item.abbr) {
                collection.add({ name: item.abbr, type: 'SAME', popularity: item.popularity, isKnown: false });
            }
            collection.add({ name: item.name, type: 'SAME', popularity: item.popularity, isKnown: false });
        }

        return collection;
    }

    static fromArray(names: string[], lang: string, type: ActorNameType = 'SAME', popularity: number = 1) {
        const collection = new ActorNameCollection(lang);
        for (const name of names) {
            collection.add({ name, popularity, type, isKnown: false });
        }

        return collection;
    }

    addArray(names: string[], type: ActorNameType = 'SAME', popularity: number = 1) {
        for (const name of names) {
            this.add({ name, popularity, type, isKnown: false });
        }

        return this;
    }
}

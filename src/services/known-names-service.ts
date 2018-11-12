export interface IKnownNameService {
    getKnownName(name: string, lang: string, country: string): KnownName | null
}

export type KnownName = {
    name: string
    countryCodes?: string[]
}

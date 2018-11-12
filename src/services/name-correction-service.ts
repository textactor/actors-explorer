
export interface INameCorrectionService {
    correct(name: string, lang: string, country?: string): Promise<string>
}

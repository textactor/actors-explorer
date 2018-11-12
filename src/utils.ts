
export function isTimeoutError(error: any) {
    return error && error.code && ['ESOCKETTIMEDOUT', 'ETIMEDOUT'].indexOf(error.code) > -1;
}

export function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function filterStrings(str: (string | undefined | null)[]): string[] {
    return (str && str.filter(item => item && item.trim().length > 0) || []) as string[];
}

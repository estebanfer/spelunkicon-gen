export function randInt(min: number, max:number) {
    return prng.random_int(min, max, PRNG_CLASS.EXTRA_SPAWNS) as number
}
export function numOrDefault(possibleNum: number | undefined, defNumber: number): number {
    return possibleNum !== undefined ? possibleNum as number : defNumber
}
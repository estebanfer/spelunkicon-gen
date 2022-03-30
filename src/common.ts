export function randInt(min: number, max:number) {
    return prng.random_int(min, max, PRNG_CLASS.EXTRA_SPAWNS) as number
}
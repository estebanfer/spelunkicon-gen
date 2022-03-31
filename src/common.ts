export function randInt(min: number, max:number): number {
    return prng.random_int(min, max, PRNG_CLASS.EXTRA_SPAWNS) as number
}
export function rand(): number {
    return prng.random_float(PRNG_CLASS.EXTRA_SPAWNS) as number
}
export function numOrDefault(possibleNum: number | undefined, defNumber: number): number {
    return possibleNum !== undefined ? possibleNum as number : defNumber
}

export enum DIR {
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3,
}

export const DIRECTION = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
]

export function getDir(dir: number) {
    return dir % 4
}

export function getNewDir(prevDir: number) {
    return (prevDir+1 + Math.floor(Math.random() * 3)) %4 //prng.random(3, PRNG_CLASS.EXTRA_SPAWNS) as number
}
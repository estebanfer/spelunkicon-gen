import { randInt, DIRECTION, getDir, getNewDir } from "./common"

export class RoomGrid {
    sx: number = 0
    sy: number = 0
    grid: string[][] = []
    constructor(sx: number, sy: number, grid?: string[][]){
        this.sx = sx
        this.sy = sy
        if (grid !== undefined) {
            this.grid = grid
        } else {
            for (let y = 0; y < sy; y++) {
                this.grid[y] = []
                for (let x = 0; x < sx; x++) {
                    this.grid[y][x] = "0"
                }
            }
        }
    }
    foreach(func: (x: number, y: number, roomGrid: RoomGrid) => void) {
        for (let y = 0; y<this.sy; y++) {
            for (let x = 0; x<this.sx; x++) {
                func(x, y, this)
            }
        }
    }
    hasNeighbor(x: number, y: number, tile: string) {
        return this.getTile(x+1, y) == tile || this.getTile(x-1, y) == tile
        || this.getTile(x, y+1) == tile || this.getTile(x, y-1) == tile
    }
    placeTile(x: number, y: number, tile: string): void {
        this.grid[y][x] = tile
    }
    getTile(x: number, y: number): string {
        return this.grid[y] ? this.grid[y][x] : "-1"
    }
    setRandomGrid(floorChance: number): void {
        for (let y = 0; y<this.sy; y++) {
            for (let x = 0; x<this.sx; x++) {
                this.grid[y][x] = Math.random()*100 < floorChance ? "X" : "0" //prng.random_int(0, 1, PRNG_CLASS.EXTRA_SPAWNS) as number
            }
        }
    }
    setRandomPath(startPos: [number, number], endPos: [number, number], fromDir: number, maxMoves: number = randInt(this.sx, this.sx*2)) {
        let pos = startPos
        let lastDir = fromDir
        let dir = 0
        this.placeTile(pos[0], pos[1], "0")
        for (let moves = 0; moves < maxMoves; moves++) {
            dir = getNewDir(getDir(lastDir+2))
            const moveDir = DIRECTION[dir]
            const nextPos: [number, number] = [pos[0] + moveDir[0], pos[1] + moveDir[1]]
            if (nextPos[0] < 0 || nextPos[0] >= this.sx ||
                nextPos[1] < 0 || nextPos[1] >= this.sy) {
                    pos = [pos[0] - moveDir[0], pos[1] - moveDir[1]]
                    lastDir = getDir(dir+2)
            } else {
                pos = nextPos
                lastDir = dir
            }
            this.placeTile(pos[0], pos[1], "0")
        }
        while (pos[0] != endPos[0]) {
            pos[0] < endPos[0] ? pos[0]++ : pos[0]--
            this.placeTile(pos[0], pos[1], "0")
        }
        while (pos[1] != endPos[1]) {
            pos[1] < endPos[1] ? pos[1]++ : pos[1]--
            this.placeTile(pos[0], pos[1], "0")
        }
    }
    expandVertical(top: boolean, bottom: boolean, tile: string) {
        if (top) {
            //move lines
            for (let y = this.sy; y > 0; y--) {
                this.grid[y] = this.grid[y-1];
            }
            //add new line
            this.grid[0] = []
            for (let x = 0; x < this.sx; x++) {
                this.grid[0][x] = tile
            }
            this.sy++
        }
        if (bottom) {
            this.grid[this.sy] = []
            for (let x = 0; x < this.sx; x++) {
                this.grid[this.sy][x] = tile
            }
            this.sy++
        }
    }
    getGridString(): string {
        let retStr = ""
        for (let y = 0; y<this.sy; y++) {
            for (let x = 0; x<this.sx; x++) {
                retStr += this.getTile(x, y)
            }
            retStr += "\n"
        }
        return retStr.substring(0, retStr.length-1)
    }
    getMirrorGrid(): RoomGrid {
        let newRoom = new RoomGrid(this.sx*2, this.sy)
        for (let y = 0; y<this.sy; y++) {
            for (let x = 0; x<this.sx; x++) {
                let invX = newRoom.sx-x-1
                let tile = this.getTile(x, y)
                newRoom.placeTile(x, y, tile)
                newRoom.placeTile(invX, y, tile)
            }
        }
        return newRoom
    }
}
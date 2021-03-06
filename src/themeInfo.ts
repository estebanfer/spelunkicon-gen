import { randInt, rand } from "./common"
import { RoomGrid } from "./roomGrid"

type ProceduralTilecodeCallback = (tx: number, ty: number, roomGrid: RoomGrid) => boolean
type PlaceTilecodeCallback = (tilecode: string, tx: number, ty: number, roomGrid: RoomGrid) => void

export interface ProceduralTilecode {
    tileCode: string
    chance: number
    condition: ProceduralTilecodeCallback
    placeTilecode: PlaceTilecodeCallback
}
export class ThemeInfo {
    proceduralTiles: ProceduralTilecode[]
    floor1: string = "X"
    floor2: string = "="
    constructor(proceduralTiles: ProceduralTilecode[], floor1: string, floor2: string) {
        this.proceduralTiles = proceduralTiles
        this.floor1 = floor1
        this.floor2 = floor2
    }
    spawnProceduralsOn(x: number, y: number, roomGrid: RoomGrid) {
        for (const proceduralTile of this.proceduralTiles) {
            if (randInt(0, 100) < proceduralTile.chance && proceduralTile.condition(x, y, roomGrid)) {
                proceduralTile.placeTilecode(proceduralTile.tileCode, x, y, roomGrid)
                break
            }
        }
    }
    processTiles(roomGrid: RoomGrid): void {
        for (let y = 0; y<roomGrid.sy; y++) {
            for (let x = 0; x<roomGrid.sx; x++) {
                let tile = roomGrid.getTile(x, y)
                if (tile == "X") {
                    if ( (roomGrid.hasNeighbor(x, y, this.floor2) && rand() < 0.75) || rand() < 0.05 )
                        roomGrid.placeTile(x, y, this.floor2)
                    else
                        roomGrid.placeTile(x, y, this.floor1)
                }
            }
        }
        for (let y = 0; y<roomGrid.sy; y++) {
            for (let x = 0; x<roomGrid.sx; x++) {
                let tile = roomGrid.getTile(x, y)
                this.spawnProceduralsOn(x, y, roomGrid)
            }
        }
    }
}
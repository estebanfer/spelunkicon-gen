import { randInt, rand } from "./common"
import { RoomGrid } from "./roomGrid"

type ProceduralTilecodeCallback = (tx: number, ty: number, roomGrid: RoomGrid) => any

interface ProceduralTilecode {
    tileCode: string
    chance: number
    condition: ProceduralTilecodeCallback
}
export class ThemeInfo {
    proceduralTiles: ProceduralTilecode[]
    floor1: string = "1"
    floor2: string = "="
    constructor(proceduralTiles: ProceduralTilecode[], floor1: string, floor2: string) {
        this.proceduralTiles = proceduralTiles
        this.floor1 = floor1
        this.floor2 = floor2
    }
    spawnProceduralsOn(x: number, y: number, roomGrid: RoomGrid) {
        for (const proceduralTile of this.proceduralTiles) {
            if (randInt(0, 100) < proceduralTile.chance && proceduralTile.condition(x, y, roomGrid)) {
                roomGrid.placeTile(x, y, proceduralTile.tileCode)
            }
        }
    }
    processTiles(roomGrid: RoomGrid): void {
        for (let y = 0; y<roomGrid.sy; y++) {
            for (let x = 0; x<roomGrid.sx; x++) {
                let tile = roomGrid.getTile(x, y)
                if (tile == "1" || tile == this.floor1)
                    if (roomGrid.hasNeighbor(x, y, this.floor2) && rand() > 0.5)
                        roomGrid.placeTile(x, y, this.floor2)
                    else
                        roomGrid.placeTile(x, y, this.floor1)
                this.spawnProceduralsOn(x, y, roomGrid)
            }
        }
    }
}
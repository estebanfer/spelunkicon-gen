import { randInt, rand } from "./common"
import { ThemeInfo, ProceduralTilecode } from "./themeInfo"
import { RoomGrid } from "./roomGrid"

function defaultPlaceTilecode(tilecode: string, x: number, y: number, roomGrid: RoomGrid) {
    roomGrid.placeTile(x, y, tilecode)
}
const genericSpikes: ProceduralTilecode = {
    tileCode: "^",
    chance: 10,
    condition: (x, y, roomGrid) => {
        return roomGrid.getTile(x, y+1) == "1" && roomGrid.getTile(x, y-1) == "0" && (roomGrid.getTile(x+1, y-1) == "0" || roomGrid.getTile(x-1, y-1) == "0")
    },
    placeTilecode: defaultPlaceTilecode
}

const fallingPlatform: ProceduralTilecode = {
    tileCode: "F",
    chance: 10,
    condition: (x, y, roomGrid) => {
        return roomGrid.getTile(x, y) == "0" && roomGrid.getTile(x, y-1) == "0" && (roomGrid.getTile(x+1, y-1) == "0" || roomGrid.getTile(x-1, y-1) == "0")
    },
    placeTilecode: defaultPlaceTilecode
}

const defSolids = ["1", "="]
const jungleSolids = ["1", "-"]
export const themes: {[key: number]: ThemeInfo} = {
    //DWELLING:
    [THEME.DWELLING]: new ThemeInfo([
        genericSpikes,
        {//Bone block
            tileCode: "f",
            chance: 5,
            condition: (x, y, roomGrid) => {
                let tile = roomGrid.getTile(x, y)
                return tile == "1"
            },
            placeTilecode: defaultPlaceTilecode
        },
        {//Ladder platform
            tileCode: "P",
            chance: 15,
            condition: (x, y, roomGrid) => {
                if (roomGrid.getTile(x, y) == "0" && roomGrid.getTile(x, y-1) == "0" && roomGrid.getTile(x, y+1) == "0" && (
                    (defSolids.includes(roomGrid.getTile(x+1, y)) && roomGrid.getTile(x+1, y-1) == "0") ||
                    (defSolids.includes(roomGrid.getTile(x-1, y)) && roomGrid.getTile(x-1, y-1) == "0")
                )) {
                    return true
                }
                return false
            },
            placeTilecode: (tilecode, x, y, roomGrid) => {
                roomGrid.placeTile(x, y-1, tilecode)
                if (y > 0) roomGrid.placeTile(x, y-1, "L")
                y++
                while (roomGrid.getTile(x, y) == "0" && y < roomGrid.sy) {
                    roomGrid.placeTile(x, y, "L")
                    y++
                }
            }
        }
    ], "1", "="),
    [THEME.JUNGLE]: new ThemeInfo([
        genericSpikes,
        {
            tileCode: "V",
            chance: 10,
            condition: (x, y, roomGrid) => {
                return roomGrid.getTile(x, y) == "0" && jungleSolids.includes(roomGrid.getTile(x, y-1))
            },
            placeTilecode: defaultPlaceTilecode
        },
        {
            tileCode: "T",
            chance: 10,
            condition: (x, y, roomGrid) => {
                return roomGrid.getTile(x, y) == "0" && roomGrid.getTile(x, y+1) == "1"
            },
            placeTilecode: defaultPlaceTilecode
        }
    ], "1", "-"),
    [THEME.VOLCANA]: new ThemeInfo([
        fallingPlatform,
        {// ConveyorBelt <
            tileCode: "<",
            chance: 40,
            condition: (x, y, roomGrid) => {
                return defSolids.includes(roomGrid.getTile(x, y)) && (rand() < 0.1 || roomGrid.getTile(x-1, y) == "<")
            },
            placeTilecode: defaultPlaceTilecode
        },
        {// ConveyorBelt >
            tileCode: ">",
            chance: 40,
            condition: (x, y, roomGrid) => {
                return defSolids.includes(roomGrid.getTile(x, y)) && (rand() < 0.1 || roomGrid.getTile(x-1, y) == ">")
            },
            placeTilecode: defaultPlaceTilecode
        },
        {
            tileCode: "A",
            chance: 2,
            condition: (x, y, roomGrid) => {
                return defSolids.includes(roomGrid.getTile(x, y)) && roomGrid.getTile(x, y+1) == "0"
            },
            placeTilecode: defaultPlaceTilecode
        }
    ], "1", "="),
    [THEME.TIDE_POOL]: new ThemeInfo([
        genericSpikes,
        {
            tileCode: "B",
            chance: 10,
            condition: (x, y, roomGrid) => {
                return defSolids.includes(roomGrid.getTile(x, y)) && roomGrid.getTile(x, y+1) == "0"
            },
            placeTilecode: defaultPlaceTilecode
        }
    ], "1", "="),
    [THEME.TEMPLE]: new ThemeInfo([], "=", "1"),
    [THEME.DUAT]: new ThemeInfo([], "=", "="),
    [THEME.ICE_CAVES]: new ThemeInfo([], "1", "c"),
    [THEME.NEO_BABYLON]: new ThemeInfo([], "=", "1"),
    [THEME.SUNKEN_CITY]: new ThemeInfo([], "1", "="),
    [THEME.CITY_OF_GOLD]: new ThemeInfo([], "=", "1"),
    [THEME.EGGPLANT_WORLD]: new ThemeInfo([], "1", "="),
}

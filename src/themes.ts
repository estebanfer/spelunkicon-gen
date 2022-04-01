
import { ThemeInfo } from "./themeInfo"

const dwellingSolids = ["1", "="]
export const themes: {[key: number]: ThemeInfo} = {
    //DWELLING:
    [THEME.DWELLING]: new ThemeInfo([
        {
            tileCode: "^",
            chance: 10,
            condition: (x, y, roomGrid) => {
                return roomGrid.getTile(x, y+1) == "1" && roomGrid.getTile(x, y-1) == "0" && (roomGrid.getTile(x+1, y-1) == "0" || roomGrid.getTile(x-1, y-1) == "0")
            }
        },
        {
            tileCode: "f",
            chance: 5,
            condition: (x, y, roomGrid) => {
                let tile = roomGrid.getTile(x, y)
                return tile == "1"
            }
        },
        {
            tileCode: "P",
            chance: 15,
            condition: (x, y, roomGrid) => {
                if (roomGrid.getTile(x, y) == "0" && roomGrid.getTile(x, y-1) == "0" && roomGrid.getTile(x, y+1) == "0" && (
                    (dwellingSolids.includes(roomGrid.getTile(x+1, y)) && roomGrid.getTile(x+1, y-1) == "0") ||
                    (dwellingSolids.includes(roomGrid.getTile(x-1, y)) && roomGrid.getTile(x-1, y-1) == "0")
                )) {
                    if (y > 0) roomGrid.placeTile(x, y-1, "L")
                    y++
                    while (roomGrid.getTile(x, y) == "0" && y < roomGrid.sy) {
                        roomGrid.placeTile(x, y, "L")
                        y++
                    }
                    return true
                }
                return false
            }
        }
    ], "1", "="),
    [THEME.JUNGLE]: new ThemeInfo([], "1", "-"),
    [THEME.VOLCANA]: new ThemeInfo([], "1", "="),
    [THEME.TIDE_POOL]: new ThemeInfo([], "1", "="),
    [THEME.TEMPLE]: new ThemeInfo([], "=", "1"),
    [THEME.DUAT]: new ThemeInfo([], "=", "="),
    [THEME.ICE_CAVES]: new ThemeInfo([], "1", "c"),
    [THEME.NEO_BABYLON]: new ThemeInfo([], "=", "1"),
    [THEME.SUNKEN_CITY]: new ThemeInfo([], "1", "="),
    [THEME.CITY_OF_GOLD]: new ThemeInfo([], "=", "1"),
    [THEME.EGGPLANT_WORLD]: new ThemeInfo([], "1", "="),
}

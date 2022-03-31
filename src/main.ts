//TODO: theme specific tiles, fix ice caves
import { randInt, numOrDefault, DIR } from "./common"
import { RoomConnections } from "./roomConnection/roomConnections"
import { RoomGrid } from "./roomGrid"

function isLavaLevel(): boolean {
    let co_subtheme = get_co_subtheme()
    return state.theme == THEME.VOLCANA || state.theme == THEME.NEO_BABYLON || co_subtheme == COSUBTHEME.VOLCANA || co_subtheme == COSUBTHEME.NEO_BABYLON
}

function isWaterLevel(): boolean {
    let co_subtheme = get_co_subtheme()
    return state.theme == THEME.TIDE_POOL || state.theme == THEME.SUNKEN_CITY || co_subtheme == COSUBTHEME.TIDE_POOL || co_subtheme == COSUBTHEME.SUNKEN_CITY
}

let roomConnections: RoomConnections = new RoomConnections()

let num = 0

let ignoreRooms: [number, number][] = []
set_callback((ctx: PostRoomGenerationContext) => {
    num = 0
    roomConnections = new RoomConnections(state.height)
    ignoreRooms = []
    for (let y = 0; y<state.height; y++) {
        for (let x = 0; x<state.width; x++) {
            let roomTemplate = get_room_template(x, y, LAYER.FRONT)
            if (roomTemplate !== undefined && !roomConnections.rooms[y][x]) {
                if (roomTemplate == ROOM_TEMPLATE.PATH_NORMAL) {
                    roomConnections.setHorizontalConnection(x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.PATH_DROP) {
                    roomConnections.setPathDropConnection(x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.PATH_NOTOP) {
                    roomConnections.setPathNotopConnection(x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.PATH_DROP_NOTOP)  {
                    roomConnections.setAllRoomConnections(x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.MACHINE_WIDEROOM_PATH) {
                    roomConnections.setWideRoomConnection(x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.MACHINE_TALLROOM_PATH || roomTemplate == ROOM_TEMPLATE.MACHINE_TALLROOM_SIDE) {
                    let topTemplate = get_room_template(x, y-1, LAYER.FRONT)
                    if (topTemplate == ROOM_TEMPLATE.PATH_DROP || topTemplate == ROOM_TEMPLATE.PATH_DROP_NOTOP)
                        ctx.set_room_template(x, y, LAYER.FRONT, ROOM_TEMPLATE.PATH_DROP_NOTOP)
                    else
                        ctx.set_room_template(x, y, LAYER.FRONT, ROOM_TEMPLATE.PATH_DROP)
                    roomConnections.setAllRoomConnections(x, y)
                    
                    let bottomTemplate = get_room_template(x, y+2, LAYER.FRONT)
                    if (bottomTemplate == ROOM_TEMPLATE.PATH_NOTOP || bottomTemplate == ROOM_TEMPLATE.PATH_DROP_NOTOP)
                        ctx.set_room_template(x, y+1, LAYER.FRONT, ROOM_TEMPLATE.PATH_DROP_NOTOP)
                    else
                        ctx.set_room_template(x, y+1, LAYER.FRONT, ROOM_TEMPLATE.PATH_NOTOP)
                    roomConnections.setAllRoomConnections(x, y+1)
                    messpect("tall", x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.MACHINE_BIGROOM_PATH) {
                    let leftTopRoom = roomConnections.setAllRoomConnections(x, y)
                    let leftBottomRoom = roomConnections.setAllRoomConnections(x, y+1)
                    let rightTopRoom = roomConnections.setHorizontalConnection(x+1, y)
                    let rightBottomRoom = roomConnections.setHorizontalConnection(x+1, y+1)
                    rightTopRoom.top = 9 - (leftTopRoom.top as number)
                    rightBottomRoom.bottom = 9 - (leftBottomRoom.bottom as number)
                }
            }
        }
    }
}, ON.POST_ROOM_GENERATION)

//Old
function getRoom(roomTemplate: number, floorChance: number): string {
    let room: RoomGrid
    let roomStr: string = ""
    switch (roomTemplate) {
        case ROOM_TEMPLATE.PATH_NORMAL:
            room = new RoomGrid(10, 6)
            room.setRandomGrid(floorChance)
            room.setRandomPath([0,5], [9,5], DIR.LEFT)
            roomStr = "1111111111\n" + room.getGridString() + "\n1111111111"
            break;
        case ROOM_TEMPLATE.PATH_DROP:
            room = new RoomGrid(10, 7)
            room.setRandomGrid(floorChance)
            room.setRandomPath([0,5], [4,6], DIR.LEFT)
            room.setRandomPath([9,5], [4,6], DIR.RIGHT)
            roomStr = "1111111111\n" + room.getGridString()
            break;
        case ROOM_TEMPLATE.PATH_NOTOP:
            room = new RoomGrid(10, 7)
            room.setRandomGrid(floorChance)
            room.setRandomPath([0,6], [9,6], DIR.LEFT)
            room.setRandomPath([4,0], [4,6], DIR.UP)
            roomStr = room.getGridString() + "\n1111111111"
            break;
        case ROOM_TEMPLATE.PATH_DROP_NOTOP:
            room = new RoomGrid(10, 8)
            room.setRandomGrid(floorChance)
            room.setRandomPath([4,0], [4,7], DIR.UP)
            roomStr = room.getGridString()
            break;
        case ROOM_TEMPLATE.SIDE:
            room = new RoomGrid(10, 8)
            room.setRandomGrid(floorChance)
            roomStr = room.getGridString()
        default:
            return "";
    }
    /*if (isLavaLevel() || isWaterLevel()) {
        for (let y = 0; y < room.grid.length; y++) {
            const element = room.grid[y];
            for (let x = 0; x < element.length; x++) {

            }
        }
    }*/
    return roomStr
}

function getRoomConectionSides(x: number, y: number, left: number, top: number, right: number, bottom: number): LuaMultiReturn<[number, number, number, number]> {
    const roomConnection = roomConnections.getRoomConnection(x, y)
    if (roomConnection !== undefined) {
        left = numOrDefault(roomConnection.left, left)
        right = numOrDefault(roomConnection.right, right)
        top = numOrDefault(roomConnection.top, top)
        bottom = numOrDefault(roomConnection.bottom, bottom)
    }
    return $multi(left, top, right, bottom)
}

function getRoomSymmetric(pos: [number, number], roomTemplate: number, floorChance: number): string {
    let room: RoomGrid
    let roomStr: string = ""
    let [x, y] = pos
    if (roomTemplate == ROOM_TEMPLATE.PATH_NORMAL) {
        room = new RoomGrid(5, 6)
        room.setRandomGrid(floorChance)
        const [left, , right, ] = getRoomConectionSides(x, y, 5, 0, 5, 0)
        room.setRandomPath([0,left-1], [4,randInt(0,5)], DIR.LEFT)
        roomStr = "1111111111\n" + room.getMirrorGrid().getGridString() + "\n1111111111"
        //messpect(roomStr)
    } else if (roomTemplate == ROOM_TEMPLATE.PATH_DROP) {
        room = new RoomGrid(5, 7)
        room.setRandomGrid(floorChance)
        const [left, , , bottom] = getRoomConectionSides(x, y, 5, 0, 0, 4)
        room.setRandomPath([0,left-1], [bottom,6], DIR.LEFT)
        room.setRandomPath([0,left-1], [4,randInt(0,5)], DIR.LEFT)
        roomStr = "1111111111\n" + room.getMirrorGrid().getGridString()
    } else if (roomTemplate == ROOM_TEMPLATE.PATH_NOTOP) {
        room = new RoomGrid(5, 7)
        room.setRandomGrid(floorChance)
        const [left, top, , ] = getRoomConectionSides(x, y, 5, 0, 0, 4)
        room.setRandomPath([0,left], [top,0], DIR.LEFT)
        room.setRandomPath([0,left], [4,randInt(0,5)], DIR.LEFT)
        roomStr = room.getMirrorGrid().getGridString() + "\n1111111111"
    } else if (roomTemplate == ROOM_TEMPLATE.PATH_DROP_NOTOP) {
        room = new RoomGrid(5, 8)
        room.setRandomGrid(floorChance)
        const [left, top, right, bottom] = getRoomConectionSides(x, y, 5, 0, 0, 4)
        room.setRandomPath([0,left], [4,right], DIR.LEFT)
        room.setRandomPath([top,0], [bottom,7], DIR.UP)
        roomStr = room.getMirrorGrid().getGridString()
    } else if (roomTemplate == ROOM_TEMPLATE.MACHINE_WIDEROOM_PATH || roomTemplate == ROOM_TEMPLATE.MACHINE_WIDEROOM_SIDE) {
        room = new RoomGrid(10, 6)
        room.setRandomGrid(floorChance)
        const [left, , right, ] = getRoomConectionSides(x, y, 5, 0, 5, 0)
        room.setRandomPath([0,left-1], [9,randInt(0,5)], DIR.LEFT)
        roomStr = "11111111111111111111\n" + room.getMirrorGrid().getGridString() + "\n11111111111111111111"
        messpect("wideroom", roomStr)
    } else if (roomTemplate == ROOM_TEMPLATE.SIDE) {
        room = new RoomGrid(5, 8)
        room.setRandomGrid(floorChance)
        roomStr = room.getMirrorGrid().getGridString()
    } else if (roomTemplate == ROOM_TEMPLATE.MACHINE_BIGROOM_PATH) {
        room = new RoomGrid(10, 16)
        room.setRandomGrid(floorChance)
        const [leftTop, topLeft, , ] = getRoomConectionSides(x, y, 5, 0, 5, 0)
        const [leftBottom, , , bottomLeft] = getRoomConectionSides(x, y+1, 5, 0, 5, 0)
        room.setRandomPath([0,leftTop], [9,randInt(0,7)], DIR.LEFT)
        room.setRandomPath([0,leftBottom+8], [9,randInt(8,15)], DIR.LEFT)
        room.setRandomPath([topLeft,0], [bottomLeft,15], DIR.LEFT, randInt(10, 25))
        roomStr = room.getMirrorGrid().getGridString()
        messpect("bigroom", roomStr)
    }
    /*if (isLavaLevel() || isWaterLevel()) {
        for (let y = 0; y < room.grid.length; y++) {
            const element = room.grid[y];
            for (let x = 0; x < element.length; x++) {

            }
        }
    }*/
    return roomStr
}

function shouldNotBeReplaced(x: number, y: number, l: number, room_template: number): boolean {
    if (l != LAYER.FRONT) return true
    if (state.theme == THEME.OLMEC || state.theme == THEME.TIAMAT || state.theme == THEME.BASE_CAMP) return true
    return false
}

set_callback((x: number, y:number, l: number, room_template: ROOM_TEMPLATE) => {
    if (shouldNotBeReplaced(x, y, l, room_template)) return
    let roomStr = getRoomSymmetric([x, y], room_template, state.theme == THEME.COSMIC_OCEAN ? 30 : 50)
    num++
    if (num > 100) {
        messpect(x, y, l, room_template)
        num = 0
        return
    }
    return roomStr
}, ON.PRE_GET_RANDOM_ROOM)

let FLOORS = [ENT_TYPE.FLOOR_GENERIC, ENT_TYPE.FLOOR_SURFACE, ENT_TYPE.FLOOR_JUNGLE, ENT_TYPE.FLOOR_TUNNEL_CURRENT, ENT_TYPE.FLOOR_TUNNEL_NEXT, ENT_TYPE.FLOOR_PEN, ENT_TYPE.FLOOR_TOMB, ENT_TYPE.FLOORSTYLED_BABYLON, ENT_TYPE.FLOORSTYLED_BEEHIVE, ENT_TYPE.FLOORSTYLED_COG, ENT_TYPE.FLOORSTYLED_DUAT, ENT_TYPE.FLOORSTYLED_GUTS, ENT_TYPE.FLOORSTYLED_MINEWOOD, ENT_TYPE.FLOORSTYLED_MOTHERSHIP, ENT_TYPE.FLOORSTYLED_PAGODA, ENT_TYPE.FLOORSTYLED_STONE, ENT_TYPE.FLOORSTYLED_SUNKEN, ENT_TYPE.FLOORSTYLED_TEMPLE, ENT_TYPE.FLOORSTYLED_VLAD]

set_pre_entity_spawn(() => {
    return 0
}, SPAWN_TYPE.LEVEL_GEN_FLOOR_SPREADING, MASK.ANY, FLOORS)
//TODO: theme specific tiles, fix ice caves

type ExtraConditionCallback = (tx: number, ty: number, tiles: number[][]) => any

interface ExtraTile {
    tileCode: String
    chance: number
    extraCondition?: ExtraConditionCallback
}

interface RoomConnection {
    left?: number
    top?: number
    right?: number
    bottom?: number
}

function isLavaLevel(): boolean {
    let co_subtheme = get_co_subtheme()
    return state.theme == THEME.VOLCANA || state.theme == THEME.NEO_BABYLON || co_subtheme == COSUBTHEME.VOLCANA || co_subtheme == COSUBTHEME.NEO_BABYLON
}

function isWaterLevel(): boolean {
    let co_subtheme = get_co_subtheme()
    return state.theme == THEME.TIDE_POOL || state.theme == THEME.SUNKEN_CITY || co_subtheme == COSUBTHEME.TIDE_POOL || co_subtheme == COSUBTHEME.SUNKEN_CITY
}

enum DIR{
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3,
}

const DIRECTION = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
]

function getDir(dir: number) {
    return dir % 4
}

function getNewDir(prevDir: number) {
    return (prevDir+1 + Math.floor(Math.random() * 3)) %4 //prng.random(3, PRNG_CLASS.EXTRA_SPAWNS) as number
}

class RoomGrid {
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
    placeTile(x: number, y: number, tile: string): void {
        this.grid[y][x] = tile
    }
    getTile(x: number, y: number): string {
        return this.grid[y][x]
    }
    setRandomGrid(floorChance: number): void {
        for (let y = 0; y<this.sy; y++) {
            for (let x = 0; x<this.sx; x++) {
                this.grid[y][x] = Math.random()*100 < floorChance ? "1" : "0" //prng.random_int(0, 1, PRNG_CLASS.EXTRA_SPAWNS) as number
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
    getGridString(): String {
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

function randInt(min: number, max:number) {
    return prng.random_int(min, max, PRNG_CLASS.EXTRA_SPAWNS) as number
}

let roomConnections: RoomConnection[][] = []

function setHorizontalConnections(room: RoomConnection, leftRoom?: RoomConnection, rightRoom?: RoomConnection) {
    if (leftRoom !== undefined) {
        room.left = leftRoom.right !== undefined ? leftRoom.right : randInt(1, 6)
        room.right = room.left
    } else if (rightRoom !== undefined) {
        room.right = rightRoom.left !== undefined ? rightRoom.left : randInt(1, 6)
        room.left = room.right
    } else {
        room.left = randInt(1, 6)
        room.right = room.left
    }
}

function setVerticalConnections(room: RoomConnection, topRoom?: RoomConnection, bottomRoom?: RoomConnection) {
    if (topRoom !== undefined) {
        room.top = topRoom.bottom !== undefined ? topRoom.bottom : randInt(1, 4)
    } else {
        room.top = randInt(1, 4)
    }
    if (bottomRoom !== undefined) {
        room.bottom = bottomRoom.top !== undefined ? bottomRoom.top : randInt(1, 4)
    } else {
        room.bottom = randInt(1, 4)
    }
}

function getRoomConnection(x: number, y: number): RoomConnection | undefined {
    return roomConnections[y] !== undefined ? roomConnections[y][x] : undefined
}

function setAllRoomConnections(x: number, y: number): RoomConnection {
    roomConnections[y][x] = {}
    let roomConnection = roomConnections[y][x]
    let leftRoom = getRoomConnection(x-1, y)
    let rightRoom = getRoomConnection(x+1, y)
    let topRoom = getRoomConnection(x, y-1)
    let bottomRoom = getRoomConnection(x, y+1)
    setHorizontalConnections(roomConnection, leftRoom, rightRoom)
    setVerticalConnections(roomConnection, topRoom, bottomRoom)
    return roomConnection
}

function setHorizontalConnectionsPos(x: number, y: number): RoomConnection {
    roomConnections[y][x] = {}
    let roomConnection = roomConnections[y][x]
    let leftRoom = getRoomConnection(x-1, y)
    let rightRoom = getRoomConnection(x+1, y)
    setHorizontalConnections(roomConnection, leftRoom, rightRoom)
    return roomConnection
}

function setPathDropConnection(x: number, y: number): void {
    roomConnections[y][x] = {}
    let roomConnection = roomConnections[y][x]
    let leftRoom = getRoomConnection(x-1, y)
    let rightRoom = getRoomConnection(x+1, y)
    setHorizontalConnections(roomConnection, leftRoom, rightRoom)
    setVerticalConnections(roomConnection)
}

function setPathNotopConnection(x: number, y: number): void {
    roomConnections[y][x] = {}
    let roomConnection = roomConnections[y][x]
    let leftRoom = getRoomConnection(x-1, y)
    let rightRoom = getRoomConnection(x+1, y)
    let topRoom = getRoomConnection(x, y-1)
    setHorizontalConnections(roomConnection, leftRoom, rightRoom)
    setVerticalConnections(roomConnection, topRoom)
}

let lastRoomX
let lastRoomY
let num = 0

let ignoreRooms: [number, number][] = []
set_callback((ctx: PostRoomGenerationContext) => {
    num = 0
    lastRoomX = -1
    lastRoomY = -1
    roomConnections = []
    ignoreRooms = []
    for (let y = 0; y<state.height; y++) {
        roomConnections[y] = []
    }
    for (let y = 0; y<state.height; y++) {
        for (let x = 0; x<state.width; x++) {
            let roomTemplate = get_room_template(x, y, LAYER.FRONT)
            if (roomTemplate !== undefined && !roomConnections[y][x]) {
                if (roomTemplate == ROOM_TEMPLATE.PATH_NORMAL) {
                    setHorizontalConnectionsPos(x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.PATH_DROP) {
                    setPathDropConnection(x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.PATH_NOTOP) {
                    setPathNotopConnection(x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.PATH_DROP_NOTOP)  {
                    setAllRoomConnections(x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.MACHINE_WIDEROOM_PATH) {
                    roomConnections[y][x] = {}
                    let roomConnection = roomConnections[y][x]
                    let leftRoom = getRoomConnection(x-1, y)
                    setHorizontalConnections(roomConnection, leftRoom, undefined)

                    roomConnections[y][x+1] = {}
                    let roomConnectionRight = roomConnections[y][x+1]
                    let rightRoom = getRoomConnection(x+2, y)
                    setHorizontalConnections(roomConnectionRight, roomConnection, rightRoom)
                } else if (roomTemplate == ROOM_TEMPLATE.MACHINE_TALLROOM_PATH || roomTemplate == ROOM_TEMPLATE.MACHINE_TALLROOM_SIDE) {
                    let topTemplate = get_room_template(x, y-1, LAYER.FRONT)
                    if (topTemplate == ROOM_TEMPLATE.PATH_DROP || topTemplate == ROOM_TEMPLATE.PATH_DROP_NOTOP)
                        ctx.set_room_template(x, y, LAYER.FRONT, ROOM_TEMPLATE.PATH_DROP_NOTOP)
                    else
                        ctx.set_room_template(x, y, LAYER.FRONT, ROOM_TEMPLATE.PATH_DROP)
                    setAllRoomConnections(x, y)
                    
                    let bottomTemplate = get_room_template(x, y+2, LAYER.FRONT)
                    if (bottomTemplate == ROOM_TEMPLATE.PATH_NOTOP || bottomTemplate == ROOM_TEMPLATE.PATH_DROP_NOTOP)
                        ctx.set_room_template(x, y+1, LAYER.FRONT, ROOM_TEMPLATE.PATH_DROP_NOTOP)
                    else
                        ctx.set_room_template(x, y+1, LAYER.FRONT, ROOM_TEMPLATE.PATH_NOTOP)
                    setAllRoomConnections(x, y+1)
                    messpect("tall", x, y)
                } else if (roomTemplate == ROOM_TEMPLATE.MACHINE_BIGROOM_PATH) {
                    //TODO: Make rooms at right top and right bottom to have correct connections (if they don't have it correct already)
                    let leftTopRoom = setAllRoomConnections(x, y)
                    let leftBottomRoom = setAllRoomConnections(x, y+1)
                    let rightTopRoom = setHorizontalConnectionsPos(x+1, y)
                    let rightBottomRoom = setHorizontalConnectionsPos(x+1, y+1)
                    rightTopRoom.top = 9 - (leftTopRoom.top as number)
                    rightBottomRoom.bottom = 9 - (leftBottomRoom.bottom as number)
                }
            }
        }
    }
}, ON.POST_ROOM_GENERATION)

//Old
function getRoom(roomTemplate: number, floorChance: number): String {
    let room: RoomGrid
    let roomStr: String = ""
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
    const roomConnection = getRoomConnection(x, y)
    if (roomConnection !== undefined) {
        left = roomConnection.left !== undefined ? roomConnection.left as number : left
        right = roomConnection.right !== undefined ? roomConnection.right as number : right
        top = roomConnection.top !== undefined ? roomConnection.top as number : top
        bottom = roomConnection.bottom !== undefined ? roomConnection.bottom as number : bottom
    }
    return $multi(left, top, right, bottom)
}

function getRoomSymmetric(pos: [number, number], roomTemplate: number, floorChance: number): String {
    let room: RoomGrid
    let roomStr: String = ""
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
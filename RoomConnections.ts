import { RoomConnection } from "./RoomConnection"
export class RoomConnections {
    rooms: RoomConnection[][]
    constructor(height?: number) {
        this.rooms = []
        if (height) {
            for (let y = 0; y<height; y++) {
                this.rooms[y] = []
            }
        }
    }
    getRoomConnection(x: number, y: number): RoomConnection | undefined {
        return this.rooms[y] ? this.rooms[y][x] : undefined
    }
    setHorizontalConnection(x: number, y: number): RoomConnection {
        let roomConnection = new RoomConnection()
        roomConnection.setHorizontalConnections(
            this.getRoomConnection(x-1, y),
            this.getRoomConnection(x+1, y))
        this.rooms[y][x] = roomConnection
        return roomConnection
    }
    setPathDropConnection(x: number, y: number): RoomConnection {
        let roomConnection = new RoomConnection()
        roomConnection.setHorizontalConnections(
            this.getRoomConnection(x-1, y),
            this.getRoomConnection(x+1, y))
        roomConnection.setVerticalConnections()
        this.rooms[y][x] = roomConnection
        return roomConnection
    }
    setPathNotopConnection(x: number, y: number): RoomConnection {
        let roomConnection = new RoomConnection()
        roomConnection.setHorizontalConnections(
            this.getRoomConnection(x-1, y),
            this.getRoomConnection(x+1, y))
        roomConnection.setVerticalConnections(
            this.getRoomConnection(x, y-1))
        this.rooms[y][x] = roomConnection
        return roomConnection
    }
    setAllRoomConnections(x: number, y: number): RoomConnection {
        let roomConnection = new RoomConnection()
        roomConnection.setHorizontalConnections(
            this.getRoomConnection(x-1, y),
            this.getRoomConnection(x+1, y))
        roomConnection.setVerticalConnections(
            this.getRoomConnection(x, y-1),
            this.getRoomConnection(x, y+1))
        this.rooms[y][x] = roomConnection
        return roomConnection
    }
    setWideRoomConnection(x: number, y: number): void {
        let roomConnection = new RoomConnection()
        roomConnection.setHorizontalConnections(this.getRoomConnection(x-1, y))
        this.rooms[y][x] = roomConnection

        let roomConnectionRight = new RoomConnection()
        roomConnectionRight.setHorizontalConnections(
            roomConnection,
            this.getRoomConnection(x+2, y))
        this.rooms[y][x+1] = roomConnectionRight
    }
}
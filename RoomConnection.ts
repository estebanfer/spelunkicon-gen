import {randInt} from "./Common"

export class RoomConnection {
    left?: number
    top?: number
    right?: number
    bottom?: number
    setHorizontalConnections(leftRoom?: RoomConnection, rightRoom?: RoomConnection) {
        if (leftRoom !== undefined) {
            this.left = leftRoom.right !== undefined ? leftRoom.right : randInt(1, 6)
            this.right = this.left
        } else if (rightRoom !== undefined) {
            this.right = rightRoom.left !== undefined ? rightRoom.left : randInt(1, 6)
            this.left = this.right
        } else {
            this.left = randInt(1, 6)
            this.right = this.left
        }
    }
    setVerticalConnections(topRoom?: RoomConnection, bottomRoom?: RoomConnection) {
        if (topRoom !== undefined) {
            this.top = topRoom.bottom !== undefined ? topRoom.bottom : randInt(1, 4)
        } else {
            this.top = randInt(1, 4)
        }
        if (bottomRoom !== undefined) {
            this.bottom = bottomRoom.top !== undefined ? bottomRoom.top : randInt(1, 4)
        } else {
            this.bottom = randInt(1, 4)
        }
    }
}
import nengi from 'nengi'
import SAT from 'sat'
import WeaponSystem from '../WeaponSystem'
import CONFIG from '../gameConfig'

class PlayerCharacter {
    constructor({ name }) {
        this.x = 0
        this.y = 0
        this.mood = 'neutral'

        this.moveDirection = {
            x: 0,
            y: 0,
        }

        this.hat_color = `0x${Math.random().toString(16).substr(2, 6)}`
        this.skin_color = `0x${Math.random().toString(16).substr(2, 6)}`

        this.name = name

        this.rotation = 0
        this.speed = CONFIG.PLAYER_SPEED

        this.weaponSystem = new WeaponSystem()
        this.collider = new SAT.Circle(new SAT.Vector(this.x, this.y), 25)
    }

    // TODO DISABLE IN THE FUTURE?
    fire() {
        return this.weaponSystem.fire()
    }

    processMove(command) {
        this.rotation = command.rotation

        let unitX = 0
        let unitY = 0

        // create forces from input
        if (command.forward) {
            unitY -= 1
        }
        if (command.backward) {
            unitY += 1
        }

        if (command.left) {
            unitX -= 1
        }

        if (command.right) {
            unitX += 1
        }

        // normalize
        const len = Math.sqrt(unitX * unitX + unitY * unitY)
        if (len > 0) {
            unitX /= len
            unitY /= len
        }

        this.moveDirection.x = unitX
        this.moveDirection.y = unitY
    }

    processMood(command) {
        this.mood = command.mood
    }

    move(delta) {
        this.x += this.moveDirection.x * this.speed * delta
        this.x = Math.max(CONFIG.PLAYER_DIAMETER / 2, this.x)
        this.x = Math.min(CONFIG.MAP_X - CONFIG.PLAYER_DIAMETER / 2, this.x)

        this.y += this.moveDirection.y * this.speed * delta
        this.y = Math.max(CONFIG.PLAYER_DIAMETER / 2, this.y)
        this.y = Math.min(CONFIG.MAP_Y - CONFIG.PLAYER_DIAMETER / 2, this.y)

        this.collider.pos.x = this.x
        this.collider.pos.y = this.y
    }
}

PlayerCharacter.protocol = {
    x: { type: nengi.Float32, interp: true },
    y: { type: nengi.Float32, interp: true },
    hitpoints: nengi.UInt8,
    name: nengi.String,
    message: nengi.String,
    mood: nengi.String,
    skin_color: nengi.String,
    hat_color: nengi.String,
}

export default PlayerCharacter

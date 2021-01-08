import nengi from 'nengi'
import nengiConfig from '../common/nengiConfig'
import InputSystem from './InputSystem'
import MoveCommand from '../common/command/MoveCommand'
import FireCommand from '../common/command/FireCommand'
import PIXIRenderer from './graphics/PIXIRenderer'

const ALLOW_ROTATION = false

class GameClient {
    constructor(client) {
        this.client = client
        this.renderer = new PIXIRenderer()
        this.input = new InputSystem()

        this.client.onClose(() => {
            console.log('connection closed')
        })
    }

    update(delta, tick, now) {
        /* receiving */
        const network = this.client.readNetwork()

        network.entities.forEach(snapshot => {
            snapshot.createEntities.forEach(entity => {
                this.renderer.createEntity(entity)
            })

            snapshot.updateEntities.forEach(update => {
                this.renderer.updateEntity(update)
            })

            snapshot.deleteEntities.forEach(nid => {
                this.renderer.deleteEntity(nid)
            })
        })

        network.messages.forEach(message => {
            this.renderer.processMessage(message)
        })

        network.localMessages.forEach(localMessage => {
            this.renderer.processLocalMessage(localMessage)
        })
        /* * */

        /* sending */
        const input = this.input.frameState

        let rotation = 0
        const worldCoord = this.renderer.toWorldCoordinates(this.input.currentState.mx, this.input.currentState.my)

        if (this.renderer.myEntity) {
            // calculate the direction our character is facing
            const dx = worldCoord.x - this.renderer.myEntity.x
            const dy = worldCoord.y - this.renderer.myEntity.y
            rotation = Math.atan2(dy, dx)
        }

        this.client.addCommand(new MoveCommand(input.w, input.a, input.s, input.d, ALLOW_ROTATION ? rotation : 0, delta))

        if (input.mouseDown) {
            this.client.addCommand(new FireCommand(worldCoord.x, worldCoord.y))
        }

        this.input.releaseKeys()
        this.client.update()
        /* * */

        /* rendering */
        this.renderer.update(delta)
        /* * */
    }
}

export default GameClient

import * as PIXI from 'pixi.js'
import CONFIG from '../../common/gameConfig'

class PlayerAvatar extends PIXI.Container {
    constructor() {
        super()

        this.body = new PIXI.Graphics()
        this.body.beginFill(0xffffff)
        this.body.drawCircle(0, 0, 25)
        this.body.endFill()

        this.body.tint = 0xff0000

        this.nose = new PIXI.Graphics()
        this.nose.beginFill(0xff99999)
        this.nose.moveTo(0, -25)
        this.nose.lineTo(40, 0)
        this.nose.lineTo(0, 25)
        this.nose.endFill()

        // To point the hat to the top.
        // TODO REMOVE THIS IN THE FUTURE
        this.angle = 270

        this.addChild(this.nose)
        this.addChild(this.body)
    }
}

class PlayerCharacter extends PIXI.Container {
    constructor(entity) {
        super()
        this.x = entity.x
        this.y = entity.y

        this.avatar = new PlayerAvatar()

        this.addChild(this.avatar)

        const { name } = entity

        const playerNameText = new PIXI.Text(name, {
            fontFamily: 'Arial',
            fontSize: 15,
            fill: 0xffffff,
            align: 'center',
            wordWrapWidth: 100,
            wordWrap: true,
        })
        this.playerNameText = playerNameText
        this.playerNameText.y = 25 + playerNameText.height / 2
        this.playerNameText.x = -playerNameText.width / 2
        this.addChild(this.playerNameText)
    }

    showMessage(msg) {
        this.removeChild(this.messageBubble)

        const messageCanvas = new PIXI.Text(msg, {
            fontFamily: 'Arial',
            fontSize: 15,
            fill: 0xffffff,
            align: 'center',
            wordWrapWidth: 200,
            wordWrap: true,
            breakWords: true,
            fill: 0xffff00,
            leading: 0,
        })
        this.messageBubble = messageCanvas
        this.messageBubble.y = -50 - messageCanvas.height
        this.messageBubble.x = -messageCanvas.width / 2

        this.addChild(this.messageBubble)
        setTimeout(() => {
            this.removeChild(messageCanvas)
            messageCanvas.destroy({
                children: true,
                texture: true,
                baseTexture: true,
            })
        }, CONFIG.PLAYER_CHAT_TIMEOUT)
    }

    update(delta) {
        this.rotation = 0
    }
}

export default PlayerCharacter

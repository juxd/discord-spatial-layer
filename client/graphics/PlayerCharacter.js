import * as PIXI from 'pixi.js'
import CONFIG from '../../common/gameConfig'

class PlayerAvatar extends PIXI.Container {
    constructor(skin_rgb, hat_color) {
        super()

        this.body = new PIXI.Graphics()
        this.body.beginFill(0xffffff)
        this.body.drawCircle(0, 0, 25)
        this.body.endFill()
        this.body.tint = skin_rgb || `0x${Math.random().toString(16).substr(2, 6)}`

        this.hat = new PIXI.Graphics()
        this.hat.beginFill(hat_color || `0x${Math.random().toString(16).substr(2, 6)}`)
        this.hat.moveTo(25, 0)
        this.hat.lineTo(0, -70)
        this.hat.lineTo(-25, 0)
        this.hat.endFill()

        this.addChild(this.hat)
        this.addChild(this.body)
    }
}

class PlayerCharacter extends PIXI.Container {
    constructor(entity) {
        super()
        this.x = entity.x
        this.y = entity.y
        this.mood = entity.mood

        this.avatar = new PlayerAvatar(entity.skin_color, entity.hat_color)

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
        this.playerNameText.y = CONFIG.PLAYER_DIAMETER / 2
        this.playerNameText.x = -playerNameText.width / 2
        this.addChild(this.playerNameText)
    }

    showMessage(msg) {
        this.messageBubble && this.removeChild(this.messageBubble)

        const messageCanvas = new PIXI.Text(msg, {
            fontFamily: 'Arial',
            fontWeight: 'bold',
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
        this.moodFace && this.removeChild(this.moodFace)
        let sprite

        if (this.mood === 'neutral') {
            sprite = new PIXI.Sprite.from(CONFIG.NEUTRAL_FACE)
        } else if (this.mood === 'happy') {
            sprite = new PIXI.Sprite.from(CONFIG.HAPPY_FACE)
        } else if (this.mood === 'kissy') {
            sprite = new PIXI.Sprite.from(CONFIG.KISSY_FACE)
        } else if (this.mood === 'sad') {
            sprite = new PIXI.Sprite.from(CONFIG.CRYING_FACE)
        } else if (this.mood === 'angry') {
            sprite = new PIXI.Sprite.from(CONFIG.ANGRY_FACE)
        }

        sprite.width = 60
        sprite.height = 60
        sprite.anchor.set(0.5)
        this.moodFace = sprite
        this.addChild(this.moodFace)
    }
}

export default PlayerCharacter

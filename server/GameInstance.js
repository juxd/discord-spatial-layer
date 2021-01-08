import nengi from 'nengi'
import Discord from 'discord.js'
import nengiConfig from '../common/nengiConfig'
import PlayerCharacter from '../common/entity/PlayerCharacter'
import Identity from '../common/message/Identity'
import DiscordMessageReceived from '../common/message/DiscordMessageReceived'
import WeaponFired from '../common/message/WeaponFired'
import CollisionSystem from '../common/CollisionSystem'
import AuthDatabase from './AuthDatabase'
import CONFIG from '../common/gameConfig'

class GameInstance {
    constructor() {
        this.entities = new Map()
        this.collisionSystem = new CollisionSystem()
        this.instance = new nengi.Instance(nengiConfig, { port: 8079 })
        this.authDatabase = new AuthDatabase()
        this.nids = new Map()
        if (process.env.NODE_ENV === 'development') this.authDatabase.addUserWithSecret({ displayName: 'joe' }, 'MAGIC_VALUE')
        this.instance.onConnect((client, clientData, callback) => {
            const { user } = this.authDatabase.getUser(clientData.fromClient.secret) || { user: undefined }
            if (!user) {
                callback({ accepted: false, text: 'Secret not correct!' })
                return
            }

            // create a entity for this client
            const entity = new PlayerCharacter({ name: user.displayName })
            this.instance.addEntity(entity) // adding an entity to a nengi instance assigns it an id
            this.nids.set(user.id, entity.nid)

            // tell the client which entity it controls (the client will use this to follow it with the camera)
            this.instance.message(new Identity(entity.nid), client)

            entity.x = CONFIG.MAP_X / 2
            entity.y = CONFIG.MAP_Y / 2
            // establish a relation between this entity and the client
            entity.client = client
            /* eslint-disable no-param-reassign */
            client.entity = entity

            // define the view (the area of the game visible to this client, all else is culled)
            client.view = {
                x: entity.x,
                y: entity.y,
                halfWidth: 1000,
                halfHeight: 1000,
            }
            /* eslint-enable no-param-reassign */

            this.entities.set(entity.nid, entity)

            callback({ accepted: true, text: 'Welcome!' })
        })

        this.instance.onDisconnect(client => {
            this.entities.delete(client.entity.nid)
            this.instance.removeEntity(client.entity)
        })

        this.registerDiscordClient()
    }

    handleMessage(msg) {
        const prefix = '!'
        if (msg.author.bot) return
        if (msg.content.startsWith(prefix)) {
            const cmd = msg.content.slice(prefix.length)
            if (cmd === 'joinspace') {
                const code = this.authDatabase.addUser(msg.member)
                console.log(`code assigned: ${code}`)
                msg.author.send(`Your entrance code is: ${code}`)
            }
            return
        }
        this.instance.messageAll(new DiscordMessageReceived(msg, this.nids.get(msg.author.id)))
    }

    registerDiscordClient() {
        const bot = new Discord.Client()

        bot.once('ready', () => console.log('discord client ready!'))

        bot.on('message', msg => console.log(`msg received: ${msg.content}`))

        // DO this for each client
        bot.on('message', msg => this.handleMessage(msg))

        bot.login(process.env.DISCORD_TOKEN)
    }

    update(delta) {
        // console.log('stats', this.entities.size, this.instance.clients.toArray().length, this.instance.entities.toArray().length)
        this.acc += delta

        let cmd = null
        while (cmd = this.instance.getNextCommand()) {
            const { tick } = cmd
            const { client } = cmd

            for (let i = 0; i < cmd.commands.length; i++) {
                const command = cmd.commands[i]
                const { entity } = client
                // console.log('command', command)
                if (command.protocol.name === 'MoveCommand') {
                    entity.processMove(command)
                }

                if (command.protocol.name === 'FireCommand') {
                    if (entity.fire()) {
                        this.entities.forEach(potentialVictim => {
                            const hit = this.collisionSystem.checkLineCircle(entity.x, entity.y, command.x, command.y, potentialVictim.collider)
                            // if the line intersects a player other than the shooter
                            if (hit && potentialVictim.nid !== entity.nid) {
                            }
                        })

                        this.instance.addLocalMessage(new WeaponFired(entity.nid, entity.x, entity.y, command.x, command.y))
                    }
                }
            }
        }

        // TODO: the rest of the game logic
        this.instance.clients.forEach(client => {
            client.view.x = client.entity.x
            client.view.y = client.entity.y

            client.entity.move(delta)
            client.entity.weaponSystem.update(delta)
        })

        // when instance.updates, nengi sends out snapshots to every client
        this.instance.update()
    }
}

export default GameInstance

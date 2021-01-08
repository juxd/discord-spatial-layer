import nengi from 'nengi'
import Discord from 'discord.js'
import nengiConfig from '../common/nengiConfig'
import PlayerCharacter from '../common/entity/PlayerCharacter'
import GreenCircle from '../common/entity/GreenCircle'
import Identity from '../common/message/Identity'
import DiscordMessageReceived from '../common/message/DiscordMessageReceived'
import WeaponFired from '../common/message/WeaponFired'
import CollisionSystem from '../common/CollisionSystem'
import AuthDatabase from './AuthDatabase'

class GameInstance {
    constructor() {
        this.entities = new Map()
        this.discordMessages = ['its the theme song'] // TODO should this be some sort of queue/window?
        this.collisionSystem = new CollisionSystem()
        this.instance = new nengi.Instance(nengiConfig, { port: 8079 })
        this.globalChannel = this.instance.createChannel()
        this.authDatabase = new AuthDatabase()
        this.instance.onConnect((client, clientData, callback) => {
            if (!this.authDatabase.getUser(clientData.fromClient.secret)) {
                callback({ accepted: false, text: 'Secret not correct!' })
            }
            this.globalChannel.subscribe(client)

            // create a entity for this client
            const entity = new PlayerCharacter()
            this.instance.addEntity(entity) // adding an entity to a nengi instance assigns it an id

            // tell the client which entity it controls (the client will use this to follow it with the camera)
            this.instance.message(new Identity(entity.nid), client)
            this.discordMessages.forEach(
                discordMessage => this.instance.message(new DiscordMessageReceived(discordMessage), client),
            )

            entity.x = Math.random() * 1000
            entity.y = Math.random() * 1000
            // establish a relation between this entity and the client
            entity.client = client
            client.entity = entity

            // define the view (the area of the game visible to this client, all else is culled)
            client.view = {
                x: entity.x,
                y: entity.y,
                halfWidth: 1000,
                halfHeight: 1000,
            }

            this.entities.set(entity.nid, entity)

            callback({ accepted: true, text: 'Welcome!' })
        })

        this.instance.onDisconnect(client => {
            this.globalChannel.unsubscribe(client)
            this.entities.delete(client.entity.nid)
            this.instance.removeEntity(client.entity)
        })

        for (let i = 0; i < 0; i++) {
            this.spawnGreenCircle()
        }

        this.registerDiscordClient()
    }

    registerDiscordClient() {
        const bot = new Discord.Client()

        bot.once('ready', () => console.log('discord client ready!'))

        const printGuildMembers = guild => {
            guild.members.cache.each(mem => console.log(`${mem.displayName} (ID: ${mem.user.id})`))
        }

        bot.on('presenceUpdate', (_, presence) => {
            console.log('presence update received.')
            printGuildMembers(presence.guild)
        })

        bot.on('message', msg => console.log(`msg received: ${msg.content}`))

        // DO this for each client
        bot.on('message', msg => {
            console.log(msg)
            this.globalChannel.addMessage(new DiscordMessageReceived(msg.content))
        })

        bot.login(process.env.DISCORD_TOKEN)
    }

    spawnGreenCircle() {
        const green = new GreenCircle(
            Math.random() * 1000,
            Math.random() * 1000,
        )
        // Order is important for the next two lines
        this.instance.addEntity(green) // assigns an `nid` to green
        this.entities.set(green.nid, green) // uses the `nid` as a key
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

        this.entities.forEach(entity => {
            if (entity instanceof GreenCircle) {
                if (!entity.isAlive) {
                    // Order matters for the next 2 lines
                    this.entities.delete(entity.nid)
                    this.instance.removeEntity(entity)
                    // respawn after one second
                    setTimeout(() => { this.spawnGreenCircle() }, 1000)
                }
            }
        })

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

import nengi from 'nengi'

class DiscordMessageReceived {
    constructor(discordMessage, authorNid) {
        this.messageId = discordMessage.id
        this.content = discordMessage.content
        this.authorId = discordMessage.author.id
        this.authorEntityNid = authorNid
        this.authorUsername = discordMessage.author.username
        this.authorDiscriminator = discordMessage.author.discriminator
    }
}

DiscordMessageReceived.protocol = {
    messageId: nengi.String,
    content: nengi.String,
    authorId: nengi.String,
    authorEntityNid: nengi.UInt16,
    authorUsername: nengi.String,
    authorDiscriminator: nengi.String,
}

export default DiscordMessageReceived

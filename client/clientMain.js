import GameClient from './GameClient'

function main(secret) {

    // TODO: const secret = document.getElementById('secret-input').value
    const gameClient = new GameClient(secret)
    let tick = 0
    let previous = performance.now()
    const loop = function () {
        window.requestAnimationFrame(loop)
        const now = performance.now()
        const delta = (now - previous) / 1000
        previous = now
        tick++

        gameClient.update(delta, tick, now)
    }

    loop()
}

export default main

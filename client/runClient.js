import GameClient from './GameClient'
import instantiateClient from './instantiateClient'

const SECRET_KEY_FORM_ID = 'secret-key-form'

class UI {
    constructor(container) {
        this.container = container
    }

    start() {
        this.container.innerText = ''
        this.container.insertAdjacentHTML('beforeend', this.renderSecretKeyForm())
        document.addEventListener('submit', e => {
            e.preventDefault()

            const form = e.target
            const formId = form.getAttribute('id')

            if (formId === SECRET_KEY_FORM_ID) {
                this.handleSecretKeyFormSubmit(e)
            }
        }, false)
    }

    renderSecretKeyForm() {
        return `
        <form id="${SECRET_KEY_FORM_ID}">
          <label for="secret-key">Secret Key:</label><br>
          <input type="text" id="secret-key" name="secret-key"><br>
          <input type="submit" value="Submit">
        </form>
      `
    }

    async handleSecretKeyFormSubmit(e) {
        const secretKey = document.getElementById('secret-key').value

        let client;

        try {
            client = await instantiateClient(secretKey);
        } catch (err) {
            console.log(`error: ${err}`)
            alert(`Connection denied.
Please check that WebSocket connection is working and your secret key is correct
`)
            return;
        }

        try {
            console.log('success')
            const canvas = '<canvas id=\'main-canvas\' style="height: 100%; width: 100%" tabindex="1"></canvas>'
            this.container.innerText = ''
            this.container.insertAdjacentHTML('beforeend', canvas)
            document.getElementById('main-canvas').focus()
            const gameClient = new GameClient(client)
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
        } catch (err) {
            console.log(`error: ${err}`)
            alert('Error in the game client / run loop. Please check the logs.');
        }
    }
}

export default UI

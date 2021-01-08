import GameClient from './GameClient'
import instantiateClient from './instantiateClient'

const SECRET_KEY_FORM_ID = 'secret-key-form'

window.onload = function () {
    const container = document.getElementById('container')
    container.style.height = '100%'
    container.style.width = '100%'
    container.style.position = 'absolute'

    container.insertAdjacentHTML('beforeend', renderSecretKeyForm())
}

function renderSecretKeyForm() {
    return `
    <form id="${SECRET_KEY_FORM_ID}">
      <label for="secret-key">Secret Key:</label><br>
      <input type="text" id="secret-key" name="secret-key"><br>
      <input type="submit" value="Submit">
    </form>
  `
}

let gameClient

function handleSecretKeyFormSubmit(e) {
    const secretKey = document.getElementById('secret-key').value

    instantiateClient(secretKey)
        .then(client => {
            const canvas = '<canvas id=\'main-canvas\' style="height: 100%; width: 100%"></canvas>'
            container.innerText = ''
            container.insertAdjacentHTML('beforeend', canvas)
            gameClient = new GameClient(client)
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
        })
        .catch(res => {
            alert('shit secret key')
        })
}

document.addEventListener('submit', e => {
    e.preventDefault()

    const form = e.target
    const formId = form.getAttribute('id')

    if (formId === SECRET_KEY_FORM_ID) {
        handleSecretKeyFormSubmit(e)
    }
}, false)

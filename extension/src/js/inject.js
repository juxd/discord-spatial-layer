import nengiConfig from '../../../common/nengiConfig';
import main from '../../../client/clientMain';

console.log(nengiConfig);
const SECRET_KEY_FORM_ID = 'secret-key-form';

(function() {
  const discordElement = document.getElementById("app-mount");

  const body = discordElement.parentElement;

  discordElement.style.height = '60%';
  discordElement.style.float = 'top';
  
  const container = document.createElement("div");
  container.id = "game-container";
  container.style.height = '40%';
  container.style.width = '100%';
  container.style.position = 'absolute';
  container.style.top = '60%';
  container.style.backgroundColor = 'white';

  container.insertAdjacentHTML('beforeend', renderSecretKeyForm());

  // const canvas = document.createElement('canvas');
  // canvas.id = 'game-canvas';
  // canvas.style.height = '100%';
  // canvas.style.width = '100%';
  // canvas.style.backgroundColor = 'red';

  body.appendChild(container);
  // container.appendChild(canvas)
})();

function renderSecretKeyForm() {
  return `
    <form id="${SECRET_KEY_FORM_ID}">
      <label for="secret-key">Secret Key:</label><br>
      <input type="text" id="secret-key" name="secret-key"><br>
      <input type="submit" value="Submit">
    </form>
  `
}

function handleSecretKeyFormSubmit(e) {
  const secretKey = document.getElementById('secret-key').value
  main(secretKey);
  alert(secretKey);
}

document.addEventListener('submit', function (e) {
  e.preventDefault();

  const form = e.target;
  const formId = form.getAttribute('id');
  
  if (formId === SECRET_KEY_FORM_ID) {
    handleSecretKeyFormSubmit(e);
    return;
  }

}, false);


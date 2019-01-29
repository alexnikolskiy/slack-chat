import { throttle } from 'Utils/helpers';
import template from 'Templates/message-edit';

import CancelCommand from '../commands/cancelCommand';
import SaveCommand from '../commands/saveCommand';

class MessageEditOutput {
  constructor() {
    this.message = null;
  }

  setHandlers(elem) {
    const input = elem.querySelector('.message__editor-input');
    const buttonsContainer = elem.querySelector('.message__editor-footer');

    input.addEventListener('focus', (ev) => {
      ev.target.parentElement.classList.add('message__editor-input-container_focus');
    });
    input.addEventListener('blur', (ev) => {
      ev.target.parentElement.classList.remove('message__editor-input-container_focus');
    });
    input.addEventListener('input', throttle(onInput, 400), false);

    function onInput(ev) {
      const maxHeight = Math.ceil(window.innerHeight / 4);

      if (ev.target.scrollHeight <= maxHeight - 20) {
        ev.target.style.height = 'auto';
        ev.target.style.height = (ev.target.scrollHeight) + 'px';
      }
    }

    input.addEventListener('keydown', (ev) => {
      if (ev.keyCode === 13) {
        if (ev.ctrlKey) {
          input.value = input.value + '\n';
          onInput(ev);
        } else {
          ev.preventDefault();
          // input.value = input.value.replace(/\r?\n/g, '<br>');
          // io.emit('message:save', messageId, input.value);
          //   this.message.text = input.value;
          let command = new SaveCommand(this.message, input.value);
          command.execute();
          input.value = '';
          onInput(ev);
        }
      } else if (ev.keyCode === 27) {
        let command = new CancelCommand(this.message);
        command.execute();
      }
    });

    buttonsContainer.addEventListener('click', (ev) => {
      const button = ev.target.closest('.button');

      if (!button) { return; }

      const action = button.dataset.action;
      let command;

      switch (action) {
        case 'cancel':
          command = new CancelCommand(this.message);
          break;
        case 'save':
          this.message.text = input.value;
          command = new SaveCommand(this.message, input.value);
          break;
      }

        command.execute();
    });
  }

  output(message = {}) {
    const div = document.createElement(div);

    this.message = message;
    message.text = message.text.replace(/<br>/g, '\n');
    div.innerHTML = template(message);
    this.setHandlers(div.firstElementChild);

    return div.firstElementChild;
  }
}

export default MessageEditOutput;

import { throttle, htmlToElement } from 'Utils/helpers';
import template from 'Templates/message-edit';

import CancelCommand from '../commands/cancelCommand';
import SaveCommand from '../commands/saveCommand';

class MessageEditOutput {
  constructor() {
    this.message = null;
    this.elem = null;
  }

  setHandlers() {
    const input = this.elem.querySelector('.message__editor-input');
    const buttonsContainer = this.elem.querySelector('.message__editor-footer');

    input.addEventListener('focus', ev => {
      ev.target.parentElement.classList.add('message__editor-input-container_focus');
    });

    input.addEventListener('blur', ev => {
      ev.target.parentElement.classList.remove('message__editor-input-container_focus');
    });

    function onInput(ev) {
      const maxHeight = Math.ceil(window.innerHeight / 4);

      if (ev.target.scrollHeight <= maxHeight - 20) {
        ev.target.style.height = 'auto';
        ev.target.style.height = `${ev.target.scrollHeight}px`;
      }
    }

    input.addEventListener('input', throttle(onInput, 400), false);

    input.addEventListener('keydown', ev => {
      if (ev.keyCode === 13) {
        if (ev.ctrlKey) {
          input.value += '\n';
          onInput(ev);
        } else {
          ev.preventDefault();
          const command = new SaveCommand(this.message, input.value);
          command.execute();
          input.value = '';
          onInput(ev);
        }
      } else if (ev.keyCode === 27) {
        const command = new CancelCommand(this.message);
        command.execute();
      }
    });

    buttonsContainer.addEventListener('click', ev => {
      const button = ev.target.closest('.button');

      if (!button) {
        return;
      }

      const { action } = button.dataset;
      let command;

      switch (action) {
        case 'cancel':
          command = new CancelCommand(this.message);
          break;
        case 'save':
          this.message.text = input.value;
          command = new SaveCommand(this.message, input.value);
          break;
        default:
          break;
      }

      if (command) {
        command.execute();
      }
    });
  }

  output(message = {}) {
    this.message = message;
    this.message.text = this.message.text.replace(/<br>/g, '\n');
    this.elem = htmlToElement(template(message));
    this.setHandlers();

    return this.elem;
  }
}

export default MessageEditOutput;

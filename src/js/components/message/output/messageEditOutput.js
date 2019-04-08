import { throttle, htmlToElement } from 'Utils/helpers';
import { autoExpand } from 'Utils/ui';
import template from 'Templates/message-edit';

import CancelCommand from '../commands/cancelCommand';
import SaveCommand from '../commands/saveCommand';

class MessageEditOutput {
  constructor() {
    this.elem = null;
    this.message = null;
    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleInputKeydown = this.handleInputKeydown.bind(this);
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

    input.addEventListener('input', throttle(() => autoExpand(input, 4), 400), false);

    input.addEventListener('keydown', this.handleInputKeydown);

    buttonsContainer.addEventListener('click', ev => this.handleButtonClick(ev, input));
  }

  handleInputKeydown(ev) {
    const el = ev.currentTarget;

    if (ev.keyCode === 13) {
      if (ev.ctrlKey) {
        el.value += '\n';
      } else {
        ev.preventDefault();
        const command = new SaveCommand(this.message, el.value);
        command.execute();
        el.value = '';
      }

      autoExpand(el, 4);
    }

    if (ev.keyCode === 27) {
      const command = new CancelCommand(this.message);
      command.execute();
    }
  }

  handleButtonClick(ev, input) {
    const btn = ev.target.closest('button');

    if (!btn) {
      return;
    }

    const { action } = btn.dataset;
    let command;

    switch (action) {
      case 'cancel':
        command = new CancelCommand(this.message);
        break;
      case 'save':
        command = new SaveCommand(this.message, input.value);
        break;
      default:
        throw new Error('Unknown command');
    }

    command.execute();
  }

  output(message = {}) {
    this.message = message;
    this.message.text = this.message.text.replace(/<br>/g, '\n');
    this.elem = htmlToElement(template(this.message));
    this.setHandlers();

    return this.elem;
  }
}

export default MessageEditOutput;

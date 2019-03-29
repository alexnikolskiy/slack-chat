import { format } from 'date-fns';
import template from 'Templates/message';
import { htmlToElement } from 'Utils/helpers';

class MessageOutput {
  constructor() {
    this.message = null;
    this.elem = null;
    this.handleUserClick = this.handleUserClick.bind(this);
  }

  setHandlers() {
    const links = this.elem.querySelectorAll('.message__sender-link');

    [...links].forEach(link => {
      link.addEventListener('click', this.handleUserClick);
    });
  }

  handleUserClick(ev) {
    ev.preventDefault();
    this.message.pubsub.pub('message:select-user', this.message.sender.username);
  }

  output(message = {}) {
    this.message = message;
    this.message.time = format(new Date(this.message.timestamp), 'hh:mm A');
    this.elem = htmlToElement(template(this.message));
    this.setHandlers();

    return this.elem;
  }
}

export default MessageOutput;

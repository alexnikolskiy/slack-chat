import moment from 'moment';
import template from 'Templates/message';
import pubsub from 'Utils/pubsub';

class MessageOutput {
  constructor() {
    this.message = null;
    this.template = document.createElement('template');
  }

  setHandlers() {
    const links = this.template.content.querySelectorAll('.message__sender-link');

    [...links].forEach(link =>
      link.addEventListener('click', ev => {
        ev.preventDefault();

        pubsub.pub('message:select-user', this.message.sender);
      }),
    );
  }

  output(message = {}) {
    this.message = message;
    this.message.time = moment(this.message.timestamp).format('LT');
    this.template.innerHTML = template(this.message);
    this.setHandlers();

    return this.template.content.firstChild;
  }
}

export default MessageOutput;

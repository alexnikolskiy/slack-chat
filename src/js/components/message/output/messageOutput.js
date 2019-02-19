// import moment from 'moment';
import { format } from 'date-fns';
import template from 'Templates/message';
import pubsub from 'Utils/pubsub';
import { htmlToElement } from 'Utils/helpers';

class MessageOutput {
  constructor() {
    this.message = null;
    this.elem = null;
  }

  setHandlers() {
    const links = this.elem.querySelectorAll('.message__sender-link');

    [...links].forEach(link =>
      link.addEventListener('click', ev => {
        ev.preventDefault();

        pubsub.pub('message:select-user', this.message.sender);
      }),
    );
  }

  output(message = {}) {
    this.message = message;
    // this.message.time = moment(this.message.timestamp).format('LT');
    this.message.time = format(new Date(this.message.timestamp), 'hh:mm A');
    this.elem = htmlToElement(template(this.message));
    this.setHandlers();

    return this.elem;
  }
}

export default MessageOutput;

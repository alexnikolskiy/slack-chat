import moment from 'moment';
import template from 'Templates/message-repeated';

class MessageRepeatedOutput {
  constructor() {
    this.message = null;
    this.template = document.createElement('template');
  }

  output(message = {}) {
    this.message = message;

    this.message.time = moment(this.message.timestamp).format('LT');
    this.template.innerHTML = template(message);

    return this.template.content.firstChild;
  }
}

export default MessageRepeatedOutput;

// import moment from 'moment';
import { format } from 'date-fns';
import template from 'Templates/message-repeated';
import { htmlToElement } from 'Utils/helpers';

class MessageRepeatedOutput {
  constructor() {
    this.message = null;
    this.elem = null;
  }

  output(message = {}) {
    this.message = message;

    // this.message.time = moment(this.message.timestamp).format('LT');
    this.message.time = format(new Date(this.message.timestamp), 'hh:mm A');
    this.elem = htmlToElement(template(message));

    return this.elem;
  }
}

export default MessageRepeatedOutput;

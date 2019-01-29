import moment from 'moment';
import template from 'Templates/message-repeated';

class MessageRepeatedOutput {
  output(message = {}) {
    const div = document.createElement(div);

    message.time = moment(message.timestamp).format('LT');
    div.innerHTML = template(message);

    return div.firstElementChild;
  }
}

export default MessageRepeatedOutput;

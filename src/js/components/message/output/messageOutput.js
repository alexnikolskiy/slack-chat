import moment from 'moment';
import template from 'Templates/message';
import pubsub from 'Utils/pubsub';

class MessageOutput {
  setHandlers(elem, message) {
    const links = elem.querySelectorAll('.message__sender-link');

    [...links].forEach(link => link.addEventListener('click', (ev) => {
      ev.preventDefault();

      pubsub.pub('message:select-user', message.sender);
    }));
  }

  output(message = {}) {
    const div = document.createElement(div);

    message.time = moment(message.timestamp).format('LT');
    div.innerHTML = template(message);
    this.setHandlers(div.firstElementChild, message);

    return div.firstElementChild;
  }
}

export default MessageOutput;

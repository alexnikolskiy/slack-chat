import template from 'Templates/message-new';

class MessageNewOutput {
  output(message = {}) {
    const div = document.createElement(div);

    div.innerHTML = template(message);

    return div.firstElementChild;
  }
}

export default MessageNewOutput;

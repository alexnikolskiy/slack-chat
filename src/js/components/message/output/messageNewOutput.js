import template from 'Templates/message-new';

class MessageNewOutput {
  constructor() {
    this.message = null;
    this.template = document.createElement('template');
  }

  output(message = {}) {
    this.message = message;
    this.template.innerHTML = template(message);

    return this.template.content.firstChild;
  }
}

export default MessageNewOutput;

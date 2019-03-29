import template from 'Templates/message-new';
import { htmlToElement } from 'Utils/helpers';

class MessageNewOutput {
  constructor() {
    this.message = null;
  }

  setHandlers() {
    setTimeout(() => {
      this.elem.parentElement.removeChild(this.elem);
    }, 3000);
  }

  output(message = {}) {
    this.message = message;
    this.elem = htmlToElement(template(message));
    this.setHandlers();

    return this.elem;
  }
}

export default MessageNewOutput;

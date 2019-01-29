import pubsub from 'Utils/pubsub';

class CancelCommand {
  constructor(message) {
    this.message = message;
  }

  execute() {
    this.message.editing = false;
    pubsub.pub('message:cancel', this.message);
  }
}

export default CancelCommand;

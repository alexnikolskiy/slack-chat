class CancelCommand {
  constructor(message) {
    this.message = message;
  }

  execute() {
    this.message.text = this.message.text.replace(/\r?\n/g, '<br>');
    this.message.editing = false;
    this.message.pubsub.pub('message:cancel', this.message);
  }
}

export default CancelCommand;

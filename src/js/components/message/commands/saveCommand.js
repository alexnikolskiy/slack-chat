import pubsub from 'Utils/pubsub';

class SaveCommand {
  constructor(message, value) {
    this.message = message;
    this.value = value;
  }

  execute() {
    this.value = this.value.replace(/\r?\n/g, '<br>');

    const hasChanges = this.message.text !== this.value;

    this.message.edited = this.message.edited || hasChanges;
    this.message.editing = false;
    this.message.hasChanges = true;
    this.message.text = this.value;

    pubsub.pub('message:save', this.message, hasChanges);
  }
}

export default SaveCommand;

import escape from 'validator/lib/escape';

class SaveCommand {
  constructor(message, value) {
    this.message = message;
    this.value = value;
  }

  execute() {
    this.value = escape(this.value);
    this.value = this.value.replace(/\r?\n/g, '<br>');

    const hasChanges = this.message.text !== this.value;

    this.message.edited = this.message.edited || hasChanges;
    this.message.editing = false;
    this.message.hasChanges = true;
    this.message.text = this.value;

    this.message.pubsub.pub('message:save', this.message, hasChanges);
  }
}

export default SaveCommand;

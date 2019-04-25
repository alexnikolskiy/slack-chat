class EditCommand {
  constructor(message) {
    this.message = message;
  }

  execute() {
    this.message.editing = true;
    this.message.hasChanges = true;
    this.message.pubsub.pub('message:edit', this.message);
  }
}

export default EditCommand;

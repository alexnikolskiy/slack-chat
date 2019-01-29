import pubsub from 'Utils/pubsub';

class EditCommand {
  constructor(message) {
    this.message = message;
  }

  execute() {
    this.message.editing = true;
    this.message.hasChanges = true;
    pubsub.pub('message:edit', this.message);
  }
}

export default EditCommand;

import EditCommand from '../../../message/commands/editCommand';
import Message from '../../../message';
import PubSub, { mockPub } from '../../../../lib/pubsub';

jest.mock('../../../../lib/pubsub');

test('should execute', () => {
  const message = new Message({ pubsub: new PubSub() });
  const command = new EditCommand(message);

  command.execute();

  expect(command.message).toMatchObject({ editing: true, hasChanges: true });
  expect(mockPub).toHaveBeenCalledWith('message:edit', command.message);
});

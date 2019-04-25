import SaveCommand from '../../../message/commands/saveCommand';
import Message from '../../../message';
import PubSub, { mockPub } from '../../../../lib/pubsub';
import generate from '../../../../../../utils/generate';

jest.mock('../../../../lib/pubsub');

test('should execute', () => {
  const testText = generate.title();
  const message = new Message({ pubsub: new PubSub() });
  const command = new SaveCommand(message, testText);

  command.execute();

  expect(command.message).toMatchObject({
    edited: true,
    editing: false,
    hasChanges: true,
    text: testText,
  });
  expect(mockPub).toHaveBeenCalledWith('message:save', message, true);
});

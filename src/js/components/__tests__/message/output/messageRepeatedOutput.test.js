import MessageRepeatedOutput from '../../../message/output/messageRepeatedOutput';
import Message from '../../../message';

test('should output', () => {
  const message = new Message({ timestamp: 1553251677 });
  const messageRepeatedOutput = new MessageRepeatedOutput();
  const formatTime = '11:27 PM';

  messageRepeatedOutput.output(message);
  expect(messageRepeatedOutput.message.time).toBe(formatTime);
  expect(messageRepeatedOutput.elem).not.toBeNull();
  expect(messageRepeatedOutput.elem.innerHTML).not.toHaveLength(0);
});

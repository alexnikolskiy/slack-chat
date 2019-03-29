import MessageNewOutput from '../../../message/output/messageNewOutput';
import Message from '../../../message';

test('should output', () => {
  const message = new Message();
  const messageNewOutput = new MessageNewOutput();

  messageNewOutput.output(message);
  expect(messageNewOutput.elem).not.toBeNull();
  expect(messageNewOutput.elem.innerHTML).not.toHaveLength(0);
});

test('should be deleted after timeout', () => {
  const message = new Message();
  const messageNewOutput = new MessageNewOutput();

  jest.useFakeTimers();

  const elem = messageNewOutput.output(message);
  expect(setTimeout).toHaveBeenCalledTimes(1);
  expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 3000);

  const parentElem = document.createElement('div');
  parentElem.appendChild(elem);
  messageNewOutput.elem = elem;
  jest.runAllTimers();

  expect(parentElem.innerHTML).toHaveLength(0);
});

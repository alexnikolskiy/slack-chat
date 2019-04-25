import MessageEditOutput from '../../../message/output/messageEditOutput';
import Message from '../../../message';
import CancelCommand from '../../../message/commands/cancelCommand';
import SaveCommand from '../../../message/commands/saveCommand';
import PubSub from '../../../../lib/pubsub';
import generate from '../../../../../../utils/generate';

jest.mock('../../../../lib/pubsub');
jest.mock('../../../message/commands/cancelCommand');
jest.mock('../../../message/commands/saveCommand');

let messageEditOutput;

beforeEach(() => {
  messageEditOutput = new MessageEditOutput();
  CancelCommand.mockClear();
  SaveCommand.mockClear();
});

test('should output', () => {
  const testText = generate.title();
  const message = new Message({ pubsub: new PubSub(), text: `${testText}<br>` });

  const output = messageEditOutput.output(message);
  expect(messageEditOutput.message.text).toBe(`${testText}\n`);
  expect(output).toBeDefined();
  expect(output.innerHTML).not.toHaveLength(0);
});

test('should execute cancel command on cancel button click', () => {
  const btn = document.createElement('button');
  const ev = { target: { closest: () => btn } };
  const message = new Message();

  btn.dataset.action = 'cancel';
  messageEditOutput.message = message;
  messageEditOutput.handleButtonClick(ev);
  expect(CancelCommand).toHaveBeenCalledWith(message);
});

test('should execute save command on save button click', () => {
  const btn = document.createElement('button');
  const ev = { target: { closest: () => btn } };
  const message = new Message();
  const inputValue = generate.title();

  btn.dataset.action = 'save';
  messageEditOutput.message = message;
  messageEditOutput.handleButtonClick(ev, { value: inputValue });
  expect(SaveCommand).toHaveBeenCalledWith(message, inputValue);
});

test('should not execute any command if no one button was clicked', () => {
  const ev = { target: { closest: () => null } };

  messageEditOutput.handleButtonClick(ev);

  expect(CancelCommand).not.toHaveBeenCalled();
  expect(SaveCommand).not.toHaveBeenCalled();
});

test('should throw an error on unknown action', () => {
  const btn = document.createElement('button');
  const ev = { target: { closest: () => btn } };

  btn.dataset.action = '';
  expect(() => messageEditOutput.handleButtonClick(ev)).toThrow('Unknown command');
});

test('should execute save command on enter key press', () => {
  const ev = new KeyboardEvent('keydown', { keyCode: 13 });
  const el = document.createElement('textarea');
  const testValue = generate.title();
  const message = new Message();

  messageEditOutput.message = message;
  el.addEventListener('keydown', messageEditOutput.handleInputKeydown);
  el.value = testValue;
  el.dispatchEvent(ev);
  expect(SaveCommand).toHaveBeenCalledWith(message, testValue);
});

test('should add new line on ctrl+enter key press', () => {
  const ev = new KeyboardEvent('keydown', { keyCode: 13, ctrlKey: true });
  const el = document.createElement('textarea');
  const message = new Message();

  messageEditOutput.message = message;
  el.addEventListener('keydown', messageEditOutput.handleInputKeydown);
  el.dispatchEvent(ev);
  expect(el.value).toMatch(/\n/g);
});

test('should execute cancel command on esc key', () => {
  const ev = new KeyboardEvent('keydown', { keyCode: 27 });
  const el = document.createElement('textarea');
  const message = new Message();

  messageEditOutput.message = message;
  el.addEventListener('keydown', messageEditOutput.handleInputKeydown);
  el.dispatchEvent(ev);
  expect(CancelCommand).toHaveBeenCalledWith(message);
});

test('should add class on focus and remove class on blur', () => {
  const input = document.createElement('textarea');
  const inputContainer = document.createElement('div');
  const buttonsContainer = document.createElement('div');
  let ev = new Event('focus');

  input.className = 'message__editor-input';
  buttonsContainer.className = 'message__editor-footer';
  inputContainer.appendChild(input);
  inputContainer.appendChild(buttonsContainer);
  messageEditOutput.elem = inputContainer;
  messageEditOutput.setHandlers();
  input.dispatchEvent(ev);
  expect(inputContainer.className).toMatch('message__editor-input-container_focus');

  ev = new Event('blur');
  input.dispatchEvent(ev);
  expect(inputContainer.className).not.toMatch('message__editor-input-container_focus');
});

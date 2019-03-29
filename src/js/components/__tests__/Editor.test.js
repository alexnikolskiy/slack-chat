import Editor from '../Editor';
import PubSub, { mockPub, mockSub } from '../../lib/pubsub';
import io, { mockOn, mockEmit } from '../../lib/io';
import generate from '../../../../utils/generate';
import { mockGetState } from '../../store/store';

jest.mock('../../lib/pubsub');
jest.mock('../../lib/io');
jest.mock('../../store/store');

const mockStartRecognition = jest.fn();
const mockStopRecognition = jest.fn();
window.SpeechRecognition = jest.fn().mockImplementation(() => {
  return {
    start: mockStartRecognition,
    stop: mockStopRecognition,
    addEventListener: jest.fn(),
  };
});

let socket;
let pubsub;
let editor;

beforeAll(() => {
  socket = io();
  pubsub = new PubSub();
});

beforeEach(() => {
  document.body.innerHTML = '<form class="message-form"></form>';
  editor = new Editor(socket, pubsub);
  mockPub.mockClear();
  mockSub.mockClear();
  mockOn.mockClear();
  mockEmit.mockClear();
});

test('`elem` property should be defined during `Editor` class instantiation', () => {
  expect(editor.elem).toBeDefined();
});

describe('setHandlers', () => {
  let wrapper;
  let input;
  let buttonRecord;

  beforeEach(() => {
    wrapper = document.createElement('div');
    wrapper.className = 'message-form__input-wrapper';

    input = document.createElement('textarea');
    input.className = 'message-form__input';

    buttonRecord = document.createElement('button');
    buttonRecord.className = 'message-form__button message-form__button_record';

    wrapper.appendChild(input);
    wrapper.appendChild(buttonRecord);
    editor.elem.appendChild(wrapper);
  });

  test('should add class on focus', () => {
    editor.setHandlers();
    expect(wrapper.className).toMatch('message-form__input-wrapper_focus');
  });

  test('should remove class on blur', () => {
    const event = new Event('blur');

    editor.setHandlers();
    input.dispatchEvent(event);
    expect(wrapper.className).not.toMatch('message-form__input-wrapper_focus');
  });

  test('should insert new line on ctrl+enter key', () => {
    const event = new KeyboardEvent('keydown', { keyCode: 13, ctrlKey: true });

    editor.setHandlers();
    input.dispatchEvent(event);
    expect(input.value).toMatch(/\n/g);
    expect(mockPub).toHaveBeenCalledWith('editor:new-line');
  });

  test('should add message on enter key', () => {
    const event = new KeyboardEvent('keydown', { keyCode: 13 });
    const text = generate.title();
    const receiver = generate.userData();

    editor.setHandlers();
    input.value = text;
    mockGetState.mockReturnValue({ receiver });
    input.dispatchEvent(event);
    expect(mockEmit).toHaveBeenCalledWith('editor:stop-typing', receiver);
    expect(mockEmit).toHaveBeenCalledWith('message:add', text, receiver);
    expect(input.value).toHaveLength(0);
  });

  test('should not add message on enter key if empty message', () => {
    const event = new KeyboardEvent('keydown', { keyCode: 13 });

    editor.setHandlers();
    input.dispatchEvent(event);
    expect(mockEmit).not.toHaveBeenCalled();
  });

  test('should edit last message on up key', () => {
    const event = new KeyboardEvent('keydown', { keyCode: 38 });

    editor.setHandlers();
    input.dispatchEvent(event);
    expect(mockPub).toHaveBeenCalledWith('message:edit-last');
  });

  test('should not edit last message if input not empty', () => {
    const event = new KeyboardEvent('keydown', { keyCode: 38 });

    editor.setHandlers();
    input.value = generate.title();
    input.dispatchEvent(event);
    expect(mockPub).not.toHaveBeenCalled();
  });

  test('should notify about typing on key press', () => {
    const event = new KeyboardEvent('keypress');
    const receiver = generate.userData();

    mockGetState.mockReturnValue({ receiver });
    editor.setHandlers();
    input.dispatchEvent(event);
    expect(mockEmit).toHaveBeenCalledWith('editor:typing', receiver);
  });

  describe('setButtonRecordHandlers', () => {
    test('should prevent default on record button click', () => {
      const event = new Event('click');
      const mockPreventDefault = jest.fn();

      event.preventDefault = mockPreventDefault;
      editor.setButtonRecordHandlers(input);

      buttonRecord.dispatchEvent(event);
      expect(mockPreventDefault).toHaveBeenCalled();
    });

    test('should start recognition on mousedown', () => {
      const event = new Event('mousedown');

      editor.setButtonRecordHandlers(input);
      buttonRecord.dispatchEvent(event);

      expect(mockStartRecognition).toHaveBeenCalled();
    });

    test('should stop recognition on mouseup', () => {
      const event = new Event('mouseup');

      editor.setButtonRecordHandlers(input);
      buttonRecord.dispatchEvent(event);

      expect(mockStopRecognition).toHaveBeenCalled();
    });
  });
});

test('should set focus', () => {
  const input = document.createElement('textarea');
  const mockFocus = jest.fn();

  input.className = 'message-form__input';
  input.focus = mockFocus;
  editor.elem.appendChild(input);
  editor.setFocus();

  expect(mockFocus).toHaveBeenCalled();
});

test('should clear value', () => {
  const input = document.createElement('textarea');

  input.className = 'message-form__input';
  input.value = generate.title();
  editor.elem.appendChild(input);
  editor.clearValue();

  expect(input.value).toHaveLength(0);
});

test('should render', () => {
  editor.render();
  expect(editor.elem.innerHTML).not.toHaveLength(0);
});

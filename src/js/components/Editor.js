import escape from 'validator/lib/escape';
import template from 'Templates/editor';
import { debounce, throttle } from '../utils/helpers';
import { autoExpand } from '../utils/ui';
import Component from '../lib/component';
import store from '../store';

class Editor extends Component {
  constructor(io, pubsub) {
    super({
      store,
      elem: document.querySelector('.message-form'),
    });

    this.canSpeechRecognize = false;
    this.recognition = null;
    this.io = io;
    this.pubsub = pubsub;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.canSpeechRecognize = true;
      this.recognition = new SpeechRecognition();
      // this.recognition.lang = 'ru-RU';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }

    this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
    this.setFocus = this.setFocus.bind(this);
    this.clearValue = this.clearValue.bind(this);

    this.pubsub.sub('message:cancel', this.setFocus);
    this.pubsub.sub('message:save', this.setFocus);
    this.pubsub.sub('room:select', this.clearValue);
    this.pubsub.sub('member:select', this.clearValue);
  }

  handleInputKeyDown(ev, input) {
    if (ev.keyCode === 13) {
      if (ev.ctrlKey) {
        input.value += '\n';
        this.pubsub.pub('editor:new-line');
      } else {
        ev.preventDefault();

        if (!input.value) {
          return;
        }

        const { receiver } = store.getState();
        let value = escape(input.value);

        value = value.replace(/\r?\n/g, '<br>');
        this.io.emit('editor:stop-typing', receiver);
        this.io.emit('message:add', value, receiver);
        input.value = '';
      }

      autoExpand(input, 2);
    } else if (ev.keyCode === 38) {
      if (!input.value) {
        this.pubsub.pub('message:edit-last');
      }
    }
  }

  setButtonRecordHandlers(input) {
    const buttonRecord = this.elem.querySelector('.message-form__button_record');

    if (buttonRecord) {
      let text = '';

      buttonRecord.addEventListener('click', ev => {
        ev.preventDefault();
      });

      buttonRecord.addEventListener('mousedown', () => {
        this.recognition.start();
        text = input.value;
        input.value = '';
        input.placeholder = 'Listening...';
      });

      buttonRecord.addEventListener('mouseup', () => {
        this.recognition.stop();
        input.placeholder = '';
        input.value = text;
      });

      this.recognition.addEventListener('result', ev => {
        input.value = ev.results[0][0].transcript;
      });
    }
  }

  setHandlers() {
    const input = this.elem.querySelector('.message-form__input');

    input.addEventListener('focus', ev => {
      ev.target.parentElement.classList.add('message-form__input-wrapper_focus');
    });

    input.focus();

    input.addEventListener('blur', ev => {
      ev.target.parentElement.classList.remove('message-form__input-wrapper_focus');
    });

    input.setAttribute('style', `height: ${input.scrollHeight}px;`);
    input.addEventListener('input', throttle(() => autoExpand(input, 2), 400), false);

    const onStopTyping = debounce(receiver => {
      this.io.emit('editor:stop-typing', receiver);
    }, 1500);

    input.addEventListener('keydown', ev => this.handleInputKeyDown(ev, input));

    input.addEventListener('keypress', () => {
      const { receiver } = store.getState();

      this.io.emit('editor:typing', receiver);
      onStopTyping(receiver);
    });

    this.setButtonRecordHandlers(input);
  }

  setFocus() {
    const input = this.elem.querySelector('.message-form__input');

    input.focus();
  }

  clearValue() {
    const input = this.elem.querySelector('.message-form__input');

    input.value = '';
  }

  render() {
    this.elem.innerHTML = template({
      canSpeechRecognize: this.canSpeechRecognize,
    });
    this.setHandlers();
  }
}

export default Editor;

import template from 'Templates/editor';
import pubsub from 'Utils/pubsub';
import io from 'Utils/io';
import { debounce, throttle } from '../utils/helpers';

class Editor {
  constructor() {
    this.elem = document.querySelector('.message-form');
    this.receiver = null;
    this.canSpeechRecognize = false;
    this.recognition = null;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.canSpeechRecognize = true;
      this.recognition = new SpeechRecognition();
      // this.recognition.lang = 'ru-RU';
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }

    this.setFocus = this.setFocus.bind(this);

    pubsub.sub('message:cancel', this.setFocus.bind(this));
    pubsub.sub('message:save', this.setFocus.bind(this));
    pubsub.sub('member:select', this.handleSelectMember.bind(this));
    pubsub.sub('room:select', this.handleSelectRoom.bind(this));
  }

  setHandlers() {
    const input = this.elem.querySelector('.message-form__input');
    const buttonRecord = this.elem.querySelector('.message-form__button_record');

    input.focus();
    input.addEventListener('focus', ev => {
      ev.target.parentElement.classList.add('message-form__input-wrapper_focus');
    });

    input.addEventListener('blur', ev => {
      ev.target.parentElement.classList.remove('message-form__input-wrapper_focus');
    });

    function onInput(ev) {
      const maxHeight = Math.ceil(window.innerHeight / 2);

      if (ev.target.scrollHeight <= maxHeight - 20) {
        const { target } = ev;

        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
      }
    }

    input.setAttribute('style', `height: ${input.scrollHeight}px;`);
    input.addEventListener('input', throttle(onInput, 400), false);

    const onStopTyping = debounce(() => io.emit('editor:stop-typing', this.receiver), 1500);

    input.addEventListener('keydown', ev => {
      if (ev.keyCode === 13) {
        if (ev.ctrlKey) {
          input.value += '\n';
          onInput(ev);
          pubsub.pub('editor:new-line');
        } else {
          ev.preventDefault();
          input.value = input.value.replace(/\r?\n/g, '<br>');
          pubsub.pub('message:add', input.value);
          input.value = '';
          onInput(ev);
        }
      } else if (ev.keyCode === 38) {
        pubsub.pub('message:edit-last');
      }
    });

    input.addEventListener('keypress', () => {
      io.emit('editor:typing', this.receiver);
      onStopTyping();
    });

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

  setFocus() {
    const input = this.elem.querySelector('.message-form__input');

    input.focus();
  }

  handleSelectMember(member) {
    this.receiver = member;
  }

  handleSelectRoom() {
    this.receiver = null;
  }

  render() {
    this.elem.innerHTML = template({
      canSpeechRecognize: this.canSpeechRecognize,
    });
    this.setHandlers();
  }
}

export default Editor;

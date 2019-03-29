import template from 'Templates/dialog';
import { htmlToElement } from 'Utils/helpers';

class Dialog {
  constructor({ title = '' } = {}) {
    this.title = title;

    this.elem = htmlToElement(template(this));
    this.setHandlers();

    document.body.appendChild(this.elem);
  }

  show() {
    this.elem.classList.add('dialog_open');
  }

  hide() {
    this.elem.classList.remove('dialog_open');
  }

  destroy() {
    this.elem.parentElement.removeChild(this.elem);
    this.elem = null;
  }

  setHandlers() {
    if (this.title) {
      const btnClose = this.elem.querySelector('.dialog__close');

      btnClose.addEventListener('click', ev => {
        ev.preventDefault();
        this.destroy();
      });
    }

    document.addEventListener(
      'keydown',
      function close(ev) {
        if (this.elem && ev.keyCode === 27) {
          this.destroy();
          document.removeEventListener('keydown', close);
        }
      }.bind(this),
    );
  }

  setContent(content) {
    const contentElem = this.elem.querySelector('.dialog__body');
    let elem = content;

    if (typeof content === 'string') {
      elem = htmlToElement(content);
    }

    contentElem.appendChild(elem);
  }

  addFooterBtn(label, cssClass, cb) {
    const footer = this.elem.querySelector('.dialog__footer');
    const btn = document.createElement('button');

    btn.innerText = label;
    btn.className = cssClass;
    btn.addEventListener('click', ev => {
      ev.preventDefault();
      cb();
    });

    footer.appendChild(btn);
  }
}

export default Dialog;

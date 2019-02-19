import template from 'Templates/modal';
import { htmlToElement } from 'Utils/helpers';

class Modal {
  constructor({ header, footer, title } = {}) {
    this.header = header;
    this.footer = footer;
    this.title = title;

    this.elem = htmlToElement(template(this));
    this.setHandlers();
    this.close();

    document.body.appendChild(this.elem);
  }

  setHandlers() {
    const btnClose = this.elem.querySelector('.modal__close');

    btnClose.addEventListener('click', ev => {
      ev.preventDefault();
      this.destroy();
    });

    document.addEventListener(
      'keydown',
      function close(ev) {
        const menu = document.querySelector('.menu');
        const dialog = document.querySelector('.dialog');

        if (this.elem && !menu && !dialog && ev.keyCode === 27) {
          this.destroy();
          document.removeEventListener('keydown', close);
        }
      }.bind(this),
    );
  }

  open() {
    this.elem.style.display = 'block';
  }

  close() {
    this.elem.style.display = 'none';
  }

  destroy() {
    this.elem.parentElement.removeChild(this.elem);
    this.elem = null;
  }

  getContent() {
    const contentElem = this.elem.querySelector('.modal__content');

    return contentElem;
  }

  setContent(content) {
    const contentElem = this.elem.querySelector('.modal__content');
    let elem = content;

    if (typeof content === 'string') {
      elem = htmlToElement(content);
    }

    contentElem.appendChild(elem);
  }

  addFooterBtn(label, cssClass, cb) {
    const footer = this.elem.querySelector('.modal__footer');
    const btn = document.createElement('button');

    btn.innerText = label;
    btn.className = cssClass;
    btn.addEventListener('click', ev => {
      ev.preventDefault();
      cb(this);
    });

    footer.appendChild(btn);
  }
}

export default Modal;

import template from 'Templates/menu';
import { htmlToElement } from 'Utils/helpers';

class Menu {
  constructor(target) {
    this.target = target;
    this.items = new Map();
    this.elem = null;
    this.list = null;

    const container = document.querySelector('.chat-page__container');

    this.elem = container.appendChild(htmlToElement(template()));
    this.hide();
    this.setHandlers();

    this.list = this.elem.querySelector('.menu__list');
    this.target.classList.add('active');
  }

  setHandlers() {
    const mask = this.elem.querySelector('.popover_mask');

    mask.addEventListener('click', ev => {
      ev.preventDefault();
      this.destroy();
    });

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

  add(text, cssClass, fn) {
    const item = document.createElement('li');
    const link = document.createElement('a');

    item.className = 'menu__item';
    item.className += cssClass ? ` ${cssClass}` : '';
    link.className = 'menu__link';
    link.href = '#';
    link.textContent = text;
    link.addEventListener('click', ev => {
      ev.preventDefault();
      ev.stopPropagation();
      this.destroy();
      fn();
    });
    item.appendChild(link);

    this.list.appendChild(item);
    this.items.set(text, item);

    return this;
  }

  remove(text) {
    this.list.removeChild(this.items.get(text));
    this.items.delete(text);

    return this;
  }

  clear() {
    this.list.innerHTML = '';
    this.items.clear();

    return this;
  }

  show(style = {}) {
    const targetCoords = this.target.getBoundingClientRect();

    if (style.offsetWidth) {
      this.elem.style.left = `${targetCoords.left + style.offsetWidth}px`;
    } else {
      this.elem.style.left = this.elem.style.left && `${style.left}px`;
    }

    if (style.offsetHeight) {
      this.elem.style.top = `${targetCoords.top + style.offsetHeight}px`;
    } else {
      this.elem.style.top = this.elem.style.top && `${style.top}px`;
    }

    let left = targetCoords.left ? targetCoords.left : 10;
    let top = targetCoords.bottom + 10;

    if (targetCoords.left + this.elem.clientWidth > window.innerWidth) {
      left = targetCoords.right - this.elem.clientWidth;
    }

    if (top + this.elem.clientHeight > window.innerHeight) {
      top = targetCoords.top - this.elem.clientHeight - 10;
    }

    this.elem.style.left = this.elem.style.left ? this.elem.style.left : `${left}px`;
    this.elem.style.top = this.elem.style.top ? this.elem.style.top : `${top}px`;

    this.elem.style.opacity = 1;

    return this;
  }

  hide() {
    this.elem.style.opacity = 0;
    this.target.classList.remove('active');

    return this;
  }

  destroy() {
    this.elem.parentElement.removeChild(this.elem);
    this.elem = null;
    this.target.classList.remove('active');
  }
}

export default Menu;

import template from 'Templates/edit-profile';
import { htmlToElement, getUserAvatar } from 'Utils/helpers';
import Menu from './Menu';

class EditUserProfile {
  constructor(user) {
    this.user = user;
    this.elem = htmlToElement(
      template({
        ...this.user,
        avatar: getUserAvatar(this.user, 192),
      }),
    );

    this.setHandlers();
  }

  setHandlers() {
    const elem = this.elem.querySelector('.edit-profile__avatar-wrapper');
    const fileElem = this.elem.querySelector('.edit-profile__avatar-input');

    elem.addEventListener('click', this.handleElemClick.bind(this));
    fileElem.addEventListener('change', this.handleFileChange.bind(this));
  }

  handleElemClick(ev) {
    const menu = new Menu(ev.currentTarget);
    const fileElem = this.elem.querySelector('.edit-profile__avatar-input');
    const img = this.elem.querySelector('.edit-profile__avatar-image');

    menu.add('Upload an image', '', () => fileElem.click());

    if (this.user.avatar) {
      menu.add('Remove photo', 'menu__item_danger', () => {
        fileElem.value = '';
        fileElem.dataset.deleted = true;
        img.src = getUserAvatar({ ...this.user, avatar: '' }, 192);
      });
    }

    menu.show({
      offsetWidth: 32,
      offsetHeight: 156,
    });
  }

  handleFileChange(ev) {
    const fileElem = ev.currentTarget;
    const file = fileElem.files[0];
    const img = this.elem.querySelector('.edit-profile__avatar-image');

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = e => {
      img.src = e.target.result;
    };

    reader.readAsDataURL(file);
    delete fileElem.dataset.deleted;
  }

  render() {
    return this.elem;
  }
}

export default EditUserProfile;

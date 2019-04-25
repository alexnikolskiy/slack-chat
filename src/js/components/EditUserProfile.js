import template from 'Templates/edit-profile';
import { htmlToElement } from 'Utils/helpers';
import { getUserAvatar } from 'Utils/ui';
import Menu from './Menu';

class EditUserProfile {
  constructor(user) {
    this.user = user;
    this.elem = null;

    this.handleElemClick = this.handleElemClick.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
  }

  setHandlers() {
    const wrapper = this.elem.querySelector('.edit-profile__avatar-wrapper');
    const fileElem = this.elem.querySelector('.edit-profile__avatar-input');

    wrapper.addEventListener('click', this.handleElemClick);
    fileElem.addEventListener('change', this.handleFileChange);
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
    this.elem = htmlToElement(
      template({
        ...this.user,
        avatar: getUserAvatar(this.user, 192),
      }),
    );
    this.setHandlers();

    return this.elem;
  }
}

export default EditUserProfile;

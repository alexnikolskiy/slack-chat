import template from 'Templates/user';
import { getUserAvatar, makeDialog } from 'Utils/ui';
import * as userService from '../services/user';
import * as authService from '../services/auth';
import Menu from './Menu';
import Modal from './Modal';
import EditUserProfile from './EditUserProfile';
import Component from '../lib/component';
import store from '../store';

class User extends Component {
  constructor(io, pubsub) {
    super({
      store,
      observedAttrs: ['sender'],
      elem: document.querySelector('.chat-sidebar__user'),
    });

    this.io = io;
    this.pubsub = pubsub;

    this.handleElemClick = this.handleElemClick.bind(this);
    this.handleEditProfile = this.handleEditProfile.bind(this);
    this.handleSaveProfile = this.handleSaveProfile.bind(this);
    // this.handleSignOut = this.handleSignOut.bind(this);

    this.setHandlers();

    this.io.on('login', this.ioLogin.bind(this));
    this.io.on('logout', User.ioLogout);
  }

  setHandlers() {
    this.elem.addEventListener('click', this.handleElemClick);
  }

  handleElemClick(ev) {
    ev.preventDefault();

    const menu = new Menu(this.elem);

    menu
      .add('Edit profile', '', this.handleEditProfile)
      .add('Sign out', '', User.handleSignOut)
      .show({ top: 60, left: 10 });
  }

  handleEditProfile() {
    const modal = new Modal({
      header: true,
      footer: true,
      title: 'Edit your profile',
    });
    const { sender } = store.getState();

    modal.setContent(new EditUserProfile(sender).render());
    modal.addFooterBtn('Cancel', 'button', () => modal.destroy());
    modal.addFooterBtn('Save Changes', 'button button_primary margin-left', this.handleSaveProfile);
    modal.open();
  }

  async handleSaveProfile(self) {
    const modalContent = self.getContent();
    const inputs = modalContent.querySelectorAll('input:not([type="file"])');
    const fileElem = modalContent.querySelector('input[type="file"]');
    const file = fileElem.files[0];
    const formData = new FormData();
    let error;

    if (file && file.size > 1024 * 1024) {
      error = 'File too large!';
    }

    if (error) {
      const dialog = makeDialog({ content: error, ok: true });
      dialog.show();

      return;
    }

    [...inputs].forEach(input => {
      formData.append(input.name, input.value);
    });

    formData.append('isDeleted', !!fileElem.dataset.deleted);
    formData.append('file', file);

    const { sender } = store.getState();
    const data = await userService.saveUserProfile(sender.id, formData);

    if (data.error) {
      const dialog = makeDialog({ content: data.error, ok: true });
      dialog.show();

      return;
    }

    store.dispatch('editUser', data.data);
    self.destroy();

    this.io.emit('member:edit', sender.id);
  }

  static async handleSignOut() {
    const data = await authService.logout();

    if (data.success) {
      User.ioLogout();
    }
  }

  ioLogin(user) {
    store.dispatch('login', user);
    this.pubsub.pub('login');
  }

  static ioLogout() {
    window.location.assign('auth/login');
  }

  render() {
    const { sender } = store.getState();

    if (!sender) {
      return;
    }

    this.elem.innerHTML = template({
      username: sender.username,
      avatar: getUserAvatar(sender, 72),
    });
  }
}

export default User;

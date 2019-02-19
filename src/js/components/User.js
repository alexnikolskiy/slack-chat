import template from 'Templates/user';
import io from 'Utils/io';
import { getUserAvatar } from 'Utils/helpers';
import makeDialog from 'Utils/ui';
import Menu from './Menu';
import Modal from './Modal';
import EditUserProfile from './EditUserProfile';

class User {
  constructor() {
    this.elem = document.querySelector('.chat-sidebar__user');
    this.user = null;

    this.handleElemClick = this.handleElemClick.bind(this);
    this.handleEditProfile = this.handleEditProfile.bind(this);
    this.handleSaveProfile = this.handleSaveProfile.bind(this);

    this.setHandlers();

    io.on('login', this.ioLogin.bind(this));
    io.on('logout', this.ioLogout.bind(this));
  }

  setHandlers() {
    this.elem.addEventListener('click', this.handleElemClick);
  }

  handleElemClick(ev) {
    ev.preventDefault();

    const menu = new Menu(this.elem);

    menu
      .add('Edit profile', '', this.handleEditProfile)
      .add('Sign out', '', () => {
        fetch(`auth/logout`, {
          method: 'POST',
        })
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              this.ioLogout();
            }
          });
      })
      .show({ top: 60, left: 10 });
  }

  handleEditProfile() {
    const modal = new Modal({
      header: true,
      footer: true,
      title: 'Edit your profile',
    });

    modal.setContent(new EditUserProfile(this.user).render());
    modal.addFooterBtn('Cancel', 'button', () => modal.destroy());
    modal.addFooterBtn('Save Changes', 'button button_primary margin-left', this.handleSaveProfile);
    modal.open();
  }

  handleSaveProfile(self) {
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

    fetch(`api/users/${this.user.id}`, {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          const dialog = makeDialog({ content: data.error, ok: true });
          dialog.show();

          return;
        }

        this.user = { ...this.user, ...data.data };
        this.render();
        self.destroy();

        io.emit('member:edit', this.user);
      });
  }

  ioLogin(user) {
    this.user = user;
    this.render();
  }

  ioLogout() {
    this.user = null;
    window.location.href = 'auth/login';
  }

  render() {
    if (!this.user) {
      return;
    }

    this.elem.innerHTML = template({
      username: this.user.username,
      avatar: getUserAvatar(this.user, 72),
    });
  }
}

export default User;

import template from 'Templates/user';
import io from 'Utils/io';

class User {
  constructor() {
    this.elem = document.querySelector('.chat-sidebar__user');
    this.user = null;

    io.on('login', this.ioLogin.bind(this));
  }

  ioLogin(user) {
    this.user = user;
    this.render();
  }

  render() {
    if (!this.user) {
      return;
    }

    this.elem.innerHTML = template({
      username: this.user.username,
      avatar: `https://api.adorable.io/avatars/72/${this.user.username}.png`,
    });
  }
}

export default User;

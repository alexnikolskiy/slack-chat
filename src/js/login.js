document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('.login-page__form');
  const fields = document.querySelectorAll('.login-page__input');
  const links = document.querySelectorAll('.login-page__link');

  async function onSubmit(ev) {
    ev.preventDefault();

    const { action: url, method } = ev.target;
    const form = ev.target;
    let data;
    let errors = [];

    try {
      const response = await fetch(url, {
        body: new FormData(form),
        credentials: 'same-origin',
        method,
      });

      data = await response.json();

      if (data.errors) {
        errors = errors.concat(data.errors);
      }
    } catch (err) {
      errors.push({ msg: err.message, param: 'username' });
    }

    if ((data && data.success) || errors.length === 0) {
      let loc = url.replace('.', '');

      loc = window.location.pathname.replace(loc, '');
      window.location.href = loc;
      return;
    }

    [...form.elements].forEach(elem => {
      const parent = elem.parentElement;

      parent.classList.remove('error');
      parent.dataset.error = '';
    });

    errors.reverse().forEach(err => {
      const parent = form.elements[err.param].parentElement;

      parent.classList.add('error');
      parent.dataset.error = err.msg;
    });
  }

  [...fields].forEach(field =>
    field.addEventListener('focus', ev => {
      ev.target.parentElement.classList.remove('error');
    }),
  );

  [...links].forEach(link =>
    link.addEventListener('click', ev => {
      ev.preventDefault();
      ev.target
        .closest('.login-page__form-wrapper')
        .classList.toggle('login-page__form-wrapper_flipped');
    }),
  );

  [...forms].forEach(form => form.addEventListener('submit', onSubmit));
});

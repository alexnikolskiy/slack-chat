import EditUserProfile from '../EditUserProfile';
import Menu, { mockShow as mockMenuShow, mockAdd as mockMenuAdd } from '../Menu';
import generate from '../../../../utils/generate';

jest.mock('../Menu');

let editUserProfile;
let user;

beforeEach(() => {
  user = generate.userData({ avatar: generate.avatar() });
  editUserProfile = new EditUserProfile(user);
});

describe('setHandlers', () => {
  let wrapper;
  let fileInput;
  let image;

  beforeEach(() => {
    wrapper = document.createElement('div');
    fileInput = document.createElement('input');
    image = document.createElement('img');

    wrapper.className = 'edit-profile__avatar-wrapper';
    fileInput.className = 'edit-profile__avatar-input';
    fileInput.type = 'file';
    image.className = 'edit-profile__avatar-image';

    wrapper.appendChild(image);
    editUserProfile.elem = document.createElement('div');
    editUserProfile.elem.appendChild(fileInput);
    editUserProfile.elem.appendChild(wrapper);
  });

  test('should open menu on wrapper click', () => {
    const event = new Event('click');

    editUserProfile.setHandlers();
    wrapper.dispatchEvent(event);
    expect(Menu).toHaveBeenCalled();
    expect(mockMenuAdd).toHaveBeenCalledWith('Upload an image', '', expect.any(Function));
    expect(mockMenuAdd).toHaveBeenCalledWith(
      'Remove photo',
      'menu__item_danger',
      expect.any(Function),
    );
    expect(mockMenuShow).toHaveBeenCalled();
  });

  test('should set image on file input change event', done => {
    const event = new Event('change');
    const file = new File(['(⌐□_□)'], 'chucknorris.png', {
      type: 'image/png',
    });

    editUserProfile.setHandlers();
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
    fileInput.dispatchEvent(event);

    setTimeout(() => {
      expect(image.src).not.toHaveLength(0);
      done();
    }, 100);
  });

  test('should not set image on file input change event if file not exist', done => {
    const event = new Event('change');

    editUserProfile.setHandlers();
    fileInput.dispatchEvent(event);

    setTimeout(() => {
      expect(image.src).toHaveLength(0);
      done();
    }, 100);
  });
});

test('should render', () => {
  editUserProfile.render();
  expect(editUserProfile.elem.innerHTML).not.toHaveLength(0);
});

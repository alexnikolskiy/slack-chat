import User from '../User';
import Menu, { mockShow as mockMenuShow } from '../Menu';
import Modal, { mockOpen as mockModalOpen, mockDestroy as mockModalDestroy } from '../Modal';
import { mockShow as mockDialogShow, getContent as dialogGetContent } from '../Dialog';
import EditUserProfile, { mockRender as mockEditUserProfileRender } from '../EditUserProfile';
import * as authService from '../../services/auth';
import * as userService from '../../services/user';
import Pubsub, { mockPub } from '../../lib/pubsub';
import io, { mockOn, mockEmit } from '../../lib/io';
import { mockGetState, mockDispatch } from '../../store/store';
import { htmlToElement } from '../../utils/helpers';
import generate from '../../../../utils/generate';

jest.mock('../Menu');
jest.mock('../Modal');
jest.mock('../Dialog');
jest.mock('../EditUserProfile');
jest.mock('../../store/store');
jest.mock('../../lib/io');
jest.mock('../../lib/pubsub');

let user;
let pubsub;
let socket;

authService.logout = jest.fn();
userService.saveUserProfile = jest.fn();

function createModalContent(file) {
  const html = `
        <div class="edit-profile">
          <input class="edit-profile__field-input" id="username" name="username" type="text" value="{{username}}" readonly>
          <input class="edit-profile__avatar-input" id="file" name="file" type="file" accept="image/*">          
        </div>
      `;
  const elem = htmlToElement(html);
  const fileInput = elem.querySelector('input[type="file"]');

  if (file && file instanceof File) {
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });
  }

  return elem;
}

describe('User', () => {
  beforeAll(() => {
    pubsub = new Pubsub();
    socket = io();
  });

  beforeEach(() => {
    document.body.innerHTML = `<div class="chat-sidebar__user"></div>`;
    user = new User(socket, pubsub);
    mockOn.mockClear();
    mockEmit.mockClear();
  });

  test('`elem` property should be defined during `User` class instantiation', () => {
    expect(user.elem).toBeDefined();
  });

  test('should display a menu after click on elem', () => {
    const event = { preventDefault: () => {} };

    user.handleElemClick(event);
    expect(Menu).toHaveBeenCalledTimes(1);
    expect(mockMenuShow).toHaveBeenCalledTimes(1);
  });

  test('should open modal on edit profile', () => {
    const sender = generate.userData();

    mockGetState.mockImplementation(() => ({ sender }));
    user.handleEditProfile();
    expect(Modal).toHaveBeenCalledTimes(1);
    expect(EditUserProfile).toHaveBeenCalledWith(sender);
    expect(mockEditUserProfileRender).toHaveBeenCalledTimes(1);
    expect(mockModalOpen).toHaveBeenCalledTimes(1);
  });

  test('should save profile', async () => {
    const sender = generate.userData({ id: generate.id() });
    const file = new File(['(⌐□_□)'], 'chucknorris.png', {
      type: 'image/png',
    });
    const modal = new Modal();

    modal.getContent.mockImplementation(() => createModalContent(file));
    mockGetState.mockImplementation(() => ({ sender }));
    userService.saveUserProfile.mockResolvedValue({ success: true, data: sender });

    await user.handleSaveProfile(modal);

    expect(mockDispatch).toHaveBeenCalledWith('editUser', sender);
    expect(mockModalDestroy).toHaveBeenCalledTimes(1);
    expect(mockEmit).toHaveBeenCalledWith('member:edit', sender.id);
  });

  test('should show an error dialog if file size > 1MB', async () => {
    const fileSize = 2 * 1024 * 1024;
    const file = new File([new ArrayBuffer(fileSize)], 'avatar.jpg', {
      type: 'image/jpeg',
    });
    const modal = new Modal();

    modal.getContent.mockImplementation(() => createModalContent(file));

    await user.handleSaveProfile(modal);

    expect(mockDialogShow).toHaveBeenCalledTimes(1);
    expect(dialogGetContent()).toBe('File too large!');

    mockDialogShow.mockClear();
  });

  test('should show an error dialog if something goes wrong while saving a profile', async () => {
    const sender = generate.userData({ id: generate.id() });
    const file = new File(['(⌐□_□)'], 'chucknorris.txt', {
      type: 'text/plain',
    });
    const error = 'Something goes wrong';
    const modal = new Modal();

    modal.getContent.mockImplementation(() => createModalContent(file));
    mockGetState.mockImplementation(() => ({ sender }));
    userService.saveUserProfile.mockResolvedValue({ success: false, error });

    await user.handleSaveProfile(modal);

    expect(mockDialogShow).toHaveBeenCalledTimes(1);
    expect(dialogGetContent()).toBe(error);

    mockDialogShow.mockClear();
  });

  test('should login', () => {
    const testUser = generate.userData();

    user.ioLogin(testUser);
    expect(mockDispatch).toHaveBeenCalledWith('login', testUser);
    expect(mockPub).toHaveBeenCalledWith('login');
  });

  test('should redirect on logout', () => {
    window.location.assign = jest.fn();
    User.ioLogout();
    expect(window.location.assign).toHaveBeenCalledWith(`auth/login`);
  });

  test('should logout', async () => {
    authService.logout.mockResolvedValue({ success: true });
    window.location.assign = jest.fn();

    await User.handleSignOut();

    expect(window.location.assign).toHaveBeenCalledWith(`auth/login`);
  });

  test('should not logout if error', async () => {
    authService.logout.mockResolvedValue({ success: false });
    window.location.assign = jest.fn();

    await User.handleSignOut();

    expect(window.location.assign).not.toHaveBeenCalled();
  });

  test('should render', () => {
    const sender = generate.userData();

    mockGetState.mockImplementation(() => ({ sender }));
    user.render();
    expect(user.elem.innerHTML.length).not.toBe(0);
  });

  test('should not render if user is not defined', () => {
    mockGetState.mockImplementation(() => ({ sender: null }));
    user.render();
    expect(user.elem.innerHTML.length).toBe(0);
  });
});

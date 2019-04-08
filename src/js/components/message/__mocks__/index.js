import { htmlToElement } from '../../../utils/helpers';

export const mockRender = jest.fn(() => htmlToElement('<li class="message"></li>'));
export const mockRenderActions = jest.fn(() =>
  htmlToElement('<div class="message__action-list"></div>'),
);

const mock = jest.fn().mockImplementation(props => {
  return {
    ...props,
    timestamp: Date.now(),
    render: mockRender,
    renderActions: mockRenderActions,
  };
});

export default mock;

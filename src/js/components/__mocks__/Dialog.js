let content;

export const mockShow = jest.fn();

export const mockDestroy = jest.fn();

export const mockSetContent = jest.fn(cnt => {
  content = cnt;
});

export const getContent = () => content;

export const mockAddFooterBtn = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    show: mockShow,
    destroy: mockDestroy,
    setContent: mockSetContent,
    addFooterBtn: mockAddFooterBtn,
  };
});

export default mock;

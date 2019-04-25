export const mockSetContent = jest.fn();
export const mockGetContent = jest.fn();
export const mockAddFooterBtn = jest.fn();
export const mockOpen = jest.fn();
export const mockDestroy = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    setContent: mockSetContent,
    getContent: mockGetContent,
    addFooterBtn: mockAddFooterBtn,
    open: mockOpen,
    destroy: mockDestroy,
  };
});

export default mock;

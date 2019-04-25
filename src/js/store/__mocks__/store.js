export const mockDispatch = jest.fn();
export const mockCommit = jest.fn();
export const mockGetState = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    dispatch: mockDispatch,
    commit: mockCommit,
    getState: mockGetState,
  };
});

export default mock;

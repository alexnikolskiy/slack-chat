export const mockRender = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    render: mockRender,
  };
});

export default mock;

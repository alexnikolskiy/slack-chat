export const mockAdd = jest.fn().mockReturnThis();
export const mockShow = jest.fn().mockReturnThis();

const mock = jest.fn().mockImplementation(() => {
  return {
    add: mockAdd,
    show: mockShow,
  };
});

export default mock;

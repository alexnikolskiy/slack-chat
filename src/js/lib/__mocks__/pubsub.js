export const mockPub = jest.fn();
export const mockSub = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    pub: mockPub,
    sub: mockSub,
  };
});

export default mock;

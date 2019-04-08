const faker = require('faker');
const omit = require('lodash.omit');

function userData(overrides = {}) {
  return Object.assign(
    {
      username: faker.internet.userName(),
    },
    omit(overrides, ['password']),
  );
}

function roomData(overrides = {}) {
  return Object.assign({ name: faker.random.word() }, overrides);
}

function messageData(overrides = {}) {
  return Object.assign({ text: faker.lorem.words() }, overrides);
}

module.exports = {
  userData,
  roomData,
  messageData,
  id: faker.random.uuid,
  title: faker.lorem.words,
  avatar: faker.internet.avatar,
};

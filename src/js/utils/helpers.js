export const throttle = (fn, delay) => {
  let lastTime;

  return function throttled(...args) {
    const timeSinceLastExecution = Date.now() - lastTime;

    if (!lastTime || timeSinceLastExecution >= delay) {
      fn.apply(this, args);
      lastTime = Date.now();
    }
  };
};

export const debounce = (fn, delay) => {
  let timer;

  return function debounced(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

export async function getRoomMembers(roomId) {
  try {
    const response = await fetch(`api/rooms/${roomId}/members`);
    const data = await response.json();

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getRoomMessages(roomId) {
  try {
    const response = await fetch(`api/rooms/${roomId}/messages`);
    const data = await response.json();

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getRooms() {
  try {
    const response = await fetch('api/rooms');
    const data = await response.json();

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getPrivateMessages(roomId, receiverId) {
  try {
    const response = await fetch(`api/rooms/${roomId}/messages/${receiverId}`);
    const data = await response.json();

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

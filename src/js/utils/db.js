export async function getRoomMembers(roomId) {
  try {
    const response = await fetch(`api/rooms/${roomId}/members`, { credentials: 'same-origin' });
    const data = await response.json();

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getRoomMessages(roomId) {
  try {
    const response = await fetch(`api/rooms/${roomId}/messages`, { credentials: 'same-origin' });
    const data = await response.json();

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getRooms() {
  try {
    const response = await fetch('api/rooms', { credentials: 'same-origin' });
    const data = await response.json();

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getPrivateMessages(roomId, receiverId) {
  try {
    const response = await fetch(`api/rooms/${roomId}/messages/${receiverId}`, {
      credentials: 'same-origin',
    });
    const data = await response.json();

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function logout() {
  try {
    return fetch(`auth/logout`, {
      method: 'POST',
      credentials: 'same-origin',
    });
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function saveUserProfile(userId, userData) {
  try {
    return fetch(`api/users/${userId}`, {
      method: 'POST',
      body: userData,
      credentials: 'same-origin',
    });
  } catch (err) {
    throw new Error(err.message);
  }
}

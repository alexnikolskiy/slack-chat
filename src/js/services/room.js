export async function getRoomMembers(roomId) {
  try {
    const response = await fetch(`api/rooms/${roomId}/members`, { credentials: 'same-origin' });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getRoomMessages(roomId) {
  try {
    const response = await fetch(`api/rooms/${roomId}/messages`, { credentials: 'same-origin' });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getRooms() {
  try {
    const response = await fetch('api/rooms', { credentials: 'same-origin' });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

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

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

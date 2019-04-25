export async function saveUserProfile(userId, userData) {
  try {
    const response = await fetch(`api/users/${userId}`, {
      method: 'POST',
      body: userData,
      credentials: 'same-origin',
    });

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getOne(userId) {
  try {
    const response = await fetch(`api/users/${userId}`, { credentials: 'same-origin' });
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error);
    }

    return data.data;
  } catch (err) {
    throw new Error(err.message);
  }
}

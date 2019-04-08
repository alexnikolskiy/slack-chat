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

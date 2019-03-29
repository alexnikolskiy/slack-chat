export async function logout() {
  try {
    const response = await fetch(`auth/logout`, {
      method: 'POST',
      credentials: 'same-origin',
    });

    return await response.json();
  } catch (err) {
    throw new Error(err.message);
  }
}

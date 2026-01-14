export const getToken = () => localStorage.getItem('token');
export const getUserIdFromToken = () => {
  const token = getToken();
  if (!token) return null;

  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.userId;
};
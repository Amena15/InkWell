/**
 * Get a cookie by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part) {
      return part.split(';').shift();
    }
  }
  return undefined;
}

/**
 * Set a cookie
 */
export function setCookie(
  name: string, 
  value: string, 
  days = 7,
  path = '/'
): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=${path}`;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string, path = '/'): void {
  if (typeof document === 'undefined') {
    return;
  }
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path}`;
}

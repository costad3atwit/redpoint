import { HttpInterceptorFn } from '@angular/common/http';

const TOKEN_KEY = 'rp_token';
const PUBLIC_PATHS = ['/login', '/register'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const isPublic = PUBLIC_PATHS.some(path => req.url.includes(path));
  if (isPublic) return next(req);

  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return next(req);

  return next(
    req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
  );
};

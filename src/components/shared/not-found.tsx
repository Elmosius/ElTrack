import { useLocation } from '@tanstack/react-router';

export default function NotFound() {
  const location = useLocation();

  return <div>Page Not Found {location.pathname}</div>;
}

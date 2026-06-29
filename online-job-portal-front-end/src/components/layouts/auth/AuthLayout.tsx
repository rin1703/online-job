import { Link, Outlet } from 'react-router';

import { Icons } from '@/components/icons/icons';
import { Logo } from '@/components/icons/Logo';
import { AuthBackground } from '@/components/layouts/auth/AuthBackground';

export default function AuthLayout() {
  return (
    <AuthBackground>
      <div className="absolute right-10 top-6 flex items-center gap-6 z-20">
        <Link to="/" className="cursor-pointer hover:opacity-80 transition-opacity">
          <Logo />
        </Link>
        <Link to="/auth/sign-up" className="font-medium hover:text-primary transition-colors">
          Sign up
        </Link>
        <div className="cursor-pointer hover:text-primary transition-colors">
          <Icons.globe />
        </div>
      </div>
      <div className="flex min-h-screen items-center justify-center">
        <Outlet />
      </div>
    </AuthBackground>
  );
}

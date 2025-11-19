'use client';

import { Repeat2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex h-16 items-center px-6 justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Repeat2 className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-blue-600">Imitate Tweet</span>
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3">
                  {user?.profile_image_url && (
                    <img
                      src={user.profile_image_url}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <span className="text-gray-600">@{user?.username || "rafiulm_"}</span>
                </div>
                <Button variant="outline" onClick={logout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button onClick={login}>Login with Twitter</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 
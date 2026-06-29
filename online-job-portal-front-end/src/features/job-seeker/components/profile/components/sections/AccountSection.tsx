import { User } from 'lucide-react';
import type { Profile } from '@/features/job-seeker/components/profile/types/profile.types.tsx';
import { ProfileForm } from './ProfileForm';

type AccountSectionProps = {
  profile: Profile;
  onUpdate: (updatedProfile: Partial<Profile>) => void;
};

export function AccountSection({ profile, onUpdate }: AccountSectionProps) {
  return (
    <section id="account" className="scroll-mt-24">
      <div className="w-full p-6 bg-card rounded-lg shadow-md border border-border">
        <div className="w-full mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Account</h2>
              <p className="text-sm text-muted-foreground">
                Manage your account information and avatar
              </p>
            </div>
          </div>
        </div>
        <ProfileForm profile={profile} onUpdate={onUpdate} isAccountSection={true} />
      </div>
    </section>
  );
}
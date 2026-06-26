import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { AdminProfile, PublicUser } from '../types';
import ExpertBadge from './ExpertBadge';
import Card from './Card';

interface FitriProfileCardProps {
  compact?: boolean;
}

export default function FitriProfileCard({ compact = false }: FitriProfileCardProps) {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [user, setUser] = useState<PublicUser | null>(null);

  useEffect(() => {
    api
      .get('/admin-profiles/featured')
      .then(({ data }) => {
        const first = data.profiles[0];
        if (first) {
          setProfile(first.profile);
          setUser(first.user);
        }
      })
      .catch(() => undefined);
  }, []);

  if (!profile || !user) return null;

  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-skyblue/20 text-2xl font-bold text-navy">
        {user.name.replace('Psikolog ', '').charAt(0)}
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-h3 font-bold text-navy">{user.name}</h3>
          <ExpertBadge credentials={profile.credentials ?? undefined} />
        </div>
        <p className="text-textlight">{profile.title}</p>
        {profile.credentials && <p className="text-sm text-textlight">{profile.credentials}</p>}

        {!compact && (
          <>
            <p className="mt-2 text-textdark">{profile.bio}</p>
            {profile.expertise_areas.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.expertise_areas.map((area) => (
                  <span key={area} className="rounded-full bg-skyblue/15 px-2 py-0.5 text-xs font-medium text-navy">
                    {area}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-textdark">
              {profile.location && <span>📍 {profile.location}</span>}
              {profile.phone && <span>📞 {profile.phone}</span>}
            </div>
            {profile.whatsapp_link && (
              <a
                href={profile.whatsapp_link}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary mt-3 inline-flex"
              >
                Chat WhatsApp
              </a>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

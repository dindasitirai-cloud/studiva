import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { CommunityProfile, PublicUser, Tier } from '../types';
import { timeAgo } from '../lib/community';
import Card from '../components/Card';

const TIER_LABELS: Record<string, string> = { tier1: 'Tier 1 Parent', tier2: 'Tier 2 Parent' };

export default function CommunityProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();

  const [profileUser, setProfileUser] = useState<PublicUser | null>(null);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [counts, setCounts] = useState({ discussionsCount: 0, commentsCount: 0 });
  const [bio, setBio] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUser?.id === Number(userId);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/community/profile/${userId}`);
        setProfileUser(data.user);
        setProfile(data.profile);
        setTier(data.tier);
        setBio(data.profile.bio ?? '');
        setCounts({ discussionsCount: data.discussionsCount, commentsCount: data.commentsCount });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  async function saveBio() {
    await api.patch('/community/profile/me', { bio });
    setEditingBio(false);
    if (profile) setProfile({ ...profile, bio });
  }

  if (loading) return <div className="px-4 py-16 text-center text-textlight">Memuat profil...</div>;
  if (!profileUser || !profile) return <div className="px-4 py-16 text-center text-textlight">Profil tidak ditemukan.</div>;

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-skyblue/20 text-2xl font-bold text-navy">
              {profileUser.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-h3 font-bold text-navy">{profileUser.name}</h1>
              <div className="mt-1 flex flex-wrap gap-2">
                {tier && (
                  <span className="rounded-full bg-skyblue/15 px-2 py-0.5 text-xs font-semibold text-navy">
                    {TIER_LABELS[tier]}
                  </span>
                )}
                {profile.is_champion === 1 && (
                  <span className="rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold text-navy">
                    🏆 Community Champion
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4">
            {isOwnProfile && editingBio ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="rounded-md border border-bordergray px-3 py-2"
                />
                <button onClick={saveBio} className="btn-primary self-start">
                  Save Bio
                </button>
              </div>
            ) : (
              <p className="text-textdark">{profile.bio || 'Belum ada bio.'}</p>
            )}
            {isOwnProfile && !editingBio && (
              <button onClick={() => setEditingBio(true)} className="mt-2 text-sm text-gold hover:underline">
                Edit Bio
              </button>
            )}
          </div>
        </Card>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <p className="text-2xl font-bold text-navy">{counts.discussionsCount}</p>
            <p className="text-sm text-textlight">Discussions</p>
          </Card>
          <Card>
            <p className="text-2xl font-bold text-navy">{counts.commentsCount}</p>
            <p className="text-sm text-textlight">Comments</p>
          </Card>
          <Card>
            <p className="text-2xl font-bold text-navy">{profile.helpful_count}</p>
            <p className="text-sm text-textlight">Helpful Marks</p>
          </Card>
          <Card>
            <p className="text-2xl font-bold text-navy">{profile.likes_received}</p>
            <p className="text-sm text-textlight">Likes Received</p>
          </Card>
        </div>

        <p className="mt-4 text-sm text-textlight">
          Joined {timeAgo(profile.joined_date)} &middot; Last active {timeAgo(profile.last_active)}
        </p>
      </div>
    </div>
  );
}

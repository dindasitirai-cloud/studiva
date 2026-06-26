import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Comment, Discussion } from '../types';
import { timeAgo } from '../lib/community';
import DiscussionCard from '../components/DiscussionCard';
import Card from '../components/Card';

export default function MyCommunityActivityPage() {
  const [tab, setTab] = useState<'discussions' | 'comments'>('discussions');
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState<{
    discussionsCount: number;
    commentsCount: number;
    helpfulCount: number;
    likesReceived: number;
    isChampion: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [activityRes, statsRes] = await Promise.all([
          api.get('/community/myactivity'),
          api.get('/community/stats/user'),
        ]);
        setDiscussions(activityRes.data.discussions);
        setComments(activityRes.data.comments);
        setStats(statsRes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-h2 font-bold text-navy">My Community Activity</h1>

        {stats && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.discussionsCount}</p>
              <p className="text-sm text-textlight">Discussions</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.commentsCount}</p>
              <p className="text-sm text-textlight">Comments</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.helpfulCount}</p>
              <p className="text-sm text-textlight">Marked Helpful</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-navy">{stats.likesReceived}</p>
              <p className="text-sm text-textlight">Likes Received</p>
            </Card>
          </div>
        )}
        {stats?.isChampion && (
          <p className="mt-3 inline-block rounded-full bg-gold/20 px-3 py-1 text-sm font-semibold text-navy">
            🏆 Community Champion
          </p>
        )}

        <div className="mt-6 flex gap-2">
          <button
            onClick={() => setTab('discussions')}
            className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium ${
              tab === 'discussions' ? 'bg-navy text-white' : 'bg-white text-textdark shadow-sm'
            }`}
          >
            My Discussions
          </button>
          <button
            onClick={() => setTab('comments')}
            className={`min-h-[44px] rounded-full px-4 py-2 text-sm font-medium ${
              tab === 'comments' ? 'bg-navy text-white' : 'bg-white text-textdark shadow-sm'
            }`}
          >
            My Comments
          </button>
        </div>

        {loading && <p className="mt-6 text-textlight">Memuat...</p>}

        {!loading && tab === 'discussions' && (
          <div className="mt-6 space-y-4">
            {discussions.length === 0 && <p className="text-textlight">Anda belum membuat diskusi.</p>}
            {discussions.map((d) => (
              <DiscussionCard key={d.id} discussion={d} />
            ))}
          </div>
        )}

        {!loading && tab === 'comments' && (
          <div className="mt-6 space-y-4">
            {comments.length === 0 && <p className="text-textlight">Anda belum memberikan komentar.</p>}
            {comments.map((c) => (
              <Card key={c.id}>
                <p className="text-sm text-textlight">
                  {timeAgo(c.created_at)} {c.is_marked_helpful === 1 && '· ✓ Marked Helpful'}
                </p>
                <p className="mt-1 text-textdark">{c.content}</p>
                <Link
                  to={`/community/discussions/${c.discussion_id}`}
                  className="mt-2 inline-block text-sm font-medium text-gold hover:underline"
                >
                  View discussion →
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

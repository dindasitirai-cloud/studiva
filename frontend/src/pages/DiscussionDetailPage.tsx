import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Comment, Discussion } from '../types';
import { CATEGORY_STYLES, timeAgo } from '../lib/community';
import Card from '../components/Card';
import CommentItem from '../components/CommentItem';
import ReportModal from '../components/ReportModal';
import ExpertBadge from '../components/ExpertBadge';

export default function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyContent, setReplyContent] = useState('');
  const [replyAnonymous, setReplyAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [reportTarget, setReportTarget] = useState<{ id: number; type: 'discussion' | 'comment' } | null>(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/community/discussions/${id}`);
      setDiscussion(data.discussion);
      setComments(data.comments);
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? 'Forum ini tidak tersedia untuk tier subscription Anda.'
          : 'Gagal memuat diskusi.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLikeDiscussion() {
    if (!discussion) return;
    await api.post(`/community/discussions/${discussion.id}/like`);
    setDiscussion({ ...discussion, likes_count: discussion.likes_count + 1 });
  }

  async function handleMarkSolved() {
    if (!discussion) return;
    await api.post(`/community/discussions/${discussion.id}/mark-solved`);
    setDiscussion({ ...discussion, is_solved: 1 });
  }

  async function handleSubmitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!discussion || !replyContent.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/community/discussions/${discussion.id}/comments`, {
        content: replyContent,
        isAnonymous: replyAnonymous,
      });
      setReplyContent('');
      await load();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal mengirim balasan.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLikeComment(commentId: number) {
    await api.post(`/community/comments/${commentId}/like`);
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, likes_count: c.likes_count + 1 } : c)));
  }

  async function handleMarkHelpful(commentId: number) {
    await api.post(`/community/comments/${commentId}/mark-helpful`);
    await load();
  }

  async function handleDeleteComment(commentId: number) {
    if (!window.confirm('Hapus balasan ini?')) return;
    await api.delete(`/community/comments/${commentId}`);
    await load();
  }

  async function handleDeleteDiscussion() {
    if (!discussion || !window.confirm('Hapus diskusi ini?')) return;
    await api.delete(`/community/discussions/${discussion.id}`);
    navigate('/community');
  }

  if (loading) return <div className="px-4 py-16 text-center text-textlight">Memuat diskusi...</div>;

  if (error || !discussion) {
    return (
      <div className="px-4 py-16 text-center">
        <p className="text-red-600">{error ?? 'Diskusi tidak ditemukan.'}</p>
      </div>
    );
  }

  const style = CATEGORY_STYLES[discussion.category];
  const isAuthor = user?.id === discussion.author_id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="bg-background px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${style.chip}`}>
              {style.icon} {style.label}
            </span>
            {discussion.subcategory && <span className="text-xs text-textlight">{discussion.subcategory}</span>}
            {discussion.is_solved === 1 && (
              <span className="rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success">
                ✓ Solved
              </span>
            )}
          </div>

          <h1 className="mt-3 text-h2 font-bold text-navy">{discussion.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-textlight">
            <span className={discussion.is_expert ? 'font-bold text-gold' : ''}>{discussion.display_name}</span>
            {discussion.is_expert && <ExpertBadge label={discussion.expert_badge} />}
            <span>
              &middot; {timeAgo(discussion.created_at)} &middot; {discussion.views_count} views
            </span>
          </p>

          {discussion.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {discussion.tags.map((tag) => (
                <span key={tag} className="text-xs font-medium text-skyblue">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p className="mt-4 whitespace-pre-line text-textdark">{discussion.content}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <button onClick={handleLikeDiscussion} className="text-textlight hover:text-gold">
              ❤️ Like ({discussion.likes_count})
            </button>
            <button
              onClick={() => setReportTarget({ id: discussion.id, type: 'discussion' })}
              className="text-textlight hover:text-red-600"
            >
              Report
            </button>
            {(isAuthor || isAdmin) && discussion.is_solved === 0 && (
              <button onClick={handleMarkSolved} className="font-medium text-success hover:underline">
                Mark Solved
              </button>
            )}
            {(isAuthor || isAdmin) && (
              <button onClick={handleDeleteDiscussion} className="text-red-600 hover:underline">
                Delete
              </button>
            )}
          </div>
        </Card>

        <section className="mt-8">
          <h2 className="text-h3 font-semibold text-navy">{comments.length} Replies</h2>
          <div className="mt-4 space-y-4">
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                canMarkHelpful={isAuthor || isAdmin}
                canModerate={user?.id === c.author_id || isAdmin}
                onLike={() => handleLikeComment(c.id)}
                onMarkHelpful={() => handleMarkHelpful(c.id)}
                onDelete={() => handleDeleteComment(c.id)}
                onReport={() => setReportTarget({ id: c.id, type: 'comment' })}
              />
            ))}
          </div>

          <Card className="mt-6">
            {discussion.category === 'fitri' && !isAdmin ? (
              <p className="text-textlight">
                💬 Ini adalah forum Ask Psikolog Fitri, hanya Psikolog Fitri yang dapat menjawab
                pertanyaan di sini. Beliau akan merespons sesegera mungkin.
              </p>
            ) : (
              <>
                <h3 className="font-semibold text-navy">Write a Reply</h3>
                <form onSubmit={handleSubmitReply} className="mt-3 flex flex-col gap-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={4}
                    required
                    placeholder="Bagikan pengalaman atau saran Anda..."
                    className="rounded-md border border-bordergray px-4 py-2 focus:border-gold focus:outline-none"
                  />
                  <label className="flex items-center gap-2 text-sm text-textdark">
                    <input
                      type="checkbox"
                      checked={replyAnonymous}
                      onChange={(e) => setReplyAnonymous(e.target.checked)}
                    />
                    Post Anonymously
                  </label>
                  <button type="submit" disabled={submitting} className="btn-primary self-start disabled:opacity-60">
                    {submitting ? 'Mengirim...' : 'Post Reply'}
                  </button>
                </form>
              </>
            )}
          </Card>
        </section>
      </div>

      {reportTarget && (
        <ReportModal
          contentId={reportTarget.id}
          contentType={reportTarget.type}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}

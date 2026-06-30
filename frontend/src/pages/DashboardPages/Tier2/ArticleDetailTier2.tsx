import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, BookOpen } from 'lucide-react';
import { getArticleById } from './articleData';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import ChildPicker from './ChildPicker';

export default function ArticleDetailTier2() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { children, markArticleRead, unmarkArticleRead, isArticleReadByChild } = useDashboardTier2();

  const article = id ? getArticleById(id) : undefined;

  // When there's exactly one child, there's no ambiguity - attribute to them
  // automatically. With 2+ children, the parent must pick explicitly (see
  // ChildPicker below) since we can't guess which child this is relevant to.
  const autoMarkedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!article || children.length !== 1) return;
    if (autoMarkedRef.current === article.id) return;
    autoMarkedRef.current = article.id;
    markArticleRead(children[0].id, article.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id, children.length]);

  if (!article) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <BookOpen className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
        <h2 className="font-baloo text-[20px] font-bold text-stv-navy">Artikel tidak ditemukan</h2>
        <Link
          to="/dashboard/tier2/resources"
          className="rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white no-underline transition hover:bg-amber-600"
        >
          Kembali ke Resource Library
        </Link>
      </div>
    );
  }

  const taggedChildIds = children.filter(c => isArticleReadByChild(c.id, article.id)).map(c => c.id);

  return (
    <div className="mx-auto max-w-[680px]">
      <button
        type="button"
        onClick={() => navigate('/dashboard/tier2/resources')}
        className="mb-5 flex items-center gap-1.5 text-[14px] font-semibold text-stv-muted transition hover:text-amber-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Resource Library
      </button>

      <article className="rounded-2xl bg-white p-6 shadow-[0_4px_16px_rgba(16,58,107,.06)] sm:p-9">
        {/* Meta */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[12px] font-bold text-amber-700">
            {article.category}
          </span>
          <span className="flex items-center gap-1 text-[13px] text-stv-muted">
            <Clock className="h-3.5 w-3.5" />
            {article.readTime} menit baca
          </span>
        </div>

        {/* Title */}
        <h1 className="font-baloo text-[26px] font-extrabold leading-[1.25] text-stv-navy sm:text-[30px]">
          {article.title}
        </h1>
        <p className="mt-3 text-[16px] italic leading-[1.6] text-stv-quote">{article.summary}</p>

        {/* Activity attribution */}
        <div className="mt-5">
          {children.length === 0 ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-stv-muted">
              Tambahkan{' '}
              <Link to="/dashboard/tier2/profil-anak" className="font-semibold text-amber-600 underline">
                profil anak
              </Link>{' '}
              agar aktivitas ini tercatat di Perjalanan Pembelajaran.
            </p>
          ) : children.length === 1 ? (
            <div className="flex items-center gap-2 rounded-xl bg-stv-green-tint px-4 py-3 text-[13px] font-semibold text-stv-green">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Tercatat di Perjalanan Pembelajaran {children[0].name}.
            </div>
          ) : (
            <ChildPicker
              children={children}
              taggedIds={taggedChildIds}
              onToggle={(childId, isCurrentlyTagged) =>
                isCurrentlyTagged ? unmarkArticleRead(childId, article.id) : markArticleRead(childId, article.id)
              }
              label="Catat artikel ini sebagai dibaca untuk anak:"
            />
          )}
        </div>

        {/* Content */}
        <div className="mt-6 flex flex-col gap-4 border-t border-amber-100 pt-6">
          {article.content.map((para, i) => (
            <p key={i} className="text-[16px] leading-[1.85] text-stv-body">
              {para}
            </p>
          ))}
        </div>
      </article>
    </div>
  );
}

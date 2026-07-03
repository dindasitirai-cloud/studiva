import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, BookOpen } from 'lucide-react';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import { useDashboardBasePath } from '../useDashboardBasePath';
import { useActivityChild } from '../useActivityChild';
import ChildPicker from './ChildPicker';

export default function ArticleDetailTier2() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const basePath = useDashboardBasePath();
  const { articles, markArticleRead, unmarkArticleRead, isArticleReadByChild } = useDashboardTier2();
  const { singleChild, pickerChildren } = useActivityChild();

  const article = id ? articles.find(a => a.id === id && a.status === 'published') : undefined;

  // Tier 1 parents always have exactly one school-managed child (no
  // picker), and Tier 2 parents with exactly one child profile get the same
  // no-ambiguity treatment. With 2+ Tier 2 children, the parent must pick
  // explicitly (see ChildPicker below) since we can't guess which child this
  // is relevant to.
  const autoMarkedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!article || !singleChild) return;
    if (autoMarkedRef.current === article.id) return;
    autoMarkedRef.current = article.id;
    markArticleRead(singleChild.id, article.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article?.id, singleChild?.id]);

  if (!article) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 rounded-2xl bg-white p-8 text-center shadow-[0_4px_16px_rgba(16,58,107,.06)]">
        <BookOpen className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
        <h2 className="font-baloo text-[20px] font-bold text-stv-navy">Artikel tidak ditemukan</h2>
        <Link
          to={`${basePath}/resources`}
          className="rounded-full bg-amber-500 px-5 py-2 text-[14px] font-bold text-white no-underline transition hover:bg-amber-600"
        >
          Kembali ke Resource Library
        </Link>
      </div>
    );
  }

  const taggedChildIds = pickerChildren.filter(c => isArticleReadByChild(c.id, article.id)).map(c => c.id);

  return (
    <div className="mx-auto max-w-[680px]">
      <button
        type="button"
        onClick={() => navigate(`${basePath}/resources`)}
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
          {singleChild ? (
            <div className="flex items-center gap-2 rounded-xl bg-stv-green-tint px-4 py-3 text-[13px] font-semibold text-stv-green">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Tercatat di Perjalanan Pembelajaran {singleChild.name}.
            </div>
          ) : pickerChildren.length === 0 ? (
            <p className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-stv-muted">
              Tambahkan{' '}
              <Link to={`${basePath}/profil-anak`} className="font-semibold text-amber-600 underline">
                profil anak
              </Link>{' '}
              agar aktivitas ini tercatat di Perjalanan Pembelajaran.
            </p>
          ) : (
            <ChildPicker
              children={pickerChildren}
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

        {/* Sudah Dibaca button — at the bottom after reading the full article */}
        {singleChild && (
          <button
            type="button"
            onClick={() => {
              if (isArticleReadByChild(singleChild.id, article.id)) {
                unmarkArticleRead(singleChild.id, article.id);
              } else {
                markArticleRead(singleChild.id, article.id);
              }
            }}
            className={`mt-7 flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-[15px] font-bold text-white transition ${
              isArticleReadByChild(singleChild.id, article.id)
                ? 'bg-stv-green hover:bg-stv-green/90'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isArticleReadByChild(singleChild.id, article.id) ? 'Sudah Dibaca' : 'Tandai Sudah Dibaca'}
          </button>
        )}
      </article>
    </div>
  );
}

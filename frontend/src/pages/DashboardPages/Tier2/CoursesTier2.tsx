import React, { useState } from 'react';
import {
  Radio,
  Video,
  PlayCircle,
  CalendarDays,
  Clock,
  CircleCheck,
  X,
  GraduationCap,
  Link2,
} from 'lucide-react';
import { COURSES, Course, isVideoLike } from './courseData';
import { useDashboardTier2 } from '../../../context/DashboardTier2Context';
import { useActivityChild } from '../useActivityChild';
import ChildPicker from './ChildPicker';

const THEME_GRADIENT: Record<Course['colorTheme'], string> = {
  amber: 'from-amber-300 to-yellow-200',
  sky: 'from-stv-sky-tint to-sky-100',
  coral: 'from-stv-coral-tint to-orange-100',
  green: 'from-stv-green-tint to-emerald-100',
};

const THEME_ICON_COLOR: Record<Course['colorTheme'], string> = {
  amber: 'text-amber-600',
  sky: 'text-stv-sky-stroke',
  coral: 'text-stv-coral',
  green: 'text-stv-green',
};

const STATUS_LABEL: Record<Course['status'], string> = {
  upcoming: 'Akan Datang',
  available: 'Tersedia',
  completed: 'Rekaman',
};

const STATUS_STYLE: Record<Course['status'], string> = {
  upcoming: 'bg-stv-sky-tint text-stv-sky-stroke',
  available: 'bg-stv-green-tint text-stv-green',
  completed: 'bg-amber-100 text-amber-700',
};

function CourseCard({ course, isEnrolled, onAction }: { course: Course; isEnrolled: boolean; onAction: () => void }) {
  const asVideo = isVideoLike(course);
  const Icon = asVideo ? Video : Radio;
  const actionLabel = asVideo ? 'Tonton' : isEnrolled ? 'Detail Webinar' : 'Daftar Webinar';

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(16,58,107,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(217,119,6,.14)]">
      {/* Thumbnail */}
      <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${THEME_GRADIENT[course.colorTheme]}`}>
        <Icon className={`h-10 w-10 ${THEME_ICON_COLOR[course.colorTheme]}`} strokeWidth={1.5} />
        <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLE[course.status]}`}>
          {STATUS_LABEL[course.status]}
        </span>
        {isEnrolled && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-stv-green shadow">
            <CircleCheck className="h-3.5 w-3.5" />
            Diikuti
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="font-baloo text-[15px] font-bold leading-[1.3] text-stv-navy">{course.title}</p>
        <p className="text-[12px] font-semibold text-amber-700">{course.psychologist}</p>
        <p className="line-clamp-2 text-[13px] leading-[1.5] text-stv-muted">{course.description}</p>

        <div className="mt-1 flex flex-col gap-1 text-[12px] text-stv-muted">
          {course.date && (
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {course.type === 'webinar' && course.status === 'completed' ? `Direkam ${course.date}` : course.date}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {course.duration} menit
          </span>
        </div>

        <button
          type="button"
          onClick={onAction}
          className={`mt-auto flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold text-white transition ${
            !asVideo && isEnrolled ? 'bg-stv-green hover:bg-stv-green/90' : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {asVideo && <PlayCircle className="h-4 w-4" />}
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function CourseModal({ course, isEnrolled, onClose }: { course: Course; isEnrolled: boolean; onClose: () => void }) {
  const { enrollCourse, unenrollCourse, isCourseEnrolledByChild, notifyWebinarRegistered } = useDashboardTier2();
  const { singleChild, pickerChildren } = useActivityChild();
  const taggedChildIds = pickerChildren.filter(c => isCourseEnrolledByChild(c.id, course.id)).map(c => c.id);

  // Frozen at the moment this modal opens, on purpose: registering for a
  // webinar and seeing its join-link detail are two separate steps. Without
  // freezing this, auto-enrolling a single child (below) would flip this
  // modal into "detail" mode instantly and reveal the link in the same
  // click - the parent never actually gets a distinct "you're registered"
  // moment. Closing and reopening via the card's "Detail Webinar" button is
  // what unlocks the detail view, matching a real registration flow.
  const [wasEnrolledAtOpen] = useState(isEnrolled);
  const showWebinarDetail = course.type === 'webinar' && course.status !== 'completed' && wasEnrolledAtOpen;
  const isRegistrationMode = course.type === 'webinar' && course.status !== 'completed' && !wasEnrolledAtOpen;

  // Notify exactly once per registration session - regardless of whether it
  // came from the single-child auto-enroll below or a ChildPicker tag.
  const notifiedRef = React.useRef(false);
  React.useEffect(() => {
    if (course.type === 'webinar' && isRegistrationMode && isEnrolled && !notifiedRef.current) {
      notifiedRef.current = true;
      notifyWebinarRegistered(course.title);
    }
  }, [isEnrolled, isRegistrationMode, course.type, course.title, notifyWebinarRegistered]);

  // Single child (always true for Tier 1, or a Tier 2 parent with exactly
  // one child profile): enroll immediately, no need to ask.
  React.useEffect(() => {
    if (singleChild && !isCourseEnrolledByChild(singleChild.id, course.id)) {
      enrollCourse(singleChild.id, course.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stv-navy/30 px-4">
      <div className="w-full max-w-[440px] rounded-2xl bg-white p-6 shadow-[0_20px_60px_rgba(16,58,107,.2)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-baloo text-[18px] font-bold text-stv-navy">
            {showWebinarDetail ? 'Detail Webinar' : course.type === 'webinar' ? 'Daftar Webinar' : 'Tandai Ditonton'}
          </h2>
          <button type="button" onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-stv-muted hover:text-stv-navy">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-4 text-[14px] font-semibold text-stv-navy">{course.title}</p>

        {/* Registration confirmation - tells the parent to come back for the link, without showing it yet */}
        {isRegistrationMode && isEnrolled && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-stv-green-tint px-4 py-3 text-[13px] font-semibold text-stv-green">
            <CircleCheck className="h-4 w-4 shrink-0" />
            Pendaftaran berhasil! Tutup ini, lalu buka &quot;Detail Webinar&quot; pada kartu untuk melihat link.
          </div>
        )}

        {/* Webinar detail info: only in a session opened via "Detail Webinar" */}
        {showWebinarDetail && (
          <div className="mb-4 flex flex-col gap-2.5 rounded-xl bg-amber-50 p-4">
            <div className="flex items-center gap-2 text-[13px] text-stv-navy">
              <CalendarDays className="h-4 w-4 shrink-0 text-amber-600" />
              <span className="font-semibold">{course.date}</span>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-stv-navy">
              <Clock className="h-4 w-4 shrink-0 text-amber-600" />
              <span className="font-semibold">{course.duration} menit</span>
            </div>
            {course.webinarLink && (
              <a
                href={course.webinarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center justify-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-[13px] font-bold text-white no-underline transition hover:bg-amber-600"
              >
                <Link2 className="h-3.5 w-3.5" />
                Gabung Live Webinar
              </a>
            )}
            <p className="text-[11px] text-stv-muted">Tautan aktif saat jadwal webinar dimulai.</p>
          </div>
        )}

        {singleChild ? (
          <div className="flex items-center gap-2 rounded-xl bg-stv-green-tint px-4 py-3 text-[13px] font-semibold text-stv-green">
            <CircleCheck className="h-4 w-4 shrink-0" />
            Tercatat di Perjalanan Pembelajaran {singleChild.name}.
          </div>
        ) : pickerChildren.length === 0 ? (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-[13px] text-stv-muted">
            Tambahkan profil anak terlebih dahulu agar aktivitas ini tercatat di Perjalanan Pembelajaran.
          </p>
        ) : (
          <ChildPicker
            children={pickerChildren}
            taggedIds={taggedChildIds}
            onToggle={(childId, isCurrentlyTagged) =>
              isCurrentlyTagged ? unenrollCourse(childId, course.id) : enrollCourse(childId, course.id)
            }
            label={showWebinarDetail ? 'Diikuti untuk anak:' : 'Catat course ini untuk anak:'}
          />
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-amber-500 px-5 py-2.5 text-[14px] font-bold text-white transition hover:bg-amber-600"
        >
          Selesai
        </button>
      </div>
    </div>
  );
}

export default function CoursesTier2() {
  const [tab, setTab] = useState<'webinar' | 'video'>('webinar');
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const { isCourseEnrolledByAnyChild } = useDashboardTier2();

  // Completed webinars move into "Video Rekaman" since they're now just a
  // recording - only upcoming webinars stay in the "Live Webinar" tab.
  const filtered = COURSES.filter(c => (tab === 'webinar' ? !isVideoLike(c) : isVideoLike(c)));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Courses</h2>
        <p className="text-[14px] text-stv-muted">Kelas dan webinar bersama psikolog, langsung atau rekaman.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 self-start rounded-2xl bg-amber-50 p-1">
        {([
          ['webinar', 'Live Webinar', Radio],
          ['video', 'Video Rekaman', Video],
        ] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition ${
              tab === id ? 'bg-white font-bold text-amber-700 shadow-sm' : 'text-stv-muted hover:text-amber-700'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-amber-200 py-14 text-center">
          <GraduationCap className="h-10 w-10 text-amber-300" strokeWidth={1.5} />
          <p className="mt-3 font-semibold text-stv-navy">Belum ada course di kategori ini</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={isCourseEnrolledByAnyChild(course.id)}
              onAction={() => setActiveCourse(course)}
            />
          ))}
        </div>
      )}

      {activeCourse && (
        <CourseModal
          course={activeCourse}
          isEnrolled={isCourseEnrolledByAnyChild(activeCourse.id)}
          onClose={() => setActiveCourse(null)}
        />
      )}
    </div>
  );
}

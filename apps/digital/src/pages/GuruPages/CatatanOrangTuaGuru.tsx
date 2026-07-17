import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useGuru, PANGGILAN_GURU } from './GuruContext';

function formatChatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { weekday: 'short' }) + ', ' +
    d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export default function CatatanOrangTuaGuru() {
  const { students, parentNotes, addTeacherResponse, markParentNoteRead } = useGuru();
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? '');
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const selectedStudent = students.find(s => s.id === selectedStudentId);
  const teacherName = `${PANGGILAN_GURU} ${selectedStudent?.waliKelas?.replace(/^(Bu|Pak)\s/, '') ?? 'Ratna Sari'}`;

  // Notes for selected student, chronological
  const studentNotes = [...parentNotes]
    .filter(n => n.studentId === selectedStudentId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Flatten into chat stream: parent message + optional teacher reply
  const messages = studentNotes.flatMap(note => {
    const items: { id: string; type: 'parent' | 'teacher'; text: string; time: string; name: string; noteId: string }[] = [
      { id: note.id, type: 'parent', text: note.message, time: note.date, name: 'Orang Tua', noteId: note.id },
    ];
    if (note.teacherResponse && note.teacherResponseAt) {
      items.push({
        id: note.id + '-reply',
        type: 'teacher',
        text: note.teacherResponse,
        time: note.teacherResponseAt,
        name: teacherName,
        noteId: note.id,
      });
    }
    return items;
  });

  // First unread note without a reply → the one teacher should respond to
  const unrepliedNote = studentNotes.find(n => !n.teacherResponse);

  // Unread count per student for badge
  const unreadCount = (sid: string) =>
    parentNotes.filter(n => n.studentId === sid && !n.readByTeacher).length;

  function handleSend() {
    const text = input.trim();
    if (!text || !unrepliedNote) return;
    addTeacherResponse(unrepliedNote.id, text);
    markParentNoteRead(unrepliedNote.id);
    setInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, selectedStudentId]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-baloo text-[22px] font-extrabold text-stv-navy">Catatan dari Orang Tua</h2>
        <p className="text-[14px] text-stv-muted">
          Pesan dari orang tua tentang kondisi anak, balas langsung di sini.
        </p>
      </div>

      {/* Student tabs */}
      <div className="flex flex-wrap gap-2">
        {students.map(s => {
          const count = unreadCount(s.id);
          const active = s.id === selectedStudentId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelectedStudentId(s.id)}
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition ${
                active
                  ? 'bg-teal-600 text-white shadow-[0_4px_12px_rgba(13,148,136,.3)]'
                  : 'border border-stv-border bg-white text-stv-body hover:border-teal-400 hover:text-teal-700'
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-100 font-baloo text-[12px] font-bold text-teal-700">
                {s.name.charAt(0)}
              </span>
              {s.name.split(' ')[0]}
              {count > 0 && (
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Chat window */}
      <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_4px_16px_rgba(16,58,107,.08)]">

        {/* Student header */}
        {selectedStudent && (
          <div className="flex items-center gap-3 border-b border-stv-border px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 font-baloo text-[15px] font-bold text-white">
              {selectedStudent.name.charAt(0)}
            </div>
            <div>
              <p className="font-baloo text-[15px] font-bold text-stv-navy">{selectedStudent.name}</p>
              <p className="text-[12px] text-stv-muted">{selectedStudent.kelompok}</p>
            </div>
            {unreadCount(selectedStudent.id) > 0 && (
              <button
                type="button"
                onClick={() => studentNotes.filter(n => !n.readByTeacher).forEach(n => markParentNoteRead(n.id))}
                className="ml-auto flex items-center gap-1.5 rounded-full bg-stv-green-tint px-3 py-1.5 text-[12px] font-bold text-stv-green transition hover:bg-stv-green hover:text-white"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Tandai Semua Dibaca
              </button>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex max-h-[480px] min-h-[280px] flex-col gap-3 overflow-y-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
              <MessageSquare className="h-10 w-10 text-stv-sky-tint" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-stv-navy">Belum ada catatan</p>
              <p className="text-[13px] text-stv-muted">
                Orang tua {selectedStudent?.name.split(' ')[0] ?? ''} belum mengirim catatan apapun.
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isTeacher = msg.type === 'teacher';
              return (
                <div key={msg.id} className={`flex flex-col ${isTeacher ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${
                    isTeacher ? 'rounded-tr-sm bg-teal-50' : 'rounded-tl-sm bg-stv-sky-tint'
                  }`}>
                    <p className={`mb-1 text-[12px] font-bold ${
                      isTeacher ? 'text-teal-700' : 'text-stv-sky-stroke'
                    }`}>
                      {msg.name}
                    </p>
                    <p className="text-[14px] leading-[1.6] text-stv-navy">{msg.text}</p>
                    <p className={`mt-1.5 text-[11px] text-stv-muted ${isTeacher ? 'text-right' : 'text-left'}`}>
                      {formatChatTime(msg.time)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Divider */}
        <div className="h-px bg-stv-border" />

        {/* Input */}
        <div className="flex items-end gap-3 px-4 py-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={unrepliedNote ? 'Tulis balasan untuk orang tua...' : 'Semua pesan sudah dibalas'}
            disabled={!unrepliedNote}
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-stv-border bg-slate-50 px-4 py-3 text-[15px] text-stv-navy placeholder:text-stv-muted-2 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ maxHeight: 120, overflowY: 'auto' }}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || !unrepliedNote}
            aria-label="Kirim balasan"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white shadow-[0_4px_12px_rgba(13,148,136,.3)] transition hover:bg-teal-700 disabled:opacity-40"
          >
            <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

// IlustrasiKegiatan — ilustrasi flat sederhana untuk kartu Susunan Hari.
// Flat (isian), memakai currentColor agar bisa diwarnai per kategori.
import React from 'react';
import type { IkonKey } from './susunanDefault';

export default function IlustrasiKegiatan({ ikon, size = 22 }: { ikon: IkonKey; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' as const, 'aria-hidden': true };
  switch (ikon) {
    case 'bangun':
      return (<svg {...p}><circle cx="12" cy="14" r="4.6" /><rect x="3" y="19.4" width="18" height="1.7" rx=".85" /><g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><line x1="12" y1="4" x2="12" y2="6.2" /><line x1="5.2" y1="7" x2="6.7" y2="8.5" /><line x1="18.8" y1="7" x2="17.3" y2="8.5" /></g></svg>);
    case 'makan':
      return (<svg {...p}><circle cx="12" cy="12" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.9" /><circle cx="12" cy="12" r="2.4" /></svg>);
    case 'mandi':
      return (<svg {...p}><path d="M12 3.2c3 3.9 5 6.4 5 8.9a5 5 0 0 1-10 0c0-2.5 2-5 5-8.9z" /></svg>);
    case 'main':
      return (<svg {...p}><rect x="3.5" y="11" width="7" height="7" rx="1.3" /><rect x="13.5" y="11" width="7" height="7" rx="1.3" /><rect x="8.5" y="3.6" width="7" height="7" rx="1.3" /></svg>);
    case 'buku':
      return (<svg {...p}><path d="M12 6.3C10 5 7.5 4.7 5 5.3v12c2.5-.6 5-.3 7 1 2-1.3 4.5-1.6 7-1v-12c-2.5-.6-5-.3-7 1z" /></svg>);
    case 'sup':
      return (<svg {...p}><path d="M4 12h16a8 8 0 0 1-16 0z" /><g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"><path d="M9 4c-.8 1 .8 2 0 3" /><path d="M13 4c-.8 1 .8 2 0 3" /></g></svg>);
    case 'tidurSiang':
      return (<svg {...p}><path d="M20 14.6A8 8 0 1 1 9.4 4 6.5 6.5 0 0 0 20 14.6z" /></svg>);
    case 'kopi':
      return (<svg {...p}><path d="M5 7.5h11v5.5a5 5 0 0 1-11 0z" /><path d="M16 8.6h2.4a2 2 0 0 1 0 4H16" fill="none" stroke="currentColor" strokeWidth="1.7" /><rect x="5" y="19" width="11" height="1.6" rx=".8" /></svg>);
    case 'luar':
      return (<svg {...p}><circle cx="12" cy="9" r="5.4" /><rect x="11" y="13" width="2" height="7.2" rx="1" /></svg>);
    case 'beres':
      return (<svg {...p}><path d="M4.4 9h15.2l-1.4 9.4a1.5 1.5 0 0 1-1.5 1.3H7.3a1.5 1.5 0 0 1-1.5-1.3z" /><rect x="3" y="6.4" width="18" height="3" rx="1" /></svg>);
    case 'gigi':
      return (<svg {...p}><path d="M12 3.4c-3 0-5 1.5-5 4.4 0 2 .6 3.4 1.1 6.1.4 1.9.6 4.4 1.7 4.4 1 0 1-2.3 1.2-2.3s.2 2.3 1.2 2.3c1.1 0 1.3-2.5 1.7-4.4.5-2.7 1.1-4.1 1.1-6.1 0-2.9-2-4.4-5-4.4z" /></svg>);
    case 'cerita':
      return (<svg {...p}><path d="M11.2 6.4C9.4 5.3 7.2 5 5.2 5.4v11c2-.4 4.2-.1 6 1z" /><path d="M12.8 6.4c1.8-1.1 4-1.4 6-1v11c-2-.4-4.2-.1-6 1z" opacity=".5" /></svg>);
    case 'tidur':
      return (<svg {...p}><path d="M20 14.6A8 8 0 1 1 9.4 4 6.5 6.5 0 0 0 20 14.6z" /><path d="M18 3.4l.6 1.5 1.6.3-1.2 1.1.3 1.6-1.3-.8-1.3.8.3-1.6-1.2-1.1 1.6-.3z" /></svg>);
    default:
      return (<svg {...p}><circle cx="12" cy="12" r="6" /></svg>);
  }
}

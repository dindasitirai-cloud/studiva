-- Rekah — verifikasi migrasi 015 pada Supabase LOKAL (jalankan setelah `supabase db reset`)
-- Perintah:  supabase db query --file verify-015.sql
-- (Tanpa perintah psql seperti \pset — hanya SQL murni, agar cocok dengan `db query`.)
SELECT 'journey_tables (harus 11)'       AS check, count(*)::text AS value FROM pg_tables   WHERE tablename LIKE 'rekah_journey_%'
UNION ALL SELECT 'rls_policies (harus 31)',        count(*)::text FROM pg_policies WHERE tablename LIKE 'rekah_journey_%'
UNION ALL SELECT 'append_rpc (harus 1)',           count(*)::text FROM pg_proc    WHERE proname='rekah_journey_append_event'
UNION ALL SELECT 'is_family_member fn (harus 1)',  count(*)::text FROM pg_proc    WHERE proname='rekah_journey_is_family_member'
UNION ALL SELECT 'immutability_triggers (harus 2)',count(*)::text FROM pg_trigger t JOIN pg_class c ON t.tgrelid=c.oid
                                                    WHERE c.relname LIKE 'rekah_journey_%' AND NOT t.tgisinternal
UNION ALL SELECT 'ownership orang_tua->auth (harus t)',
  (SELECT (count(*)>0)::text FROM information_schema.table_constraints tc
     JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name=ccu.constraint_name
    WHERE tc.table_name='orang_tua' AND tc.constraint_type='FOREIGN KEY' AND ccu.table_name='users');

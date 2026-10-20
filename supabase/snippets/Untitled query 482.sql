-- Jadikan akun Fitri sebagai Peninjau Klinis (psikolog)
update auth.users
set raw_app_meta_data =
  coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'peninjau_klinis')
where email = 'fitri@rekah.id';   -- GANTI dengan email Fitri
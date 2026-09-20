select id, judul, author_nama, status, dibuat_pada from forum_thread order by dibuat_pada desc limit 5;
select id, thread_id, isi from forum_balasan order by dibuat_pada desc limit 5;
#!/usr/bin/env bash
# Rekah — Phase 10S gates #9/#10/#11/#12 via REAL authenticated HTTP (user JWT → PostgREST → RLS).
# Runs entirely against LOCAL Supabase. Never touches production. Run from the repo root.
set -uo pipefail
PASS=0; FAIL=0
ok(){ echo "  ✅ PASS: $1"; PASS=$((PASS+1)); }
no(){ echo "  ❌ FAIL: $1"; FAIL=$((FAIL+1)); }

echo "== ambil kredensial Supabase lokal =="
ENV=$(supabase status -o env) || { echo "supabase belum jalan? jalankan 'supabase start'"; exit 1; }
API=$(echo "$ENV" | sed -n 's/^API_URL="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p')
ANON=$(echo "$ENV" | sed -n 's/^ANON_KEY="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p')
SERVICE=$(echo "$ENV" | sed -n 's/^SERVICE_ROLE_KEY="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p')
[ -z "$API" ] && API="http://127.0.0.1:54321"
echo "API=$API"
case "$API" in *supabase.co*) echo "BAHAYA: URL tampak produksi. BERHENTI."; exit 1;; esac

jqget(){ python3 -c "import sys,json;d=json.load(sys.stdin);print(d$1)" 2>/dev/null; }

echo "== pastikan user B ada (buat via admin API bila belum) =="
curl -s -X POST "$API/auth/v1/admin/users" -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE" \
  -H "Content-Type: application/json" \
  -d '{"email":"b@uji.test","password":"Uji12345!","email_confirm":true}' >/dev/null

echo "== ambil family_id A & B =="
USERS=$(curl -s "$API/auth/v1/admin/users" -H "apikey: $SERVICE" -H "Authorization: Bearer $SERVICE")
A_ID=$(echo "$USERS" | python3 -c "import sys,json;u=json.load(sys.stdin)['users'];print(next(x['id'] for x in u if x['email']=='a@uji.test'))")
B_ID=$(echo "$USERS" | python3 -c "import sys,json;u=json.load(sys.stdin)['users'];print(next(x['id'] for x in u if x['email']=='b@uji.test'))")
echo "A_ID=$A_ID"; echo "B_ID=$B_ID"
[ -z "$A_ID" ] || [ -z "$B_ID" ] && { echo "gagal ambil id (pastikan a@uji.test & b@uji.test ada)"; exit 1; }

echo "== seed profil+langganan+anak untuk B (idempoten) =="
for SQL in \
 "insert into orang_tua(id,email) values('$B_ID','b@uji.test') on conflict(id) do nothing;" \
 "insert into langganan(id_orang_tua,status,akhir_periode) values('$B_ID','aktif',now()+interval '365 days') on conflict(id_orang_tua) do update set status='aktif',akhir_periode=now()+interval '365 days';" \
 "insert into anak(id_orang_tua,nama_anak,tanggal_lahir) select '$B_ID','Anak B1',date '2024-06-15' where not exists(select 1 from anak where id_orang_tua='$B_ID');" ; do
  echo "$SQL" > /tmp/_s.sql; supabase db query --file /tmp/_s.sql >/dev/null 2>&1
done

echo "== login A & B (JWT asli via GoTrue) =="
login(){ curl -s -X POST "$API/auth/v1/token?grant_type=password" -H "apikey: $ANON" -H "Content-Type: application/json" -d "{\"email\":\"$1\",\"password\":\"$2\"}" | jqget "['access_token']"; }
JWT_A=$(login a@uji.test Uji12345!); JWT_B=$(login b@uji.test Uji12345!)
[ -z "$JWT_A" ] || [ -z "$JWT_B" ] && { echo "login gagal — cek password/konfirmasi user"; exit 1; }
echo "JWT A & B didapat."

hdrA=(-H "apikey: $ANON" -H "Authorization: Bearer $JWT_A")
hdrB=(-H "apikey: $ANON" -H "Authorization: Bearer $JWT_B")

echo ""; echo "===== GATE #9 — RLS FAMILY ISOLATION ====="
# B membaca event keluarga A → harus 0
R=$(curl -s "$API/rest/v1/rekah_journey_event?family_id=eq.$A_ID&select=id" "${hdrB[@]}")
[ "$R" = "[]" ] && ok "B tak bisa baca event A (0 baris)" || no "B membaca event A: $R"
# B append ke stream A → FORBIDDEN
R=$(curl -s -X POST "$API/rest/v1/rpc/rekah_journey_append_event" "${hdrB[@]}" -H "Content-Type: application/json" \
  -d "{\"p_stream_id\":\"$A_ID\",\"p_family_id\":\"$A_ID\",\"p_kind\":\"TRANSITION\",\"p_occurred_at\":\"$(date -u +%FT%TZ)\",\"p_idempotency_key\":\"forge-$RANDOM\",\"p_payload\":{\"x\":1},\"p_expected_sequence\":null}")
echo "$R" | grep -q FORBIDDEN && ok "B append ke A → FORBIDDEN" || no "B append ke A: $R"
# arah sebaliknya: A baca event B → 0
R=$(curl -s "$API/rest/v1/rekah_journey_event?family_id=eq.$B_ID&select=id" "${hdrA[@]}")
[ "$R" = "[]" ] && ok "A tak bisa baca event B (0 baris)" || no "A membaca event B: $R"

echo ""; echo "===== GATE #10 — IMMUTABILITY via HTTP ====="
BEFORE=$(curl -s "$API/rest/v1/rekah_journey_event?family_id=eq.$A_ID&sequence=eq.1&select=payload_json" "${hdrA[@]}")
curl -s -X PATCH "$API/rest/v1/rekah_journey_event?family_id=eq.$A_ID&sequence=eq.1" "${hdrA[@]}" -H "Content-Type: application/json" -d '{"payload_json":{"tamper":1}}' >/dev/null
curl -s -X DELETE "$API/rest/v1/rekah_journey_event?family_id=eq.$A_ID&sequence=eq.1" "${hdrA[@]}" >/dev/null
AFTER=$(curl -s "$API/rest/v1/rekah_journey_event?family_id=eq.$A_ID&sequence=eq.1&select=payload_json" "${hdrA[@]}")
[ "$BEFORE" = "$AFTER" ] && [ "$AFTER" != "[]" ] && ok "event seq1 tak berubah oleh UPDATE/DELETE klien" || no "immutability: before=$BEFORE after=$AFTER"

echo ""; echo "===== GATE #11 — IDEMPOTENCY via HTTP ====="
K="idem10s-$RANDOM"; TS="$(date -u +%FT%TZ)"
rpcA(){ curl -s -X POST "$API/rest/v1/rpc/rekah_journey_append_event" "${hdrA[@]}" -H "Content-Type: application/json" -d "$1"; }
R1=$(rpcA "{\"p_stream_id\":\"$A_ID\",\"p_family_id\":\"$A_ID\",\"p_kind\":\"TRANSITION\",\"p_occurred_at\":\"$TS\",\"p_idempotency_key\":\"$K\",\"p_payload\":{\"demo\":1},\"p_expected_sequence\":null}")
R2=$(rpcA "{\"p_stream_id\":\"$A_ID\",\"p_family_id\":\"$A_ID\",\"p_kind\":\"TRANSITION\",\"p_occurred_at\":\"$TS\",\"p_idempotency_key\":\"$K\",\"p_payload\":{\"demo\":1},\"p_expected_sequence\":null}")
R3=$(rpcA "{\"p_stream_id\":\"$A_ID\",\"p_family_id\":\"$A_ID\",\"p_kind\":\"TRANSITION\",\"p_occurred_at\":\"$TS\",\"p_idempotency_key\":\"$K\",\"p_payload\":{\"demo\":2},\"p_expected_sequence\":null}")
echo "$R1"|grep -q '"OK"' && ok "append#1 → OK" || no "append#1: $R1"
echo "$R2"|grep -q IDEMPOTENT_REPLAY && ok "append#2 (kunci+payload sama) → IDEMPOTENT_REPLAY" || no "append#2: $R2"
echo "$R3"|grep -q PAYLOAD_MISMATCH && ok "append#3 (payload beda) → PAYLOAD_MISMATCH" || no "append#3: $R3"

echo ""; echo "===== GATE #12 — STALE-SEQUENCE CONFLICT via HTTP ====="
LAST=$(curl -s "$API/rest/v1/rekah_journey_event?family_id=eq.$A_ID&select=sequence&order=sequence.desc&limit=1" "${hdrA[@]}" | jqget "[0]['sequence']")
STALE=$((LAST-1))
R=$(rpcA "{\"p_stream_id\":\"$A_ID\",\"p_family_id\":\"$A_ID\",\"p_kind\":\"TRANSITION\",\"p_occurred_at\":\"$(date -u +%FT%TZ)\",\"p_idempotency_key\":\"conf-$RANDOM\",\"p_payload\":{\"x\":1},\"p_expected_sequence\":$STALE}")
echo "$R"|grep -q CONFLICT && ok "expected_sequence basi ($STALE, aktual $LAST) → CONFLICT" || no "conflict: $R"

echo ""; echo "================= RINGKASAN ================="
echo "PASS=$PASS  FAIL=$FAIL"
echo "A_ID=$A_ID"; echo "B_ID=$B_ID"
[ $FAIL -eq 0 ] && echo "SEMUA GATE HTTP (#9/#10/#11/#12) LULUS." || echo "ADA GATE GAGAL — tempel output ke Claude."

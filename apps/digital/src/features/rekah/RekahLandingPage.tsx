import React from 'react';

/*
 * Rekah — Halaman utama (pra-login) di route "/".
 * Desain: sistem brand "Langit Peony". Konten & copy disetujui Raisha
 * (iterasi mockup 2026-09). Ilustrasi botanical = inline SVG statis
 * (di-generate dari registry bunga), tanpa dependensi eksternal.
 * Self-contained: seluruh gaya di-scope lewat <style> di bawah.
 */

const CSS = `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Shantell+Sans:wght@500;600;700&display=swap');
:root{
    --plum:#6E3B57; --pink:#F06BA8; --peony:#F8B9D4; --sky:#8FB8F7;
    --corn:#5F84E6; --lilac:#C9B8F0; --butter:#FFE29A;
    --cream:#FFF3E6; --cream2:#FFF6EC; --page:#FBF3E6; --pinklight:#FCE3EE;
    --sky-soft:#E4EFFD; --lilac-soft:#F1ECFB;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth}
  body{margin:0;background:var(--page);font-family:'Nunito',sans-serif;color:var(--plum);-webkit-font-smoothing:antialiased}
  a{color:inherit;text-decoration:none}
  h1,h2,h3,h4{font-family:'Fredoka',sans-serif;font-weight:700;margin:0;line-height:1.05}
  p{margin:0}
  .wrap{max-width:1180px;margin:0 auto;padding:0 clamp(20px,4vw,40px)}
  .btn{font-family:'Nunito',sans-serif;font-weight:800;font-size:16px;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;border-radius:28px;transition:transform .15s ease, box-shadow .15s ease}
  .btn:hover{transform:translateY(-2px)}
  .btn-pink{color:#fff;background:var(--pink);padding:14px 30px;box-shadow:0 14px 26px -12px rgba(240,107,168,.85)}
  .btn-outline{color:var(--pink);background:transparent;border:2px solid var(--pink);padding:12px 26px}
  .btn-ghost{color:var(--corn);background:transparent;padding:12px 12px}
  @keyframes sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
  .sway{animation:sway 8s ease-in-out infinite;transform-origin:bottom center}
  .eyebrow{font-family:'Shantell Sans',cursive;font-weight:700;font-size:20px;color:var(--pink)}
  section{scroll-margin-top:80px}

  /* NAV */
  header{position:sticky;top:0;z-index:50;background:rgba(251,243,230,.86);backdrop-filter:blur(10px);border-bottom:1px solid rgba(110,59,87,.08)}
  .nav{display:flex;align-items:center;justify-content:space-between;padding-top:14px;padding-bottom:14px}
  .logo{font-family:'Fredoka',sans-serif;font-weight:700;font-size:28px;color:var(--pink);display:flex;align-items:center;gap:9px}
  .logo .mark{width:34px;height:34px}
  .nav-links{display:flex;gap:26px;align-items:center}
  .nav-links a{font-weight:700;font-size:15px;opacity:.78}
  .nav-links a:hover{opacity:1;color:var(--pink)}
  .nav-cta{display:flex;align-items:center;gap:8px}

  /* HERO */
  .hero{display:grid;grid-template-columns:1.15fr 1fr;gap:clamp(24px,4vw,56px);align-items:center;padding-top:clamp(36px,6vw,72px);padding-bottom:30px}
  .hero h1{font-size:60px;color:var(--plum)}
  .hero .sub{font-size:19px;line-height:1.55;opacity:.82;max-width:520px;margin-top:6px}
  .hero-cta{display:flex;gap:14px;flex-wrap:wrap;margin-top:6px}
  .hero-note{font-size:13px;opacity:.6;margin-top:2px}
  .hero-col{display:flex;flex-direction:column;gap:18px}
  .hero-art{position:relative;height:340px}
  .hero-art>div{position:absolute;bottom:0}

  /* PRINCIPLES STRIP */
  .strip{background:var(--pinklight);border-radius:26px;padding:22px 30px;margin-top:12px;display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
  .strip-lead{font-weight:800;font-size:15px;max-width:280px;line-height:1.4}
  .strip-items{display:flex;gap:14px;flex-wrap:wrap}
  .pill{display:flex;align-items:center;gap:9px;background:#fff;border-radius:22px;padding:9px 16px;font-weight:700;font-size:13.5px}
  .pill .dot{width:10px;height:10px;border-radius:50%;flex:none}

  /* IDEA */
  .idea{text-align:center;padding-top:76px;padding-bottom:8px;max-width:820px;margin:0 auto}
  .idea h2{font-size:44px;color:var(--plum);margin-top:10px}
  .idea .q{color:var(--pink)}
  .idea p{font-size:18px;line-height:1.65;opacity:.82;margin-top:18px}

  /* SECTION HEAD */
  .sec-head{margin-bottom:8px}
  .sec-head h2{font-size:36px;margin-top:8px}
  .sec-head .lead{font-size:16px;line-height:1.6;opacity:.78;margin-top:8px;max-width:640px}

  /* STAGES */
  .stages{display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-top:26px}
  .stage{border-radius:20px;padding:22px 18px;display:flex;flex-direction:column;gap:9px}
  .stage .chip{width:34px;height:34px;border-radius:12px}
  .stage .age{font-family:'Fredoka',sans-serif;font-weight:700;font-size:18px}
  .stage .t{font-weight:800;font-size:14px}
  .stage .b{font-size:13px;line-height:1.45;opacity:.68}

  /* FEATURES */
  .feats{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-top:28px}
  .fcard{background:#fff;border-radius:22px;padding:28px;display:flex;flex-direction:column;gap:12px;box-shadow:0 24px 50px -40px rgba(90,50,70,.55)}
  .fcard.center{border:2px solid var(--pink);background:#FFFCF8}
  .fcard .ic{width:58px;height:86px}
  .fhead{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  .ftag{font-family:'Fredoka',sans-serif;font-weight:700;font-size:13px;letter-spacing:.5px;color:var(--corn)}
  .badge{font-family:'Nunito',sans-serif;font-weight:800;font-size:11px;color:#fff;background:var(--pink);padding:3px 11px;border-radius:20px;letter-spacing:.4px}
  .fcard h3{font-size:23px;line-height:1.12}
  .fcard .intro{font-size:14.5px;line-height:1.6;opacity:.8}
  .fsub{display:flex;flex-direction:column;gap:10px;margin-top:2px;border-top:1px solid rgba(110,59,87,.1);padding-top:16px}
  .fsub .s{font-size:13.5px;line-height:1.55}
  .fsub .s b{color:var(--pink)}

  /* DOMAINS */
  .domains{background:#fff;border-radius:26px;padding:38px 34px;margin-top:30px;box-shadow:0 24px 50px -42px rgba(90,50,70,.5)}
  .domblock{margin-top:30px}
  .domblock:first-of-type{margin-top:22px}
  .bh{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:5px}
  .bh .name{font-family:'Fredoka',sans-serif;font-weight:700;font-size:20px}
  .bh .count{font-weight:800;font-size:11.5px;color:#fff;background:var(--sky);padding:3px 11px;border-radius:20px}
  .bd{font-size:14px;opacity:.76;line-height:1.55;margin-bottom:14px;max-width:660px}
  .dgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
  .dcard{display:flex;gap:12px;align-items:flex-start;background:var(--cream);border-radius:14px;padding:14px 16px}
  .dcard .d{width:12px;height:12px;border-radius:50%;margin-top:5px;flex:none}
  .dcard h4{font-size:15px}
  .dcard p{font-size:12.5px;line-height:1.42;opacity:.72;margin-top:3px}
  .chips{display:flex;flex-wrap:wrap;gap:10px}
  .chip2{background:var(--cream);border:1.5px solid var(--peony);border-radius:20px;padding:8px 15px;font-weight:700;font-size:13px}
  .chip-hi{background:#FFF7DF;border-color:var(--butter)}
  .dk{display:flex;gap:12px;align-items:flex-start;background:#FFF7DF;border:1.5px solid var(--butter);border-radius:14px;padding:15px 18px;margin-top:12px}
  .dk .d{width:12px;height:12px;border-radius:50%;margin-top:5px;flex:none;background:#E8A33C}
  .dk h4{font-size:15px}
  .dk p{font-size:13px;line-height:1.5;opacity:.78;margin-top:3px}

  /* STEPS */
  .steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:28px}
  .step{background:var(--cream2);border-radius:22px;padding:28px 26px}
  .step .n{font-family:'Fredoka',sans-serif;font-weight:700;font-size:20px;width:44px;height:44px;border-radius:50%;background:var(--pink);color:#fff;display:flex;align-items:center;justify-content:center}
  .step h3{font-size:20px;margin-top:16px}
  .step p{font-size:14.5px;line-height:1.6;opacity:.78;margin-top:8px}

  /* DNA */
  .dna{background:var(--plum);border-radius:30px;padding:52px 48px;margin-top:36px;color:#fff;position:relative;overflow:hidden}
  .dna .eyebrow{color:var(--peony)}
  .dna h2{color:#fff;font-size:36px;margin-top:8px}
  .dna .lead{opacity:.85;font-size:16px;line-height:1.6;margin-top:10px;max-width:640px}
  .dna-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:30px;position:relative;z-index:2}
  .dna-item{background:rgba(255,255,255,.08);border-radius:18px;padding:22px 24px}
  .dna-item h3{font-size:19px;color:var(--butter)}
  .dna-item p{font-size:14.5px;line-height:1.6;opacity:.9;margin-top:7px}
  .dna-flower{position:absolute;right:30px;top:-10px;width:150px;height:230px;opacity:.9}

  /* QUOTE */
  .quote{background:var(--sky);border-radius:26px;padding:44px 46px;margin-top:36px;display:flex;align-items:center;gap:30px}
  .quote .fl{width:110px;height:165px;flex:none}
  .quote blockquote{margin:0;font-family:'Fredoka',sans-serif;font-weight:600;font-size:27px;line-height:1.28;color:#fff}
  .quote .by{font-weight:800;font-size:14px;color:#fff;opacity:.85;margin-top:14px}

  /* CTA */
  .cta{position:relative;overflow:hidden;background:var(--pinklight);border-radius:30px;padding:58px 44px;text-align:center;margin-top:40px}
  .cta h2{font-size:40px;color:var(--plum);max-width:600px;margin:0 auto}
  .cta p{opacity:.72;font-size:15px;margin-top:12px}
  .cta .btn{margin-top:22px}
  .cta .harga{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:22px}
  .cta .harga span{background:#fff;border-radius:999px;padding:8px 16px;font-weight:800;font-size:14px}
  .cta .harga-link{display:block;margin-top:14px;font-weight:800;font-size:14px;color:var(--pink)}
  .cta .fl{position:absolute;bottom:-6px;width:90px;height:150px}

  /* FOOTER */
  footer{background:var(--plum);color:#fff;margin-top:56px;padding:52px 0 40px}
  .foot{display:flex;justify-content:space-between;gap:36px;flex-wrap:wrap}
  .foot .brand .logo{color:var(--pinklight)}
  .foot .brand .tag{font-family:'Shantell Sans',cursive;font-size:16px;color:var(--peony);margin-top:8px}
  .foot .brand .org{font-size:13px;opacity:.6;margin-top:12px;max-width:260px;line-height:1.5}
  .foot-cols{display:flex;gap:52px;flex-wrap:wrap}
  .foot-col{display:flex;flex-direction:column;gap:9px}
  .foot-col .h{font-family:'Fredoka',sans-serif;font-weight:700;font-size:14px;color:var(--butter)}
  .foot-col a{font-size:13.5px;opacity:.78}
  .foot-col a:hover{opacity:1;color:var(--peony)}
  .disclaimer{max-width:1180px;margin:34px auto 0;padding:0 clamp(20px,4vw,40px);font-size:12.5px;opacity:.55;line-height:1.55}

  /* RESPONSIVE */
  @media (max-width:940px){
    /* Tablet: hero tetap dua kolom, menu tengah disembunyikan supaya tombol tidak terlipat. */
    .nav-links{display:none}
    .nav-cta .btn{white-space:nowrap}
    .hero h1{font-size:46px}
    .hero-art{height:280px}
    .stages{grid-template-columns:repeat(3,1fr)}
    .dgrid{grid-template-columns:1fr 1fr}
    .dna-flower{display:none}
    .quote{flex-direction:column;text-align:center;gap:16px}
  }
  @media (max-width:760px){
    .hero{grid-template-columns:1fr}
    .hero-art{height:240px;order:-1}
    .hero h1{font-size:44px}
    .feats{grid-template-columns:1fr}
    .steps{grid-template-columns:1fr}
    .dna-grid{grid-template-columns:1fr}
  }
  @media (max-width:620px){
    .wrap{padding-left:16px;padding-right:16px}
    .nav-links{display:none}
    .hero h1{font-size:36px}
    .idea h2{font-size:29px}
    .sec-head h2{font-size:27px}
    .dgrid{grid-template-columns:1fr}
    .stages{grid-template-columns:1fr 1fr}
    .dna{padding:38px 26px}
    .dna h2{font-size:27px}
    .quote{padding:32px 26px}
    .quote blockquote{font-size:22px}
    .cta{padding:44px 24px}
    .cta h2{font-size:29px}
    .strip{padding:20px}
    .domains{padding:30px 22px}
    .disclaimer{padding:0 16px}
    .nav-cta{gap:4px}
    .nav-cta .btn{white-space:nowrap;font-size:15px}
    .nav-cta .btn-ghost{color:var(--plum);padding:12px 8px}
    .nav-cta .btn-ghost .panah{display:none}
    .nav-cta .btn-pink{padding:12px 18px}
    .cta{padding:44px 20px 132px}
    .cta .fl{width:64px;height:106px}
    .cta .harga-link{display:inline-flex;align-items:center;min-height:44px}
    .foot-col{gap:0}
    .foot-col a{padding:10px 0;font-size:14px}
    .foot-cols{gap:28px}
  }
  @media (max-width:380px){
    .logo{font-size:22px}
    .nav-cta .btn-pink{padding:11px 14px;font-size:14px}
    .nav-cta .btn-ghost{font-size:14px;padding:11px 6px}
  }`;

const HTML = `<!-- ===================== NAV ===================== -->
<header>
  <div class="wrap nav">
    <a class="logo" href="#top"><span class="mark sway"><img src="/images/logo-rekah-icon.png" alt="Rekah" style="width:100%;height:100%;object-fit:contain;display:block" /></span>rekah</a>
    <nav class="nav-links">
      <a href="#cara">Cara kerja</a>
      <a href="#fitur">Fitur</a>
      <a href="#tahap">Tahap usia</a>
      <a href="#ciri">Ciri khas</a>
      <a href="/pricing">Harga</a>
    </nav>
    <div class="nav-cta">
      <a class="btn btn-ghost" href="/login">Masuk<span class="panah"> →</span></a>
      <a class="btn btn-pink" href="/daftar">Daftar Sekarang</a>
    </div>
  </div>
</header>

<div id="top"></div>

<!-- ===================== HERO ===================== -->
<section class="wrap hero">
  <div class="hero-col">
    <div class="eyebrow">bukan sekadar tahu</div>
    <h1>Tahu saja<br>belum cukup.</h1>
    <p class="sub">Rekah membantumu memahami tumbuh kembang si kecil, lalu menjalankannya lewat langkah kecil setiap hari.</p>
    <div class="hero-cta">
      <a class="btn btn-pink" href="/daftar">Daftar Sekarang</a>
      <a class="btn btn-outline" href="#cara">Lihat cara kerja</a>
    </div>
    <p class="hero-note">Untuk keluarga dengan anak usia 0 sampai 6 tahun.</p>
  </div>
  <div class="hero-art">
    <div class="sway" style="right:36px;width:170px;height:270px"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M50 149 C49 118 50 98 50 82" fill="none" stroke="#6F9E3F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 118 C31 118 21 100 25 84 C41 94 48 106 50 118 Z" fill="#A7C63E" stroke="none"></path><path d="M50 112 C69 112 81 96 77 80 C59 90 52 100 50 112 Z" fill="#8FB84A" stroke="none"></path><path d="M36 80 C33 60 39 46 50 46 C61 46 67 60 64 80 C56 86 44 86 36 80 Z" fill="#F06BA8" stroke="none"></path><path d="M50 46 C56 46 61 56 62 70 C58 68 54 66 50 66 C50 58 50 52 50 46 Z" fill="#F8B9D4" stroke="none"></path><path d="M50 46 C44 46 39 56 38 70 C42 68 46 66 50 66 C50 58 50 52 50 46 Z" fill="#F06BA8" stroke="none"></path></g></svg></div>
    <div class="sway" style="right:172px;width:140px;height:230px"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M50 149 C49 120 50 100 50 86" fill="none" stroke="#6F9E3F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 122 C33 122 23 106 27 92 C43 102 49 111 50 122 Z" fill="#A7C63E" stroke="none"></path><path d="M50 130 C67 130 79 114 75 100 C57 110 52 119 50 130 Z" fill="#8FB84A" stroke="none"></path><circle cx="66" cy="56" r="8.5" fill="#F8B9D4"></circle><circle cx="61.31370849898476" cy="67.31370849898477" r="8.5" fill="#F8B9D4"></circle><circle cx="50" cy="72" r="8.5" fill="#F8B9D4"></circle><circle cx="38.68629150101524" cy="67.31370849898477" r="8.5" fill="#F8B9D4"></circle><circle cx="34" cy="56" r="8.5" fill="#F8B9D4"></circle><circle cx="38.68629150101523" cy="44.68629150101524" r="8.5" fill="#F8B9D4"></circle><circle cx="50" cy="40" r="8.5" fill="#F8B9D4"></circle><circle cx="61.31370849898476" cy="44.68629150101523" r="8.5" fill="#F8B9D4"></circle><circle cx="50" cy="56" r="10" fill="#FFE29A"></circle><circle cx="50" cy="56" r="5" fill="#F06BA8"></circle></g></svg></div>
    <div class="sway" style="right:6px;width:118px;height:190px"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M50 149 C50 122 50 98 50 74" fill="none" stroke="#6F9E3F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 100 C40 96 34 88 31 78" fill="none" stroke="#6F9E3F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 92 C60 88 66 80 69 70" fill="none" stroke="#6F9E3F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 116 C40 114 34 106 33 98 C42 102 48 109 50 116 Z" fill="#A7C63E" stroke="none"></path><circle cx="56" cy="70" r="4" fill="#5F84E6"></circle><circle cx="51.85410196624969" cy="75.70633909777092" r="4" fill="#5F84E6"></circle><circle cx="45.14589803375031" cy="73.52671151375483" r="4" fill="#5F84E6"></circle><circle cx="45.14589803375031" cy="66.47328848624517" r="4" fill="#5F84E6"></circle><circle cx="51.85410196624969" cy="64.29366090222908" r="4" fill="#5F84E6"></circle><circle cx="50" cy="70" r="2.6" fill="#FFE29A"></circle><circle cx="37" cy="74" r="4" fill="#5F84E6"></circle><circle cx="32.85410196624969" cy="79.70633909777092" r="4" fill="#5F84E6"></circle><circle cx="26.145898033750317" cy="77.52671151375483" r="4" fill="#5F84E6"></circle><circle cx="26.145898033750314" cy="70.47328848624517" r="4" fill="#5F84E6"></circle><circle cx="32.85410196624969" cy="68.29366090222908" r="4" fill="#5F84E6"></circle><circle cx="31" cy="74" r="2.6" fill="#FFE29A"></circle><circle cx="75" cy="66" r="4" fill="#5F84E6"></circle><circle cx="70.85410196624969" cy="71.70633909777092" r="4" fill="#5F84E6"></circle><circle cx="64.14589803375031" cy="69.52671151375483" r="4" fill="#5F84E6"></circle><circle cx="64.14589803375031" cy="62.47328848624516" r="4" fill="#5F84E6"></circle><circle cx="70.85410196624969" cy="60.29366090222908" r="4" fill="#5F84E6"></circle><circle cx="69" cy="66" r="2.6" fill="#FFE29A"></circle></g></svg></div>
  </div>
</section>

<!-- ===================== PRINCIPLES STRIP ===================== -->
<div class="wrap">
  <div class="strip">
    <div class="strip-lead">Dirancang bersama psikolog, untuk keluarga Indonesia.</div>
    <div class="strip-items">
      <div class="pill"><span class="dot" style="background:var(--pink)"></span>Merujuk panduan kesehatan anak & riset tepercaya</div>
      <div class="pill"><span class="dot" style="background:var(--sky)"></span>Ditinjau psikolog sebelum tayang</div>
      <div class="pill"><span class="dot" style="background:var(--lilac)"></span>Tanpa membandingkan anak</div>
    </div>
  </div>
</div>

<!-- ===================== CORE IDEA ===================== -->
<section class="wrap idea">
  <div class="eyebrow">satu pertanyaan yang menenangkan</div>
  <h2>“Apa <span class="q">satu hal</span> yang bisa kulakukan untuk anakku hari ini?”</h2>
  <p>Rekah menjawabnya dengan satu ajakan kecil setiap hari, pas untuk usia si kecil dan muat di sela kesibukanmu. Kamu juga tahu apa yang sedang tumbuh pada anakmu.</p>
</section>

<!-- ===================== STAGES ===================== -->
<section id="tahap" class="wrap" style="margin-top:64px">
  <div class="sec-head">
    <div class="eyebrow">tahap demi tahap</div>
    <h2>Menemani tiap fase usia</h2>
    <p class="lead">Isi Rekah menyesuaikan usia si kecil, dari baru lahir sampai 6 tahun.</p>
  </div>
  <div class="stages">
    <div class="stage" style="background:#FCE3EE">
      <div class="chip" style="background:var(--pink)"></div>
      <div class="age">0 sampai 1 thn</div>
      <div class="t">Ikatan &amp; Sensorik</div>
      <div class="b">Sentuhan, suara, dan kontak mata membangun rasa aman.</div>
    </div>
    <div class="stage" style="background:#E4EFFD">
      <div class="chip" style="background:var(--sky)"></div>
      <div class="age">1 sampai 2 thn</div>
      <div class="t">Gerak &amp; Kata Pertama</div>
      <div class="b">Melangkah, menunjuk, meniru; kosakata mulai bermunculan.</div>
    </div>
    <div class="stage" style="background:#F1ECFB">
      <div class="chip" style="background:var(--lilac)"></div>
      <div class="age">2 sampai 3 thn</div>
      <div class="t">Main &amp; Bahasa</div>
      <div class="b">Bermain pura-pura, kalimat pendek, dan rasa ingin tahu yang meledak.</div>
    </div>
    <div class="stage" style="background:#FFF3D9">
      <div class="chip" style="background:#FFC94D"></div>
      <div class="age">3 sampai 4 thn</div>
      <div class="t">Sosial &amp; Emosi</div>
      <div class="b">Berbagi, menunggu giliran, dan mulai mengenali perasaan.</div>
    </div>
    <div class="stage" style="background:#E4EFFD">
      <div class="chip" style="background:var(--corn)"></div>
      <div class="age">4 sampai 6 thn</div>
      <div class="t">Mandiri &amp; Siap Belajar</div>
      <div class="b">Rutinitas, percaya diri, dan dasar bernalar.</div>
    </div>
  </div>
</section>

<!-- ===================== FEATURES (per navbar) ===================== -->
<section id="fitur" class="wrap" style="margin-top:72px">
  <div class="sec-head">
    <div class="eyebrow">yang bisa kamu buka di Rekah</div>
    <h2>Empat ruang, satu alur yang tenang</h2>
    <p class="lead">Bekal untuk tahu, Kelola untuk menata, Temani untuk menjalani, dan Bantu saat butuh pegangan.</p>
  </div>
  <div class="feats">

    <div class="fcard">
      <div class="ic sway"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M64 149 C60 126 48 116 42 104" fill="none" stroke="#6F9E3F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M58 132 C43 132 34 118 38 106 C50 114 55 123 58 132 Z" fill="#A7C63E" stroke="none"></path><circle cx="42" cy="84" r="9" fill="#F06BA8"></circle><circle cx="53.412678195541844" cy="92.29179606750063" r="9" fill="#F06BA8"></circle><circle cx="49.05342302750968" cy="105.70820393249937" r="9" fill="#F06BA8"></circle><circle cx="34.94657697249032" cy="105.70820393249937" r="9" fill="#F06BA8"></circle><circle cx="30.587321804458156" cy="92.29179606750063" r="9" fill="#F06BA8"></circle><circle cx="42" cy="96" r="5.5" fill="#FFE29A"></circle></g></svg></div>
      <div class="fhead"><span class="ftag">BEKAL</span></div>
      <h3>Bekal untuk menemani</h3>
      <p class="intro">Bacaan dan ide sesuai usia si kecil, bisa dibuka kapan saja.</p>
      <div class="fsub">
        <div class="s"><b>Kebiasaan Baik.</b> Kebiasaan kecil yang menumbuhkan nilai keluarga.</div>
        <div class="s"><b>Ajak Main.</b> Ide bermain beserta apa yang sedang dilatih.</div>
        <div class="s"><b>Wawasan Tumbuh.</b> Bacaan singkat tentang apa yang wajar di tiap tahap.</div>
      </div>
    </div>

    <div class="fcard center">
      <div class="ic sway"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M50 149 C49 120 50 100 50 86" fill="none" stroke="#6F9E3F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 122 C33 122 23 106 27 92 C43 102 49 111 50 122 Z" fill="#A7C63E" stroke="none"></path><path d="M50 130 C67 130 79 114 75 100 C57 110 52 119 50 130 Z" fill="#8FB84A" stroke="none"></path><circle cx="66" cy="56" r="8.5" fill="#F8B9D4"></circle><circle cx="61.31370849898476" cy="67.31370849898477" r="8.5" fill="#F8B9D4"></circle><circle cx="50" cy="72" r="8.5" fill="#F8B9D4"></circle><circle cx="38.68629150101524" cy="67.31370849898477" r="8.5" fill="#F8B9D4"></circle><circle cx="34" cy="56" r="8.5" fill="#F8B9D4"></circle><circle cx="38.68629150101523" cy="44.68629150101524" r="8.5" fill="#F8B9D4"></circle><circle cx="50" cy="40" r="8.5" fill="#F8B9D4"></circle><circle cx="61.31370849898476" cy="44.68629150101523" r="8.5" fill="#F8B9D4"></circle><circle cx="50" cy="56" r="10" fill="#FFE29A"></circle><circle cx="50" cy="56" r="5" fill="#F06BA8"></circle></g></svg></div>
      <div class="fhead"><span class="ftag">KELOLA</span><span class="badge">PUSAT</span></div>
      <h3>Tempat semuanya tertata</h3>
      <p class="intro">Mengubah yang kamu baca jadi rencana harian yang ringan, tanpa skor. Semuanya tersimpan di akunmu.</p>
      <div class="fsub">
        <div class="s"><b>Irama Keseharian.</b> Susun pagi, siang, dan malam untuk hari ini dan minggu depan, lengkap dengan daftar Untuk Dikelola.</div>
        <div class="s"><b>Jurnal.</b> Catat cerita, foto, dan hal baru yang terlihat dari si kecil.</div>
        <div class="s"><b>Perjalanan.</b> Pilih nilai fokus pekan ini dan tinjau minggumu dengan lembut.</div>
        <div class="s"><b>Kehidupan Keluarga.</b> Ceritakan keadaan di rumah, Rekah menyesuaikan sarannya. Ada Lembar Nifas dan Piring Ibu untuk ibu baru.</div>
      </div>
    </div>

    <div class="fcard">
      <div class="ic sway"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M22 149 C40 140 52 122 44 100" fill="none" stroke="#6F9E3F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M30 138 C16 134 10 120 14 108 C26 116 30 128 30 138 Z" fill="#A7C63E" stroke="none"></path><path d="M40 118 C55 116 64 104 61 92 C49 100 44 110 40 118 Z" fill="#8FB84A" stroke="none"></path><path d="M44 92 C33 92 30 106 34 116 C37 123 51 123 54 116 C58 106 55 92 44 92 Z" fill="#8FB8F7" stroke="none"></path><circle cx="44" cy="96" r="5" fill="#5F84E6"></circle></g></svg></div>
      <div class="fhead"><span class="ftag">TEMANI</span></div>
      <h3>Ditemani menjalani, bukan cuma tahu</h3>
      <p class="intro">Perjalanan beberapa hari dengan satu langkah kecil setiap hari.</p>
      <div class="fsub">
        <div class="s"><b>Perjalanan bertema.</b> Misalnya tidur lebih tenang, makan lebih santai, atau anak lebih mandiri.</div>
        <div class="s"><b>Progres yang terlihat.</b> Tandai langkah yang sudah dijalani dan lihat sejauh mana kalian melangkah.</div>
      </div>
    </div>

    <div class="fcard">
      <div class="ic sway"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M50 149 C50 122 50 98 50 74" fill="none" stroke="#6F9E3F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 100 C40 96 34 88 31 78" fill="none" stroke="#6F9E3F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 92 C60 88 66 80 69 70" fill="none" stroke="#6F9E3F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 116 C40 114 34 106 33 98 C42 102 48 109 50 116 Z" fill="#A7C63E" stroke="none"></path><circle cx="56" cy="70" r="4" fill="#C9B8F0"></circle><circle cx="51.85410196624969" cy="75.70633909777092" r="4" fill="#C9B8F0"></circle><circle cx="45.14589803375031" cy="73.52671151375483" r="4" fill="#C9B8F0"></circle><circle cx="45.14589803375031" cy="66.47328848624517" r="4" fill="#C9B8F0"></circle><circle cx="51.85410196624969" cy="64.29366090222908" r="4" fill="#C9B8F0"></circle><circle cx="50" cy="70" r="2.6" fill="#F8B9D4"></circle><circle cx="37" cy="74" r="4" fill="#C9B8F0"></circle><circle cx="32.85410196624969" cy="79.70633909777092" r="4" fill="#C9B8F0"></circle><circle cx="26.145898033750317" cy="77.52671151375483" r="4" fill="#C9B8F0"></circle><circle cx="26.145898033750314" cy="70.47328848624517" r="4" fill="#C9B8F0"></circle><circle cx="32.85410196624969" cy="68.29366090222908" r="4" fill="#C9B8F0"></circle><circle cx="31" cy="74" r="2.6" fill="#F8B9D4"></circle><circle cx="75" cy="66" r="4" fill="#C9B8F0"></circle><circle cx="70.85410196624969" cy="71.70633909777092" r="4" fill="#C9B8F0"></circle><circle cx="64.14589803375031" cy="69.52671151375483" r="4" fill="#C9B8F0"></circle><circle cx="64.14589803375031" cy="62.47328848624516" r="4" fill="#C9B8F0"></circle><circle cx="70.85410196624969" cy="60.29366090222908" r="4" fill="#C9B8F0"></circle><circle cx="69" cy="66" r="2.6" fill="#F8B9D4"></circle></g></svg></div>
      <div class="fhead"><span class="ftag">BANTU</span></div>
      <h3>Saat situasi terasa sulit</h3>
      <p class="intro">Pegangan cepat saat butuh arahan atau teman bicara.</p>
      <div class="fsub">
        <div class="s"><b>Panduan situasi.</b> Langkah tenang untuk tantrum, susah tidur, sampai konflik saudara.</div>
        <div class="s"><b>Forum orang tua.</b> Bertanya dan berbagi di ruang yang dijaga hangat.</div>
        <div class="s"><b>Konsultasi psikolog.</b> Sesi terpisah dengan psikolog anak. Bukan layanan darurat.</div>
      </div>
    </div>

  </div>
</section>

<!-- ===================== DOMAINS ===================== -->
<section class="wrap">
  <div class="domains">
    <div class="sec-head">
      <div class="eyebrow">arah di balik setiap materi</div>
      <h2 style="margin-top:8px">Selalu tahu apa yang sedang bertumbuh</h2>
      <p class="lead">Setiap materi di Bekal punya arah yang jelas.</p>
    </div>

    <div class="domblock">
      <div class="bh"><span class="name">Ajak Main</span><span class="count">6 domain perkembangan</span></div>
      <p class="bd">Tiap ide bermain melatih satu dari enam domain.</p>
      <div class="dgrid">
        <div class="dcard"><span class="d" style="background:var(--pink)"></span><div><h4>Motorik Kasar</h4><p>Merangkak, berjalan, melompat.</p></div></div>
        <div class="dcard"><span class="d" style="background:var(--sky)"></span><div><h4>Motorik Halus</h4><p>Menjumput, mencoret, menyusun.</p></div></div>
        <div class="dcard"><span class="d" style="background:var(--corn)"></span><div><h4>Bahasa &amp; Komunikasi</h4><p>Mendengar, bicara, menyampaikan maksud.</p></div></div>
        <div class="dcard"><span class="d" style="background:var(--lilac)"></span><div><h4>Kognitif</h4><p>Mengamati dan memecahkan masalah.</p></div></div>
        <div class="dcard"><span class="d" style="background:#FFC94D"></span><div><h4>Sosial Emosional</h4><p>Mengenali perasaan dan berteman.</p></div></div>
        <div class="dcard"><span class="d" style="background:var(--peony)"></span><div><h4>Kemandirian &amp; Bantu Diri</h4><p>Makan, berpakaian, rutinitas sendiri.</p></div></div>
      </div>
    </div>

    <div class="domblock">
      <div class="bh"><span class="name">Wawasan Tumbuh</span><span class="count">7 domain</span></div>
      <p class="bd">Enam domain yang sama, ditambah satu:</p>
      <div class="dk">
        <span class="d"></span>
        <div>
          <h4>Deteksi Dini &amp; Kebutuhan Khusus</h4>
          <p>Mengenali kapan anak perlu perhatian lebih atau konsultasi. Sebagai arah, bukan label atau diagnosis.</p>
        </div>
      </div>
    </div>

    <div class="domblock">
      <div class="bh"><span class="name">Kebiasaan Baik</span><span class="count">12 nilai keluarga</span></div>
      <p class="bd">Tiap kebiasaan menumbuhkan satu nilai yang keluargamu pilih.</p>
      <div class="chips">
        <span class="chip2">Kejujuran</span>
        <span class="chip2">Syukur</span>
        <span class="chip2">Kasih Sayang</span>
        <span class="chip2">Empati</span>
        <span class="chip2">Kemandirian</span>
        <span class="chip2">Tanggung Jawab</span>
        <span class="chip2">Kesederhanaan</span>
        <span class="chip2">Cinta Ilmu</span>
        <span class="chip2">Sabar</span>
        <span class="chip2">Berbagi</span>
        <span class="chip2">Keberanian</span>
        <span class="chip2">Hormat pada Sesama</span>
      </div>
    </div>
  </div>
</section>

<!-- ===================== HOW IT WORKS ===================== -->
<section id="cara" class="wrap" style="margin-top:72px">
  <div class="sec-head">
    <div class="eyebrow">mudah dimulai</div>
    <h2>Cara kerja Rekah</h2>
    <p class="lead">Tiga langkah tenang, tanpa perlu jadi ahli lebih dulu.</p>
  </div>
  <div class="steps">
    <div class="step">
      <div class="n">1</div>
      <h3>Kenalkan si kecil</h3>
      <p>Isi usia, pendamping, dan nilai keluarga. Bisa untuk lebih dari satu anak.</p>
    </div>
    <div class="step">
      <div class="n">2</div>
      <h3>Dapat satu langkah</h3>
      <p>Tiap hari ada satu ajakan kecil yang pas untuk usianya.</p>
    </div>
    <div class="step">
      <div class="n">3</div>
      <h3>Jalani &amp; rayakan</h3>
      <p>Tata di Kelola, catat di Jurnal, dan lihat kebiasaan baik mekar.</p>
    </div>
  </div>
</section>

<!-- ===================== DNA / KEUNGGULAN ===================== -->
<section id="ciri" class="wrap">
  <div class="dna">
    <div class="dna-flower sway"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M50 149 C49 118 50 98 50 82" fill="none" stroke="#6F9E3F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 118 C31 118 21 100 25 84 C41 94 48 106 50 118 Z" fill="#A7C63E" stroke="none"></path><path d="M50 112 C69 112 81 96 77 80 C59 90 52 100 50 112 Z" fill="#8FB84A" stroke="none"></path><path d="M36 80 C33 60 39 46 50 46 C61 46 67 60 64 80 C56 86 44 86 36 80 Z" fill="#F8B9D4" stroke="none"></path><path d="M50 46 C56 46 61 56 62 70 C58 68 54 66 50 66 C50 58 50 52 50 46 Z" fill="#F06BA8" stroke="none"></path><path d="M50 46 C44 46 39 56 38 70 C42 68 46 66 50 66 C50 58 50 52 50 46 Z" fill="#F8B9D4" stroke="none"></path></g></svg></div>
    <div class="eyebrow">yang membuat Rekah berbeda</div>
    <h2>Menemani, bukan menilai</h2>
    <p class="lead">Setiap anak mekar dengan iramanya sendiri. Prinsip ini ada di setiap sudut Rekah.</p>
    <div class="dna-grid">
      <div class="dna-item">
        <h3>Tanpa membandingkan</h3>
        <p>Anakmu hanya dibandingkan dengan dirinya sendiri kemarin.</p>
      </div>
      <div class="dna-item">
        <h3>Merayakan, bukan mengoreksi</h3>
        <p>Tanpa skor dan rapor merah. Yang ada perayaan langkah kecil.</p>
      </div>
      <div class="dna-item">
        <h3>Ramah untuk semua anak</h3>
        <p>Setiap cara berkomunikasi dihargai, termasuk anak berkebutuhan khusus, tanpa label.</p>
      </div>
      <div class="dna-item">
        <h3>Ditinjau psikolog</h3>
        <p>Isi Rekah ditinjau psikolog dan merujuk sumber tepercaya.</p>
      </div>
    </div>
  </div>
</section>

<!-- ===================== QUOTE / MANIFESTO ===================== -->
<section class="wrap">
  <div class="quote">
    <div class="fl sway"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M50 149 C49 118 50 98 50 82" fill="none" stroke="#6F9E3F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 118 C31 118 21 100 25 84 C41 94 48 106 50 118 Z" fill="#A7C63E" stroke="none"></path><path d="M50 112 C69 112 81 96 77 80 C59 90 52 100 50 112 Z" fill="#8FB84A" stroke="none"></path><path d="M36 80 C33 60 39 46 50 46 C61 46 67 60 64 80 C56 86 44 86 36 80 Z" fill="#ffffff" stroke="none"></path><path d="M50 46 C56 46 61 56 62 70 C58 68 54 66 50 66 C50 58 50 52 50 46 Z" fill="#F8B9D4" stroke="none"></path><path d="M50 46 C44 46 39 56 38 70 C42 68 46 66 50 66 C50 58 50 52 50 46 Z" fill="#ffffff" stroke="none"></path></g></svg></div>
    <div>
      <blockquote>“Setiap anak mekar dengan waktunya sendiri. Tugas kita bukan mempercepat, melainkan menemani.”</blockquote>
      <div class="by">Filosofi Rekah</div>
    </div>
  </div>
</section>

<!-- ===================== CTA ===================== -->
<section id="daftar" class="wrap">
  <div class="cta">
    <div class="fl sway" style="left:24px"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M50 149 C50 122 50 98 50 74" fill="none" stroke="#6F9E3F" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 100 C40 96 34 88 31 78" fill="none" stroke="#6F9E3F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 92 C60 88 66 80 69 70" fill="none" stroke="#6F9E3F" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 116 C40 114 34 106 33 98 C42 102 48 109 50 116 Z" fill="#A7C63E" stroke="none"></path><circle cx="56" cy="70" r="4" fill="#F06BA8"></circle><circle cx="51.85410196624969" cy="75.70633909777092" r="4" fill="#F06BA8"></circle><circle cx="45.14589803375031" cy="73.52671151375483" r="4" fill="#F06BA8"></circle><circle cx="45.14589803375031" cy="66.47328848624517" r="4" fill="#F06BA8"></circle><circle cx="51.85410196624969" cy="64.29366090222908" r="4" fill="#F06BA8"></circle><circle cx="50" cy="70" r="2.6" fill="#FFE29A"></circle><circle cx="37" cy="74" r="4" fill="#F06BA8"></circle><circle cx="32.85410196624969" cy="79.70633909777092" r="4" fill="#F06BA8"></circle><circle cx="26.145898033750317" cy="77.52671151375483" r="4" fill="#F06BA8"></circle><circle cx="26.145898033750314" cy="70.47328848624517" r="4" fill="#F06BA8"></circle><circle cx="32.85410196624969" cy="68.29366090222908" r="4" fill="#F06BA8"></circle><circle cx="31" cy="74" r="2.6" fill="#FFE29A"></circle><circle cx="75" cy="66" r="4" fill="#F06BA8"></circle><circle cx="70.85410196624969" cy="71.70633909777092" r="4" fill="#F06BA8"></circle><circle cx="64.14589803375031" cy="69.52671151375483" r="4" fill="#F06BA8"></circle><circle cx="64.14589803375031" cy="62.47328848624516" r="4" fill="#F06BA8"></circle><circle cx="70.85410196624969" cy="60.29366090222908" r="4" fill="#F06BA8"></circle><circle cx="69" cy="66" r="2.6" fill="#FFE29A"></circle></g></svg></div>
    <div class="fl sway" style="right:24px"><svg viewBox="0 0 100 150" style="width:100%;height:100%;display:block;overflow:visible"><g><path d="M50 149 C49 120 50 100 50 86" fill="none" stroke="#6F9E3F" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"></path><path d="M50 122 C33 122 23 106 27 92 C43 102 49 111 50 122 Z" fill="#A7C63E" stroke="none"></path><path d="M50 130 C67 130 79 114 75 100 C57 110 52 119 50 130 Z" fill="#8FB84A" stroke="none"></path><circle cx="66" cy="56" r="8.5" fill="#5F84E6"></circle><circle cx="61.31370849898476" cy="67.31370849898477" r="8.5" fill="#5F84E6"></circle><circle cx="50" cy="72" r="8.5" fill="#5F84E6"></circle><circle cx="38.68629150101524" cy="67.31370849898477" r="8.5" fill="#5F84E6"></circle><circle cx="34" cy="56" r="8.5" fill="#5F84E6"></circle><circle cx="38.68629150101523" cy="44.68629150101524" r="8.5" fill="#5F84E6"></circle><circle cx="50" cy="40" r="8.5" fill="#5F84E6"></circle><circle cx="61.31370849898476" cy="44.68629150101523" r="8.5" fill="#5F84E6"></circle><circle cx="50" cy="56" r="10" fill="#FFE29A"></circle><circle cx="50" cy="56" r="5" fill="#8FB8F7"></circle></g></svg></div>
    <h2>Mulai temani tumbuh kembang si kecil hari ini.</h2>
    <p>Satu langkah kecil setiap hari, tanpa membandingkan.</p>
    <div class="harga" aria-label="Harga langganan Rekah">
      <span>Bulanan Rp79.000</span>
      <span>3 Bulan Rp200.000</span>
      <span>Tahunan Rp650.000</span>
    </div>
    <a class="btn btn-pink" href="/daftar">Daftar Sekarang</a>
    <a class="harga-link" href="/pricing">Lihat detail paket &amp; harga</a>
  </div>
</section>

<!-- ===================== FOOTER ===================== -->
<footer>
  <div class="wrap foot">
    <div class="brand">
      <div class="logo"><span class="mark" style="width:30px;height:30px"><img src="/images/logo-rekah-icon.png" alt="Rekah" style="width:100%;height:100%;object-fit:contain;display:block" /></span>rekah</div>
      <div class="tag">tumbuh &amp; mekar bersama</div>
      <div class="org">Sebuah produk Studiva · Bukittinggi, Sumatra Barat.</div>
    </div>
    <div class="foot-cols">
      <div class="foot-col">
        <div class="h">Fitur</div>
        <a href="#fitur">Bekal</a>
        <a href="#fitur">Kelola</a>
        <a href="#fitur">Temani</a>
        <a href="#fitur">Bantu</a>
      </div>
      <div class="foot-col">
        <div class="h">Rekah</div>
        <a href="/tentang">Tentang kami</a>
        <a href="#">Basis ilmiah</a>
        <a href="#ciri">Nilai kami</a>
      </div>
      <div class="foot-col">
        <div class="h">Bantuan</div>
        <a href="#">Pusat bantuan</a>
        <a href="#">Privasi</a>
        <a href="/kontak">Kontak</a>
      </div>
    </div>
  </div>
  <div class="disclaimer">Rekah adalah panduan pendampingan tumbuh kembang, bukan layanan medis darurat, dan tidak menggantikan pemeriksaan tenaga kesehatan. Konsultasi psikolog tersedia terpisah, bersifat non-darurat dan non-diagnostik.</div>
</footer>`;

export default function RekahLandingPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </>
  );
}

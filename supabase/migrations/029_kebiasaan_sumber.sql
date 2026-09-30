-- 029_kebiasaan_sumber.sql
-- Sumber rujukan untuk setiap Kebiasaan Baik (tampil sebagai tautan yang bisa diklik orang tua).
-- • Kolom baru kebiasaan_baik.sumber (beberapa sumber dipisah "; ").
-- • Isi awal 77 kebiasaan yang ada: pedoman AAP/CDC/Harvard/ZERO TO THREE & riset ditelaah sejawat
--   (diverifikasi September 2026). Hanya mengisi baris yang sumbernya masih kosong — suntingan admin aman.
-- • terapkan_kebiasaan ikut menyimpan sumber dari draf.
-- Idempoten. Jalankan SETELAH 026.

ALTER TABLE kebiasaan_baik ADD COLUMN IF NOT EXISTS sumber TEXT NOT NULL DEFAULT '';

UPDATE kebiasaan_baik k SET sumber = v.sumber
FROM (VALUES
  ('kb-001', 'Harvard Center on the Developing Child — Serve and Return. https://developingchild.harvard.edu/key-concepts/serve-and-return/'),
  ('kb-002', 'AAP HealthyChildren.org — Responding to Your Baby''s Cries. https://www.healthychildren.org/English/ages-stages/baby/crying-colic/Pages/Responding-to-Your-Babys-Cries.aspx; Harvard Center on the Developing Child — Serve and Return. https://developingchild.harvard.edu/key-concepts/serve-and-return/'),
  ('kb-003', 'Field, T. (2019). Pediatric Massage Therapy Research: A Narrative Review. Children, 6(6), 78. https://doi.org/10.3390/children6060078'),
  ('kb-004', 'Harvard Center on the Developing Child — Serve and Return. https://developingchild.harvard.edu/key-concepts/serve-and-return/'),
  ('kb-005', 'Harvard Center on the Developing Child — Serve and Return. https://developingchild.harvard.edu/key-concepts/serve-and-return/'),
  ('kb-006', 'Mindell, J. A. & Williamson, A. A. (2018). Benefits of a bedtime routine in young children. Sleep Medicine Reviews, 40. https://pubmed.ncbi.nlm.nih.gov/29195725/'),
  ('kb-007', 'AAP (2014). Literacy Promotion: An Essential Component of Primary Care Pediatric Practice. Pediatrics, 134(2). https://pubmed.ncbi.nlm.nih.gov/24962987/'),
  ('kb-008', 'Yogman, M. dkk. (2018). The Power of Play: A Pediatric Role in Enhancing Development in Young Children. Pediatrics, 142(3). https://doi.org/10.1542/peds.2018-2058'),
  ('kb-009', 'Harvard Center on the Developing Child — Serve and Return. https://developingchild.harvard.edu/key-concepts/serve-and-return/'),
  ('kb-010', 'AAP HealthyChildren.org — Back to Sleep, Tummy to Play. https://www.healthychildren.org/English/ages-stages/baby/sleep/Pages/back-to-sleep-tummy-to-play.aspx'),
  ('kb-011', 'Warneken, F. & Tomasello, M. (2006). Altruistic Helping in Human Infants and Young Chimpanzees. Science, 311. https://doi.org/10.1126/science.1121448'),
  ('kb-012', 'AAP HealthyChildren.org — Benefits of Family Meals: Eat Together, Thrive Together. https://www.healthychildren.org/English/family-life/family-dynamics/Pages/family-meals-eat-together-thrive-together.aspx'),
  ('kb-013', 'Yogman, M. dkk. (2018). The Power of Play: A Pediatric Role in Enhancing Development in Young Children. Pediatrics, 142(3). https://doi.org/10.1542/peds.2018-2058'),
  ('kb-014', 'Aknin, L. B., Hamlin, J. K. & Dunn, E. W. (2012). Giving Leads to Happiness in Young Children. PLoS ONE, 7(6). https://doi.org/10.1371/journal.pone.0039211'),
  ('kb-015', 'Yogman, M. dkk. (2018). The Power of Play: A Pediatric Role in Enhancing Development in Young Children. Pediatrics, 142(3). https://doi.org/10.1542/peds.2018-2058'),
  ('kb-016', 'Tomasello, M. & Farrar, M. J. (1986). Joint attention and early language. Child Development, 57(6). https://pubmed.ncbi.nlm.nih.gov/3802971/'),
  ('kb-017', 'Aknin, L. B., Hamlin, J. K. & Dunn, E. W. (2012). Giving Leads to Happiness in Young Children. PLoS ONE, 7(6). https://doi.org/10.1371/journal.pone.0039211'),
  ('kb-018', 'AAP HealthyChildren.org — Self-Feeding. https://www.healthychildren.org/English/ages-stages/toddler/nutrition/Pages/Self-Feeding.aspx; Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822'),
  ('kb-019', 'Kuo, M., Barnes, M. & Jordan, C. (2019). Do Experiences With Nature Promote Learning? Frontiers in Psychology, 10. https://doi.org/10.3389/fpsyg.2019.00305'),
  ('kb-020', 'ZERO TO THREE — Helping Young Children With Sharing. https://www.zerotothree.org/resource/helping-young-children-with-sharing/'),
  ('kb-021', 'CDC — Learn the Signs. Act Early. (tahapan perkembangan). https://www.cdc.gov/act-early/'),
  ('kb-022', 'Warneken, F. & Tomasello, M. (2006). Altruistic Helping in Human Infants and Young Chimpanzees. Science, 311. https://doi.org/10.1126/science.1121448; Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822'),
  ('kb-023', 'CDC — Tips for Praise, Imitation, and Description (Essentials for Parenting Toddlers). https://www.cdc.gov/parenting-toddlers/communication/praise.html'),
  ('kb-024', 'AAP (2014). Literacy Promotion: An Essential Component of Primary Care Pediatric Practice. Pediatrics, 134(2). https://pubmed.ncbi.nlm.nih.gov/24962987/'),
  ('kb-025', 'Aknin, L. B., Hamlin, J. K. & Dunn, E. W. (2012). Giving Leads to Happiness in Young Children. PLoS ONE, 7(6). https://doi.org/10.1371/journal.pone.0039211'),
  ('kb-026', 'CDC — Learn the Signs. Act Early. (tahapan perkembangan). https://www.cdc.gov/act-early/'),
  ('kb-027', 'ZERO TO THREE — How to Help Children Develop Self-Control. https://www.zerotothree.org/resource/help-your-child-develop-self-control/'),
  ('kb-028', 'CDC — Tips for Praise, Imitation, and Description (Essentials for Parenting Toddlers). https://www.cdc.gov/parenting-toddlers/communication/praise.html'),
  ('kb-029', 'Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822'),
  ('kb-030', 'ZERO TO THREE — How to Help Children Develop Self-Control. https://www.zerotothree.org/resource/help-your-child-develop-self-control/'),
  ('kb-031', 'Hussong, A. M. dkk. (2021). Parenting and the development of children''s gratitude. Child Development Perspectives. https://doi.org/10.1111/cdep.12434; Mindell, J. A. & Williamson, A. A. (2018). Benefits of a bedtime routine in young children. Sleep Medicine Reviews, 40. https://pubmed.ncbi.nlm.nih.gov/29195725/'),
  ('kb-032', 'Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822; Kuo, M., Barnes, M. & Jordan, C. (2019). Do Experiences With Nature Promote Learning? Frontiers in Psychology, 10. https://doi.org/10.3389/fpsyg.2019.00305'),
  ('kb-033', 'ZERO TO THREE — How to Help Your Child Develop Empathy. https://www.zerotothree.org/resource/how-to-help-your-child-develop-empathy/; Yogman, M. dkk. (2018). The Power of Play: A Pediatric Role in Enhancing Development in Young Children. Pediatrics, 142(3). https://doi.org/10.1542/peds.2018-2058'),
  ('kb-034', 'Harvard Center on the Developing Child — Executive Function & Self-Regulation. https://developingchild.harvard.edu/key-concept/executive-function/'),
  ('kb-035', 'Talwar, V., Arruda, C. & Yachison, S. (2015). The effects of punishment and appeals for honesty on children''s truth-telling behavior. Journal of Experimental Child Psychology, 130. https://pubmed.ncbi.nlm.nih.gov/25447716/'),
  ('kb-036', 'ZERO TO THREE — Tips for Promoting Social-Emotional Development in Infants and Toddlers. https://www.zerotothree.org/resource/tips-for-promoting-social-emotional-development/'),
  ('kb-037', 'Hussong, A. M. dkk. (2021). Parenting and the development of children''s gratitude. Child Development Perspectives. https://doi.org/10.1111/cdep.12434; AAP HealthyChildren.org — Benefits of Family Meals: Eat Together, Thrive Together. https://www.healthychildren.org/English/family-life/family-dynamics/Pages/family-meals-eat-together-thrive-together.aspx'),
  ('kb-038', 'ZERO TO THREE — Helping Young Children With Sharing. https://www.zerotothree.org/resource/helping-young-children-with-sharing/'),
  ('kb-039', 'Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822'),
  ('kb-040', 'Lee, K. dkk. (2014). Can Classic Moral Stories Promote Honesty in Children? Psychological Science, 25(8). https://pubmed.ncbi.nlm.nih.gov/24928424/'),
  ('kb-041', 'Hussong, A. M. dkk. (2021). Parenting and the development of children''s gratitude. Child Development Perspectives. https://doi.org/10.1111/cdep.12434'),
  ('kb-042', 'Aknin, L. B., Hamlin, J. K. & Dunn, E. W. (2012). Giving Leads to Happiness in Young Children. PLoS ONE, 7(6). https://doi.org/10.1371/journal.pone.0039211'),
  ('kb-043', 'Kuo, M., Barnes, M. & Jordan, C. (2019). Do Experiences With Nature Promote Learning? Frontiers in Psychology, 10. https://doi.org/10.3389/fpsyg.2019.00305; Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822'),
  ('kb-044', 'Yogman, M. dkk. (2018). The Power of Play: A Pediatric Role in Enhancing Development in Young Children. Pediatrics, 142(3). https://doi.org/10.1542/peds.2018-2058; ZERO TO THREE — How to Help Your Child Develop Empathy. https://www.zerotothree.org/resource/how-to-help-your-child-develop-empathy/'),
  ('kb-045', 'ZERO TO THREE — Tips for Promoting Social-Emotional Development in Infants and Toddlers. https://www.zerotothree.org/resource/tips-for-promoting-social-emotional-development/'),
  ('kb-046', 'Harvard Center on the Developing Child — Executive Function & Self-Regulation. https://developingchild.harvard.edu/key-concept/executive-function/; Yogman, M. dkk. (2018). The Power of Play: A Pediatric Role in Enhancing Development in Young Children. Pediatrics, 142(3). https://doi.org/10.1542/peds.2018-2058'),
  ('kb-047', 'Yogman, M. dkk. (2018). The Power of Play: A Pediatric Role in Enhancing Development in Young Children. Pediatrics, 142(3). https://doi.org/10.1542/peds.2018-2058'),
  ('kb-048', 'Yogman, M. dkk. (2018). The Power of Play: A Pediatric Role in Enhancing Development in Young Children. Pediatrics, 142(3). https://doi.org/10.1542/peds.2018-2058'),
  ('kb-049', 'Aknin, L. B., Hamlin, J. K. & Dunn, E. W. (2012). Giving Leads to Happiness in Young Children. PLoS ONE, 7(6). https://doi.org/10.1371/journal.pone.0039211'),
  ('kb-050', 'Harvard Center on the Developing Child — Executive Function & Self-Regulation. https://developingchild.harvard.edu/key-concept/executive-function/'),
  ('kb-051', 'Brussoni, M. dkk. (2015). What is the Relationship between Risky Outdoor Play and Health in Children? A Systematic Review. IJERPH, 12(6). https://doi.org/10.3390/ijerph120606423'),
  ('kb-052', 'Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822'),
  ('kb-053', 'CFPB (2016). Building Blocks to Help Youth Achieve Financial Capability. https://files.consumerfinance.gov/f/documents/092016_cfpb_BuildingBlocksReport_ModelAndRecommendations_web.pdf'),
  ('kb-054', 'Aknin, L. B., Hamlin, J. K. & Dunn, E. W. (2012). Giving Leads to Happiness in Young Children. PLoS ONE, 7(6). https://doi.org/10.1371/journal.pone.0039211'),
  ('kb-055', 'Talwar, V., Arruda, C. & Yachison, S. (2015). The effects of punishment and appeals for honesty on children''s truth-telling behavior. Journal of Experimental Child Psychology, 130. https://pubmed.ncbi.nlm.nih.gov/25447716/'),
  ('kb-056', 'Harvard Center on the Developing Child — Executive Function & Self-Regulation. https://developingchild.harvard.edu/key-concept/executive-function/; Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822'),
  ('kb-057', 'Mueller, C. M. & Dweck, C. S. (1998). Praise for intelligence can undermine children''s motivation and performance. Journal of Personality and Social Psychology, 75(1). https://pubmed.ncbi.nlm.nih.gov/9686450/'),
  ('kbd-bangun-1', 'Harvard Center on the Developing Child — Serve and Return. https://developingchild.harvard.edu/key-concepts/serve-and-return/'),
  ('kbd-sarap-1', 'CDC — About Handwashing (Clean Hands). https://www.cdc.gov/clean-hands/about/index.html'),
  ('kbd-sarap-2', 'Hussong, A. M. dkk. (2021). Parenting and the development of children''s gratitude. Child Development Perspectives. https://doi.org/10.1111/cdep.12434'),
  ('kbd-mandi-1', 'Harvard Center on the Developing Child — Executive Function & Self-Regulation. https://developingchild.harvard.edu/key-concept/executive-function/'),
  ('kbd-main-1', 'ZERO TO THREE — Helping Young Children With Sharing. https://www.zerotothree.org/resource/helping-young-children-with-sharing/'),
  ('kbd-main-2', 'ZERO TO THREE — How to Help Your Child Develop Empathy. https://www.zerotothree.org/resource/how-to-help-your-child-develop-empathy/'),
  ('kbd-msiang-1', 'AAP HealthyChildren.org — Self-Feeding. https://www.healthychildren.org/English/ages-stages/toddler/nutrition/Pages/Self-Feeding.aspx'),
  ('kbd-mmalam-1', 'Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822'),
  ('kbd-beres-1', 'Tepper dkk. (2022). Executive functions and household chores: Does engagement in chores predict children''s cognition? Australian Occupational Therapy Journal. https://doi.org/10.1111/1440-1630.12822'),
  ('kbd-tidur-1', 'AAP HealthyChildren.org — Toothbrushing Tips for Young Children. https://www.healthychildren.org/English/healthy-living/oral-health/Pages/Toothbrushing-Tips-for-Young-Children.aspx'),
  ('kbd-tidur-2', 'Mindell, J. A. & Williamson, A. A. (2018). Benefits of a bedtime routine in young children. Sleep Medicine Reviews, 40. https://pubmed.ncbi.nlm.nih.gov/29195725/'),
  ('msh-001', 'Harvard Center on the Developing Child — Serve and Return. https://developingchild.harvard.edu/key-concepts/serve-and-return/'),
  ('msh-002', 'ZERO TO THREE — How to Help Your Child Develop Empathy. https://www.zerotothree.org/resource/how-to-help-your-child-develop-empathy/'),
  ('msh-003', 'Talwar, V., Arruda, C. & Yachison, S. (2015). The effects of punishment and appeals for honesty on children''s truth-telling behavior. Journal of Experimental Child Psychology, 130. https://pubmed.ncbi.nlm.nih.gov/25447716/'),
  ('msh-004', 'Yogman, M. dkk. (2018). The Power of Play: A Pediatric Role in Enhancing Development in Young Children. Pediatrics, 142(3). https://doi.org/10.1542/peds.2018-2058'),
  ('msh-005', 'Tomasello, M. & Farrar, M. J. (1986). Joint attention and early language. Child Development, 57(6). https://pubmed.ncbi.nlm.nih.gov/3802971/'),
  ('sit-1', 'ZERO TO THREE — How to Help Children Develop Self-Control. https://www.zerotothree.org/resource/help-your-child-develop-self-control/'),
  ('sit-2', 'ZERO TO THREE — Helping Young Children With Sharing. https://www.zerotothree.org/resource/helping-young-children-with-sharing/'),
  ('sit-3', 'Talwar, V., Arruda, C. & Yachison, S. (2015). The effects of punishment and appeals for honesty on children''s truth-telling behavior. Journal of Experimental Child Psychology, 130. https://pubmed.ncbi.nlm.nih.gov/25447716/'),
  ('sit-4', 'Brussoni, M. dkk. (2015). What is the Relationship between Risky Outdoor Play and Health in Children? A Systematic Review. IJERPH, 12(6). https://doi.org/10.3390/ijerph120606423')
) AS v(id, sumber)
WHERE k.id = v.id AND COALESCE(k.sumber, '') = '';

-- ─── terapkan_kebiasaan: ikut menyimpan sumber ───────────────────────────────
CREATE OR REPLACE FUNCTION terapkan_kebiasaan(p_id_draf UUID)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_draf konten_draf%ROWTYPE;
  v_isi  JSONB;
  v_kat  TEXT;
BEGIN
  IF NOT (peran_staf() = 'admin' OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Hanya admin yang dapat menerapkan Kebiasaan Baik.';
  END IF;

  SELECT * INTO v_draf FROM konten_draf
   WHERE id = p_id_draf AND jenis::text = 'kebiasaan_baik' AND status = 'disetujui';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Draf Kebiasaan % tidak ditemukan atau belum disetujui peninjau.', p_id_draf;
  END IF;
  v_isi := v_draf.isi;
  v_kat := v_isi->>'kategori';
  IF v_isi->>'id' IS NULL OR COALESCE(jsonb_array_length(v_isi->'nilai'), 0) = 0 THEN
    RAISE EXCEPTION 'Isi draf tidak lengkap (id/nilai kosong).';
  END IF;
  IF v_kat = 'rutin' AND NOT EXISTS (SELECT 1 FROM irama_template WHERE key = v_isi->>'template_key') THEN
    RAISE EXCEPTION 'Kegiatan template "%" tidak ditemukan.', v_isi->>'template_key';
  END IF;

  INSERT INTO kebiasaan_baik AS k (
    id, judul, deskripsi, nilai, usia_min_bulan, usia_max_bulan, kategori, template_key, kapan, urutan, sumber,
    status, versi, id_draf_asal, id_penyetuju, diterbitkan_pada
  ) VALUES (
    v_isi->>'id',
    v_isi->>'judul',
    COALESCE(v_isi->>'deskripsi', ''),
    ARRAY(SELECT jsonb_array_elements_text(v_isi->'nilai')),
    COALESCE((v_isi->>'usia_min_bulan')::INT, 0),
    COALESCE((v_isi->>'usia_max_bulan')::INT, 71),
    v_kat,
    CASE WHEN v_kat = 'rutin' THEN v_isi->>'template_key' END,
    CASE WHEN v_kat = 'situasional' THEN NULLIF(v_isi->>'kapan', '') END,
    COALESCE((v_isi->>'urutan')::INT, 100),
    COALESCE(v_isi->>'sumber', ''),
    'tayang', 1, v_draf.id, v_draf.id_penyetuju, NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    judul            = EXCLUDED.judul,
    deskripsi        = EXCLUDED.deskripsi,
    nilai            = EXCLUDED.nilai,
    usia_min_bulan   = EXCLUDED.usia_min_bulan,
    usia_max_bulan   = EXCLUDED.usia_max_bulan,
    kategori         = EXCLUDED.kategori,
    template_key     = EXCLUDED.template_key,
    kapan            = EXCLUDED.kapan,
    urutan           = EXCLUDED.urutan,
    sumber           = EXCLUDED.sumber,
    status           = 'tayang',
    versi            = k.versi + 1,
    id_draf_asal     = EXCLUDED.id_draf_asal,
    id_penyetuju     = EXCLUDED.id_penyetuju,
    diterbitkan_pada = NOW();

  UPDATE konten_draf SET status = 'tayang' WHERE id = p_id_draf;
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO riwayat_tinjauan (id_draf, id_pelaku, tindakan) VALUES (p_id_draf, auth.uid(), 'tayang');
  END IF;
  RETURN v_isi->>'id';
END;
$$;

REVOKE ALL ON FUNCTION terapkan_kebiasaan(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION terapkan_kebiasaan(UUID) TO authenticated, service_role;

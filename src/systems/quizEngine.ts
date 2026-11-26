import { QuizQuestion } from '../types/game';

const QUESTION_POOL: QuizQuestion[] = [
  { tier: '1-2', subject: 'B. Indonesia Kls 1-2 📖', question: 'Lawan kata dari BESAR adalah...', options: ['Panjang', 'Kecil', 'Tinggi', 'Lebar'], answerIndex: 1 },
  { tier: '1-2', subject: 'B. Indonesia Kls 1-2 📖', question: 'Sebelum makan sebaiknya kita mencuci...', options: ['Kaki', 'Tangan', 'Baju', 'Sepatu'], answerIndex: 1 },
  { tier: '1-2', subject: 'PPKn Kls 1-2 🇮🇩', question: 'Lambang sila pertama Pancasila adalah...', options: ['Bintang', 'Rantai', 'Beringin', 'Padi Kapas'], answerIndex: 0 },
  { tier: '1-2', subject: 'PPKn Kls 1-2 🇮🇩', question: 'Lambang sila kedua Pancasila adalah...', options: ['Bintang', 'Rantai Emas', 'Kepala Banteng', 'Beringin'], answerIndex: 1 },
  { tier: '1-2', subject: 'IPA Kls 1-2 🌿', question: 'Hewan yang berkokok pagi hari adalah...', options: ['Bebek', 'Kucing', 'Ayam jantan', 'Burung hantu'], answerIndex: 2 },
  { tier: '1-2', subject: 'IPA Kls 1-2 🌿', question: 'Kita melihat warna alam memakai...', options: ['Telinga', 'Hidung', 'Mata', 'Kulit'], answerIndex: 2 },
  { tier: '1-2', subject: 'IPA Kls 1-2 🌿', question: 'Kita mendengar suara musik menggunakan...', options: ['Mata', 'Hidung', 'Lidah', 'Telinga'], answerIndex: 3 },
  { tier: '1-2', subject: 'Matematika Kls 1-2 🔢', question: 'Bentuk roda sepeda adalah...', options: ['Segitiga', 'Persegi', 'Lingkaran', 'Trapesium'], answerIndex: 2 },
  { tier: '3-4', subject: 'IPA Kls 3-4 🌿', question: 'Hewan pemakan tumbuhan saja disebut...', options: ['Karnivora', 'Omnivora', 'Herbivora', 'Insektivora'], answerIndex: 2 },
  { tier: '3-4', subject: 'IPA Kls 3-4 🌿', question: 'Hewan pemakan daging disebut...', options: ['Herbivora', 'Karnivora', 'Omnivora', 'Frugivora'], answerIndex: 1 },
  { tier: '3-4', subject: 'IPA Kls 3-4 🌿', question: 'Perubahan cair menjadi gas disebut...', options: ['Membeku', 'Mencair', 'Menguap', 'Mengembun'], answerIndex: 2 },
  { tier: '3-4', subject: 'B. Indonesia Kls 3-4 📖', question: 'Antonim kata HEMAT adalah...', options: ['Rajin', 'Boros', 'Pelit', 'Cerdas'], answerIndex: 1 },
  { tier: '3-4', subject: 'B. Indonesia Kls 3-4 📖', question: 'Sinonim kata GEMBIRA adalah...', options: ['Sedih', 'Takut', 'Senang', 'Marah'], answerIndex: 2 },
  { tier: '3-4', subject: 'PPKn Kls 3-4 🇮🇩', question: 'Arti Bhinneka Tunggal Ika adalah...', options: ['Bersatu kita teguh', 'Berbeda-beda tetap satu jua', 'Maju terus', 'Cinta tanah air'], answerIndex: 1 },
  { tier: '5-6', subject: 'IPA Kls 5-6 🌿', question: 'Tumbuhan membuat makanan dengan cahaya disebut...', options: ['Respirasi', 'Fotosintesis', 'Transpirasi', 'Penyerbukan'], answerIndex: 1 },
  { tier: '5-6', subject: 'IPA Kls 5-6 🌿', question: 'Alat kelamin betina pada bunga adalah...', options: ['Benang sari', 'Kelopak', 'Mahkota', 'Putik'], answerIndex: 3 },
  { tier: '5-6', subject: 'B. Indonesia Kls 5-6 📖', question: 'Pesan moral dalam cerita disebut...', options: ['Alur', 'Latar', 'Watak', 'Amanat'], answerIndex: 3 },
  { tier: '5-6', subject: 'IPS Kls 5-6 🇮🇩', question: 'Gunung tertinggi di Pulau Jawa adalah...', options: ['Merapi', 'Bromo', 'Semeru', 'Slamet'], answerIndex: 2 },
  { tier: 'all', subject: 'Umum 🇮🇩', question: 'Hari Kemerdekaan RI setiap tanggal...', options: ['17 Agustus', '1 Juni', '28 Oktober', '10 November'], answerIndex: 0 },
  { tier: 'all', subject: 'IPA 🌿', question: 'Sumber energi panas terbesar Bumi adalah...', options: ['Bulan', 'Matahari', 'Listrik', 'Api'], answerIndex: 1 },
  { tier: 'all', subject: 'IPA 🌿', question: 'Planet berjuluk Planet Merah adalah...', options: ['Venus', 'Mars', 'Jupiter', 'Saturnus'], answerIndex: 1 },
  { tier: 'all', subject: 'Umum 🇮🇩', question: 'Warna bendera Indonesia adalah...', options: ['Merah Putih', 'Putih Merah', 'Biru Putih', 'Merah Kuning'], answerIndex: 0 },
  { tier: 'all', subject: 'IPA 🌿', question: 'Bagian tumbuhan penyerap air dari tanah adalah...', options: ['Daun', 'Batang', 'Akar', 'Bunga'], answerIndex: 2 },
  { tier: 'all', subject: 'PPKn 🇮🇩', question: 'Jumlah bulu sayap burung Garuda ada...', options: ['8 helai', '17 helai', '19 helai', '45 helai'], answerIndex: 1 },
];

function makeOptions(answer: number, unit = ''): { options: string[]; answerIndex: number } {
  const set = [answer];
  while (set.length < 4) {
    const offset = Math.floor(Math.random() * 9) - 4 || 3;
    let candidate = answer + offset;
    if (candidate < 0) {
      candidate = answer + Math.floor(Math.random() * 10) + 1;
    }
    if (!set.includes(candidate)) {
      set.push(candidate);
    }
  }
  set.sort(() => Math.random() - 0.5);
  return {
    options: set.map((x) => `${x}${unit}`),
    answerIndex: set.indexOf(answer),
  };
}

export function generateMathQuestion(grade: number): QuizQuestion {
  if (grade <= 1) {
    const visualPool: QuizQuestion[] = [
      { subject: 'Visual Prasekolah / TK 🍎', question: 'Hitung jumlah buah apel: 🍎 🍎 🍎', options: ['3 buah', '4 buah', '2 buah', '5 buah'], answerIndex: 0 },
      { subject: 'Visual Prasekolah / TK ⭐', question: 'Hitung jumlah bintang bersinar: ⭐ ⭐ ⭐ ⭐', options: ['4 bintang', '3 bintang', '5 bintang', '2 bintang'], answerIndex: 0 },
      { subject: 'Visual Prasekolah / TK 🌸', question: 'Hitung jumlah bunga mekar: 🌸 🌸 🌸', options: ['3 bunga', '2 bunga', '4 bunga', '1 bunga'], answerIndex: 0 },
      { subject: 'Visual Prasekolah / TK 🔴', question: 'Bentuk apakah gambar ini? 🔴', options: ['Lingkaran', 'Segitiga', 'Kotak', 'Bintang'], answerIndex: 0 },
      { subject: 'Visual Prasekolah / TK ⭐', question: 'Bentuk apakah gambar ini? ⭐', options: ['Bintang', 'Lingkaran', 'Persegi', 'Segitiga'], answerIndex: 0 },
      { subject: 'Visual Prasekolah / TK 🍌', question: 'Warna buah pisang yang manis: 🍌', options: ['Kuning', 'Merah', 'Hijau', 'Biru'], answerIndex: 0 },
      { subject: 'Visual Prasekolah / TK 🍃', question: 'Warna daun pohon yang segar: 🍃', options: ['Hijau', 'Merah', 'Kuning', 'Ungu'], answerIndex: 0 },
      { subject: 'Visual Prasekolah / TK 🐱', question: 'Hewan apakah yang berbunyi Meong? 🐱', options: ['Kucing', 'Anjing', 'Bebek', 'Sapi'], answerIndex: 0 },
      { subject: 'Visual Prasekolah / TK 🐔', question: 'Berapakah jumlah kaki ayam? 🐔', options: ['2 kaki', '4 kaki', '0 kaki', '6 kaki'], answerIndex: 0 },
    ];
    const q = visualPool[Math.floor(Math.random() * visualPool.length)];
    const correctOpt = q.options[q.answerIndex];
    const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);
    return {
      subject: q.subject,
      question: q.question,
      options: shuffledOpts,
      answerIndex: shuffledOpts.indexOf(correctOpt),
    };
  }

  const kind = Math.floor(Math.random() * 3);
  if (grade <= 2) {
    let question = '';
    let result = 0;
    if (kind === 0) {
      const a = 3 + Math.floor(Math.random() * 13);
      const b = 2 + Math.floor(Math.random() * 11);
      result = a + b;
      question = `Berapakah hasil dari ${a} + ${b}?`;
    } else if (kind === 1) {
      const a = 11 + Math.floor(Math.random() * 10);
      const b = 2 + Math.floor(Math.random() * (a - 3));
      result = a - b;
      question = `Ada ${a} buah, dimakan ${b}. Sisa buah sekarang...`;
    } else {
      const a = 2 + Math.floor(Math.random() * 6);
      const b = 2 + Math.floor(Math.random() * 6);
      const c = 1 + Math.floor(Math.random() * 5);
      result = a + b + c;
      question = `Hitung hasil dari ${a} + ${b} + ${c}!`;
    }
    const op = makeOptions(result);
    return { subject: 'Matematika Kls 1-2 🔢', question, ...op };
  }

  if (grade <= 4) {
    let question = '';
    let result = 0;
    if (kind === 0) {
      const a = 3 + Math.floor(Math.random() * 7);
      const b = 3 + Math.floor(Math.random() * 7);
      result = a * b;
      question = `Hasil perkalian ${a} x ${b} adalah...`;
    } else if (kind === 1) {
      const a = 3 + Math.floor(Math.random() * 7);
      const b = 3 + Math.floor(Math.random() * 7);
      result = b;
      question = `Hasil pembagian ${a * b} : ${a} adalah...`;
    } else {
      const a = 25 + Math.floor(Math.random() * 45);
      const b = 15 + Math.floor(Math.random() * 35);
      result = a + b;
      question = `Berapakah hasil dari ${a} + ${b}?`;
    }
    const op = makeOptions(result);
    return { subject: 'Matematika Kls 3-4 🔢', question, ...op };
  }

  if (kind === 0) {
    const a = 11 + Math.floor(Math.random() * 9);
    const b = 4 + Math.floor(Math.random() * 6);
    const op = makeOptions(a * b);
    return { subject: 'Matematika Kls 5-6 🔢', question: `Hasil dari ${a} x ${b} adalah...`, ...op };
  }
  if (kind === 1) {
    const base = (3 + Math.floor(Math.random() * 6)) * 2;
    const height = 4 + Math.floor(Math.random() * 8);
    const op = makeOptions((base * height) / 2, ' cm2');
    return {
      subject: 'Matematika Kls 5-6 🔢',
      question: `Luas segitiga alas ${base} cm dan tinggi ${height} cm adalah...`,
      ...op,
    };
  }
  const p = 7 + Math.floor(Math.random() * 9);
  const l = 4 + Math.floor(Math.random() * 6);
  const op = makeOptions(2 * (p + l), ' cm');
  return {
    subject: 'Matematika Kls 5-6 🔢',
    question: `Keliling persegi panjang ${p} cm x ${l} cm adalah...`,
    ...op,
  };
}

export function generateCrystalQuestions(grade: number): QuizQuestion[] {
  const count = 3 + Math.floor(Math.random() * 3);
  const tier = grade <= 2 ? '1-2' : grade <= 4 ? '3-4' : '5-6';
  const pool = QUESTION_POOL.filter((q) => q.tier === tier || q.tier === 'all').sort(
    () => Math.random() - 0.5,
  );
  const list: QuizQuestion[] = [];
  let pIdx = 0;

  for (let i = 0; i < count; i++) {
    if (i % 2 === 0 || pIdx >= pool.length) {
      list.push(generateMathQuestion(grade));
    } else {
      list.push(pool[pIdx]);
      pIdx++;
    }
  }
  return list.sort(() => Math.random() - 0.5);
}

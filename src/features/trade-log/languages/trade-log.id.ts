import type tradeLog from "./trade-log.en";

/** Indonesian copy for the trade log — typed against `trade-log.en`. */
const id: typeof tradeLog = {
  title: "Trade log",

  empty: {
    title: "Belum ada trade yang dicatat",
    description:
      "Tulis plan sebelum membeli: entry, stop loss, dan target. Jumlah lot dihitung dari batas risikomu.",
    action: "Buat plan",
    search: "Cari saham",
  },

  action: {
    create: "Buat plan",
    seeAll: "Lihat semua",
    edit: "Ubah",
    open: "Sudah beli",
    close: "Tutup posisi",
    delete: "Hapus plan",
    save: "Simpan plan",
  },

  status: {
    planned: "Rencana",
    open: "Terbuka",
    closed: "Selesai",
  },

  section: {
    active: "Aktif",
    closed: "Selesai",
  },

  price: {
    entry: "Entry",
    stopLoss: "Stop loss",
    target: "Target",
    exit: "Jual",
  },

  lots: "{{count}} lot",

  home: {
    title: "Plan aktif",
    empty: "Belum ada plan aktif. Tulis satu sebelum membeli lagi.",
    openRisk:
      "{{amount}} berisiko di {{count}} posisi terbuka, {{percent}} dari modal.",
    openRiskOver:
      "{{amount}} berisiko di {{count}} posisi terbuka, {{percent}} dari modal. Jaga di bawah {{limit}} sebelum membuka posisi lagi.",
  },

  performance: {
    winRate: "Win rate",
    averageR: "Rata-rata R",
    lossStreak: "Rugi beruntun",
    trades: "Dari {{count}} trade selesai",
    streakAdvice:
      "Tiga kali atau lebih rugi berturut-turut. Pertimbangkan menurunkan risiko per trade sampai rentetannya putus.",
    streakGuarded:
      "Tiga kali atau lebih rugi berturut-turut. Plan baru dihitung dengan risiko {{percent}} sampai ada trade yang untung.",
    seeStats: "Lihat statistik",
  },

  form: {
    titleNew: "Plan baru",
    titleEdit: "Ubah plan",
    code: "Kode saham",
    codePlaceholder: "BBCA",
    lastPrice: "Harga terakhir {{price}}",
    useLastPrice: "Pakai harga terakhir",
    unknownCode: "Tidak ada di daftar saham. Periksa kodenya.",
    targetOptional: "Target (opsional)",
    lots: "Jumlah lot",
    cost: "Modal terpakai",
    risk: "Rugi jika kena stop loss",
    reward: "Rasio untung-risiko",
    limitedByCapital: "Dibatasi oleh modal, bukan batas risiko.",
    tooWide:
      "Stop loss terlalu jauh untuk batas rugi {{maxLoss}}. Dekatkan ke harga entry, atau naikkan risiko per trade.",
    pending: "Isi entry dan stop loss untuk menghitung jumlah lot.",
    note: "Catatan (opsional)",
    notePlaceholder: "Alasan trade ini, dan kondisi yang membatalkannya",
    loweredRisk:
      "Dihitung dengan risiko {{percent}} karena kamu sedang {{count}} kali rugi berturut-turut.",
    averageDown:
      "Kamu sudah memegang {{code}} dari harga {{entry}}, dan entry ini lebih rendah. Menambah posisi yang sedang rugi memperbesar kerugian dari satu saham.",
  },

  detail: {
    title: "Plan",
    notFound: "Plan ini sudah tidak ada.",
    profit: "Hasil",
    note: "Catatan",
    planned: "Dibuat {{date}}",
    opened: "Dibeli {{date}}",
    closed: "Dijual {{date}}",
  },

  closeSheet: {
    title: "Tutup posisi",
    description: "Harga jualmu. Hasilnya diukur terhadap stop loss.",
  },

  deleteDialog: {
    title: "Hapus plan ini?",
    body: "Plan dihapus dari trade log dan hasilnya tidak dihitung lagi.",
  },

  validation: {
    codeInvalid: "Masukkan kode saham empat huruf",
    entryRequired: "Harga entry wajib diisi",
    stopLossRequired: "Stop loss wajib diisi",
    exitRequired: "Harga jual wajib diisi",
    priceInvalid: "Masukkan harga rupiah bulat di atas 0",
    stopLossAboveEntry: "Stop loss harus di bawah entry",
    targetBelowEntry: "Target harus di atas entry",
    tickInvalid:
      "Bukan harga yang valid di BEI. Fraksi harga di rentang ini {{tick}}: coba {{lower}} atau {{upper}}.",
    noteMax: "Catatan maksimal 500 karakter",
  },

  stats: {
    title: "Statistik",
    total: "Hasil terealisasi",
    totalOf: "Dari {{count}} trade selesai, {{wins}} di antaranya untung. {{percent}} dari modal saat ini.",
    curve: "Akumulasi hasil",
    curveStart: "Sebelum trade pertama",
    curveAfter: "Setelah trade ke-{{count}}",
    curveSummary:
      "Akumulasi hasil dari {{count}} trade, berakhir di {{total}}. Tertinggi {{high}}, terendah {{low}}.",
    expectancy: "Expectancy",
    profitFactor: "Profit factor",
    maxDrawdown: "Max drawdown",
    averageWin: "Rata-rata untung",
    averageLoss: "Rata-rata rugi",
    best: "Trade terbaik",
    worst: "Trade terburuk",
    explain:
      "Expectancy adalah rata-rata hasil per trade dalam R: di atas 0 berarti metodenya menghasilkan dalam jangka panjang. Profit factor adalah total untung dibagi total rugi. Max drawdown adalah penurunan terdalam dari titik tertinggi akumulasi hasil.",
    empty: {
      title: "Belum ada trade yang selesai",
      description: "Statistik muncul setelah kamu menutup posisi pertama.",
    },
  },
};

export default id;

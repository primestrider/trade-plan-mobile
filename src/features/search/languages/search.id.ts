import type search from "./search.en";

/** Indonesian copy for search and stock detail — typed against `search.en`. */
const id: typeof search = {
  title: "Cari saham",
  placeholder: "Kode atau nama emiten",
  loading: "Memuat daftar saham",
  rowHint: "Membuka detail saham",

  noMatch: {
    title: "Tidak ada saham yang cocok dengan “{{query}}”",
    description: "Periksa kodenya, atau coba sebagian nama perusahaan.",
  },

  error: {
    title: "Daftar saham gagal dimuat",
    description: "Periksa koneksi internet, lalu coba lagi.",
  },

  detail: {
    loading: "Memuat data saham",
    today: "hari ini",
    asOf: "Harga per {{date}}",

    sections: {
      today: "Perdagangan hari ini",
      yearRange: "Rentang 52 minggu",
      performance: "Kinerja",
      valuation: "Valuasi",
      risk: "Risiko",
    },

    open: "Pembukaan",
    prevClose: "Penutupan kemarin",
    high: "Tertinggi",
    low: "Terendah",
    volume: "Volume",
    shares: "{{count}} lembar",
    value: "Nilai",
    frequency: "Frekuensi",
    trades: "{{count}} kali",

    periods: {
      oneDay: "1H",
      oneWeek: "1M",
      oneMonth: "1B",
      threeMonth: "3B",
      sixMonth: "6B",
      mtd: "MTD",
      ytd: "YTD",
      oneYear: "1T",
      threeYear: "3T",
      fiveYear: "5T",
      tenYear: "10T",
    },

    perAnnualized: "PER disetahunkan",
    psr: "PSR disetahunkan",
    pcfr: "PCFR disetahunkan",
    marketCap: "Kapitalisasi pasar",
    freeFloat: "Free float",
    beta: "Beta 1 tahun",
    volatility: "Volatilitas 1 tahun",

    notFound: {
      title: "Tidak ada saham dengan kode {{code}}",
      description: "Mungkin sudah delisting. Cari lagi dari daftar.",
    },

    error: {
      title: "Data saham gagal dimuat",
      description: "Periksa koneksi internet, lalu coba lagi.",
    },
  },
};

export default id;

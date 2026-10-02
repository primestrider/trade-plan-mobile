import type news from "./news.en";

/** Indonesian copy for news — typed against `news.en`. */
const id: typeof news = {
  title: "Berita pasar",
  seeAll: "Lihat semua",
  opensHint: "Membuka artikel di situs penerbitnya",

  filter: {
    all: "Semua",
    plans: "Saham di plan kamu",
  },

  sources: "Dari {{sources}}. Artikel dibuka di situs penerbitnya.",

  empty: {
    title: "Belum ada berita",
    description: "Tarik ke bawah untuk memeriksa lagi.",
    plans: "Belum ada berita hari ini tentang saham di plan aktifmu.",
  },

  error: {
    title: "Berita gagal dimuat",
    description: "Periksa koneksi lalu coba lagi.",
    short: "Berita gagal dimuat.",
  },
};

export default id;

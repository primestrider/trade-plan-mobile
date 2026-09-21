import type example from "./example.en";

/** Indonesian copy for the example feature — typed against `example.en`. */
const exampleId: typeof example = {
  title: "Contoh Fitur",
  subtitle: "Layar nyata yang tersambung ke plugin bawaan boilerplate ini",

  signIn: {
    title: "Masuk",
    subtitle: "React Hook Form, Zod, Axios, dan token yang disimpan di MMKV",

    demo: {
      title: "Akun demo",
      description: "DummyJSON menerima kredensial berikut.",
      fill: "Isi formulir",
    },

    field: {
      username: {
        label: "Nama pengguna",
        placeholder: "emilys",
      },
      password: {
        label: "Kata sandi",
        placeholder: "••••••••",
      },
    },

    validation: {
      usernameMin: "Nama pengguna minimal 3 karakter",
      passwordMin: "Kata sandi minimal 6 karakter",
    },

    action: {
      signIn: "Masuk",
      signOut: "Keluar",
    },

    session: {
      title: "Sudah masuk",
      tokenNote: "Token akses tersimpan di MMKV dan disertakan di setiap permintaan.",
    },

    account: {
      title: "Akun",
      subtitle: "Layar yang hanya bisa dibuka oleh sesi yang sudah masuk",
    },

    error: {
      title: "Gagal masuk",
    },

    toast: {
      signedIn: "Selamat datang kembali",
      signedOut: "Berhasil keluar",
    },
  },

  products: {
    title: "Produk",
    subtitle: "React Query, infinite scroll, dan FlashList ke API sungguhan",

    search: {
      placeholder: "Cari produk",
    },

    empty: {
      title: "Produk tidak ditemukan",
      description: "Coba kata kunci yang lain.",
    },

    error: {
      title: "Gagal memuat produk",
    },

    stock: "Stok {{count}}",
    outOfStock: "Stok habis",

    detail: {
      tab: {
        overview: "Ringkasan",
        specs: "Spesifikasi",
        reviews: "Ulasan",
      },
      brand: "Merek",
      category: "Kategori",
      rating: "Penilaian",
      stock: "Stok",
      discount: "Diskon",
      noReviews: "Belum ada ulasan",
      action: "Tambah ke keranjang",
      sheetTitle: "Tambah ke keranjang",
      quantity: "Jumlah",
      confirm: "Konfirmasi",
      added: "Ditambahkan ke keranjang",
      notFound: "Produk ini sudah tidak tersedia.",
    },
  },

  todos: {
    title: "Tugas",
    subtitle: "Zustand yang dipersistensikan ke MMKV — yang ini jalan tanpa internet",

    field: {
      title: {
        placeholder: "Apa yang perlu dikerjakan?",
      },
    },

    validation: {
      titleMin: "Tulis minimal 3 karakter",
      titleMax: "Maksimal 100 karakter",
    },

    action: {
      add: "Tambah",
      clearCompleted: "Bersihkan yang selesai",
    },

    filter: {
      all: "Semua",
      active: "Aktif",
      done: "Selesai",
    },

    progress: "{{done}} dari {{total}} selesai",

    empty: {
      title: "Tidak ada tugas",
      description: "Tambahkan tugas pertamamu di atas. Tersimpan walau app ditutup.",
    },

    remove: {
      title: "Hapus tugas ini?",
      description: "Tindakan ini tidak bisa dibatalkan.",
    },

    toast: {
      added: "Tugas ditambahkan",
      removed: "Tugas dihapus",
      cleared: "Tugas selesai dibersihkan",
    },
  },

  settings: {
    title: "Pengaturan",
    subtitle: "Tema, bahasa, dan preferensi yang bertahan setelah app ditutup",

    appearance: {
      title: "Tampilan",
      theme: "Skema warna",
    },

    language: {
      title: "Bahasa",
      label: "Bahasa aplikasi",
    },

    notifications: {
      title: "Notifikasi",
      push: "Notifikasi push",
      pushDescription: "Pemberitahuan untuk pesan baru",
      email: "Ringkasan email",
      emailDescription: "Rangkuman mingguan",
    },

    formatting: {
      title: "Pratinjau format",
      description: "Mengikuti bahasa di atas, bukan bahasa perangkat.",
      number: "Angka",
      currency: "Mata uang",
      date: "Tanggal",
      relative: "Waktu relatif",
    },
  },
};

export default exampleId;

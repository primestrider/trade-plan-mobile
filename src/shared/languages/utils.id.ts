import type utils from "./utils.en";

/** Indonesian shared copy — typed against `utils.en` so missing keys fail the build. */
const utilsId: typeof utils = {
  appName: "RN Expo Boilerplate",
  language: "Bahasa",

  action: {
    save: "Simpan",
    cancel: "Batal",
    submit: "Kirim",
    clear: "Bersihkan",
    retry: "Coba lagi",
    delete: "Hapus",
    close: "Tutup",
    goHome: "Ke beranda",
  },

  state: {
    loading: "Memuat…",
    empty: "Belum ada data",
    offline: "Anda sedang offline",
  },

  form: {
    required: "{{field}} wajib diisi",
    invalidEmail: "Masukkan alamat email yang valid",
    minLength: "{{field}} minimal {{count}} karakter",
    maxLength: "{{field}} maksimal {{count}} karakter",
  },

  error: {
    generic: "Terjadi kesalahan. Silakan coba lagi.",
    network: "Tidak dapat menghubungi server. Periksa koneksi Anda.",
    unauthorized: "Sesi Anda telah berakhir. Silakan masuk kembali.",
  },

  fallback: {
    notFoundTitle: "Halaman ini tidak ada",
    notFoundDescription: "Tautannya mungkin rusak, atau layarnya sudah dipindah.",
    errorTitle: "Terjadi kesalahan",
    errorDescription: "Layar ini tidak dapat ditampilkan.",
  },
};

export default utilsId;

import type googleSheets from "./google-sheets.en";

/** Indonesian copy for Google Sheets — typed against `google-sheets.en`. */
const id: typeof googleSheets = {
  title: "Google Sheets",
  description:
    "Hubungkan akun Google untuk menyalin trade log ke satu spreadsheet di Google Drive kamu. Aplikasi hanya bisa membuka file yang ia buat sendiri.",
  notConfigured: "Login Google belum diatur di build ini.",
  howItWorks:
    "Plan tersinkron dua arah. Ubah entry, stop loss, target, status, exit, atau catatan di Sheet, atau tambah baris untuk plan baru. Jumlah lot dihitung aplikasi. Kalau sel yang sama diubah di kedua tempat, nilai di aplikasi yang dipakai. Menghapus baris tidak menghapus plan; hapus dari aplikasi.",
  open: "Buka di Google Sheets",
  syncNow: "Sinkronkan sekarang",
  syncing: "Menyinkronkan…",
  syncedAt: "Disinkronkan {{time}}",
  notSynced: "Belum disinkronkan",
  cancelled: "Login Google dibatalkan",
  connectFailed: "Gagal terhubung ke Google. Coba lagi.",
  connect: "Lanjutkan dengan Google",

  error: {
    offline: "Tidak bisa terhubung ke Google. Dicoba lagi saat ada perubahan berikutnya.",
    reconnect: "Akses Google sudah berakhir. Hubungkan ulang akunmu.",
    unknown: "Sinkronisasi terakhir gagal.",
  },

  rejected: {
    title: "Beberapa perubahan di Sheet tidak diambil",
    row: "Baris {{row}}, {{code}}: {{reason}}.",
    reason: {
      codeInvalid: "kode saham harus empat huruf",
      priceMissing: "entry dan stop loss wajib diisi",
      priceInvalid: "harga harus rupiah bulat di atas 0",
      tickInvalid: "ada harga yang tidak sesuai fraksi BEI",
      stopLossAboveEntry: "stop loss harus di bawah entry",
      targetBelowEntry: "target harus di atas entry",
      statusInvalid: "status harus planned, open, atau closed",
      exitRequired: "trade yang closed butuh harga exit",
      tooWide: "stop loss terlalu jauh untuk batas risikomu",
    },
  },

  disconnect: "Putuskan akun Google",
  disconnectDialog: {
    title: "Putuskan akun Google?",
    body: "Aplikasi berhenti memperbarui spreadsheet. Spreadsheet tetap ada di Google Drive kamu.",
    action: "Putuskan",
  },
};

export default id;

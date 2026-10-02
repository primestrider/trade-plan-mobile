import type settings from "./settings.en";

/** Indonesian copy for settings — typed against `settings.en`. */
const id: typeof settings = {
  title: "Pengaturan",

  risk: {
    title: "Risiko per trade",
    description:
      "Kerugian terbesar yang kamu terima dalam satu trade, dihitung dari modal.",
    maxLoss: "Rugi maksimal per trade",
    capital: "Modal trading",

    level: {
      conservative: "Konservatif",
      standard: "Standar",
      aggressive: "Agresif",
    },

    advice: {
      conservative:
        "Rugi per trade lebih kecil. Cocok untuk modal besar, atau saat sedang beruntun rugi.",
      standard:
        "Aturan yang umum dipakai. Sepuluh kali rugi berturut-turut masih menyisakan sebagian besar modal.",
      aggressive:
        "Beberapa kali rugi berturut-turut akan menggerus modal cukup dalam. Pakai hanya untuk setup yang kamu yakini.",
    },
  },

  streakGuard: {
    title: "Turunkan risiko saat rugi beruntun",
    description:
      "Setelah 3 kali rugi berturut-turut, plan baru dihitung dengan risiko 1% sampai ada trade yang untung.",
  },

  data: {
    title: "Data kamu",
    description: "Plan hanya tersimpan di HP ini. Simpan cadangan di tempat lain.",
    backup: "Cadangkan data",
    backupHint: "Menyimpan profil dan semua plan sebagai file JSON",
    csv: "Ekspor trade log",
    csvHint: "File CSV untuk spreadsheet",
    restore: "Pulihkan dari cadangan",
    restoreHint: "Mengganti data di HP ini dengan file cadangan",
    restoreDialog: {
      title: "Ganti data kamu?",
      body: "Cadangan dari {{date}} berisi {{count}} plan. Profil dan plan yang ada di HP ini akan diganti.",
      action: "Ganti",
    },
    restored: "Data dipulihkan",
    invalid: "File ini bukan cadangan Trade Plan",
    failed: "File gagal dibagikan. Coba lagi.",
  },
};

export default id;

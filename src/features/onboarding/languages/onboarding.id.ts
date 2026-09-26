import type onboarding from "./onboarding.en";

/** Indonesian copy for onboarding — typed against `onboarding.en`. */
const id: typeof onboarding = {
  title: "Selamat datang",
  subtitle: "Atur profil trading Anda sebelum mulai.",

  step: {
    name: {
      heading: "Siapa nama Anda?",
      label: "Nama",
      placeholder: "Nama Anda",
    },

    balance: {
      heading: "Berapa modal awal Anda?",
      label: "Modal awal",
      placeholder: "0",
      hint: "Modal yang menjadi tolok ukur rencana trading Anda.",
    },
  },

  preparing: {
    status: "Menyiapkan rencana trading Anda…",
    rule: "Jangan risikokan lebih dari 2% modal Anda dalam satu trade.",
    limit: "adalah batas risiko per trade dari modal {{balance}}.",
  },

  action: {
    next: "Lanjut",
    back: "Kembali",
    start: "Mulai",
  },

  validation: {
    nameMin: "Nama minimal 2 karakter",
    nameMax: "Nama maksimal 50 karakter",
    balanceRequired: "Modal awal wajib diisi",
    balanceMin: "Modal awal harus lebih dari 0",
    balanceInvalid: "Modal awal harus berupa rupiah bulat",
  },
};

export default id;

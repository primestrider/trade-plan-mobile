import type home from "./home.en";

/** Indonesian copy for home — typed against `home.en`. */
const id: typeof home = {
  greeting: "Halo, {{name}}",
  balance: "Modal trading",
  openSettings: "Pengaturan",

  editBalance: {
    action: "Ubah",
    hint: "Membuka lembar untuk mengubah modal trading",
    title: "Ubah modal trading",
    description: "Batas risiko per trade dihitung dari jumlah ini.",
  },

  risk: {
    label: "Rugi maksimal per trade",
    action: "Atur",
    hint: "Membuka pengaturan untuk mengubah risiko per trade",
    description:
      "{{percent}} dari modal. Pasang stop loss supaya satu trade yang rugi tidak lebih dari angka ini.",
  },
};

export default id;

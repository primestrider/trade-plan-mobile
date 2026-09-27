import type home from "./home.en";

/** Indonesian copy for home — typed against `home.en`. */
const id: typeof home = {
  greeting: "Halo, {{name}}",
  balance: "Modal trading",

  editBalance: {
    action: "Ubah",
    hint: "Membuka lembar untuk mengubah modal trading",
    title: "Ubah modal trading",
    description: "Batas risiko per trade dihitung dari jumlah ini.",
  },
};

export default id;

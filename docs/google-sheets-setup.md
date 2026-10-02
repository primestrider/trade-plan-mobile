# Setup Google Sheets untuk Trade Log

Panduan menyiapkan login Google supaya trade log bisa disalin otomatis ke
Google Sheets milik pengguna.

---

## Ringkasan

Pengguna membuka **Profil → Google Sheets → Sign in with Google**. Aplikasi:

1. login lewat `react-native-nitro-google-signin` (Credential Manager di
   Android, Google Sign-In SDK di iOS);
2. meminta izin `drive.file`: aplikasi **hanya** bisa membuka file yang ia buat
   sendiri, bukan seluruh Drive pengguna;
3. membuat satu spreadsheet **"Trade Plan – Trade log"** di Drive pengguna,
   dan menyinkronkan tab **Trade log** dengan plan di aplikasi.

Sinkronisasi **dua arah**:

- **Aplikasi → Sheet**: otomatis 3 detik setelah plan berubah.
- **Sheet → aplikasi**: saat aplikasi dibuka atau kembali ke depan, saat
  Trade log ditarik ke bawah, dan saat menekan *Sinkronkan sekarang*.
  Perubahan di Sheet tidak muncul seketika di aplikasi yang sedang terbuka.

Aturan dua arah:

| Situasi | Hasil |
| --- | --- |
| Kolom `entry`, `stop_loss`, `target`, `status`, `exit`, `note` diubah di Sheet | Diambil ke aplikasi |
| Kolom yang sama diubah di Sheet **dan** di aplikasi sebelum sinkron | Nilai aplikasi yang dipakai |
| Kolom berbeda diubah di masing-masing sisi | Keduanya digabung |
| `lots`, `name`, tanggal, `profit_rp`, `r_multiple` diubah di Sheet | Ditimpa; semuanya dihitung aplikasi. Lot plan berstatus `planned` dihitung ulang dari batas risiko saat entry/stop loss berubah |
| Baris baru (tanpa `id`) dengan `code`, `entry`, `stop_loss` valid | Jadi plan baru |
| Baris dihapus di Sheet | Plan **tidak** dihapus; barisnya muncul lagi. Hapus dari aplikasi |
| Plan dihapus di aplikasi | Barisnya hilang dari Sheet |
| Editan tidak valid (fraksi harga, stop loss ≥ entry, status asing, closed tanpa exit) | Ditolak, nilai aplikasi dipakai; Profil menampilkan baris dan alasannya |

Kolom `id` (kolom A) disembunyikan: itu cara aplikasi mencocokkan baris dengan
plan setelah Sheet diurutkan atau difilter. Jangan diubah. Menyalin satu baris
utuh (termasuk `id`-nya) dihitung sebagai plan baru. Kolom `status` berisi
pilihan `planned` / `open` / `closed`.

Spreadsheet dari versi sebelum sinkronisasi dua arah (tanpa kolom `id`) ditulis
ulang sekali dengan format baru; editan yang dibuat di format lama tidak diambil.

Seluruh tab ditulis ulang setiap sinkron. Kalau sebuah sel sedang diketik di Sheet
tepat saat aplikasi menulis, ketikan itu bisa tertimpa.

Nilai ditulis apa adanya (`RAW`), jadi catatan yang diawali `=` tidak
dijalankan sebagai formula.

Tidak ada backend: token diambil dan diperbarui oleh SDK di perangkat.

---

## 1. Google Cloud project

1. Buka [Google Cloud Console](https://console.cloud.google.com/) dan buat
   project (atau pakai yang sudah ada).
2. **APIs & Services → Library**, aktifkan:
   - **Google Sheets API**
   - **Google Drive API**

## 2. OAuth consent screen

**APIs & Services → OAuth consent screen** (di konsol baru: *Google Auth
Platform*).

- User type: **External**.
- Isi nama aplikasi, email dukungan, dan email developer.
- Scopes: tambahkan `.../auth/drive.file`. Scope ini **non-sensitive**, jadi
  tidak perlu verifikasi Google.
- Selama status **Testing**, hanya akun di daftar **Test users** (maks. 100)
  yang bisa login. Tambahkan akun Anda di sana. Untuk rilis publik, klik
  **Publish app**.

## 3. OAuth Client ID

**APIs & Services → Credentials → Create credentials → OAuth client ID.**
Buat tiga client:

| Tipe | Isian | Dipakai untuk |
| --- | --- | --- |
| **Web application** | Nama bebas, tanpa redirect URI | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, wajib di Android dan iOS |
| **Android** | Package `com.primestrider.tradeplanmobile` + SHA-1 | Mencocokkan aplikasi; tidak dimasukkan ke kode |
| **iOS** (opsional) | Bundle ID aplikasi | `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` |

### SHA-1 Android

Buat satu client Android **untuk setiap keystore** yang menandatangani APK:

```bash
# debug (expo run:android)
keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android

# release: keystore yang dipakai scripts/build-android-release.mjs
keytool -list -v -keystore <path-release.keystore> -alias <alias>
```

Kalau aplikasi dirilis lewat Play Store dengan Play App Signing, tambahkan
juga SHA-1 dari **Play Console → App integrity → App signing key**.

> SHA-1 yang salah atau belum terdaftar biasanya **tidak** memunculkan error:
> login hanya terlihat "dibatalkan". Periksa SHA-1 dulu kalau ini terjadi.

## 4. Isi `.env`

```env
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=1234567890-def.apps.googleusercontent.com
```

Client ID bukan rahasia; aman berada di dalam aplikasi.

- Tanpa `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, bagian Google Sheets di Profil
  menampilkan "Login Google belum diatur di build ini".
- `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` hanya untuk iOS. Kalau diisi,
  `configs/google.config.ts` mendaftarkan config plugin library dengan URL
  scheme hasil membalik client ID tersebut. Kalau kosong, plugin tidak
  dipasang dan build Android tetap jalan.

Untuk CI (`.github/workflows/deploy-android.yml`), tambahkan variabel yang sama
ke environment build.

## 5. Build ulang

Library ini modul native (Nitro), tidak jalan di Expo Go dan tidak cukup
reload Metro:

```bash
npm run android:clean
```

### Catatan iOS

Expo SDK 57 yang dibangun dengan **Xcode 27 / iOS 27** mewajibkan scene
lifecycle. Ikuti bagian *UIKit Scene-Based Life Cycle* di
[dokumentasi Expo library](https://react-native-nitro-google-sign-in.github.io/docs/setup/expo):
pasang `expo-build-properties` dengan `ios.enableSceneSupport: true` dan
teruskan URL OAuth di `SceneDelegate.swift`. Belum dikonfigurasi di project
ini karena rilis saat ini hanya Android.

---

## Masalah umum

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| Login langsung "dibatalkan" | SHA-1 / package tidak cocok dengan client Android | Daftarkan SHA-1 keystore yang dipakai build |
| `DEVELOPER_ERROR` | Web client ID salah atau dari project lain | Pakai client **Web**, bukan Android, di `.env` |
| Akun tidak bisa login, status Testing | Akun belum jadi test user | Tambahkan di OAuth consent screen |
| "Akses Google sudah berakhir" di Profil | Akses dicabut dari akun Google, atau sesi habis | Tekan Sign in with Google lagi; spreadsheet lama tetap dipakai |
| Spreadsheet terhapus | Pengguna menghapusnya dari Drive | Otomatis dibuat baru pada sinkronisasi berikutnya |

# Setup Auto Deployment ke Firebase App Distribution

Panduan lengkap menyiapkan distribusi otomatis APK Android ke Firebase App
Distribution setiap kali ada merge ke `main`.

Dokumen ini ditulis untuk dua pembaca: orang yang menyiapkannya pertama kali,
dan orang yang meng-clone boilerplate ini ke project baru. Kalau Anda pembaca
kedua, lompat ke [Yang harus diganti saat clone](#yang-harus-diganti-saat-clone).

---

## Ringkasan

Merge ke `main` memicu `.github/workflows/deploy-android.yml`, yang menjalankan:

```
checkout (riwayat penuh)
  → setup Node 20 + JDK 17 + cache Gradle
  → resolve version bump              ← prefix branch menentukan bagian versi
  → npm ci
  → npm test                          ← gagal di sini, build tidak dimulai
  → decode keystore dari secret
  → tulis & validasi kunci service account
  → npm version + commit ke main      ← chore(release): vX.Y.Z [skip ci]
  → expo prebuild --platform android  ← android/ dibuat di sini
  → gradlew assembleRelease
  → apksigner verify                  ← menolak APK debug-signed
  → upload artifact APK
  → firebase appdistribution:distribute
  → git tag vX.Y.Z                    ← hanya kalau distribusi berhasil
```

Bisa juga dijalankan manual dari **Actions → Distribute Android → Run
workflow**, yang penting untuk menguji sebelum merge.

Dua step diletakkan lebih awal dengan sengaja: `npm test` dan validasi
kredensial. Build Android makan belasan menit, jadi hal-hal yang bisa gagal
harus gagal sebelum itu, bukan sesudah.

---

## Versi naik sendiri dari nama branch

Tidak ada yang mengedit `package.json` dengan tangan. Prefix branch yang
di-merge menentukan bagian versi mana yang naik:

| Prefix branch | Bagian yang naik | Contoh |
| ------------- | ---------------- | ------ |
| `feat/`, `feature/` | tengah — *minor* | 1.4.2 → **1.5.0** |
| `fix/`, `patch/`, `hotfix/`, `bugfix/`, `revert/` | kanan — *patch* | 1.4.2 → **1.4.3** |
| `refactor/`, `perf/`, `chore/`, `docs/`, `test/`, `style/`, `ci/`, `build/` | kanan — *patch* | 1.4.2 → **1.4.3** |
| apa pun yang lain | kanan — *patch*, dengan notice di log | 1.4.2 → **1.4.3** |
| *(tidak ada)* | kiri — *major* | hanya manual, lihat di bawah |

**Kenapa `refactor/` masuk ember patch.** SemVer membedakan berdasarkan apa
yang dilihat pemakai, bukan berdasarkan besarnya diff. Refactor sebesar apa
pun tetap backwards-compatible dan tidak menambah satu pun kemampuan baru,
jadi ia setara `fix` di mata pemakai. Alasan yang sama berlaku untuk `perf`,
`chore`, `docs`, `test`, `style`, `ci`, dan `build`.

**Kenapa prefix asing tidak menggagalkan job.** Setiap merge ke `main`
menghasilkan APK, dan setiap APK butuh `versionCode` yang unik. Menolak
nama branch yang tidak dikenal berarti menolak mendistribusikan kode yang
sudah terlanjur ada di `main` — harga yang jauh lebih mahal daripada satu
patch bump yang mungkin kurang tepat.

### Major tidak punya prefix — dan itu disengaja

Major berarti breaking change. Salah ketik nama branch tidak boleh membakar
satu major version, apalagi karena `versionCode` tidak bisa turun: begitu
`2.0.0` terdistribusi, tidak ada jalan kembali ke `1.x` tanpa mengacaukan
urutan `versionCode`.

Jadi major dinaikkan lewat **Actions → Distribute Android → Run workflow →
`bump: major`** dari branch `main`. Satu klik yang disadari, bukan efek
samping dari nama branch.

Input `bump` yang sama juga menerima `patch` dan `minor` kalau Anda perlu
merilis ulang `main` tanpa merge baru. Defaultnya `none`: build dan
distribusi jalan, tapi versinya tidak berubah.

### Dari mana prefix-nya dibaca

Dari **branch PR yang memuat commit itu**, lewat
`GET /repos/{owner}/{repo}/commits/{sha}/pulls` — bukan dari pesan merge
commit. Ini penting: squash merge dan rebase merge tidak menyisakan nama
branch di pesan commit sama sekali, jadi pipeline yang mem-parsing
`"Merge pull request ... from user/feat/x"` hanya bekerja untuk satu dari
tiga strategi merge.

Kalau commit-nya tidak punya PR — push langsung ke `main` — prefix diambil
dari tipe conventional commit di subject-nya (`feat(ci): ...` → `feat`).

### Versi ditulis balik ke `main`

Setelah tes hijau, workflow menjalankan `npm version` lalu mendorong commit
`chore(release): vX.Y.Z [skip ci]` ke `main`. Marker `[skip ci]` yang
mencegah commit itu memicu workflow-nya sendiri; ada guard kedua di level
job kalau marker-nya sampai hilang.

Commit itu didorong **sebelum** build, bukan sesudah. Konsekuensinya: build
yang gagal meninggalkan nomor versi yang terpakai tanpa rilis. Itu murah —
nomor versi tidak terbatas. Urutan sebaliknya jauh lebih mahal: run
berikutnya akan mengambil nomor yang sama, dan dua APK berbeda dengan
`versionCode` identik sampai ke tester.

Tag `vX.Y.Z` justru dibuat paling akhir, setelah distribusi berhasil, supaya
`git tag` hanya menandai versi yang benar-benar sampai ke tester.

### `versionCode` diturunkan dari versi

`configs/android.config.ts` menghitung `major * 1_000_000 + minor * 1_000 +
patch`. Lebar slot 1000 dipilih karena patch naik untuk hampir setiap merge,
jadi patch tiga digit bukan kasus teoretis. Dengan lebar 100, `1.0.100` dan
`1.1.0` sama-sama menghasilkan `10100` — `versionCode` berhenti naik monoton
dan upload berikutnya ditolak Play Store.

---

## Kenapa signing lewat config plugin, bukan `build.gradle`

Ini bagian yang paling penting dipahami, karena salah paham di sini membuat
orang "memperbaiki" pipeline dengan cara yang tidak bertahan.

Folder `android/` di repo ini **di-gitignore** dan **di-regenerate dari nol**
oleh `expo prebuild` setiap kali workflow berjalan. Artinya:

> Perubahan apa pun yang Anda tulis langsung di `android/app/build.gradle`
> akan hilang. Tidak ter-commit, dan tertimpa di run berikutnya.

Karena itu signing disuntikkan lewat config plugin di
`configs/signing.config.ts`, yang dijalankan sebagai bagian dari prebuild.
Plugin itu melakukan dua hal pada `build.gradle` yang baru dibuat:

1. Menambahkan blok `signingConfigs.release` yang membaca empat environment
   variable.
2. Mengubah `buildTypes.release` supaya memilih signing config secara
   kondisional:

```groovy
signingConfig System.getenv("ANDROID_KEYSTORE_PASSWORD") ? signingConfigs.release : signingConfigs.debug
```

Kondisional itu yang membuat **build lokal tetap jalan tanpa keystore**. Di
laptop Anda tidak ada `ANDROID_KEYSTORE_PASSWORD`, jadi Gradle jatuh ke debug
key dan `npm run android:release` bekerja seperti biasa. Di CI env-nya ada,
jadi Gradle memakai keystore release.

Plugin diterapkan di `app.config.ts` dengan `export default
withReleaseSigning(config)`, bukan lewat array `plugins`. Alasannya tipe:
`ExpoConfig["plugins"]` adalah `(string | [] | [string] | [string, any])[]`,
yang tidak menerima fungsi.

---

## Yang perlu Anda siapkan

Empat hal, dan tidak ada yang bisa diotomatiskan dari sisi kode:

| # | Item | Dari mana |
| - | ---- | --------- |
| 1 | Project Firebase dengan app Android terdaftar | Firebase Console |
| 2 | App Distribution aktif + grup tester | Firebase Console |
| 3 | Kunci service account (JSON) dengan role yang benar | Firebase Console + Google Cloud IAM |
| 4 | Keystore release | `keytool` di mesin Anda |

---

## Bagian A — Firebase

### A1. Daftarkan app Android

Firebase Console → **Project settings** → **Your apps** → **Add app** →
Android.

Package name harus **persis** sama dengan nilai `package` di
`configs/android.config.ts`. Di repo ini:

```
com.primestrider.rnexpoboilerplate
```

> **Nilai ini case-sensitive dan tidak bisa diubah** setelah app terdaftar.
> Salah ketik berarti harus mendaftarkan app baru.

Setelah terdaftar, Firebase menawarkan download `google-services.json` dan
memasang SDK. **Lewati keduanya** — upload ke App Distribution tidak
memerlukannya.

Yang Anda ambil hanya **App ID**, di halaman General Settings. Bentuknya:

```
1:123456789012:android:a1b2c3d4e5f6a7b8
```

Jangan tertukar dengan dua nilai lain di halaman yang sama:

| Yang dibutuhkan | Bentuk |
| --------------- | ------ |
| **App ID** ← ini | `1:123456789012:android:a1b2...` |
| Project ID | `nama-project-abc12` |
| Project number | `123456789012` |

### A2. Aktifkan App Distribution dan buat grup tester

Firebase Console → **Release & Monitor** → **App Distribution** → **Get
started**.

Lalu tab **Testers & Groups** → buat grup (misal `internal`) → catat
**aliasnya** → masukkan email tester.

Alias grup inilah yang dipakai, bukan nama tampilannya.

> Enable "Firebase App Distribution API" di Google APIs console **tidak perlu**
> untuk app yang dibuat setelah 20 September 2019.

### A3. Buat kunci service account

Firebase Console → **Project settings** → tab **Service accounts** →
**Generate new private key**.

File yang terunduh harus memuat `"type": "service_account"`. Kalau tidak, itu
file yang salah.

> **Jebakan paling sering:** `google-services.json` bukan kunci service
> account. Keduanya JSON dari Firebase, tapi berbeda total:
>
> | File | Isi | Fungsi |
> | ---- | --- | ------ |
> | `google-services.json` | `project_info`, `client` — **tidak ada** `type` | Config app di dalam APK |
> | Kunci service account | `type`, `private_key`, `client_email`, `project_id` | Kredensial untuk autentikasi |
>
> Memaste `google-services.json` ke secret menghasilkan error
> `Failed to authenticate, have you run firebase login?` yang tidak menyebut
> file sama sekali.

### A4. Pasang role pada service account

Google Cloud Console → **IAM & Admin** → **IAM** → cari service account-nya →
Edit → tambahkan role:

```
Firebase App Distribution Admin
```

Anda harus jadi project owner untuk menambah role.

> Role menempel pada **service account**, bukan pada file kunci. Kalau Anda
> sudah men-generate kunci lalu baru menambahkan role, kuncinya tetap berlaku —
> tidak perlu generate ulang.

---

## Bagian B — Keystore release

Jalankan di terminal Anda sendiri; perintahnya interaktif dan isinya rahasia.

**Buat di folder di luar repo.** `.gitignore` memblokir `*.jks` dan
`*.keystore`, tapi menyimpannya di luar repo menghilangkan risikonya
sepenuhnya.

```powershell
mkdir $HOME\keystores -Force
cd $HOME\keystores
keytool -genkeypair -v -keystore release.keystore -alias upload `
  -keyalg RSA -keysize 2048 -validity 10000 -storetype PKCS12
```

`keytool` akan menanyakan password, lalu beberapa field identitas (nama,
organisasi, negara). Field identitas tidak dipakai untuk verifikasi apa pun,
jadi isi yang masuk akal saja. Dengan `-storetype PKCS12`, password key sama
dengan password keystore.

**Catat passwordnya** — dipakai untuk dua secret sekaligus.

Lalu ubah ke base64 dan langsung ke clipboard:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("$HOME\keystores\release.keystore")) |
  Set-Clipboard
```

Langsung ke clipboard supaya tidak ada file perantara yang tertinggal di disk.
Perintah ini tidak mencetak apa pun — itu normal.

> **Backup keystore ini di luar GitHub.** Kalau hilang, tidak ada cara
> memperbarui app di device tester — mereka harus uninstall lebih dulu. Ini
> juga keystore yang nanti dipakai kalau naik ke Play Store.

Di macOS/Linux, pakai `openssl` karena flag `base64` berbeda antara GNU dan BSD
(`-w0` tidak ada di macOS):

```bash
openssl base64 -A -in ~/keystores/release.keystore
```

---

## Bagian C — Konfigurasi GitHub

### C1. Buat environment

Repo → **Settings** → **Environments** → **New environment**, beri nama
**persis**:

```
app-distribution
```

> Nama ini harus cocok dengan `environment: app-distribution` di
> `deploy-android.yml`. Salah satu huruf saja membuat **semua secret terbaca
> sebagai string kosong tanpa peringatan apa pun** — kegagalan paling senyap di
> seluruh setup ini.

### C2. Environment secrets

Di environment `app-distribution`, tambahkan lima secret:

| Secret | Isi |
| ------ | --- |
| `ANDROID_KEYSTORE_BASE64` | hasil base64 dari Bagian B |
| `ANDROID_KEYSTORE_PASSWORD` | password keystore |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | sama dengan password keystore |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | isi file JSON dari A3, dipaste utuh dari `{` sampai `}` (Secrets menerima nilai multiline) |

### C3. Repository variables

Tab **Variables**:

| Variable | Wajib | Isi |
| -------- | ----- | --- |
| `FIREBASE_ANDROID_APP_ID` | ya | App ID dari A1 |
| `FIREBASE_TESTER_GROUPS` | ya | alias grup dari A2, dipisah koma kalau lebih dari satu |
| `EXPO_PUBLIC_APP_NAME` | tidak | `app.config.ts` sudah punya fallback ke nama di `package.json` |
| `EXPO_PUBLIC_API_URL` | tidak | `baseURL` axios; fitur example jalan tanpa ini |

Kenapa `EXPO_PUBLIC_*` jadi Variables, bukan Secrets: prefix `EXPO_PUBLIC_`
berarti nilainya di-inline ke dalam JS bundle dan bisa dibaca siapa pun yang
membongkar APK. Menyimpannya sebagai Secret hanya memberi rasa aman yang palsu.
Nilai yang benar-benar rahasia tidak boleh memakai prefix itu sama sekali.

### C4. Deployment branches

Settings → Environments → `app-distribution` → **Deployment branches and
tags**. Defaultnya **All branches**.

Untuk pengujian pertama, **biarkan default**. Setelah pipeline terbukti jalan
dan sudah di-merge, perketat ke **Selected branches and tags** berisi `main`
saja, supaya keystore hanya bisa dipakai dari `main`.

Deployment branches adalah *protection rule*. Menurut dokumentasi GitHub, "the
job won't start until all of the environment's protection rules pass" — jadi
branch yang tidak diizinkan membuat job **tidak jalan sama sekali**, terhalang
secara kasat mata. Ini bukan kegagalan senyap.

### C5. Izinkan Actions mendorong ke `main`

Workflow mendorong commit versi dan tag ke `main`, jadi dua hal harus benar:

- **Settings → Actions → General → Workflow permissions** → **Read and write
  permissions**. Tanpa ini `GITHUB_TOKEN` hanya bisa membaca dan step
  **Commit version bump** gagal dengan `403`.
- Kalau `main` punya **branch protection / ruleset** yang mewajibkan pull
  request, push dari workflow ikut tertolak. Tambahkan
  `github-actions[bot]` ke **Bypass list** ruleset itu.

Kalau Anda memang tidak mau ada commit otomatis di `main`, jalankan workflow
hanya lewat **Run workflow** dengan `bump: none` dan naikkan versi manual.

---

## Cara menguji sebelum merge

Trigger `push: main` tidak bisa diuji tanpa merge, jadi urutannya:

1. Push branch kerja Anda.
2. **Actions → Distribute Android → Run workflow** → pilih branch itu, dan
   biarkan `bump` di `none`. Run dari branch kerja memang tidak pernah
   menaikkan versi: commit versi hanya boleh lahir di `main`, jadi run di
   branch lain memaksa `bump` ke `none` dan mencetak warning.
3. Periksa keempat hal ini, semuanya harus benar:
   - Job selesai hijau.
   - Step **Write Firebase service account** mencetak
     `Service account key is valid for project <id>`.
   - Step **Verify APK is signed with the release key** lulus, dan sertifikat
     yang tercetak **bukan** `CN=Android Debug`.
   - Rilis baru muncul di Firebase Console → App Distribution, dengan release
     notes berisi subject commit + nomor run + SHA pendek, dan tester menerima
     notifikasi.
4. Baru merge ke `main`. Push ke `main` memicu workflow sekali lagi, yang
   sekaligus membuktikan trigger `push: main` bekerja — dan kali ini versi
   ikut naik. Periksa `main` punya commit `chore(release): v...` baru dan
   tag `v...` yang sesuai.
5. Perketat deployment branches ke `main` (C4).

Kalau step verifikasi signing gagal, **jangan menonaktifkannya**. Ia sedang
melaporkan hal yang memang harus menghentikan pipeline: APK yang akan terkirim
ke tester tersigning debug key.

---

## Yang harus diganti saat clone

Bagian ini untuk meng-clone boilerplate ke project baru.

### Nilai di dalam kode

| Nilai | Lokasi | Catatan |
| ----- | ------ | ------- |
| `package` Android | `configs/android.config.ts` | **Harus sama persis** dengan yang didaftarkan di Firebase. Case-sensitive dan permanen. |
| `slug` | `app.config.ts` | Identitas project di Expo |
| `scheme` | `app.config.ts` | Skema deep link |
| `name`, `version` | `package.json` | `version` menentukan `versionCode` lewat `getVersionCode()` di `configs/android.config.ts` |
| `bundleIdentifier` iOS | `configs/ios.config.ts` | Belum diset di boilerplate; hanya perlu kalau menambah jalur iOS |

### Yang dibuat baru per project

- **Project Firebase dan app Android** — Bagian A, seluruhnya.
- **Grup tester** — alias boleh sama, tapi grupnya milik project Firebase yang berbeda.
- **Kunci service account** — milik project Firebase, jadi harus baru.
- **Keystore release** — buat baru untuk setiap app. Jangan pakai ulang keystore
  project lain: kalau satu bocor, semua app yang memakainya terdampak.
- **Environment GitHub + 5 secrets + 2 variables** — Bagian C, seluruhnya.

### Yang tidak perlu diubah

File-file ini portabel apa adanya:

- `.github/workflows/deploy-android.yml`
- `configs/signing.config.ts`
- `tests/configs/signing.config.test.ts`
- Baris `export default withReleaseSigning(config)` di `app.config.ts`

Semua nilai yang project-specific dibaca dari secrets dan variables, bukan
di-hardcode di workflow.

---

## Troubleshooting

Tabel ini berisi kegagalan yang benar-benar terjadi saat setup pertama, bukan
daftar hipotetis.

### `No file in /home/runner/work/... matched to [**/*.gradle*,...]`

Step `setup-java` gagal sebelum apa pun berjalan.

**Sebab:** `actions/setup-java` dengan `cache: gradle` menghitung kunci cache
dari file `*.gradle` **saat checkout**. Di repo ini `android/` di-gitignore dan
baru dibuat `expo prebuild` beberapa step kemudian, jadi tidak ada file yang
cocok.

**Perbaikan:** jangan pakai `cache: gradle`. Repo ini memakai `actions/cache`
eksplisit dengan kunci dari `hashFiles('package-lock.json')` — lockfile itu yang
memin versi Expo, yang menentukan versi Gradle sekaligus dependensi native-nya.
Kalau error ini muncul lagi, berarti `cache: gradle` dikembalikan ke workflow.

### `Failed to authenticate, have you run firebase login?`

Step distribusi gagal padahal build sukses.

**Sebab:** firebase-tools tidak menemukan kredensial yang bisa dipakai. Paling
sering karena isi `FIREBASE_SERVICE_ACCOUNT_JSON` bukan kunci service account —
lihat jebakan `google-services.json` di A3. Bisa juga karena secretnya kosong
atau namanya salah tulis.

**Perbaikan:** pastikan JSON-nya memuat `"type": "service_account"`. Step
**Write Firebase service account** sekarang memeriksa ini lebih awal dan gagal
dengan pesan yang menyebut sebabnya, jadi Anda tidak perlu menunggu build
selesai untuk mengetahuinya.

### Semua secret terbaca kosong

Gejalanya bukan keluhan soal secret, melainkan error turunan — misalnya
`base64: invalid input` di step decode keystore.

**Sebab:** salah satu dari tiga hal:

1. Job tidak mendeklarasikan `environment: app-distribution` — environment
   secret hanya tersedia bagi job yang mereferensikan environment-nya.
2. Nama environment di GitHub tidak persis `app-distribution`.
3. Secretnya memang belum dibuat.

Ketiganya menghasilkan string kosong tanpa peringatan. Dokumentasi GitHub: "If
a secret has not been set, the return value of an expression referencing the
secret will be an empty string."

### Job tidak jalan sama sekali

**Sebab:** branch yang menjalankan workflow tidak diizinkan oleh deployment
branch rule environment.

**Perbaikan:** tambahkan branch itu ke daftar, atau kembalikan ke **All
branches** selama pengujian (C4).

### `Commit version bump` gagal: `403` atau `protected branch hook declined`

**Sebab:** `GITHUB_TOKEN` tidak punya izin tulis, atau ruleset `main`
menolak push dari bot.

**Perbaikan:** C5.

### `Commit version bump` gagal: `Updates were rejected`

**Sebab:** ada yang mendorong ke `main` selagi run berjalan.

**Perbaikan:** jalankan ulang run-nya. Rebase otomatis sengaja tidak
dilakukan — ia akan menarik perubahan yang belum lewat `npm test` di run ini
ke dalam APK yang dibangun.

### `Permission denied` saat `./gradlew`

**Sebab:** bit executable pada `gradlew` hasil ekstraksi template prebuild tidak
dijamin ada di runner.

**Perbaikan:** workflow sudah menjalankan `chmod +x gradlew` sebelum build.
Kalau error ini muncul, baris itu hilang.

### Step verifikasi signing gagal dengan `CN=Android Debug`

**Sebab:** env keystore tidak sampai ke Gradle, jadi kondisional di
`build.gradle` jatuh ke `signingConfigs.debug`. Periksa keempat secret keystore
dan bahwa `ANDROID_KEYSTORE_PATH` berisi path **absolut** — `file()` di
`build.gradle` me-resolve path relatif terhadap `android/app`, bukan root repo.

**Jangan menonaktifkan pemeriksaan ini.** Ia ada justru untuk menangkap kondisi
ini sebelum APK-nya terkirim ke tester.

### Error izin dari Firebase (403)

**Sebab:** service account-nya terautentikasi tapi tidak punya role **Firebase
App Distribution Admin** (A4). Beda dari error autentikasi: di sini kredensialnya
valid, izinnya yang kurang.

---

## Catatan pemeliharaan

**Upgrade Expo SDK bisa mematahkan transformasi gradle.**
`configs/signing.config.ts` mencocokkan string terhadap template `build.gradle`
milik Expo. Kalau template itu berubah, plugin **melempar error** dan build
gagal keras. Itu perilaku yang diinginkan: alternatifnya adalah transformasi
yang diam-diam jadi no-op, yang menghasilkan APK debug-signed yang tampak
release.

Kalau itu terjadi, perbarui anchor di `configs/signing.config.ts` dan tambahkan
tes untuk bentuk template yang baru.

> **Perlu disadari:** unit test di `tests/configs/signing.config.test.ts`
> memakai fixture, bukan `build.gradle` asli. Jadi perubahan template Expo
> **tidak** akan membuat tes itu merah — ia akan muncul sebagai error saat
> prebuild di CI. Tes itu menjaga logika transformasinya, bukan kecocokannya
> dengan template versi terbaru.

**Versi `firebase-tools` dipin ke major 15** di workflow. Menaikkannya adalah
keputusan sadar, bukan sesuatu yang dibiarkan mengalir lewat `@latest`, supaya
perubahan besar di upstream tidak mendadak mematahkan pipeline.

**Arsitektur dipersempit** ke `arm64-v8a,armeabi-v7a`, berbeda dari
`scripts/build-android-release.mjs` yang membangun keempatnya. `x86` dan
`x86_64` hanya dipakai emulator sementara tester memakai HP asli; ini memotong
waktu build hampir separuh. Script lokal dibiarkan apa adanya.

---

## Referensi

- Desain dan alasan di baliknya: [`docs/superpowers/specs/2026-09-20-android-firebase-app-distribution-design.md`](superpowers/specs/2026-09-20-android-firebase-app-distribution-design.md)
- Rencana implementasinya: [`docs/superpowers/plans/2026-09-20-android-firebase-app-distribution.md`](superpowers/plans/2026-09-20-android-firebase-app-distribution.md)
- [Firebase App Distribution — distribute with CLI](https://firebase.google.com/docs/app-distribution/android/distribute-cli)
- [Firebase — authenticate with a service account](https://firebase.google.com/docs/app-distribution/authenticate-service-account)
- [GitHub Actions — managing environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)

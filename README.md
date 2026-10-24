# Hacer Hoca Öğrenme Atölyesi — Kolay Konu Ekleme, sürüm 2

Bu paket mevcut `hacer-hoca` portalını genişletir; hazır **Yeni Nesil Kesirler** sınavını korur.

## Bir defalık güncelleme

1. `hacer-hoca` GitHub deposunun ana sayfasını aç.
2. ZIP arşivini bilgisayarında çıkar. ZIP içindeki dosyaları (ZIP'in kendisini değil) depo köküne yükle.
3. Var olan `index.html` ve `README.md` dosyalarının değiştirilmesini onayla. `etkinlikler/3-sinif/matematik/kesirler/index.html` eskisiyle aynıdır.
4. Yeni `data/konular.json` ve `araclar/konu-ekle.html` dosyaları eklenmiş olmalı.
5. `Commit changes` yap. GitHub Pages sitesi aynı adreste kalır.

## Yeni konu ekleme (bundan sonra)

1. Portaldaki **Öğretmen Aracı** bağlantısını aç veya şu adrese git:
   `https://hcrgcr2026.github.io/hacer-hoca/araclar/konu-ekle.html`
2. Sınıf, ders, konu ve açıklama alanlarını doldur. Hazırladığın **tek dosyalık HTML** sınavını seç.
3. **GitHub paketini hazırla** düğmesine bas. `hacer-hoca-yeni-konu.zip` iner.
4. ZIP'i aç. İçinde tam iki dosya bulunur:
   - `data/konular.json`
   - `etkinlikler/<sinif>-sinif/<ders>/<konu>/index.html`
5. Bu iki dosyayı **aynı klasör yollarını koruyarak** GitHub deposuna yükle, var olan `data/konular.json` dosyasının üzerine yaz, Commit changes yap.
6. Portal kendi kataloğunu `data/konular.json` üzerinden okuduğundan ana `index.html` değişmeden konu “Başla” olur.

**Dikkat:** GitHub tarayıcı yükleyicisi tek bir ZIP dosyasını otomatik açmaz. Dosyalar ayrı ayrı doğru hedef klasöre konulmalıdır. Klasör yapısını korumak için GitHub Desktop da kullanılabilir.

## Mimari
- `index.html`: Tek merkezi giriş portalı. Konuları `fetch('./data/konular.json')` ile okur.
- `data/konular.json`: Konu kataloğu. Etkinlik kartlarının durumunu, açıklamasını ve yolunu tutar.
- `araclar/konu-ekle.html`: İnternet üzerinde çalışırken güncel katalog yükler ve yeni sınav HTML ile birlikte güncellenmiş katalog ZIP'i üretir. API anahtarı veya dış kütüphane kullanmaz.
- `etkinlikler/.../index.html`: Her konunun bağımsız interaktif HTML dosyası.

## Özellik ve güvenlik notları
- Bu araç GitHub'a giriş yapmaz veya otomatik yazma yapmaz. Öğretmen dosyaları kendisi yükler.
- Yalnızca güvenilen HTML sınavları yayınlanmalıdır. Yüklenen JavaScript site kökeninde çalışır.
- Öğrenci adları ve karneler merkezi sunucuda toplanmaz.
- Tarayıcıda birden fazla sekmeyle aynı anda konu paketi oluşturup eski katalogları yükleme: her yeni konu eklendikten sonra yönetim aracını yeniden açarak güncel kataloğu yükle.
- Ana sayfayı `file://` ile doğrudan açarsan yeni katalog tarayıcı güvenliği nedeniyle yüklenmeyebilir. Yayınlanan GitHub Pages bağlantısını kullan.

## Eklenecek konu için hazır komut
`HACER YENİ KONU: 3. Sınıf | Matematik | Çarpma ve Bölme`

Yönetim aracındaki **Gemini komutunu kopyala** düğmesi bunun detaylı sürümünü üretir.

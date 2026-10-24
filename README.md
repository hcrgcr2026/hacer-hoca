# Hacer Hoca Öğrenme Atölyesi — GitHub Pages paketi

Bu paket harici kütüphane, sunucu, domain veya ücretli hosting gerektirmez.

## İçerik

- `index.html`: Sınıf (1–4), ders, konu seçimi ve arama özellikli ana eğitim portalı.
- `etkinlikler/3-sinif/matematik/kesirler/index.html`: Daha önce hazırlanan 10 soruluk interaktif kesirler değerlendirmesi. Geri dön bağlantısı eklidir.
- `.nojekyll`: GitHub Pages'in dosyaları olduğu gibi sunması için.

## Yayınlama (mevcut siteyi bozmadan)

1. Arkadaşının hesabında GitHub'a giriş yap: `hcrgcr2026`.
2. `New repository` ile **hacer-hoca** adlı bir **Public** depo aç.
3. Bu ZIP dosyasını bilgisayarında aç, **ZIP'İ DEĞİL İÇİNDEKİ DOSYALARI** depoya yükle. Klasör yollarını koru.
   - Kök dizinde `index.html` olmalı.
   - Kesir uygulaması `etkinlikler/3-sinif/matematik/kesirler/index.html` yolunda olmalı.
   - GitHub web arayüzü klasör yüklemede zorlanırsa proje klasörünün tamamını GitHub Desktop ile aktar.
4. Repo > Settings > Pages > Source: `Deploy from a branch` > Branch: `main` > Folder: `/(root)` > Save.
5. Yayın adresi: `https://hcrgcr2026.github.io/hacer-hoca/`

**Not:** Yukarıdaki adres ancak depo oluşturulup GitHub Pages yayınlandıktan sonra çalışır. Mevcut `yeni-nesil-sorular-kesirler` deponuz değişmez.

## Yeni ders/konu ekleme

1. Örnek: `etkinlikler/3-sinif/matematik/carpma/index.html` klasörüne uygulamanı yerleştir.
2. Portalın kök `index.html` dosyasında `const ACTIVITIES = [` satırını bul.
3. `grade:3, subject:'math', title:'Çarpma ve Bölme'` kaydını `status:'ready', path:'./etkinlikler/3-sinif/matematik/carpma/index.html', detail:'10 soruluk sınav'` alanlarıyla güncelle.
4. Değişiklikleri GitHub'a gönder. Kart otomatik olarak tıklanabilir olacaktır.

## Önemli

- Yalnızca **3. sınıf Matematik / Yeni Nesil Kesirler** etkinliği bu pakette hazırdır. Diğer kartlar planlanmış konu başlıklarıdır ve sınavları henüz yoktur.
- GitHub Pages statik bir barındırmadır; öğrencilerin sonuçlarını öğretmene merkezi olarak göndermez.
- Sınav karnesi öğrencinin cihazında görüntülenir ve indirilebilir.
- Ana portalda öğrenci bilgisi istenmez veya gönderilmez; kesirler sınavı yalnızca kendi çalışma akışında ad-soyad ister.
- Uygulama yerel olarak `index.html` dosyasına çift tıklanarak da önizlenebilir.

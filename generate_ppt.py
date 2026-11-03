import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6]

    # Color Palette
    C_BG = RGBColor(18, 18, 24)          # Deep Charcoal
    C_CARD = RGBColor(28, 28, 36)        # Card Background
    C_CARD_BORDER = RGBColor(50, 50, 65) # Border
    C_RED = RGBColor(217, 4, 41)         # Chili Red
    C_GOLD = RGBColor(247, 127, 0)       # Amber Gold
    C_WHITE = RGBColor(255, 255, 255)    # White
    C_MUTED = RGBColor(180, 180, 195)    # Muted Gray
    C_GREEN = RGBColor(37, 211, 102)     # WhatsApp Green
    C_RED_TINT = RGBColor(60, 20, 30)

    def set_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
        bg.fill.solid()
        bg.fill.fore_color.rgb = C_BG
        bg.line.fill.background()
        return bg

    def add_header(slide, tag_text, title_text, subtitle_text):
        # Tag pill
        tag_box = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.45), Inches(3.2), Inches(0.38))
        tag_box.fill.solid()
        tag_box.fill.fore_color.rgb = C_RED_TINT
        tag_box.line.color.rgb = C_RED
        tag_box.line.width = Pt(1)
        tf_tag = tag_box.text_frame
        tf_tag.word_wrap = True
        tf_tag.vertical_anchor = MSO_ANCHOR.MIDDLE
        p_tag = tf_tag.paragraphs[0]
        p_tag.alignment = PP_ALIGN.CENTER
        p_tag.text = tag_text.upper()
        p_tag.font.bold = True
        p_tag.font.size = Pt(10)
        p_tag.font.color.rgb = C_GOLD
        p_tag.font.name = "Arial"

        # Main Title
        title_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.88), Inches(11.7), Inches(0.7))
        tf_title = title_box.text_frame
        tf_title.word_wrap = True
        p_title = tf_title.paragraphs[0]
        p_title.text = title_text
        p_title.font.bold = True
        p_title.font.size = Pt(24)
        p_title.font.color.rgb = C_WHITE
        p_title.font.name = "Arial"

        # Subtitle
        if subtitle_text:
            sub_box = slide.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.7), Inches(0.45))
            tf_sub = sub_box.text_frame
            tf_sub.word_wrap = True
            p_sub = tf_sub.paragraphs[0]
            p_sub.text = subtitle_text
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = C_MUTED
            p_sub.font.name = "Arial"

    def add_card(slide, left, top, width, height, title, items, badge="", accent_color=C_RED):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
        card.fill.solid()
        card.fill.fore_color.rgb = C_CARD
        card.line.color.rgb = C_CARD_BORDER
        card.line.width = Pt(1)

        # Content Box
        tbox = slide.shapes.add_textbox(Inches(left + 0.25), Inches(top + 0.2), Inches(width - 0.5), Inches(height - 0.4))
        tf = tbox.text_frame
        tf.word_wrap = True

        p_t = tf.paragraphs[0]
        if badge:
            p_t.text = f"[{badge}] {title}"
        else:
            p_t.text = title
        p_t.font.bold = True
        p_t.font.size = Pt(15)
        p_t.font.color.rgb = accent_color
        p_t.font.name = "Arial"
        p_t.space_after = Pt(10)

        for it in items:
            p_i = tf.add_paragraph()
            p_i.text = f"•  {it}"
            p_i.font.size = Pt(12)
            p_i.font.color.rgb = C_WHITE
            p_i.font.name = "Arial"
            p_i.space_after = Pt(6)

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1)

    # Decorative accent bar
    acc = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(0.2), Inches(4.5))
    acc.fill.solid()
    acc.fill.fore_color.rgb = C_RED
    acc.line.fill.background()

    # Title box
    tbox1 = s1.shapes.add_textbox(Inches(1.3), Inches(1.5), Inches(11), Inches(4.5))
    tf1 = tbox1.text_frame
    tf1.word_wrap = True

    p_badge = tf1.paragraphs[0]
    p_badge.text = "LAPORAN & DOKUMENTASI FITUR SISTEM"
    p_badge.font.bold = True
    p_badge.font.size = Pt(13)
    p_badge.font.color.rgb = C_GOLD
    p_badge.space_after = Pt(14)

    p_main = tf1.add_paragraph()
    p_main.text = "BEDAH FITUR LENGKAP WEBSITE\nAYAM GEPREK CENTENG"
    p_main.font.bold = True
    p_main.font.size = Pt(36)
    p_main.font.color.rgb = C_WHITE
    p_main.space_after = Pt(18)

    p_sub = tf1.add_paragraph()
    p_sub.text = "Platform Landing Page & Katalog Menu Digital Interaktif dengan WhatsApp Checkout Otomatis"
    p_sub.font.size = Pt(16)
    p_sub.font.color.rgb = C_MUTED
    p_sub.space_after = Pt(28)

    p_meta = tf1.add_paragraph()
    p_meta.text = "🌐 Demo Website: https://raya2125.github.io/ayam-geprek-centeng/\n📦 Repository: https://github.com/raya2125/ayam-geprek-centeng"
    p_meta.font.size = Pt(12)
    p_meta.font.color.rgb = C_GOLD

    # -------------------------------------------------------------
    # SLIDE 2: Ikhtisar Ekosistem Web
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2)
    add_header(s2, "Arsitektur & Konsep", "Ikhtisar Ekosistem Website Ayam Geprek Centeng", 
               "Solusi website modern berbasis client-side yang cepat, responsif, dan mudah dikelola untuk UMKM kuliner.")

    add_card(s2, 0.8, 2.1, 3.6, 4.6, "1. Katalog Menu Pintar", [
        "Menampilkan seluruh varian menu dalam bentuk visual yang rapi dan menggugah selera.",
        "Dilengkapi filter kategori dinamis tanpa reload halaman.",
        "Fitur pencarian real-time (Live Search) untuk menemukan makanan seketika.",
        "Pengelompokan jelas: Paket Geprek, Aneka Sambal, Topping, & Minuman."
    ], "FITUR UTAMA", C_RED)

    add_card(s2, 4.8, 2.1, 3.6, 4.6, "2. Keranjang & Transaksi", [
        "Sistem keranjang belanja modern (Slide-over Cart Drawer).",
        "Penambahan porsi cepat dan kalkulasi total belanja otomatis dalam Rupiah.",
        "Pemilihan tingkat kepedasan (Level 0 sampai 10).",
        "Pilihan tipe order: Delivery, Takeaway, atau Makan di Tempat."
    ], "TRANSAKSI", C_GOLD)

    add_card(s2, 8.8, 2.1, 3.6, 4.6, "3. Integrasi & Pengelolaan", [
        "Checkout langsung terhubung ke WhatsApp resmi admin.",
        "Format order otomatis terstruktur seperti invoice digital.",
        "File konfigurasi menu terpisah (menu-data.js) yang mudah diupdate.",
        "Informasi lokasi outlet, jam operasional, dan metode bayar QRIS/Cash."
    ], "OPERASIONAL", C_GREEN)

    # -------------------------------------------------------------
    # SLIDE 3: Header, Navigasi & Promo Bar
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3)
    add_header(s3, "Antarmuka Pengguna", "Fitur 1: Header, Navigasi Cepat & Promo Bar", 
               "Bagian atas website dirancang agar pengunjung langsung mendapatkan informasi penting dan kemudahan navigasi.")

    add_card(s3, 0.8, 2.1, 5.6, 4.6, "Struktur Header & Brand Identity", [
        "Top Announcement Bar: Banner promo merah mencolok di bagian paling atas untuk menyorot informasi operasional dan sambal ulek dadakan.",
        "Sticky Navigation Bar: Menu navigasi menempel di atas layar saat discroll sehingga memudahkan pengunjung berpindah bagian.",
        "Brand Logo & Tagline: Logo api oranye-merah dengan identitas 'Ayam Geprek Centeng - Kuliner Pedas'.",
        "Smooth Scroll Spy: Tautan Beranda, Menu, Kenapa Centeng, dan Lokasi berpindah otomatis menyorot posisi halaman saat ini."
    ], "NAVIGASI", C_RED)

    add_card(s3, 6.8, 2.1, 5.6, 4.6, "Interaktivitas Header", [
        "Cart Trigger Button: Tombol keranjang di navbar dengan indikator counter pesanan (misal: Pesanan [3]) yang terupdate real-time.",
        "One-Click Cart Access: Mengklik tombol langsung membuka drawer keranjang tanpa meninggalkan posisi baca.",
        "Mobile Responsive Toggle: Hamburger menu otomatis aktif pada layar smartphone untuk tampilan yang ringkas dan tidak menumpuk.",
        "Akses Cepat WhatsApp: Tombol floating dan header siap mengarahkan chat ke nomor pemilik secara instan."
    ], "KEMUDAHAN AKSES", C_GOLD)

    # -------------------------------------------------------------
    # SLIDE 4: Hero Section & Quick Add
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4)
    add_header(s4, "Halaman Muka", "Fitur 2: Hero Section & Showcase Signature Menu", 
               "First impression yang kuat dengan proposisi nilai produk dan akses cepat pemesanan.")

    add_card(s4, 0.8, 2.1, 5.6, 4.6, "Headline & Proposisi Nilai", [
        "Catchy Headline: 'Pedasnya Nendang, Ayamnya Renyah Sampe ke Tulang!' mempertegas karakter brand kuliner.",
        "Deskripsi Autentik: Menjelaskan bumbu rempah nusantara marinasi meresap dan proses geprek di cobek batu.",
        "Chips Keunggulan Ringkas: Tiga badge utama (Ulek Dadakan Per Porsi, Bebas Pilih Level 0-10, 100% Ayam Segar & Halal).",
        "Informasi Jam Buka: Label jam operasional 10.00 - 22.00 WIB langsung terlihat tanpa perlu scroll ke bawah."
    ], "VALUE PROPOSITION", C_RED)

    add_card(s4, 6.8, 2.1, 5.6, 4.6, "Kartu Signature & Tombol Aksi", [
        "Call-to-Action Ganda: Tombol 'Pilih Menu Sekarang' (ke katalog) dan 'Pesan Cepat via WA' (langsung buka modal checkout).",
        "Hero Food Showcase: Menampilkan menu andalan 'Paket Geprek Centeng Juara' dengan foto berkualitas tinggi.",
        "Tombol Quick Add (+ Pesan): Pengunjung bisa langsung memasukkan menu andalan ke keranjang hanya dengan satu klik dari banner utama.",
        "Badge Best Seller: Penanda visual yang memandu pembeli baru untuk memilih menu paling favorit."
    ], "CONVERSION FOCUSED", C_GOLD)

    # -------------------------------------------------------------
    # SLIDE 5: Katalog Menu & Live Search
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5)
    add_header(s5, "Eksplorasi Produk", "Fitur 3: Katalog Menu Digital & Pencarian Real-Time", 
               "Pusat daftar makanan yang dirancang modular, interaktif, dan sangat mudah digunakan.")

    add_card(s5, 0.8, 2.1, 5.6, 4.6, "Live Real-Time Search Bar", [
        "Kolom Pencarian Instan: Input pencarian dengan ikon kaca pembesar di atas daftar menu.",
        "Tanpa Reload Halaman: Hasil pencarian menyaring nama dan deskripsi menu secara langsung begitu diketik (oninput event).",
        "Penanganan 'Menu Tidak Ditemukan': Menampilkan pesan bersahabat jika kata kunci tidak cocok dengan saran kategori lain.",
        "Pencarian Fleksibel: Bisa mencari berdasarkan nama paket, jenis sambal (matah/ijo), maupun minuman."
    ], "PENCARIAN CERDAS", C_RED)

    add_card(s5, 6.8, 2.1, 5.6, 4.6, "Tab Filter Kategori & Kartu Menu", [
        "5 Tab Kategori Interaktif: Semua Menu, Paket Geprek, Aneka Sambal, Topping & Tambahan, serta Minuman Segar.",
        "Informasi Kartu Menu Lengkap: Foto jernih, badge status (Favorit/Hemat/Spesial), harga resmi Rupiah, dan deskripsi porsi.",
        "Indikator Level Pedas: Badge penanda 'Level 0-10' untuk menu yang bisa dikustomisasi tingkat kepedasannya.",
        "Tombol '+ Tambah': Memasukkan pesanan ke keranjang dan otomatis memunculkan cart drawer."
    ], "STRUKTUR KATALOG", C_GOLD)

    # -------------------------------------------------------------
    # SLIDE 6: Keranjang Pesanan (Slide-over Cart Drawer)
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6)
    add_header(s6, "Manajemen Pesanan", "Fitur 4: Keranjang Pesanan (Slide-over Cart Drawer)", 
               "Pengalaman belanja modern mirip aplikasi pesan antar makanan tanpa perlu instal aplikasi.")

    add_card(s6, 0.8, 2.1, 5.6, 4.6, "Mekanisme Slide-over Drawer", [
        "Animasi Halus dari Sisi Kanan: Meluncur mulus ketika ada item yang ditambahkan atau saat tombol pesanan navbar diklik.",
        "Backdrop Blur: Memberikan fokus penuh pada daftar pesanan dengan meredupkan layar belakang.",
        "Indikator Counter Dinamis: Jumlah total item di navbar selalu sinkron saat porsi ditambah atau dikurangi.",
        "Empty State Elegan: Menampilkan ilustrasi dan teks panduan ketika keranjang masih kosong."
    ], "DESAIN DRAWER", C_RED)

    add_card(s6, 6.8, 2.1, 5.6, 4.6, "Kontrol Porsi & Kalkulasi Total", [
        "Kontrol Kuantitas Interaktif: Tombol [-] dan [+] pada tiap item pesanan untuk mengatur jumlah porsi dengan mudah.",
        "Penghapusan Otomatis: Kuantitas yang dikurangi hingga nol akan otomatis dikeluarkan dari keranjang.",
        "Kalkulasi Total Otomatis: Sistem menghitung subtotal per item dan Grand Total belanjaan secara real-time dalam Rupiah.",
        "Tombol Lanjut Checkout: Mengarahkan pelanggan ke tahap konfirmasi detail pengiriman dan level pedas."
    ], "LOGIKA PERHITUNGAN", C_GREEN)

    # -------------------------------------------------------------
    # SLIDE 7: Form Checkout & Integrasi WhatsApp
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7)
    add_header(s7, "Konversi Penjualan", "Fitur 5: Modal Checkout & Integrasi Otomatis WhatsApp", 
               "Menghilangkan friksi checkout dengan mengubah keranjang menjadi format invoice siap kirim via WhatsApp.")

    add_card(s7, 0.8, 2.1, 5.6, 4.6, "Formulir Detail Pesanan", [
        "Nama Pemesan: Kolom wajib untuk identifikasi pelanggan oleh admin.",
        "Ringkasan Pesanan Otomatis: Daftar menu dan rincian kuantitas terisi otomatis dari keranjang belanja.",
        "Pilihan Level Pedas (Dropdown): Tersedia Level 0 (Original), Level 1 (Santai), Level 2, Level 3 (Rekomendasi), Level 5 (Nampol), Level 7, dan Level 10 (Centeng Bar-bar).",
        "Pilihan Tipe Order: Fleksibilitas memilih Delivery (Pesan Antar), Takeaway (Bungkus), atau Dine-in (Makan di Tempat).",
        "Catatan Khusus & Alamat: Kolom untuk detail alamat antar, patokan lokasi, atau instruksi (contoh: 'Sambal dipisah')."
    ], "FORMULIR CHECKOUT", C_RED)

    add_card(s7, 6.8, 2.1, 5.6, 4.6, "Format Pesan WhatsApp Otomatis", [
        "Invoice Terstruktur Rapi: Pesan otomatis tersusun dengan bullet point, nama menu, harga satuan, dan total bayar.",
        "Direct Link WhatsApp API: Membuka aplikasi WhatsApp (Mobile) atau WhatsApp Web (Desktop) tanpa perlu save nomor kontak terlebih dahulu.",
        "Bebas Kesalahan Catat: Admin tidak perlu repot mengetik ulang pesanan karena format data sudah baku dari website.",
        "Permintaan Info Bayar: Format pesan otomatis meminta rekening/QRIS untuk mempercepat proses transaksi."
    ], "INTEGRASI WHATSAPP", C_GREEN)

    # -------------------------------------------------------------
    # SLIDE 8: Banner Katering & Pesanan Partai Besar
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8)
    add_header(s8, "Layanan Khusus", "Fitur 6: Banner Pemesanan Katering & Nasi Kotak", 
               "Fitur khusus untuk menjangkau pangsa pasar korporat, kantor, syukuran, dan acara keluarga.")

    add_card(s8, 0.8, 2.1, 5.6, 4.6, "Peluang Pesanan Skala Besar (B2B / Acara)", [
        "Card Banner Khusus di Bawah Menu: Menyorot kesiapan dapur Centeng melayani pesanan puluhan hingga ratusan box.",
        "Target Pengguna Jelas: Nasi kotak untuk acara kampus, rapat kantor, syukuran, arisan, maupun event komunitas.",
        "Jaminan Kualitas: Menekankan ketepatan waktu pengiriman, packing higienis, dan ketersediaan harga khusus partai besar.",
        "Pemisahan Jalur Pesanan: Membedakan pesanan reguler perorangan dengan pesanan skala katering."
    ], "LAYANAN KATERING", C_RED)

    add_card(s8, 6.8, 2.1, 5.6, 4.6, "Hotline Langsung Admin Katering", [
        "Tombol 'Hubungi Admin Katering': Membuka modal pesanan dengan pre-filled teks 'Pesanan Katering / Nasi Kotak'.",
        "Negosiasi Cepat via WhatsApp: Calon pemesan dapat langsung mendiskusikan budget, tanggal acara, dan menu kombinasi.",
        "Kemudahan Edit Jumlah: Form tetap mengizinkan kustomisasi catatan khusus seperti permintaan kemasan bento/box.",
        "Meningkatkan Nilai Transaksi: Membantu meningkatkan omset penjualan di luar pesanan makan harian."
    ], "FAST TRACK PEMESANAN", C_GOLD)

    # -------------------------------------------------------------
    # SLIDE 9: Nilai Keunggulan (USP)
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9)
    add_header(s9, "Diferensiasi Produk", "Fitur 7: Bagian Keunggulan Rasa (Kenapa Centeng?)", 
               "Membangun keyakinan dan selera makan pengunjung melalui 4 pilar kualitas autentik.")

    add_card(s9, 0.8, 2.1, 2.7, 4.6, "Ulekan Dadakan Asli", [
        "Sambal tidak diblender atau disimpan berhari-hari.",
        "Diulek manual per porsi sesaat setelah ada pesanan.",
        "Minyak panas mendidih langsung menyatu dengan aroma cabai dan bawang."
    ], "PILAR 1", C_RED)

    add_card(s9, 3.8, 2.1, 2.7, 4.6, "Ayam Segar Jumbo", [
        "Hanya menggunakan daging ayam potong segar setiap hari.",
        "Marinasi bumbu rempah nusantara meresap sampai ke serat terdalam.",
        "Tekstur renyah di luar, daging tebal dan juicy di dalam."
    ], "PILAR 2", C_GOLD)

    add_card(s9, 6.8, 2.1, 2.7, 4.6, "100% Cabai Rawit", [
        "Tanpa campuran bubuk cabai sintetis atau saus pewarna.",
        "Menggunakan kombinasi cabai rawit merah petik segar.",
        "Pedas alami yang tidak membuat perut begah."
    ], "PILAR 3", C_RED)

    add_card(s9, 9.8, 2.1, 2.7, 4.6, "Porsi Kenyang Murah", [
        "Penetapan harga yang sangat terjangkau.",
        "Ramah di kantong pelajar, mahasiswa, dan pekerja.",
        "Porsi mengenyangkan untuk makan siang dan malam."
    ], "PILAR 4", C_GOLD)

    # -------------------------------------------------------------
    # SLIDE 10: Outlet, Pembayaran & Lokasi
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10)
    add_header(s10, "Informasi Kedai", "Fitur 8: Informasi Outlet, Jam Buka & Metode Pembayaran", 
               "Memudahkan pelanggan yang ingin makan langsung di tempat (Dine-in) atau mengecek area layanan.")

    add_card(s10, 0.8, 2.1, 5.6, 4.6, "Informasi Kedai & Navigasi Maps", [
        "Alamat Jelas Kedai: Jl. Sentra Kuliner Nusantara No. 8 dengan informasi area parkir luas dan nyaman.",
        "Jam Operasional Lengkap: Buka setiap hari dari pukul 10.00 hingga 22.00 WIB.",
        "Kontak Resmi WhatsApp: Menampilkan nomor WhatsApp admin (+62 812-3456-7890) yang responsif.",
        "Integrasi Tombol Google Maps: Tautan langsung ke Google Maps memudahkan pengunjung mencari rute menuju kedai."
    ], "LOKASI & KONTAK", C_RED)

    add_card(s10, 6.8, 2.1, 5.6, 4.6, "Metode Pembayaran & Kemitraan Ojol", [
        "Stampel Sertifikasi 100% Halal: Memberikan rasa aman dan kepastian bagi seluruh konsumen muslim.",
        "Multi-Payment Support: Menampilkan badge metode pembayaran lengkap (QRIS, Tunai / Cash, Transfer Bank).",
        "Dukungan Ojek Online: Informasi bahwa kedai juga melayani pemesanan lewat GoFood, GrabFood, dan ShopeeFood.",
        "Fleksibilitas Pelanggan: Melayani makan di kedai, take-away bungkus, maupun pesan antar langsung via WhatsApp."
    ], "PEMBAYARAN & LAYANAN", C_GOLD)

    # -------------------------------------------------------------
    # SLIDE 11: Sistem Pengelolaan Modular (menu-data.js)
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    set_bg(s11)
    add_header(s11, "Kemudahan Pemilik", "Fitur 9: Pengelolaan Data Modular (menu-data.js)", 
               "Arsitektur kode yang mempermudah pemilik bisnis mengubah menu kapan saja tanpa perlu menyentuh kode HTML.")

    add_card(s11, 0.8, 2.1, 5.6, 4.6, "Arsitektur Data Terpisah", [
        "Pemisahan Logika & Data: Seluruh data menu dan nomor WhatsApp dikumpulkan dalam satu file konfigurasi terpusat: menu-data.js.",
        "Pengisian Nama Menu Nanti: Didesain dengan placeholder yang sangat rapi sehingga pemilik dapat mengisi nama menu saat sudah siap.",
        "Atribut Menu Fleksibel: Mengatur nama, kategori (geprek/sambal/camilan/minuman), harga (angka & format Rp), link gambar, dan status pedas.",
        "Penggantian Nomor WhatsApp Cepat: Cukup ganti konstanta WA_PHONE_NUMBER di baris teratas file menu-data.js."
    ], "KEMUDAHAN KUSTOMISASI", C_RED)

    add_card(s11, 6.8, 2.1, 5.6, 4.6, "Struktur Objek Menu (Contoh Kode)", [
        "Contoh Format Objek Menu:\n  {\n    id: 1,\n    name: 'Paket Geprek Centeng 1',\n    category: 'geprek',\n    price: 18000,\n    formattedPrice: 'Rp 18.000',\n    badge: 'Best Seller',\n    description: 'Ayam crispy jumbo + sambal ulek dadakan.',\n    image: 'https://...',\n    isSpicySelectable: true\n  }",
        "Otomatis Ter-render di Website: Setiap penambahan atau perubahan objek menu langsung tampil di katalog dan keranjang secara otomatis."
    ], "KODE BERSIH & RAPI", C_GOLD)

    # -------------------------------------------------------------
    # SLIDE 12: Kesimpulan & Nilai Bisnis
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    set_bg(s12)
    add_header(s12, "Penutup", "Kesimpulan: Nilai Bisnis Website Ayam Geprek Centeng", 
               "Transformasi digital sederhana namun berdampak besar bagi kemajuan usaha kuliner.")

    add_card(s12, 0.8, 2.1, 3.6, 4.6, "1. Pengalaman Pelanggan", [
        "Pelanggan dapat melihat katalog makanan kapan saja dengan visual menggugah selera.",
        "Pencarian cepat dan keranjang belanja memudahkan memilih porsi.",
        "Bebas menentukan level pedas sesuai toleransi rasa masing-masing."
    ], "BAGI KONSUMEN", C_RED)

    add_card(s12, 4.8, 2.1, 3.6, 4.6, "2. Efisiensi Operasional", [
        "Format pesanan WhatsApp yang masuk sudah tersusun rapi layaknya nota digital.",
        "Mengurangi waktu tanya jawab menu, harga, dan total belanjaan.",
        "Mendukung pesanan harian maupun partai besar katering secara simultan."
    ], "BAGI ADMIN KEDAI", C_GOLD)

    add_card(s12, 8.8, 2.1, 3.6, 4.6, "3. Aset Digital Siap Pakai", [
        "Kode bersih, ringan, dan siap di-hosting di GitHub Pages gratis.",
        "Dapat dibuka lancar di semua smartphone tanpa lag atau aplikasi tambahan.",
        "Data menu mudah diperbarui seiring perkembangan varian produk kedai."
    ], "SKALABILITAS", C_GREEN)

    output_path = os.path.join(os.getcwd(), "Presentasi_Fitur_Web_Ayam_Geprek_Centeng.pptx")
    prs.save(output_path)
    print(f"Presentation saved to: {output_path}")

if __name__ == "__main__":
    create_deck()

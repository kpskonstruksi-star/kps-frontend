"use client";

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const WELCOME_STORAGE_KEY = "kps-welcome-dismissed";

function normalizeOptionalEmail(value: string): string {
  const t = value.trim();
  if (!t) return "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t) ? t : "";
}

const serviceList = [
  {
    title: "Desain Bangunan & Interior",
    description: "Desain fungsional dan estetis sesuai karakter kebutuhan Anda.",
    icon: "🏠"
  },
  {
    title: "Perhitungan RAB",
    description: "Estimasi biaya transparan agar proyek lebih terencana dari awal.",
    icon: "📊"
  },
  {
    title: "Gambar IMB",
    description: "Dukungan dokumen teknis untuk proses pengurusan perizinan.",
    icon: "📋"
  },
  {
    title: "Pembangunan Rumah & Gedung",
    description: "Eksekusi konstruksi dari pondasi hingga finishing berkualitas.",
    icon: "🏗️"
  },
  {
    title: "Renovasi Bangunan",
    description: "Peremajaan rumah dan gedung tanpa mengganggu fungsi utama.",
    icon: "🔧"
  },
  {
    title: "Pekerjaan Taman / Landscape",
    description: "Penataan area luar agar lebih asri, rapi, dan nyaman.",
    icon: "🌿"
  },
  {
    title: "Rangka Atap & Plafon",
    description: "Pengerjaan rangka ringan dan plafon presisi untuk durabilitas.",
    icon: "🏡"
  },
  {
    title: "Furniture / Meubel Interior",
    description: "Pembuatan furniture custom agar ruang lebih optimal dan elegan.",
    icon: "🪑"
  },
  {
    title: "Pagar, Railing & Kanopi",
    description: "Pengerjaan elemen eksterior kuat dengan desain tetap menarik.",
    icon: "🛡️"
  },
  {
    title: "Instalasi Listrik",
    description: "Instalasi dan perbaikan listrik dikerjakan aman dan profesional.",
    icon: "⚡"
  }
];

const portfolioList = [
  { title: "Renovasi Rumah", image: "/portfolio/portfolio-1.png" },
  { title: "Furniture Interior", image: "/portfolio/portfolio-2.png" },
  { title: "Renovasi Gedung", image: "/portfolio/portfolio-3.png" },
  { title: "Rangka Atap & Plafon", image: "/portfolio/portfolio-4.png" },
  { title: "Pembangunan Rumah", image: "/portfolio/portfolio-5.png" },
  { title: "Sumur Bor", image: "/portfolio/portfolio-6.png" },
  { title: "Instalasi Listrik", image: "/portfolio/portfolio-7.png" }
];

const reasonList = [
  {
    title: "Harga Transparan & Terjangkau",
    description:
      "RAB detail sebelum proyek dimulai, tanpa biaya tersembunyi di tengah jalan."
  },
  {
    title: "Tim Berpengalaman & Terlatih",
    description:
      "Tenaga kerja lapangan dan supervisor kami berpengalaman mengelola banyak jenis proyek."
  },
  {
    title: "Material Berkualitas",
    description:
      "Pemilihan material mengutamakan ketahanan jangka panjang dan hasil akhir yang rapi."
  },
  {
    title: "Layanan Purna Jual",
    description:
      "Kami tetap mendampingi setelah serah terima untuk perbaikan minor dan evaluasi."
  }
];

const testimonialList = [
  {
    name: "Andi Prasetyo",
    role: "Pemilik Rumah - Surabaya",
    quote:
      "KPS mengerjakan renovasi rumah saya dengan rapi dan tepat waktu. Komunikasi timnya juga jelas dari awal sampai akhir."
  },
  {
    name: "Siti Rahayu",
    role: "Pengusaha - Gresik",
    quote:
      "Proyek ruko berjalan sesuai target. Progress transparan, pelaksanaan disiplin, dan kualitas pengerjaan sangat memuaskan."
  },
  {
    name: "Bambang Hadi",
    role: "Pemilik Usaha - Sidoarjo",
    quote:
      "Pengerjaan sumur bor dan instalasi listrik selesai cepat, bersih, dan timnya komunikatif menjelaskan setiap proses."
  }
];

const navItems = [
  { id: "layanan", label: "Layanan" },
  { id: "portfolio", label: "Portofolio" },
  { id: "keunggulan", label: "Keunggulan" },
  { id: "testimoni", label: "Klien" },
  { id: "kontak", label: "Kontak" }
];

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState("layanan");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [logoMissing, setLogoMissing] = useState(false);
  const [apiData, setApiData] = useState<{ message?: string; status?: string } | null>(null);
  const [apiError, setApiError] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [contactPage, setContactPage] = useState({
    name: "",
    phone: "",
    email: "",
    workType: "",
    message: ""
  });
  const [contactModal, setContactModal] = useState({
    name: "",
    phone: "",
    email: "",
    workType: "",
    message: ""
  });
  const [pageSubmit, setPageSubmit] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pageSubmitMsg, setPageSubmitMsg] = useState("");
  const [modalSubmit, setModalSubmit] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [modalSubmitMsg, setModalSubmitMsg] = useState("");
  const [consultBanner, setConsultBanner] = useState<string | null>(null);
  const consultationOpenRef = useRef(false);

  useEffect(() => {
    consultationOpenRef.current = isConsultationOpen;
  }, [isConsultationOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
      setScrollProgress(Math.min(Math.max(progress, 0), 100));
      setIsScrolled(y > 18);
      setShowBackTop(y > 420);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: 0.01 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/data`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setApiData(data))
      .catch(() => setApiError(true));
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(WELCOME_STORAGE_KEY)) return;
    const t = window.setTimeout(() => {
      if (sessionStorage.getItem(WELCOME_STORAGE_KEY)) return;
      if (consultationOpenRef.current) return;
      setWelcomeOpen(true);
    }, 2800);
    return () => window.clearTimeout(t);
  }, []);

  const dismissWelcome = useCallback(() => {
    setWelcomeOpen(false);
    try {
      sessionStorage.setItem(WELCOME_STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const openConsultation = useCallback(() => {
    setWelcomeOpen(false);
    setIsConsultationOpen(true);
  }, []);
  const closeConsultation = useCallback(() => setIsConsultationOpen(false), []);

  useEffect(() => {
    if (isConsultationOpen) {
      setModalSubmit("idle");
      setModalSubmitMsg("");
    }
  }, [isConsultationOpen]);

  const modalOpen = isConsultationOpen || welcomeOpen;

  useEffect(() => {
    if (!modalOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isConsultationOpen) closeConsultation();
        else dismissWelcome();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen, isConsultationOpen, welcomeOpen, closeConsultation, dismissWelcome]);

  const topbarClass = useMemo(
    () => `topbar ${isScrolled ? "topbar-scrolled" : ""}`.trim(),
    [isScrolled]
  );

  const jumpToSection = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
  };

  const submitContactPage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPageSubmit("loading");
    setPageSubmitMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "page",
          name: contactPage.name.trim(),
          phone: contactPage.phone.trim(),
          email: contactPage.email.trim(),
          workType: contactPage.workType.trim(),
          message: contactPage.message.trim()
        })
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setPageSubmit("error");
        setPageSubmitMsg(typeof data.message === "string" ? data.message : "Gagal mengirim. Periksa data Anda.");
        return;
      }
      setPageSubmit("success");
      setPageSubmitMsg(data.message ?? "Permintaan telah dikirim ke email kami.");
      setContactPage({ name: "", phone: "", email: "", workType: "", message: "" });
    } catch {
      setPageSubmit("error");
      setPageSubmitMsg("Tidak dapat terhubung ke server. Coba lagi nanti.");
    }
  };

  const submitContactModal = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setModalSubmit("loading");
    setModalSubmitMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "modal",
          name: contactModal.name.trim(),
          phone: contactModal.phone.trim(),
          email: normalizeOptionalEmail(contactModal.email),
          workType: contactModal.workType.trim(),
          message: contactModal.message.trim()
        })
      });
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      if (!res.ok) {
        setModalSubmit("error");
        setModalSubmitMsg(typeof data.message === "string" ? data.message : "Gagal mengirim.");
        return;
      }
      setModalSubmit("success");
      setConsultBanner(data.message ?? "Permintaan konsultasi telah dikirim. Tim KPS akan menghubungi Anda.");
      setContactModal({ name: "", phone: "", email: "", workType: "", message: "" });
      closeConsultation();
      window.setTimeout(() => setConsultBanner(null), 10000);
    } catch {
      setModalSubmit("error");
      setModalSubmitMsg("Tidak dapat terhubung ke server.");
    }
  };

  return (
    <main className="home">
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {consultBanner ? (
        <div className="consult-banner" role="status">
          {consultBanner}
        </div>
      ) : null}


      <header className={topbarClass}>
        <div className="brand">
          {!logoMissing ? (
            <Image
              src="/logo-kps.png"
              alt="Logo KPS Konstruksi"
              className="brand-logo"
              width={46}
              height={46}
              onError={() => setLogoMissing(true)}
            />
          ) : (
            <span className="brand-mark">▦</span>
          )}
          <div>
            <p className="brand-title">KPS Konstruksi</p>
            <p className="brand-subtitle">Solusi bangun murah dan berkualitas</p>
          </div>
        </div>
        <nav className="menu">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`menu-link ${activeSection === item.id ? "menu-link-active" : ""}`}
              onClick={() => jumpToSection(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="topbar-actions">
          <span
            className={`api-status ${apiData ? "api-status-ok" : apiError ? "api-status-err" : "api-status-pending"}`}
            title={apiData?.message ?? (apiError ? "Gagal terhubung ke server" : "Menghubungkan…")}
          >
            <span className="api-status-dot" aria-hidden />
            {apiData ? "Server aktif" : apiError ? "Offline" : "…"}
          </span>
          <button className="primary-btn" type="button" onClick={openConsultation}>
            Konsultasi Gratis
          </button>
          <button
            className="mobile-menu-btn"
            type="button"
            aria-label="Buka menu"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>
      </header>

      {isMobileMenuOpen ? (
        <>
          <button
            className="mobile-menu-backdrop"
            type="button"
            aria-label="Tutup menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="mobile-menu-panel">
            <h3>Menu Navigasi</h3>
            {navItems.map((item) => (
              <button key={item.id} type="button" onClick={() => jumpToSection(item.id)}>
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="primary-btn mobile-menu-cta"
              onClick={() => {
                setIsMobileMenuOpen(false);
                openConsultation();
              }}
            >
              Konsultasi Gratis
            </button>
          </aside>
        </>
      ) : null}

      <section className="hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="section-tag">Kontraktor & Konsultan Bangunan</p>
            {apiData?.message ? (
              <p className="hero-api-hint" role="status">
                {apiData.message}
              </p>
            ) : null}
            <h1>
              Solusi <span>Bangun</span> Berkualitas
            </h1>
            <p>
              KPS Konstruksi hadir memberikan solusi pembangunan, renovasi, dan desain interior dengan hasil rapi,
              tepat waktu, dan transparan.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" type="button" onClick={() => jumpToSection("layanan")}>
                Lihat Layanan
              </button>
              <button className="ghost-btn" type="button" onClick={() => jumpToSection("kontak")}>
                Hubungi Kami
              </button>
            </div>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-visual" aria-hidden="true">
              <svg className="hero-skyline" viewBox="0 0 520 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="heroV1" x1="0" y1="0" x2="520" y2="200" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#fff" stopOpacity="0.2" />
                    <stop offset="1" stopColor="#fff" stopOpacity="0.04" />
                  </linearGradient>
                </defs>
                <rect x="0" y="118" width="68" height="82" rx="2" fill="url(#heroV1)" opacity="0.85" />
                <rect x="78" y="72" width="88" height="128" rx="2" fill="url(#heroV1)" />
                <rect x="178" y="96" width="72" height="104" rx="2" fill="url(#heroV1)" opacity="0.9" />
                <rect x="262" y="52" width="96" height="148" rx="2" fill="url(#heroV1)" />
                <rect x="370" y="88" width="78" height="112" rx="2" fill="url(#heroV1)" opacity="0.88" />
                <rect x="458" y="108" width="62" height="92" rx="2" fill="url(#heroV1)" opacity="0.75" />
                <path stroke="rgba(255,255,255,0.22)" strokeWidth="1" d="M0 168h520M0 132h520" />
              </svg>
              <p className="hero-panel-tagline">Konstruksi · Renovasi · Interior</p>
            </div>
            <aside className="hero-stats">
              <div>
                <strong>15+</strong>
                <span>Tahun Pengalaman</span>
              </div>
              <div>
                <strong>200+</strong>
                <span>Proyek Selesai</span>
              </div>
              <div>
                <strong>98%</strong>
                <span>Kepuasan Klien</span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section id="layanan" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-tag">Kami Melayani</p>
              <h2>Layanan Kami</h2>
            </div>
            <p className="section-note">
              Semua kebutuhan konstruksi dan bangunan Anda kami tangani dengan standar
              profesional dengan harga yang kompetitif.
            </p>
          </div>
          <div className="service-grid">
            {serviceList.map((service, index) => (
              <article key={service.title} className="service-card">
                <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="service-icon">{service.icon}</span>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-tag">Hasil Nyata</p>
              <h2>Portofolio Proyek</h2>
            </div>
            <button className="ghost-btn" type="button" onClick={() => jumpToSection("kontak")}>
              Konsultasi Proyek
            </button>
          </div>
          <div className="portfolio-grid">
            {portfolioList.map((project) => (
              <article key={project.image} className="portfolio-card">
                <Image
                  src={project.image}
                  alt={project.title}
                  className="portfolio-image"
                  fill
                  sizes="(max-width: 760px) 100vw, (max-width: 900px) 50vw, 33vw"
                />
                <div className="portfolio-overlay">
                  <p className="portfolio-year">Proyek KPS</p>
                  <h3>{project.title}</h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="keunggulan" className="section highlight">
        <div className="reasons">
          <p className="section-tag">Kenapa Pilih KPS</p>
          <h2>Kenapa KPS?</h2>
          <ul>
            {reasonList.map((reason, index) => (
              <li key={reason.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{reason.title}</h3>
                  <p>{reason.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="highlight-stats">
          <strong>15+</strong>
          <p>Tahun membangun kepercayaan</p>
          <div className="badge-row">
            <span>Sejuk</span>
            <span>Rapi</span>
            <span>Aman</span>
            <span>Bergaransi</span>
          </div>
        </div>
      </section>

      <section id="testimoni" className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="section-tag">Kepercayaan Klien</p>
              <h2>Apa Kata Mereka</h2>
            </div>
          </div>
          <div className="testimonial-grid">
            {testimonialList.map((testimonial) => (
              <article key={testimonial.name} className="testimonial-card">
                <p>{testimonial.quote}</p>
                <h3>{testimonial.name}</h3>
                <span>{testimonial.role}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="kontak" className="section">
        <div className="container contact">
          <div className="contact-info">
            <p className="section-tag">Mulai Proyek Anda</p>
            <h2>Hubungi Kami</h2>
            <ul>
              <li>
                Alamat: Jalan Brigjen Katamso VI/214, Rt.14 / Rw.02, Desa Janti, Kec. Waru, Kab. Sidoarjo — Jawa Timur
              </li>
              <li>
                <strong>Contact person:</strong> Ketut Kampil —{" "}
                <a href="tel:+6281357019928">0813 5701 9928</a>
              </li>
              <li>
                Kaji Dori — <a href="tel:+628965056464">0896 6505 6464</a>
              </li>
              <li>
                Email: <a href="mailto:kpskonstruksi@gmail.com">kpskonstruksi@gmail.com</a>
              </li>
              <li>Jam operasional: Senin–Sabtu 08.00–17.00 WIB</li>
            </ul>
          </div>
          <form className="contact-form" onSubmit={submitContactPage}>
            {pageSubmit === "success" ? (
              <p className="form-feedback form-feedback--ok" role="status">
                {pageSubmitMsg}
              </p>
            ) : null}
            {pageSubmit === "error" ? (
              <p className="form-feedback form-feedback--err" role="alert">
                {pageSubmitMsg}
              </p>
            ) : null}
            <div className="input-row">
              <input
                type="text"
                name="name"
                placeholder="Nama Anda"
                required
                autoComplete="name"
                value={contactPage.name}
                onChange={(e) => setContactPage((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                type="tel"
                name="phone"
                placeholder="08xx-xxxx-xxxx"
                required
                autoComplete="tel"
                value={contactPage.phone}
                onChange={(e) => setContactPage((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <input
              type="email"
              name="email"
              placeholder="email@anda.com"
              required
              autoComplete="email"
              value={contactPage.email}
              onChange={(e) => setContactPage((p) => ({ ...p, email: e.target.value }))}
            />
            <select
              name="workType"
              required
              value={contactPage.workType}
              onChange={(e) => setContactPage((p) => ({ ...p, workType: e.target.value }))}
            >
              <option value="" disabled>
                -- Pilih Jenis Pekerjaan --
              </option>
              <option>Desain & Interior</option>
              <option>Pembangunan Rumah & Gedung</option>
              <option>Renovasi Bangunan</option>
              <option>Instalasi Listrik</option>
              <option>Sumur Bor</option>
            </select>
            <textarea
              name="message"
              placeholder="Ceritakan kebutuhan proyek Anda (minimal 10 karakter)..."
              rows={5}
              required
              minLength={10}
              value={contactPage.message}
              onChange={(e) => setContactPage((p) => ({ ...p, message: e.target.value }))}
            />
            <button className="primary-btn" type="submit" disabled={pageSubmit === "loading"}>
              {pageSubmit === "loading" ? "Mengirim…" : "Kirim Permintaan Konsultasi"}
            </button>
          </form>
        </div>
      </section>

      <footer className="footer">
        <div>
          <p className="brand-title">KPS Konstruksi</p>
          <p>
            Melayani kebutuhan konstruksi, renovasi, dan desain bangunan dengan standar
            kualitas terbaik.
          </p>
        </div>
        <div>
          <h3>Layanan</h3>
          <p>Desain & Interior</p>
          <p>Perhitungan RAB</p>
          <p>Pembangunan</p>
          <p>Renovasi</p>
        </div>
        <div>
          <h3>Spesialis</h3>
          <p>Rangka Atap & Plafon</p>
          <p>Furniture Interior</p>
          <p>Instalasi Listrik</p>
          <p>Sumur Bor</p>
        </div>
        <div>
          <h3>Perusahaan</h3>
          <p>Tentang Kami</p>
          <p>Portofolio</p>
          <p>Testimoni</p>
          <p>Kontak</p>
        </div>
      </footer>

      <a
        className="floating-wa"
        href="https://wa.me/6281357019928"
        target="_blank"
        rel="noreferrer"
        title="WhatsApp Ketut Kampil"
      >
        WA
      </a>

      {showBackTop ? (
        <button className="back-top" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          ↑
        </button>
      ) : null}

      {welcomeOpen ? (
        <div
          className="modal-wrap modal-wrap--welcome"
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-popup-title"
        >
          <button className="modal-backdrop" type="button" aria-label="Tutup" onClick={dismissWelcome} />
          <div className="welcome-card">
            <button className="modal-close" type="button" aria-label="Tutup popup" onClick={dismissWelcome}>
              ×
            </button>
            <div className="welcome-card-accent" aria-hidden />
            <div className="welcome-card-icon" aria-hidden>
              🏗️
            </div>
            <h2 id="welcome-popup-title">Bangun impian Anda bersama KPS</h2>
            <p className="welcome-card-lead">
              Konsultasi pertama gratis: estimasi awal, saran material, dan timeline realistis untuk proyek Anda.
            </p>
            <ul className="welcome-benefits">
              <li>Respons cepat via WhatsApp</li>
              <li>RAB transparan tanpa biaya tersembunyi</li>
              <li>Tim lapangan berpengalaman</li>
            </ul>
            <div className="welcome-card-actions">
              <button
                type="button"
                className="primary-btn welcome-cta-primary"
                onClick={() => {
                  dismissWelcome();
                  openConsultation();
                }}
              >
                Mulai konsultasi
              </button>
              <button type="button" className="ghost-btn welcome-cta-secondary" onClick={dismissWelcome}>
                Lihat situs dulu
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isConsultationOpen ? (
        <div
          className="modal-wrap modal-wrap--consult"
          role="dialog"
          aria-modal="true"
          aria-labelledby="consult-modal-title"
        >
          <button className="modal-backdrop" type="button" aria-label="Tutup popup" onClick={closeConsultation} />
          <div className="modal-card modal-card--rich">
            <button className="modal-close" type="button" aria-label="Tutup" onClick={closeConsultation}>
              ×
            </button>
            <div className="modal-card-head">
              <span className="modal-badge">Gratis</span>
              <h3 id="consult-modal-title">Konsultasi proyek</h3>
              <p>
                Tim KPS siap membantu estimasi kebutuhan proyek Anda. Lengkapi data singkat berikut — kami hubungi
                segera.
              </p>
            </div>
            <form className="modal-form" onSubmit={submitContactModal}>
              {modalSubmit === "error" ? (
                <p className="form-feedback form-feedback--err modal-form-feedback" role="alert">
                  {modalSubmitMsg}
                </p>
              ) : null}
              <input
                type="text"
                placeholder="Nama lengkap"
                required
                autoComplete="name"
                value={contactModal.name}
                onChange={(e) => setContactModal((p) => ({ ...p, name: e.target.value }))}
              />
              <input
                type="tel"
                placeholder="No. WhatsApp aktif"
                required
                autoComplete="tel"
                value={contactModal.phone}
                onChange={(e) => setContactModal((p) => ({ ...p, phone: e.target.value }))}
              />
              <input
                type="email"
                placeholder="Email (opsional)"
                autoComplete="email"
                value={contactModal.email}
                onChange={(e) => setContactModal((p) => ({ ...p, email: e.target.value }))}
              />
              <select
                required
                value={contactModal.workType}
                onChange={(e) => setContactModal((p) => ({ ...p, workType: e.target.value }))}
              >
                <option value="" disabled>
                  Pilih kebutuhan
                </option>
                <option>Pembangunan rumah baru</option>
                <option>Renovasi rumah / gedung</option>
                <option>Desain & RAB</option>
                <option>Pekerjaan utilitas</option>
              </select>
              <textarea
                placeholder="Detail singkat (opsional)"
                rows={3}
                value={contactModal.message}
                onChange={(e) => setContactModal((p) => ({ ...p, message: e.target.value }))}
              />
              <div className="modal-actions">
                <button type="button" className="ghost-btn" onClick={closeConsultation}>
                  Nanti saja
                </button>
                <button type="submit" className="primary-btn" disabled={modalSubmit === "loading"}>
                  {modalSubmit === "loading" ? "Mengirim…" : "Kirim ke email kami"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}

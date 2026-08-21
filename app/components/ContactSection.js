/**
 * Sección de contacto de la home.
 *
 * Dos columnas: redes/contacto (email, LinkedIn, GitHub, Instagram) y un
 * formulario (nombre, email, mensaje) con animaciones CSS via FadeInUp.
 *
 * El envío usa EmailJS (client-side, sin backend). Configura en .env.local:
 *  - NEXT_PUBLIC_EMAILJS_SERVICE_ID
 *  - NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
 *  - NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
 */
"use client";

import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import emailjs from "@emailjs/browser";
import { useLanguage } from "@/app/context/LanguageContext";
import FadeInUp from "./FadeInUp";
import Volver from "./Volver";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

export default function ContactSection() {
  const { t } = useLanguage();

  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    privacy: false,
  });
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormState((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.privacy) {
      setStatus("error");
      setErrorMsg(t.contact.privacyError);
      return;
    }
    setStatus("sending");
    setErrorMsg(null);
    try {
      if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
        throw new Error("Faltan las variables de EmailJS en .env.local");
      }
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: formState.name,
          from_email: formState.email,
          from_phone: formState.phone,
          message: formState.message,
          privacy: formState.privacy ? "Aceptado" : "No aceptado",
        },
        EMAILJS_PUBLIC_KEY,
      );
      setStatus("success");
      setFormState({ name: "", email: "", phone: "", message: "", privacy: false });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.text || err.message);
      setTimeout(() => {
        setStatus(null);
        setErrorMsg(null);
      }, 8000);
    }
  };

  const resetForm = () => {
    setStatus(null);
    setErrorMsg(null);
  };

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-[var(--line)] bg-[var(--bg-card)] text-sm text-[var(--ink-strong)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-all";
  const labelClass =
    "block text-xs font-semibold uppercase tracking-wider mb-2 text-[var(--ink-soft)]";

  return (
    <section
      id="contacto"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--bg-section-glass)]"
    >
      <div className="max-w-6xl mx-auto">
        <FadeInUp>
          <span className="font-mono inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[var(--accent)] border border-accent-20 bg-accent-5 rounded-full px-4 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            {t.contact.badge}
          </span>
        </FadeInUp>

        <FadeInUp delay={100}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-4 mb-4 text-[var(--ink-strong)]">
            {t.contact.title}
          </h2>
        </FadeInUp>

        <FadeInUp delay={200}>
          <p className="text-[var(--ink-soft)] text-base sm:text-lg leading-relaxed max-w-[600px] mb-12">
            {t.contact.description}
          </p>
        </FadeInUp>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <FadeInUp delay={250} className="space-y-6">
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "tu@email.com"}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--line)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-50"
            >
              <div className="w-12 h-12 rounded-xl bg-accent-10 flex items-center justify-center text-[var(--accent)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">{t.contact.email}</p>
                <p className="text-sm font-medium text-[var(--ink-strong)]">{process.env.NEXT_PUBLIC_CONTACT_EMAIL || "tu@email.com"}</p>
              </div>
            </a>

            <a href="https://www.linkedin.com/in/lucioingargiola/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-[var(--line)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-50">
              <div className="w-12 h-12 rounded-xl bg-accent-10 flex items-center justify-center text-[var(--accent)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">LinkedIn</p>
                <p className="text-sm font-medium text-[var(--ink-strong)]">/in/lucioingargiola</p>
              </div>
            </a>

            <a href="https://github.com/LucioingargiolaG" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-[var(--line)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-50">
              <div className="w-12 h-12 rounded-xl bg-accent-10 flex items-center justify-center text-[var(--accent)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">GitHub</p>
                <p className="text-sm font-medium text-[var(--ink-strong)]">@LucioingargiolaG</p>
              </div>
            </a>

            <a href="https://instagram.com/lucio.ingargiola" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-[var(--line)] bg-[var(--bg-card)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent-50">
              <div className="w-12 h-12 rounded-xl bg-accent-10 flex items-center justify-center text-[var(--accent)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-muted)]">Instagram</p>
                <p className="text-sm font-medium text-[var(--ink-strong)]">@lucioingargiola</p>
              </div>
            </a>
          </FadeInUp>

          <FadeInUp delay={300}>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-[var(--line)] bg-[var(--bg-card)] p-6 sm:p-8 shadow-xl space-y-5"
            >
              {status === "success" ? (
                <div className="py-8 text-center animate-[fade-up_0.3s_ease-out_both]">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-[var(--ink-strong)]">
                    {t.contact.successTitle}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {t.contact.successDesc}
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-6 inline-flex items-center gap-2 py-2.5 px-5 rounded-full text-sm font-semibold border border-[var(--line)] text-[var(--ink-soft)] hover:text-[var(--ink-strong)] hover:border-accent transition-all duration-300 cursor-pointer"
                  >
                    {t.contact.sendAnother}
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>{t.contact.name} *</label>
                    <input type="text" name="name" value={formState.name} onChange={handleChange} required placeholder={t.contact.namePlaceholder} className={inputClass} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>{t.contact.email} *</label>
                      <input type="email" name="email" value={formState.email} onChange={handleChange} required placeholder="email@example.com" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>{t.contact.phone}</label>
                      <input type="tel" name="phone" value={formState.phone} onChange={handleChange} placeholder={t.contact.phonePlaceholder} className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{t.contact.message} *</label>
                    <textarea name="message" value={formState.message} onChange={handleChange} required rows={5} placeholder={t.contact.messagePlaceholder} className={`${inputClass} resize-none`} />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" name="privacy" checked={formState.privacy} onChange={handleChange} required className="mt-0.5 w-4 h-4 rounded accent-[var(--accent)] cursor-pointer" />
                    <span className="text-xs text-[var(--ink-soft)] leading-relaxed">
                      {t.contact.privacy}
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full py-3.5 rounded-full font-semibold text-black bg-accent hover:bg-accent-strong transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                  >
                    {status === "sending" ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        {t.contact.sending}
                      </>
                    ) : (
                      t.contact.send
                    )}
                  </button>

                  {status === "error" && errorMsg && (
                    <p className="text-xs text-red-400 text-center break-words bg-red-500/10 border border-red-400/20 rounded-lg px-3 py-2 animate-[fade-up_0.3s_ease-out_both]">
                      {errorMsg}
                    </p>
                  )}
                </>
              )}
            </form>
          </FadeInUp>
        </div>
      </div>

      <Volver />
    </section>
  );
}

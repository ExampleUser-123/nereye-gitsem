/**
 * Giriş / Kaydol ekranı kabuğu.
 *
 * V1'de sunucu olmadığı için bu ekran bir "arayüz hazırlığı"dır.
 * Form doğrulaması yapılır, ancak gerçek hesap işlemleri sunucu/Supabase
 * gelene kadar pasiftir. Sunucu bağlandığında buradaki form handler'ları
 * authentication servisi çağrılarıyla değiştirilecektir.
 */

import { useState } from "react";
import { useNavigation } from "../app/navigation";

export function AuthOverlay() {
  const { back } = useNavigation();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email.includes("@") || !email.includes(".")) {
      setMessage("Lütfen geçerli bir e-posta adresi gir.");
      return;
    }
    if (mode !== "forgot" && password.length < 6) {
      setMessage("Şifre en az 6 karakter olmalı.");
      return;
    }

    setLoading(true);
    // Sunucu gelene kadar simülasyon: 1 sn sonra bilgilendirme mesajı.
    setTimeout(() => {
      setLoading(false);
      if (mode === "forgot") {
        setMessage(
          "Şifre sıfırlama bağlantısı gönderildi (demo). Sunucu aktif olduğunda gerçek e-posta gönderilecek.",
        );
      } else {
        setMessage(
          `${mode === "login" ? "Giriş" : "Kayıt"} işlemi şu anda demo modunda. Sunucu bağlandığında aktif olacak.`,
        );
      }
    }, 800);
  };

  const title =
    mode === "login" ? "Hoş geldin" : mode === "register" ? "Hesap oluştur" : "Şifreni sıfırla";

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-bg">
      {/* Header */}
      <div className="safe-top flex items-center justify-between bg-gradient-to-b from-brand-fog to-bg px-4 pb-4 pt-4">
        <button
          onClick={back}
          className="rounded-full bg-surface px-3 py-1.5 text-sm font-bold text-ink shadow-sm active:scale-95"
        >
          ← Geri
        </button>
        <h1 className="text-lg font-extrabold text-ink">{title}</h1>
        <div className="w-16" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {/* Google ile giriş (placeholder) */}
        <button
          type="button"
          disabled={loading}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-line bg-white py-3.5 text-sm font-bold text-ink shadow-sm active:scale-[0.98] disabled:opacity-50"
          onClick={() =>
            setMessage(
              "Google ile giriş sunucu bağlandığında aktif olacak. Şimdilik e-posta ile demo girişi dene.",
            )
          }
        >
          <span className="text-lg">G</span>
          Google ile devam et
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-line" />
          <span className="text-xs text-muted">ya da e-posta ile</span>
          <div className="h-px flex-1 bg-line" />
        </div>

        {message && (
          <div className="mb-4 rounded-2xl bg-brand-fog px-4 py-3 text-sm font-medium text-brand-dark">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-muted">Adın</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ömer"
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-bold text-muted">E-posta</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sen@ornek.com"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </label>

          {mode !== "forgot" && (
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-muted">Şifre</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-brand py-3.5 text-sm font-bold text-white shadow-sm active:scale-[0.98] disabled:opacity-60"
          >
            {loading
              ? "Bekleyin..."
              : mode === "login"
                ? "Giriş Yap"
                : mode === "register"
                  ? "Kaydol"
                  : "Şifre Sıfırlama Bağlantısı Gönder"}
          </button>
        </form>

        <div className="mt-6 text-center">
          {mode === "login" && (
            <div className="space-y-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setMessage(null);
                }}
                className="block w-full text-center font-semibold text-brand"
              >
                Şifremi unuttum
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setMessage(null);
                }}
                className="block w-full text-center text-muted"
              >
                Hesabın yok mu?{" "}
                <span className="font-bold text-brand">Kaydol</span>
              </button>
            </div>
          )}

          {mode === "register" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage(null);
              }}
              className="text-sm text-muted"
            >
              Zaten hesabın var mı?{" "}
              <span className="font-bold text-brand">Giriş Yap</span>
            </button>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage(null);
              }}
              className="text-sm text-muted"
            >
              ← Giriş ekranına dön
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

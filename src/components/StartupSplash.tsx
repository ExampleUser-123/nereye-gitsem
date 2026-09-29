import { useEffect, useState } from "react";
import appIcon from "../../assets/icon.png";

export function StartupSplash({ onComplete }: { onComplete: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setExiting(true), 1350);
    const completeTimer = window.setTimeout(onComplete, 1800);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`startup-splash${exiting ? " is-exiting" : ""}`}
      role="status"
      aria-label="Nereye Gitsem açılıyor"
    >
      <div className="startup-splash-content">
        <img className="startup-splash-icon" src={appIcon} alt="" />
        <h1 className="startup-splash-title">NEREYE GİTSEM?</h1>
        <p className="startup-splash-tagline">
          Çevrendeki yerleri keşfet,
          <br />
          rotana dönüştür
        </p>
      </div>
    </div>
  );
}

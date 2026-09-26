/**
 * Profil ekranı: profil bilgisi, favoriler, gezi listeleri,
 * son görüntülenen yerler ve ayarlar.
 */

import { useState } from "react";
import { useNavigation } from "../app/navigation";
import { useAppState } from "../app/state";
import * as storage from "../services/storage";
import { PlaceCard } from "../components/PlaceCard";
import { EmptyState } from "../components/states";

export function ProfileScreen() {
  const nav = useNavigation();
  const { profile, setProfileName, favorites, recentsVersion } = useAppState();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(profile.name);
  const [listVersion, setListVersion] = useState(0);

  const lists = storage.getTripLists();
  const recents = storage.getRecents();
  void recentsVersion;

  return (
    <div className="pb-24">
      <header className="safe-top bg-gradient-to-b from-brand-fog to-bg px-4 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl font-black text-white">
            {profile.name.charAt(0).toLocaleUpperCase("tr-TR")}
          </div>
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex gap-2">
                <input
                  value={nameDraft}
                  onChange={(e) => setNameDraft(e.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm outline-none"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setProfileName(nameDraft);
                    setEditing(false);
                  }}
                  className="rounded-xl bg-brand px-3 text-sm font-bold text-white"
                >
                  Kaydet
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNameDraft(profile.name);
                  setEditing(true);
                }}
                className="text-left"
              >
                <p className="truncate text-lg font-extrabold text-ink">
                  {profile.name} ✏️
                </p>
                <p className="text-xs text-muted">Profil adına dokunup düzenle</p>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-surface py-3">
            <p className="text-xl font-black text-brand">{favorites.length}</p>
            <p className="text-[11px] font-semibold text-muted">Favori</p>
          </div>
          <div className="rounded-2xl bg-surface py-3">
            <p className="text-xl font-black text-brand">{lists.length}</p>
            <p className="text-[11px] font-semibold text-muted">Liste</p>
          </div>
          <div className="rounded-2xl bg-surface py-3">
            <p className="text-xl font-black text-brand">{recents.length}</p>
            <p className="text-[11px] font-semibold text-muted">Gezilen kayıt</p>
          </div>
        </div>
      </header>

      <div className="space-y-6 px-4 pt-4">
        {/* Gezi listeleri */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink-soft">📋 Gezi Listelerim</h2>
            <button
              onClick={() => {
                const name = window.prompt("Liste adı (örn. İstanbul Hafta Sonu)");
                if (name?.trim()) {
                  storage.createTripList(name);
                  setListVersion((v) => v + 1);
                }
              }}
              className="rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-white active:scale-95"
            >
              + Yeni Liste
            </button>
          </div>
          {lists.length === 0 ? (
            <EmptyState
              emoji="🗂️"
              title="Henüz listen yok"
              description='Mekân detayında "Gezi listesine ekle" ile "İstanbul Hafta Sonu" gibi listeler oluşturabilirsin.'
            />
          ) : (
            <div className="space-y-2">
              {lists.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm"
                >
                  <button
                    onClick={() => nav.openTripList(l.id)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="truncate font-bold text-ink">{l.name}</p>
                    <p className="text-xs text-muted">{l.placeIds.length} mekân</p>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`"${l.name}" listesi silinsin mi?`)) {
                        storage.deleteTripList(l.id);
                        setListVersion((v) => v + 1);
                      }
                    }}
                    className="rounded-full px-2 py-1 text-sm text-muted"
                    aria-label="Listeyi sil"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Son görüntülenen */}
        <section>
          <h2 className="mb-2 text-sm font-bold text-ink-soft">
            🕘 Son Görüntülenen Yerler
          </h2>
          {recents.length === 0 ? (
            <EmptyState
              emoji="👀"
              title="Henüz yer görüntülemedin"
              description="Bir mekân detayını açtığında burada görünür."
            />
          ) : (
            <div className="space-y-2">
              {recents.slice(0, 5).map((ref) => (
                <PlaceCard
                  key={ref.placeId}
                  place={ref}
                  onClick={() => nav.openPlace(ref)}
                  onNavigate={() => nav.openPlace(ref)}
                />
              ))}
            </div>
          )}
        </section>

        {/* Ayarlar */}
        <section className="rounded-2xl bg-surface shadow-sm">
          <h2 className="px-4 pt-3 text-sm font-bold text-ink-soft">⚙️ Ayarlar</h2>
          <div className="divide-y divide-line px-4 pb-1">
            <SettingRow
              icon="📱"
              label="Uygulama"
              value="NEREYE GİTSEM? v1.0"
            />
            <SettingRow
              icon="🗺️"
              label="Veri kaynağı"
              value="OpenStreetMap (ücretsiz, anahtar gerektirmez)"
            />
            <SettingRow
              icon="🔒"
              label="Veriler"
              value="Favoriler ve listeler cihazında saklanır"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <span>{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="truncate text-xs text-muted">{value}</p>
      </div>
    </div>
  );
}

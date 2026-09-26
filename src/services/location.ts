/**
 * Konum servisi: Capacitor Geolocation (native) / navigator.geolocation
 * (web) üzerinden çalışır. İzin verilmediğinde uygulama çökmez;
 * şehir seçimi ve manuel arama yolları açık kalır.
 */

import { Geolocation, type PermissionStatus } from "@capacitor/geolocation";
import type { Coordinates, LocationState } from "../models/types";
import { cached } from "./cache";
import { reverseCityName } from "./osm";

export async function checkPermission(): Promise<
  "granted" | "denied" | "prompt" | "unknown"
> {
  try {
    const status: PermissionStatus = await Geolocation.checkPermissions();
    if (status.location === "granted" || status.coarseLocation === "granted")
      return "granted";
    if (status.location === "denied" || status.coarseLocation === "denied")
      return "denied";
    return "prompt";
  } catch {
    return "unknown";
  }
}

export async function requestPosition(): Promise<LocationState> {
  try {
    const permission = await checkPermission();
    if (permission === "denied") return { status: "denied" };

    if (permission === "prompt") {
      try {
        const req = await Geolocation.requestPermissions();
        if (req.location === "denied" && req.coarseLocation === "denied") {
          return { status: "denied" };
        }
      } catch {
        /* web'de requestPermissions atlanabilir */
      }
    }

    const pos = await Geolocation.getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 12000,
      maximumAge: 60000,
    });

    const coords: Coordinates = {
      lat: pos.coords.latitude,
      lon: pos.coords.longitude,
    };

    let city: string | undefined;
    try {
      city = await cached(
        `usercity:${coords.lat.toFixed(2)},${coords.lon.toFixed(2)}`,
        30 * 60 * 1000,
        () => reverseCityName(coords),
      );
    } catch {
      /* şehir adı opsiyonel */
    }

    return { status: "granted", coords, city };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Konum alınamadı";
    // Kullanıcı tarayıcıdan / cihazdan reddetmişse 'denied' sayılır.
    if (
      message.toLowerCase().includes("denied") ||
      message.toLowerCase().includes("permission")
    ) {
      return { status: "denied" };
    }
    return { status: "unavailable", reason: message };
  }
}

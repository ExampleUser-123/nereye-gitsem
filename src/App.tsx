/**
 * Uygulama kabuğu: sekmeler + overlay yığını.
 */

import { useState } from "react";
import { NavigationProvider, useNavigation } from "./app/navigation";
import { StartupSplash } from "./components/StartupSplash";
import { AppStateProvider } from "./app/state";
import { BottomNav } from "./components/BottomNav";
import { DiscoverScreen } from "./screens/DiscoverScreen";
import { MapScreen } from "./screens/MapScreen";
import { FavoritesScreen } from "./screens/FavoritesScreen";
import { AIScreen } from "./screens/AIScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SearchOverlay } from "./screens/SearchOverlay";
import { CitySelectOverlay } from "./screens/CitySelectOverlay";
import { PlaceDetailScreen } from "./screens/PlaceDetailScreen";
import { TripListOverlay } from "./screens/TripListOverlay";
import { AuthOverlay } from "./screens/AuthOverlay";

function ScreenRouter() {
  const { tab, top } = useNavigation();

  return (
    <>
      <div className={top ? "pointer-events-none select-none" : undefined}>
        {tab === "discover" && <DiscoverScreen />}
        {tab === "map" && <MapScreen />}
        {tab === "favorites" && <FavoritesScreen />}
        {tab === "ai" && <AIScreen />}
        {tab === "profile" && <ProfileScreen />}
        <BottomNav />
      </div>

      {top?.kind === "search" && <SearchOverlay />}
      {top?.kind === "citySelect" && <CitySelectOverlay />}
      {top?.kind === "place" && <PlaceDetailScreen placeRef={top.ref} />}
      {top?.kind === "tripList" && <TripListOverlay listId={top.listId} />}
      {top?.kind === "auth" && <AuthOverlay />}
    </>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      <AppStateProvider>
        <NavigationProvider>
          <div className="app-background mx-auto h-full max-w-lg">
            <ScreenRouter />
          </div>
        </NavigationProvider>
      </AppStateProvider>
      {showSplash && <StartupSplash onComplete={() => setShowSplash(false)} />}
    </>
  );
}

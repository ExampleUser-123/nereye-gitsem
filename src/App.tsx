/**
 * Uygulama kabuğu: sekmeler + overlay yığını.
 */

import { NavigationProvider, useNavigation } from "./app/navigation";
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
    </>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <NavigationProvider>
        <div className="mx-auto h-full max-w-lg bg-bg">
          <ScreenRouter />
        </div>
      </NavigationProvider>
    </AppStateProvider>
  );
}

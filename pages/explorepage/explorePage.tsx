import NavBar from "@/components/common/NavBar";
import ExploreStationList from "@/components/explorepage/ExploreStationList";
import ExploreLeafletMap from "@/components/explorepage/ExploreLeafletMap";

export default function ExplorePage() {
  return (
    <div className="bg-surface text-on-surface antialiased">
      <NavBar showSearch />
      <div className="flex h-screen pt-20">
        <div className="relative flex-1">
          <ExploreLeafletMap />
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
            <button
              id="ptg-explore-zoom-in-btn"
              type="button"
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">add</span>
            </button>
            <button
              id="ptg-explore-zoom-out-btn"
              type="button"
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">remove</span>
            </button>
            <button
              id="ptg-explore-loc-btn"
              type="button"
              className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">my_location</span>
            </button>
          </div>
        </div>
        <ExploreStationList />
      </div>
    </div>
  );
}

import type { GetStaticPaths, GetStaticProps } from "next";
import NavBar from "@/components/common/NavBar";
import Footer from "@/components/common/Footer";
import StationDetailHeader from "@/components/stationdetailpage/StationDetailHeader";
import StationDetailKpiSection from "@/components/stationdetailpage/StationDetailKpiSection";
import TrafficTrendChart from "@/components/stationdetailpage/TrafficTrendChart";
import StationDetailSpacesSection from "@/components/stationdetailpage/StationDetailSpacesSection";
import LocationSpecTable from "@/components/stationdetailpage/LocationSpecTable";
import { STATIONS_BY_ID, type Station } from "@/lib/stations";

export const getStaticPaths: GetStaticPaths = () => ({
  paths: Object.keys(STATIONS_BY_ID).map((id) => ({
    params: { station_id: id },
  })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<{ station: Station }> = ({ params }) => {
  const id = params?.station_id as string;
  const station = STATIONS_BY_ID[id];
  if (!station) return { notFound: true };
  return { props: { station } };
};

export default function StationDetailPage({ station }: { station: Station }) {
  return (
    <div className="bg-surface text-on-surface antialiased">
      <NavBar />
      <main className="flex-1 bg-surface text-on-surface font-body min-h-screen relative">
        <div className="relative flex-1 min-h-screen w-full">
          <div className="absolute inset-0 z-0 bg-surface" />
          <div
            className="absolute inset-0 z-[1] bg-cover bg-center bg-no-repeat opacity-[0.11] pointer-events-none"
            style={{ backgroundImage: `url('${station.image}')` }}
          />
          <div className="relative z-10 max-w-[1200px] mx-auto w-full px-6 py-8 pt-28 pb-28">
            <StationDetailHeader station={station} />
            <div className="space-y-12">
              <StationDetailKpiSection station={station} />
              <TrafficTrendChart station={station} />
              <StationDetailSpacesSection station={station} />
              <LocationSpecTable station={station} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

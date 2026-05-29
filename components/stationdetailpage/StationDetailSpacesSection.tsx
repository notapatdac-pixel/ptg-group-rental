import Link from "next/link";
import { Station } from "@/lib/stations";
import { useAuth } from "@/lib/authContext";

const BTN_PRIMARY_BLOCK =
  "inline-flex items-center justify-center primary-gradient text-white w-full py-2 rounded-md text-sm font-bold shadow-sm border-0 cursor-pointer transition-all hover:shadow-lime-500/40 hover:ring-2 hover:ring-lime-300 hover:ring-offset-2 hover:ring-offset-white/80 active:scale-95";

function SpaceCard({
  unit,
  name,
  price,
  desc,
  img,
  applyHref,
  showApply,
}: {
  unit: string;
  name: string;
  price: string;
  desc: string;
  img: string;
  applyHref: string;
  showApply: boolean;
}) {
  return (
    <div className="group bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden border border-transparent hover:border-primary/20 transition-all">
      <div className="h-48 bg-surface-container relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-on-surface/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
            {unit}
          </span>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h5 className="font-bold text-lg text-on-surface">{name}</h5>
          <p className="text-primary font-bold">
            <span className="text-primary font-bold">{price}</span>
            <span className="text-xs text-on-surface-variant font-normal"> THB/mo</span>
          </p>
        </div>
        <p className="text-sm text-on-surface-variant mb-6 line-clamp-2">{desc}</p>
        {showApply && (
          <Link href={applyHref} className={BTN_PRIMARY_BLOCK}>
            Apply Now
          </Link>
        )}
      </div>
    </div>
  );
}

export default function StationDetailSpacesSection({ station }: { station: Station }) {
  const { user } = useAuth();
  const showApply = user?.type !== "landlord";

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-headline text-2xl text-on-surface">Available Spaces</h4>
        <Link
          href="#"
          className="text-primary text-sm font-bold border-b border-primary/20 hover:border-primary cursor-pointer"
        >
          View Store Map
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {station.detail.spaces.map((sp) => (
          <SpaceCard
            key={sp.unit}
            unit={sp.unit}
            name={sp.name}
            price={sp.price}
            desc={sp.desc}
            img={sp.img}
            applyHref={`/retailer_backoffice/applyFlowPage?applyNow=1&stationId=${station.id}&unitCode=${encodeURIComponent(sp.unit)}`}
            showApply={showApply}
          />
        ))}
      </div>
    </div>
  );
}

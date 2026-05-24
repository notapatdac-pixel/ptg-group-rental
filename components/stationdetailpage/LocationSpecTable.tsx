import { Station } from "@/lib/stations";

function specStatusClass(status: string) {
  if (status === "VERIFIED") return "bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-1 rounded";
  return "bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded";
}

export default function LocationSpecTable({ station }: { station: Station }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl editorial-shadow overflow-hidden">
      <div className="px-8 py-6 border-b border-outline-variant/10">
        <h4 className="font-headline text-2xl text-on-surface">Location Specification</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low text-[10px] font-black text-outline-variant uppercase tracking-widest">
              <th className="px-8 py-4">Attribute</th>
              <th className="px-8 py-4">Details</th>
              <th className="px-8 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {station.detail.specs.map(([attr, detail, status], i) => (
              <tr key={i} className="hover:bg-surface-container-low transition-colors">
                <td className="px-8 py-5 font-bold text-on-surface text-sm">{attr}</td>
                <td className="px-8 py-5 text-on-surface-variant text-sm">{detail}</td>
                <td className="px-8 py-5">
                  <span className={specStatusClass(status)}>{status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CheckCell() {
  return (
    <td className="py-5 px-8 text-center">
      <span className="material-symbols-outlined text-primary">check</span>
    </td>
  );
}

function DashCell() {
  return <td className="py-5 px-8 text-center text-on-surface-variant">—</td>;
}

export default function PricingComparisonSection() {
  return (
    <section className="max-w-5xl mx-auto">
      <h2 className="font-headline text-3xl text-center mb-12">Compare features</h2>
      <div className="bg-surface-container-low rounded-xl overflow-hidden p-1">
        <div className="bg-surface-container-lowest rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="py-6 px-8 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold text-left">
                  Feature
                </th>
                <th className="py-6 px-8 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold text-center">
                  Free
                </th>
                <th className="py-6 px-8 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold text-center">
                  Pro
                </th>
                <th className="py-6 px-8 text-xs font-label uppercase tracking-widest text-on-surface-variant font-bold text-center">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-5 px-8 text-sm font-medium">Browse all listings</td>
                <CheckCell /><CheckCell /><CheckCell />
              </tr>
              <tr>
                <td className="py-5 px-8 text-sm font-medium">Apply for 2 spaces</td>
                <CheckCell /><CheckCell /><CheckCell />
              </tr>
              <tr>
                <td className="py-5 px-8 text-sm font-medium">AI recommendations</td>
                <DashCell /><CheckCell /><CheckCell />
              </tr>
              <tr>
                <td className="py-5 px-8 text-sm font-medium">Traffic analytics</td>
                <DashCell /><CheckCell /><CheckCell />
              </tr>
              <tr>
                <td className="py-5 px-8 text-sm font-medium">ML predictions</td>
                <DashCell /><DashCell /><CheckCell />
              </tr>
              <tr>
                <td className="py-5 px-8 text-sm font-medium">Retailer dashboard</td>
                <DashCell /><DashCell /><CheckCell />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

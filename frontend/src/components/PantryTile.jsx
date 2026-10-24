const AISLE_COLORS = {
  produce: 'bg-green-100 text-green-700',
  dairy: 'bg-sky-100 text-sky-700',
  'dry goods': 'bg-amber-100 text-amber-700',
  spices: 'bg-orange-100 text-orange-700',
  frozen: 'bg-cyan-100 text-cyan-700',
  bakery: 'bg-yellow-100 text-yellow-700',
  other: 'bg-stone-100 text-stone-600',
};

const EXPIRY = {
  expired: 'bg-red-600 text-white',
  'use-first': 'bg-tomato/15 text-tomato',
  ok: 'bg-sage-soft text-sage',
};

// Quantity bar: fill relative to a "typical" household stock (for bar feel only).
const TYPICAL = { g: 1000, ml: 1000, kg: 5, l: 5, pc: 10, bunch: 3, pack: 3, tbsp: 10, tsp: 10, cup: 5 };

export default function PantryTile({ item, onDelete, onEdit }) {
  const typical = TYPICAL[item.unit] || 10;
  const fill = Math.min(100, (item.quantity / typical) * 100);
  return (
    <div className="relative rounded-3xl border-2 border-stone-200/70 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-bold capitalize">{item.name}</h3>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${AISLE_COLORS[item.aisle]}`}>{item.aisle}</span>
        </div>
        <div className="flex gap-1 text-xs">
          <button onClick={() => onEdit(item)} className="rounded-full border border-stone-200 px-2 py-0.5 text-stone-400 hover:border-sage hover:text-sage">✎</button>
          <button onClick={() => onDelete(item)} className="rounded-full border border-stone-200 px-2 py-0.5 text-stone-400 hover:border-tomato hover:text-tomato">✕</button>
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-stone-700">
        {item.quantity} <span className="text-sm font-bold text-stone-400">{item.unit}</span>
      </p>
      <div className="mt-2 h-2 rounded-full bg-stone-100">
        <div className={`h-2 rounded-full ${item.quantity === 0 ? 'bg-red-400' : 'bg-sage'}`} style={{ width: `${Math.max(4, fill)}%` }} />
      </div>
      {item.expiresAt && (
        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${EXPIRY[item.expiryStatus]}`}>
          {item.expiryStatus === 'expired' ? `expired ${-item.expiryDays}d ago`
            : item.expiryStatus === 'use-first' ? `use first · ${item.expiryDays}d`
            : `${item.expiryDays}d left`}
        </span>
      )}
      {item.opened && <span className="ml-1 mt-2 inline-block rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-bold text-stone-500">opened</span>}
    </div>
  );
}

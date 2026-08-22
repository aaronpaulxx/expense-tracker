// Rendered instead of a real ExpenseRow while the list is being
// scrolled fast. Cheap to mount (no icon lookup, no menu, no
// useSortable) so it can keep up with rapid scroll/fling without
// leaving a blank gap.
const ExpenseRowSkeleton = () => (
  <div className="flex items-center justify-between p-2 rounded-xl bg-stone-800/40 animate-pulse h-full">
    <div className="flex items-center gap-5 min-w-0 flex-1">
      <div className="rounded-xl w-10 h-10 bg-stone-700/50 shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <div className="h-3.5 w-24 bg-stone-700/50 rounded" />
        <div className="h-3 w-16 bg-stone-700/40 rounded" />
      </div>
    </div>
    <div className="h-7 w-20 bg-stone-700/40 rounded-full shrink-0" />
  </div>
);

export default ExpenseRowSkeleton;

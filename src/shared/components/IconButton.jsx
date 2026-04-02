export default function IconButton({ icon: Icon, label, className = '', ...props }) {
  return (
    <button
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <Icon size={16} />
    </button>
  );
}

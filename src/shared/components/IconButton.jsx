export default function IconButton({ icon: Icon, label, className = '', ...props }) {
  return (
    <button
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-lg text-blue-grey-400 hover:bg-blue-grey-100 hover:text-blue-grey-700 transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <Icon size={16} />
    </button>
  );
}

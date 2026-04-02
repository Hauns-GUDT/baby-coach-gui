export default function IconButton({ icon: Icon, label, className = '', ...props }) {
  return (
    <button
      title={label}
      aria-label={label}
      className={`p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer ${className}`}
      {...props}
    >
      <Icon size={16} />
    </button>
  );
}

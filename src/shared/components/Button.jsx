const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`font-semibold rounded-xl py-3 px-4 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

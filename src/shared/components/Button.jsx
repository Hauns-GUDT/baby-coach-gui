const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
};

export default function Button({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      className={`font-semibold rounded-xl py-3 px-4 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

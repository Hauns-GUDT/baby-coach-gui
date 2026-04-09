const variants = {
  primary:   'bg-twilight-indigo-600 hover:bg-twilight-indigo-700 text-white dark:bg-sky-500 dark:hover:bg-sky-400 dark:text-navy-900',
  secondary: 'bg-blue-grey-100 hover:bg-blue-grey-200 text-blue-grey-700 dark:bg-navy-400 dark:hover:bg-navy-300 dark:text-navy-50',
  danger:    'bg-rose-600 hover:bg-rose-700 text-white',
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

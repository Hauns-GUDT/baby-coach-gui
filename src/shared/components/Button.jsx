const variants = {
  primary:   'bg-twilight-indigo-600 hover:bg-twilight-indigo-700 text-white dark:bg-purple-600 dark:hover:bg-purple-500',
  secondary: 'bg-blue-grey-100 hover:bg-blue-grey-200 text-blue-grey-700 dark:bg-transparent dark:text-blue-grey-600  dark:hover:text-blue-grey-900',
  danger:    'bg-rose-600 hover:bg-rose-700 text-white',
};

const sizes = {
  sm: 'py-2 px-2.5 text-sm',
  md: 'py-3 px-4',
};

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

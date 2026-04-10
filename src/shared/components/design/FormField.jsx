const labelClass = 'font-semibold text-blue-grey-700 dark:text-navy-100 text-sm';

/**
 * FormField — wraps a label, any input control (via children), and an optional error message.
 *
 * Usage:
 *   <FormField label={t('...')} htmlFor="name" error={fieldErrors.name}>
 *     <input id="name" className={inputClass} ... />
 *   </FormField>
 */
export default function FormField({ label, htmlFor, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className={labelClass} htmlFor={htmlFor}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

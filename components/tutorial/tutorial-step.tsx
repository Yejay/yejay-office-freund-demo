export function TutorialStep({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="relative">
      <input
        type="checkbox"
        id={title}
        name={title}
        className="absolute top-[3px] mr-2 peer shrink-0 mt-0.5 border-gray-200 rounded text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700 dark:checked:bg-blue-500 dark:checked:border-blue-500 dark:focus:ring-offset-gray-800"
      />
      <label
        htmlFor={title}
        className="relative text-base text-gray-800 dark:text-neutral-200 peer-checked:line-through font-medium"
      >
        <span className="ml-8">{title}</span>
        <div className="ml-8 text-sm peer-checked:line-through font-normal text-gray-500 dark:text-neutral-400">
          {children}
        </div>
      </label>
    </li>
  );
}

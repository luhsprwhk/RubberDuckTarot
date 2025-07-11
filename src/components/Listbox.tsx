import { Listbox as HListbox } from '@headlessui/react';
import { cn } from '@/src/lib/utils';

/**
 * Reusable Listbox component that wraps Headless UI's Listbox and applies
 * RubberDuck Tarot's default styling. You can still override any className
 * on sub-components if you need custom variations.
 *
 * TODO(BUG): Using this wrapper inside collapsible components (e.g. `ReflectionQuestions`)
 * currently prevents their expand/collapse toggle from working. Until the root cause
 * is identified (likely due to event propagation or state mismatch), you may need to
 * import Headless UI's `Listbox` directly in those contexts.
 */

// Re-export the base component so generic type parameters still work.
export const Listbox = Object.assign(HListbox, {
  Button: ({
    className = '',
    ...props
  }: React.ComponentProps<typeof HListbox.Button>) => (
    <HListbox.Button
      {...props}
      className={cn(
        'w-full bg-void-800 border border-liminal-border text-secondary text-sm rounded-lg p-2 text-left',
        className
      )}
    />
  ),
  Options: ({
    className = '',
    ...props
  }: React.ComponentProps<typeof HListbox.Options>) => (
    <HListbox.Options
      {...props}
      className={cn(
        'absolute mt-1 w-full bg-void-900 border border-liminal-border rounded-lg z-10 max-h-60 overflow-auto text-sm',
        className
      )}
    />
  ),
  Option: ({
    className,
    children,
    ...props
  }: React.ComponentProps<typeof HListbox.Option>) => (
    <HListbox.Option
      {...props}
      className={({ active }: { active: boolean }) =>
        cn(
          'cursor-pointer px-3 py-2',
          active && 'bg-accent/20',
          typeof className === 'function' ? className({ active }) : className
        )
      }
    >
      {children}
    </HListbox.Option>
  ),
  // Optional: Divider component helper
  Divider: () => <div className="my-1 h-px bg-liminal-border" />,
});

export default Listbox;

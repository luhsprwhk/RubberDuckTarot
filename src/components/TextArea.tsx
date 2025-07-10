import { forwardRef } from 'react';
import { Textarea } from '@headlessui/react';

export type TextAreaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    className?: string;
  };

/**
 * A reusable textarea component built on top of Headless UI's Textarea.
 * Applies the default RubberDuck Tarot styling while still allowing
 * callers to override or extend any props (e.g. className, rows, etc.).
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        {...props}
        className={`w-full p-3 bg-void-800 border border-liminal-border rounded-lg text-secondary text-sm resize-none focus:ring-2 focus:ring-accent focus:border-accent outline-none ${className}`.trim()}
      />
    );
  }
);

export default TextArea;

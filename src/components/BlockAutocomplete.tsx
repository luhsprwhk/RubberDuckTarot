import { useState, useEffect } from 'react';
import { Combobox } from '@headlessui/react';
import { cn } from '@/src/lib/utils';
import { useUserBlocks } from '@/src/lib/blocks/useUserBlocks';
import type { UserBlock } from '@/supabase/schema';
import useAuth from '@/src/lib/hooks/useAuth';

interface BlockAutocompleteProps {
  selectedBlock: UserBlock | null;
  onBlockSelect: (block: UserBlock | null) => void;
  placeholder?: string;
  className?: string;
}

export const BlockAutocomplete: React.FC<BlockAutocompleteProps> = ({
  selectedBlock,
  onBlockSelect,
  placeholder = 'Search or select a block...',
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const { blocks, loading, fetchUserBlocks } = useUserBlocks();
  const { user } = useAuth();

  useEffect(() => {
    fetchUserBlocks(user?.id);
  }, [fetchUserBlocks, user?.id]);

  const filteredBlocks = blocks.filter((block) =>
    block.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className={cn('relative', className)}>
      <Combobox value={selectedBlock} onChange={onBlockSelect}>
        <Combobox.Input
          className={cn(
            'w-full bg-liminal-overlay border border-default text-secondary text-sm rounded-lg p-3 focus:ring-2 focus:ring-breakthrough-400 focus:border-transparent',
            'placeholder:text-secondary/60'
          )}
          displayValue={(block: UserBlock | null) => block?.name || ''}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
        />

        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div
              data-testid="loading-spinner"
              className="w-4 h-4 border-2 border-breakthrough-400 border-t-transparent rounded-full animate-spin"
            />
          </div>
        )}

        <Combobox.Options className="absolute mt-1 w-full bg-liminal-overlay border border-default rounded-lg z-10 max-h-60 overflow-auto shadow-lg">
          {filteredBlocks.length === 0 && query !== '' ? (
            <div className="relative cursor-default select-none py-2 px-4 text-secondary">
              No blocks found.
            </div>
          ) : (
            filteredBlocks.map((block) => (
              <Combobox.Option
                key={block.id}
                className={({ active }) =>
                  cn(
                    'relative cursor-pointer select-none py-2 px-4',
                    active
                      ? 'bg-breakthrough-400/20 text-primary'
                      : 'text-secondary'
                  )
                }
                value={block}
              >
                {({ selected, active }) => (
                  <>
                    <span
                      className={cn(
                        'block truncate',
                        selected ? 'font-medium' : 'font-normal'
                      )}
                    >
                      {block.name}
                    </span>
                    {selected && (
                      <span
                        className={cn(
                          'absolute inset-y-0 right-0 flex items-center pr-3',
                          active ? 'text-primary' : 'text-breakthrough-400'
                        )}
                      >
                        ✓
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))
          )}
        </Combobox.Options>
      </Combobox>
    </div>
  );
};

export default BlockAutocomplete;

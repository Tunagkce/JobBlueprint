import { useId, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { normalizeForSearch } from '../format';

interface ComboboxProps<T> {
  id?: string;
  text: string;
  onTextChange: (text: string) => void;
  options: readonly T[];
  getKey: (option: T) => string;
  getLabel: (option: T) => string;
  getDetail?: (option: T) => string;
  getSearchText: (option: T) => string;
  onSelect: (option: T) => void;
  placeholder?: string;
  disabled?: boolean;
  /** When true the typed text is a valid value even if it matches no option (e.g. an unlisted city). */
  allowCustom?: boolean;
  'aria-label'?: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
}

/** A searchable dropdown following the WAI-ARIA combobox pattern (arrow keys, Enter, Escape). */
export function Combobox<T>(props: ComboboxProps<T>) {
  const { text, onTextChange, options, getKey, getLabel, getDetail, getSearchText, onSelect, allowCustom } = props;
  const listId = useId();
  const [open, setOpen] = useState(false);
  // Until the user types, show every option (the box may hold the label of the current choice).
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLDivElement>(null);

  const matches = useMemo(() => {
    const needle = normalizeForSearch(query.trim());
    return needle ? options.filter((option) => normalizeForSearch(getSearchText(option)).includes(needle)) : options;
  }, [options, query, getSearchText]);

  function choose(option: T) {
    onSelect(option);
    setOpen(false);
    setQuery('');
    setActive(-1);
  }

  function moveTo(index: number) {
    if (!matches.length) return;
    const next = (index + matches.length) % matches.length;
    setActive(next);
    listRef.current?.children[next]?.scrollIntoView({ block: 'nearest' });
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      moveTo(event.key === 'ArrowDown' ? active + 1 : active < 0 ? matches.length - 1 : active - 1);
    } else if (event.key === 'Enter' && open) {
      const pick = active >= 0 ? matches[active] : matches.length === 1 && !allowCustom ? matches[0] : undefined;
      if (pick !== undefined) {
        event.preventDefault();
        choose(pick);
      } else {
        setOpen(false);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const activeId = open && active >= 0 ? `${listId}-${active}` : undefined;

  return (
    <div className="combo-wrap">
      <input
        id={props.id}
        type="search"
        role="combobox"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open}
        aria-activedescendant={activeId}
        aria-label={props['aria-label']}
        aria-invalid={props['aria-invalid']}
        aria-describedby={props['aria-describedby']}
        placeholder={props.placeholder}
        disabled={props.disabled}
        value={text}
        onFocus={() => {
          setQuery('');
          setOpen(true);
        }}
        onBlur={() => setOpen(false)}
        onChange={(event) => {
          onTextChange(event.target.value);
          setQuery(event.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
      />
      {open && (
        <div id={listId} ref={listRef} className="combo-list" role="listbox">
          {matches.map((option, index) => (
            <div
              key={getKey(option)}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              className={`combo-option${index === active ? ' active' : ''}`}
              // Keep focus in the input so blur doesn't close the list before the click lands.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(option)}
            >
              <span className="combo-option-content">
                <span className="combo-option-title">{getLabel(option)}</span>
                {getDetail && <span className="combo-option-detail">{getDetail(option)}</span>}
              </span>
            </div>
          ))}
          {!matches.length && (
            <div className="combo-empty">{allowCustom ? 'No match. Your typed value will still be used.' : 'No matches found.'}</div>
          )}
        </div>
      )}
    </div>
  );
}

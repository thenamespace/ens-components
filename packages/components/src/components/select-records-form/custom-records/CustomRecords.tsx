import { EnsTextRecord } from "@/types";
import { supportedTexts } from "@/constants";
import { useEffect, useMemo, useRef, useState } from "react";
import { Icon, Input, Text } from "@/components/atoms";

/** One key/value line in the editor. `id` is local and stable so a row keeps
 *  its focus while its key is being typed (the key itself changes per stroke). */
interface CustomRow {
  id: string;
  key: string;
  value: string;
}

const SUPPORTED_KEY_SET = new Set(supportedTexts.map(t => t.key));
const genRowId = () => `${Date.now()}-${Math.random()}`;

const isCustomKey = (key: string) => !SUPPORTED_KEY_SET.has(key);

interface CustomRecordsProps {
  texts: EnsTextRecord[];
  onTextsChanged: (texts: EnsTextRecord[]) => void;
  searchFilter?: string;
  /** Reports whether this section currently renders anything, so the parent
   *  can show a single "no records found" state for the whole form. */
  onVisibilityChange?: (isVisible: boolean) => void;
}

/**
 * Free-form text records: any key that isn't one of the supported texts.
 * The local rows are the source of truth for custom keys; every edit rebuilds
 * the custom slice of `texts` from them. Rows with an empty, reserved or
 * duplicate key are kept on screen but not written.
 */
export const CustomRecords = ({
  texts,
  onTextsChanged,
  searchFilter,
  onVisibilityChange,
}: CustomRecordsProps) => {
  const [rows, setRows] = useState<CustomRow[]>(() =>
    texts
      .filter(t => isCustomKey(t.key))
      .map(t => ({ id: genRowId(), key: t.key, value: t.value }))
  );
  // The row whose key field should take focus the moment it mounts. Handled
  // in the ref callback rather than an effect, so it fires exactly once, on
  // the element itself, and can't re-trigger on later renders.
  const pendingFocusRowId = useRef<string | null>(null);

  // Custom keys that arrive from outside (e.g. existing records loaded after
  // mount) get a row of their own.
  useEffect(() => {
    const known = new Set(rows.map(r => r.key.trim()));
    const incoming = texts.filter(t => isCustomKey(t.key) && !known.has(t.key));
    if (incoming.length > 0) {
      setRows(prev => [
        ...prev,
        ...incoming.map(t => ({ id: genRowId(), key: t.key, value: t.value })),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texts]);

  const keyError = (row: CustomRow, all: CustomRow[]): string | null => {
    const key = row.key.trim();
    if (!key) return null;
    if (!isCustomKey(key)) return "This key is reserved, use its own field";
    // only the later duplicate is flagged; the first one is the row that's saved
    const earlier = all.slice(0, all.findIndex(r => r.id === row.id));
    if (earlier.some(r => r.key.trim() === key)) {
      return "This key is already used";
    }
    return null;
  };

  const commit = (nextRows: CustomRow[]) => {
    setRows(nextRows);
    const seen = new Set<string>();
    const customTexts: EnsTextRecord[] = [];
    nextRows.forEach(row => {
      const key = row.key.trim();
      if (!key || !isCustomKey(key) || seen.has(key)) return;
      seen.add(key);
      customTexts.push({ key, value: row.value });
    });
    onTextsChanged([...texts.filter(t => !isCustomKey(t.key)), ...customTexts]);
  };

  const handleAddRow = () => {
    const id = genRowId();
    pendingFocusRowId.current = id;
    commit([...rows, { id, key: "", value: "" }]);
  };

  const handleRowChanged = (id: string, patch: Partial<CustomRow>) => {
    commit(rows.map(r => (r.id === id ? { ...r, ...patch } : r)));
  };

  const handleRemoveRow = (id: string) => {
    commit(rows.filter(r => r.id !== id));
  };

  const query = (searchFilter || "").trim().toLocaleLowerCase();
  const sectionMatches = !query || "custom".includes(query);
  const visibleRows = useMemo(
    () =>
      sectionMatches
        ? rows
        : rows.filter(
            r =>
              r.key.toLocaleLowerCase().includes(query) ||
              r.value.toLocaleLowerCase().includes(query)
          ),
    [rows, query, sectionMatches]
  );

  const isVisible = sectionMatches || visibleRows.length > 0;
  useEffect(() => {
    onVisibilityChange?.(isVisible);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  if (!isVisible) {
    return <></>;
  }

  return (
    <div className="ns-text-records ns-custom-records">
      <Text className="ns-mb-2" weight="bold">
        Custom
      </Text>
      {visibleRows.map(row => {
        const error = keyError(row, rows);
        return (
          <div key={row.id}>
            <div className="d-flex align-items-center ns-custom-records__line">
              <Input
                ref={(el: HTMLInputElement | null) => {
                  if (el && pendingFocusRowId.current === row.id) {
                    pendingFocusRowId.current = null;
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.focus();
                  }
                }}
                value={row.key}
                onChange={e => handleRowChanged(row.id, { key: e.target.value })}
                placeholder="Key"
                aria-label="Record key"
                error={!!error}
              />
              <Input
                value={row.value}
                onChange={e =>
                  handleRowChanged(row.id, { value: e.target.value })
                }
                placeholder="Value"
                aria-label="Record value"
              />
              <button
                type="button"
                onClick={() => handleRemoveRow(row.id)}
                className="ns-close-icon"
                aria-label={row.key ? `Remove ${row.key}` : "Remove record"}
              >
                <Icon name="x" size={18} />
              </button>
            </div>
            {error && (
              <Text size="xs" color="danger">
                {error}
              </Text>
            )}
          </div>
        );
      })}
      {sectionMatches && (
        <button
          type="button"
          className="ns-custom-records__add"
          onClick={handleAddRow}
        >
          <Icon name="plus" size={16} />
          {rows.length === 0 ? "Add custom record" : "Add another"}
        </button>
      )}
    </div>
  );
};

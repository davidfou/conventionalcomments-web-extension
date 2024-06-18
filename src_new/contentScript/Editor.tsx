import { DECORATIONS, LABELS } from "./constants";

interface EditorProps {
  label: string;
  decorations: string[];
  onSelectLabel: (label: string) => void;
  onToggleDecoration: (decoration: string) => void;
  isDeactivated: boolean;
}

function Editor({
  label,
  decorations,
  onSelectLabel,
  onToggleDecoration,
  isDeactivated,
}: EditorProps) {
  return (
    <div
      data-testid="editor"
      data-testlabel={label}
      data-testdecorations={decorations.join(", ")}
    >
      <select
        data-testid="label-selector"
        value={label}
        onChange={(e) => onSelectLabel(e.target.value)}
      >
        {LABELS.map(({ label }) => (
          <option key={label} value={label}>
            {label}
          </option>
        ))}
      </select>
      {DECORATIONS.map(({ label }) => (
        <label key={label}>
          <input
            data-testid={`decoration-${label}`}
            type="checkbox"
            checked={decorations.includes(label)}
            value={label}
            onChange={() => onToggleDecoration(label)}
            disabled={isDeactivated}
          />
          {label}
        </label>
      ))}
    </div>
  );
}

export default Editor;

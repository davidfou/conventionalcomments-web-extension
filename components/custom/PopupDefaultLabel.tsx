import type { ChangeEvent, ReactElement } from "react";
import { useCallback } from "react";
import { XCircleIcon } from "lucide-react";
import { LABELS, type Label } from "~/entrypoints/content/constants";

export type DefaultLabelState = {
  label: Label;
  status: "loading" | "loaded";
  error: string | null;
};

function ErrorAlert({ message }: { message: string }): ReactElement {
  return (
    <div className="rounded-md bg-red-50 p-4 mt-3">
      <div className="flex">
        <div className="shrink-0">
          <XCircleIcon aria-hidden="true" className="size-5 text-red-400" />
        </div>
        <div className="ml-3 text-sm text-red-700">{message}</div>
      </div>
    </div>
  );
}

interface PopupDefaultLabelProps {
  defaultLabelState: DefaultLabelState;
  onChange: (label: Label) => void;
}

export default function PopupDefaultLabel({
  defaultLabelState,
  onChange,
}: PopupDefaultLabelProps): ReactElement {
  const onSelectChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      onChange(event.target.value as Label);
    },
    [onChange],
  );

  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm m-4">
      <div className="px-4 py-5">
        <h3 className="text-base font-semibold text-gray-900">
          <label htmlFor="default-label">Default label</label>
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Label preselected when starting a new comment.
        </p>
      </div>
      <div className="px-4 py-5">
        <select
          id="default-label"
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-2 focus:outline-indigo-600 disabled:opacity-50"
          value={defaultLabelState.label}
          disabled={defaultLabelState.status === "loading"}
          onChange={onSelectChange}
        >
          {LABELS.map(({ label }) => (
            <option key={label} value={label}>
              {label}
            </option>
          ))}
        </select>
        {defaultLabelState.error !== null && (
          <ErrorAlert message={defaultLabelState.error} />
        )}
      </div>
    </div>
  );
}

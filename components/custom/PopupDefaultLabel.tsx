import type { ChangeEvent, ReactElement } from "react";
import { useCallback } from "react";
import { XCircleIcon } from "lucide-react";

export type DefaultLabelState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "loaded"; label: string }
  | { status: "saveError"; label: string; error: string };

function ErrorAlert({ message }: { message: string }): ReactElement {
  return (
    <div
      id="default-label-error"
      data-testid="default-label-error"
      className="rounded-md bg-red-50 p-4 mt-3"
    >
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
  labels: readonly string[];
  defaultLabelState: DefaultLabelState;
  onChange: (label: string) => void;
}

export default function PopupDefaultLabel({
  labels,
  defaultLabelState,
  onChange,
}: PopupDefaultLabelProps): ReactElement {
  const onSelectChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>): void => {
      onChange(event.target.value);
    },
    [onChange],
  );
  const isLoading = defaultLabelState.status === "loading";
  const label = "label" in defaultLabelState ? defaultLabelState.label : "";
  const error = "error" in defaultLabelState ? defaultLabelState.error : null;

  return (
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow-sm m-4">
      <div className="px-4 py-5">
        <h3 className="text-base font-semibold text-gray-900">
          <label htmlFor="default-label">Default label</label>
        </h3>
        <p
          id="default-label-description"
          className="mt-1 text-sm text-gray-500"
        >
          Label preselected when starting a new comment.
        </p>
      </div>
      <div className="px-4 py-5">
        <select
          id="default-label"
          data-testid="default-label-select"
          aria-describedby="default-label-description default-label-error"
          className="block w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:outline-2 focus:outline-indigo-600 disabled:opacity-50"
          value={label}
          disabled={isLoading}
          onChange={onSelectChange}
        >
          <option value="" disabled hidden>
            {isLoading ? "Loading…" : "Choose a label"}
          </option>
          {!isLoading &&
            labels.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </select>
        {error !== null && <ErrorAlert message={error} />}
      </div>
    </div>
  );
}

import type { ReactElement } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "~/lib/utils";

interface BadgeBaseProps {
  children: React.ReactNode;
  variant: "primary" | "secondary" | "loading";
}

interface BadgePropsWithoutAction {
  action?: undefined;
}

interface BadgePropsWithAction {
  action: "add" | "remove";
  onAction: () => void;
  disabled: boolean;
}

type BadgeProps = BadgeBaseProps &
  (BadgePropsWithoutAction | BadgePropsWithAction);

const VARIANTS: Record<
  NonNullable<BadgeProps["variant"]>,
  Record<"container" | "button", string>
> = {
  primary: {
    container: "bg-indigo-100 text-indigo-700",
    button: "hover:bg-indigo-600/20",
  },
  secondary: {
    container: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10",
    button: "hover:bg-gray-500/20",
  },
  loading: {
    container: "bg-indigo-100 text-transparent select-none animate-pulse",
    button: "cursor-progress opacity-50 hover:bg-inherit",
  },
};

const ICONS = {
  add: Plus,
  remove: X,
} as const;

export default function Badge(props: BadgeProps): ReactElement {
  const variant = VARIANTS[props.variant];
  const Icon = ICONS[props.action ?? "add"];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-x-0.5 rounded-md px-2 py-1 text-xs font-medium",
        variant.container,
      )}
    >
      {props.children}
      {props.action !== undefined && (
        <button
          type="button"
          className={cn(
            "cursor-pointer group relative -mr-1 size-3.5 rounded-xs",
            variant.button,
            props.disabled
              ? "cursor-progress opacity-50 hover:bg-inherit"
              : "cursor-pointer",
          )}
          onClick={props.onAction}
          disabled={props.disabled}
        >
          <span className="sr-only">
            {props.action === "add" ? "Add" : "Remove"}
          </span>
          <Icon
            className={cn(
              "size-3.5 stroke-gray-600/50",
              props.disabled ? "" : "group-hover:stroke-gray-600/75",
            )}
          />
          <span className="absolute -inset-1" />
        </button>
      )}
    </span>
  );
}

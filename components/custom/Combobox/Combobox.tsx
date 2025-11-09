import type { ReactElement } from "react";
import { useRef, useState, useCallback } from "react";
import { Check, Search, X } from "lucide-react";
import Markdown from "react-markdown";
import invariant from "tiny-invariant";
import type { ProductType } from "~/entrypoints/content/types";
import { cn } from "~/lib/utils";
import { Command } from "cmdk";
import { ComboboxPortalContainerContext } from "./ComboboxPortalContainerContext";
import {
  useFloating,
  autoUpdate,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
  size,
} from "@floating-ui/react";

import "./stylesheets/index.scss";

interface BaseComboboxProps {
  productType: ProductType;
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  options: Readonly<{ label: string; description: string }[]>;
  emptyState: { title: string; description: string };
  onAction: () => void;
  "data-testid": string;
}

interface SingleComboboxProps extends BaseComboboxProps {
  isMulti: false;
  value: string;
  emptyValue: string;
  onSelect: (value: string) => void;
}

interface MultiComboboxProps extends BaseComboboxProps {
  isMulti: true;
  values: string[];
  onToggle: (value: string) => void;
}

export function Combobox({
  label,
  placeholder,
  searchPlaceholder,
  options,
  emptyState,
  onAction,
  "data-testid": dataTestId,
  ...props
}: SingleComboboxProps | MultiComboboxProps): ReactElement {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context, isPositioned } = useFloating({
    open: isOpen,
    onOpenChange: (open) => {
      if (!open) {
        onAction();
      }
      setIsOpen(open);
    },
    placement: "bottom",
    middleware: [
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
    role,
  ]);

  const showPlaceholder = props.isMulti
    ? props.values.length === 0
    : props.value === props.emptyValue;

  const focusOnInput = useCallback((): void => {
    inputRef.current?.focus();
  }, []);

  const onClickOption = useCallback(
    (value: string) => {
      if (props.isMulti) {
        props.onToggle(value);
      } else {
        props.onSelect(value);
      }
      context.onOpenChange(false);
    },
    [props, context],
  );

  const onRemoveItem = useCallback(
    (value: string) => (): void => {
      invariant(
        props.isMulti,
        "onRemoveItem can only be used in multi-select mode",
      );
      props.onToggle(value);
      onAction();
    },
    [props, onAction],
  );

  return (
    <div
      className="ccext:w-full ccext:flex ccext:items-stretch"
      data-testid={dataTestId}
    >
      <div className="ccext:flex-auto ccext:relative">
        <button
          ref={refs.setReference}
          type="button"
          className="ccext:absolute ccext:inset-0 ccext:cursor-pointer ccext:popover-button"
          data-testid="combobox-toggle"
          {...getReferenceProps()}
        />
        {isOpen && (
          <ComboboxPortalContainerContext.Consumer>
            {(container) => (
              <FloatingPortal root={container}>
                <FloatingFocusManager context={context} returnFocus={false}>
                  <div
                    ref={refs.setFloating}
                    className={cn(
                      `ccext:${props.productType} ccext:z-5000`,
                      !isPositioned && "ccext:opacity-0",
                    )}
                    style={floatingStyles}
                    onFocus={focusOnInput}
                    {...getFloatingProps()}
                  >
                    <div
                      className="ccext:popover-content ccext:overflow-hidden"
                      data-testid="combobox-options"
                    >
                      {isPositioned && (
                        <Command
                          data-slot="command"
                          className="ccext:flex ccext:flex-col"
                        >
                          <div className="ccext:popover-content-input-container ccext:flex-none">
                            <div className="ccext:popover-content-input-label">
                              {label}
                            </div>
                            <div
                              className="ccext:popover-content-input-wrapper"
                              onClick={focusOnInput}
                            >
                              <Search />
                              <Command.Input
                                placeholder={searchPlaceholder}
                                ref={inputRef}
                                autoFocus
                              />
                            </div>
                          </div>
                          <Command.List className="ccext:popover-content-list ccext:overflow-auto ccext:shrink">
                            <Command.Empty className="ccext:popover-empty">
                              <div className="ccext:popover-empty-title">
                                {emptyState.title}
                              </div>
                              <div className="ccext:popover-empty-description">
                                {emptyState.description}
                              </div>
                            </Command.Empty>
                            <Command.Group>
                              {options.map(({ label, description }) => (
                                <Command.Item
                                  className="ccext:popover-item ccext:cursor-pointer ccext:relative"
                                  key={label}
                                  value={label}
                                  onSelect={onClickOption}
                                  data-testid="combobox-item"
                                  data-testvalue={label}
                                >
                                  <span className="ccext:popover-item-icon">
                                    <Check
                                      className={cn(
                                        (
                                          props.isMulti
                                            ? props.values.includes(label)
                                            : props.value === label
                                        )
                                          ? "ccext:opacity-100"
                                          : "ccext:opacity-0",
                                      )}
                                    />
                                  </span>

                                  <div className="ccext:popover-item-wrapper">
                                    <div className="ccext:popover-item-title">
                                      {label}
                                    </div>
                                    <div className="ccext:popover-item-description">
                                      <Markdown>{description}</Markdown>
                                    </div>
                                  </div>
                                </Command.Item>
                              ))}
                            </Command.Group>
                          </Command.List>
                        </Command>
                      )}
                    </div>
                  </div>
                </FloatingFocusManager>
              </FloatingPortal>
            )}
          </ComboboxPortalContainerContext.Consumer>
        )}

        <div className="ccext:relative ccext:pointer-events-none ccext:w-full ccext:flex ccext:justify-between ccext:items-stretch">
          <div
            className={cn(
              "ccext:flex ccext:flex-row ccext:flex-wrap ccext:gap-x-1 ccext:gap-y-2 ccext:text-sm ccext:combobox-value",
              { "ccext:combobox-value-placeholder": showPlaceholder },
            )}
            data-testid="combobox-value"
            data-testvalue={
              props.isMulti ? props.values.join("|") : props.value
            }
          >
            {!showPlaceholder &&
              props.isMulti &&
              [...props.values].map((value) => (
                <div
                  key={value}
                  className="ccext:badge ccext:pointer-events-auto ccext:select-none ccext:inline-flex ccext:items-center"
                  data-testid="combobox-badge"
                  data-testvalue={value}
                >
                  {value}
                  <div
                    className="ccext:cursor-pointer ccext:badge-button"
                    data-testid="combobox-badge-clear"
                    onClick={onRemoveItem(value)}
                  >
                    <X />
                  </div>
                </div>
              ))}
            {!showPlaceholder && !props.isMulti && props.value}
            {showPlaceholder && placeholder}
          </div>
        </div>
      </div>
    </div>
  );
}

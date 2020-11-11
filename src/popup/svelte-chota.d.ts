/* eslint-disable max-classes-per-file */

declare module "svelte-chota" {
  import type { SvelteComponentTyped, JSX } from "svelte";

  type Size =
    | "1"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "8"
    | "9"
    | "10"
    | "11"
    | "12";

  export interface ContainerProps
    extends JSX.HTMLAttributes<HTMLElementTagNameMap["div"]> {}
  export class Container extends SvelteComponentTyped<
    ContainerProps,
    {},
    { default: {} }
  > {}

  export interface RowProps
    extends JSX.HTMLAttributes<HTMLElementTagNameMap["div"]> {}
  export class Row extends SvelteComponentTyped<
    RowProps,
    {},
    { default: {} }
  > {}

  export interface ColProps
    extends JSX.HTMLAttributes<HTMLElementTagNameMap["div"]> {
    size?: Size;
    sizeMD?: Size;
    sizeLG?: Size;
  }
  export class Col extends SvelteComponentTyped<
    ColProps,
    {},
    { default: {} }
  > {}

  export interface ButtonProps
    extends JSX.HTMLAttributes<HTMLElementTagNameMap["button"]> {
    outline?: boolean;
    primary?: boolean;
    secondary?: boolean;
    dark?: boolean;
    error?: boolean;
    success?: boolean;
    clear?: boolean;
    loading?: boolean;
    icon?: string;
    iconRight?: string;
    dropdown?: string;
    open?: boolean;
    autoclose?: boolean;
    submit?: boolean;
  }

  export class Button extends SvelteComponentTyped<
    ButtonProps,
    { click: WindowEventMap["click"] },
    { default: {} }
  > {}
}

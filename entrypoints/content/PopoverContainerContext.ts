import { createContext, type RefObject } from "react";

const PopoverContainerContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null);

export default PopoverContainerContext;

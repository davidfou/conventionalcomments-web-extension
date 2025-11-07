export const products = ["github", "gitlab"] as const;
export type Product = (typeof products)[number];

export const projects: { product: Product; version: number }[] = [
  { product: "github", version: 1 },
  { product: "github", version: 2 },
  { product: "gitlab", version: 1 },
];

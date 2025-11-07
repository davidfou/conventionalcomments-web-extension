import type { ReactElement } from "react";
import { PublicPath } from "wxt/browser";

export default function PopupLayout({
  children,
}: {
  children: React.ReactNode;
}): ReactElement {
  const iconPath: PublicPath = "/icon/128.png";

  return (
    <div className="min-h-full">
      <div className="shadow-xs mx-auto px-4 bg-linear-65 from-indigo-600 to-sky-400 fixed top-0 left-0 right-0">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex shrink-0 items-center">
              <img
                alt="Logo"
                src={iconPath}
                className="block h-8 w-auto mt-2"
              />
            </div>
            <div className="ml-4 flex space-x-8 text-white text-xl font-medium items-center">
              conventional: comments
            </div>
          </div>
        </div>
      </div>

      <div className="pt-17 pb-2">{children}</div>
    </div>
  );
}

import type { ReactElement } from "react";
import { useCallback } from "react";
interface LinkProps {
  href: string;
  asButton?: boolean;
  children: React.ReactNode;
}

function Link({ href, children, asButton = false }: LinkProps): ReactElement {
  const onClick = useCallback((): void => {
    window.open(href);
    window.close();
  }, [href]);
  const className = asButton
    ? "rounded-sm bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
    : "text-blue-500 hover:underline";
  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}

export default function PopupIntro(): ReactElement {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm m-4 px-4 py-5 space-y-2">
      <p>
        Comments that are easy to{" "}
        <Link href="https://en.wikipedia.org/wiki/Grok#In_computer_programmer_culture">
          grok
        </Link>{" "}
        and <Link href="https://en.wikipedia.org/wiki/Grep">grep</Link>.
      </p>
      <p>
        Bring structure and clarity to your reviews with{" "}
        <Link href="https://conventionalcomments.org/">
          conventional: comments
        </Link>
        , right in GitHub and GitLab.
      </p>
      <p>
        The extension is under active development. Feedback, ideas, and bug
        reports are all welcome — help shape it!
      </p>
      <p className="space-x-2">
        <Link
          href="https://github.com/davidfou/conventionalcomments-web-extension/issues/new?assignees=&labels=enhancement&projects=&template=feature_request.md&title="
          asButton
        >
          Feedback
        </Link>
        <Link
          href="https://github.com/davidfou/conventionalcomments-web-extension/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title="
          asButton
        >
          Report a bug
        </Link>
      </p>
    </div>
  );
}

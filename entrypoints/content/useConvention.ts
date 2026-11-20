import { useEffect, useState } from "react";
import type { ConventionFile } from "./convention/types";
import getConvention from "./convention/getConvention";
import DEFAULT_CONVENTION from "./convention/defaultConvention";

function useConvention(url: string): ConventionFile {
  const [convention, setConvention] =
    useState<ConventionFile>(DEFAULT_CONVENTION);

  useEffect(() => {
    let cancelled = false;
    getConvention(url)
      .then((result) => {
        if (cancelled) {
          return;
        }
        if (result.status === "custom") {
          setConvention(result.convention);
          return;
        }
        setConvention(DEFAULT_CONVENTION);
        return;
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        setConvention(DEFAULT_CONVENTION);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return convention;
}

export default useConvention;

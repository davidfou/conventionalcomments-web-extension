import { renderHook } from "@testing-library/react-hooks";

import useCurrentUrl from "./useCurrentUrl";
import useRegisteredUrls from "./useRegisteredUrls";
import useProps from ".";

jest.mock("./useCurrentUrl");
jest.mock("./useRegisteredUrls");

const mockedUseCurrentUrl = jest.mocked(useCurrentUrl);
const mockedUseRegisteredUrls = jest.mocked(useRegisteredUrls);

describe("when useRegisteredUrls and useCurrentUrl are loaded", () => {
  beforeEach(() => {
    mockedUseCurrentUrl.mockReturnValue({
      status: "loaded",
      value: "https://new.git.com/*",
    });

    mockedUseRegisteredUrls.mockReturnValue({
      status: "loaded",
      value: ["https://gitlab.com/*", "https://github.com/*"],
    });
  });

  it("has expected initial state", () => {
    const { result } = renderHook(() => useProps());
    expect(result.current).toEqual({
      isLoading: false,
      urls: [
        {
          status: "registered",
          url: "https://gitlab.com/*",
        },
        {
          status: "registered",
          url: "https://github.com/*",
        },
        {
          status: "new",
          url: "https://new.git.com/*",
        },
      ],
      onRegisterDomain: expect.any(Function),
      onUnregisterDomain: expect.any(Function),
    });
  });
});

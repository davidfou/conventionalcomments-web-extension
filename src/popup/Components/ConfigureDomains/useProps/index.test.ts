import { renderHook, act, addCleanup } from "@testing-library/react-hooks";

import useCurrentUrl from "./useCurrentUrl";
import useRegisteredUrls from "./useRegisteredUrls";
import { registerUrl, unregisterUrl } from "../../../requests";
import useProps from ".";
import ApplicationError from "../../../../ApplicationError";

jest.mock("./useCurrentUrl");
jest.mock("./useRegisteredUrls");
jest.mock("../../../requests");

const mockedUseCurrentUrl = jest.mocked(useCurrentUrl);
const mockedUseRegisteredUrls = jest.mocked(useRegisteredUrls);
const mockedRegisterUrl = jest.mocked(registerUrl);
const mockedUnregisterUrl = jest.mocked(unregisterUrl);

describe.each`
  isUseCurrentUrlLoaded | isUserRegisteredUrlLoaded
  ${false}              | ${false}
  ${true}               | ${false}
  ${false}              | ${true}
`(
  "when useCurrentUrl loaded $isUseCurrentUrlLoaded and useRegisteredUrls loaded $isUserRegisteredUrlLoaded",
  ({ isUseCurrentUrlLoaded, isUserRegisteredUrlLoaded }) => {
    beforeEach(() => {
      if (isUseCurrentUrlLoaded) {
        mockedUseCurrentUrl.mockReturnValue({
          status: "loaded",
          value: "https://new.git.com/*",
        });
      } else {
        mockedUseCurrentUrl.mockReturnValue({ status: "isLoading" });
      }
      if (isUserRegisteredUrlLoaded) {
        mockedUseRegisteredUrls.mockReturnValue({
          status: "loaded",
          value: ["https://gitlab.com/*", "https://github.com/*"],
        });
      } else {
        mockedUseRegisteredUrls.mockReturnValue({ status: "isLoading" });
      }
    });

    it("has expected initial state", () => {
      const { result } = renderHook(() => useProps());
      expect(result.current).toEqual({
        isLoading: true,
        urls: [],
        onRegisterDomain: expect.any(Function),
        onUnregisterDomain: expect.any(Function),
        onCloseReport: expect.any(Function),
      });
    });

    it("throws an error if onRegisterDomain is called", async () => {
      const { result } = renderHook(() => useProps());
      await expect(() => result.current.onRegisterDomain()).rejects.toEqual(
        expect.any(ApplicationError)
      );
    });

    it("throws an error if onUnregisterDomain is called", async () => {
      const { result } = renderHook(() => useProps());
      await expect(() =>
        result.current.onUnregisterDomain("https://github.com/*")
      ).rejects.toEqual(expect.any(ApplicationError));
    });
  }
);

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

    mockedRegisterUrl.mockReset();
    mockedRegisterUrl.mockResolvedValue();
    mockedUnregisterUrl.mockReset();
    mockedUnregisterUrl.mockResolvedValue();
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
      onCloseReport: expect.any(Function),
    });
  });

  describe("when onRegisterDomain callback is called", () => {
    it("calls registerUrl", async () => {
      const { result } = renderHook(() => useProps());
      await act(async () => {
        result.current.onRegisterDomain();
      });
      expect(registerUrl).toHaveBeenCalledTimes(1);
      expect(registerUrl).toHaveBeenCalledWith("https://new.git.com/*");
    });

    it("sets the status to `isAdding`", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useProps());
      act(() => {
        result.current.onRegisterDomain();
      });
      const cleanup = waitForNextUpdate();
      addCleanup(() => cleanup);
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            { status: "isAdding", url: "https://new.git.com/*" },
          ]),
        })
      );
    });

    it("sets the status to `registered` and add success report when registerUrl succeeded", async () => {
      const { result } = renderHook(() => useProps());
      await act(async () => {
        result.current.onRegisterDomain();
      });
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            {
              status: "registered",
              url: "https://new.git.com/*",
              report: {
                status: "success",
                action: "add",
                isOpen: true,
              },
            },
          ]),
        })
      );
    });

    it("sets the status to `new` and add error report when registerUrl failed with an ApplicationError", async () => {
      const fakeError = new ApplicationError(
        "error",
        "ERROR_MSG",
        "ERROR_DETAILS"
      );
      mockedRegisterUrl.mockRejectedValue(fakeError);
      const { result } = renderHook(() => useProps());
      await act(async () => {
        result.current.onRegisterDomain();
      });
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            {
              status: "new",
              url: "https://new.git.com/*",
              report: {
                status: "error",
                action: "add",
                isOpen: true,
                message: "ERROR_MSG",
              },
            },
          ]),
        })
      );
    });

    it("sets the status to `new` and add error report when registerUrl failed with a normal error", async () => {
      const fakeError = new Error("ERROR_MSG");
      mockedRegisterUrl.mockRejectedValue(fakeError);
      const { result } = renderHook(() => useProps());
      await act(async () => {
        result.current.onRegisterDomain();
      });
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            {
              status: "new",
              url: "https://new.git.com/*",
              report: {
                status: "error",
                action: "add",
                isOpen: true,
                message: "An unexpected error occurred",
              },
            },
          ]),
        })
      );
    });

    it("sets the status to `isAdding` with no report when the user retries after a failure", async () => {
      const fakeError = new Error("ERROR_MSG");
      mockedRegisterUrl.mockRejectedValue(fakeError);
      const { result, waitForNextUpdate } = renderHook(() => useProps());
      await act(async () => {
        result.current.onRegisterDomain();
      });
      act(() => {
        result.current.onRegisterDomain();
      });
      const cleanup = waitForNextUpdate();
      addCleanup(() => cleanup);
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            { status: "isAdding", url: "https://new.git.com/*" },
          ]),
        })
      );
    });

    it("throws an error if useCurrentUrl returns a null url", async () => {
      mockedUseCurrentUrl.mockReturnValue({
        status: "loaded",
        value: null,
      });
      const { result } = renderHook(() => useProps());
      await expect(() => result.current.onRegisterDomain()).rejects.toEqual(
        expect.any(ApplicationError)
      );
    });
  });

  describe("when onUnregisterDomain callback is called", () => {
    it("calls unregisterUrl", async () => {
      const { result } = renderHook(() => useProps());
      await act(async () => {
        result.current.onUnregisterDomain("https://github.com/*");
      });
      expect(unregisterUrl).toHaveBeenCalledTimes(1);
      expect(unregisterUrl).toHaveBeenCalledWith("https://github.com/*");
    });

    it("sets the status to `isRemoving` to the correct url", async () => {
      const { result, waitForNextUpdate } = renderHook(() => useProps());
      act(() => {
        result.current.onUnregisterDomain("https://github.com/*");
      });
      const cleanup = waitForNextUpdate();
      addCleanup(() => cleanup);
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            {
              status: "registered",
              url: "https://gitlab.com/*",
            },
            {
              status: "isRemoving",
              url: "https://github.com/*",
            },
          ]),
        })
      );
    });

    it("sets the status to `removed` and add success report when unregisterUrl succeeded", async () => {
      const { result } = renderHook(() => useProps());
      await act(async () => {
        result.current.onUnregisterDomain("https://github.com/*");
      });
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            {
              status: "registered",
              url: "https://gitlab.com/*",
            },
            {
              status: "removed",
              url: "https://github.com/*",
              report: {
                status: "success",
                action: "remove",
                isOpen: true,
              },
            },
          ]),
        })
      );
    });

    it("sets the status to `registered` and add error report when unregisterUrl failed with an ApplicationError", async () => {
      const fakeError = new ApplicationError(
        "error",
        "ERROR_MSG",
        "ERROR_DETAILS"
      );
      mockedUnregisterUrl.mockRejectedValue(fakeError);
      const { result } = renderHook(() => useProps());
      await act(async () => {
        result.current.onUnregisterDomain("https://github.com/*");
      });
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            {
              status: "registered",
              url: "https://gitlab.com/*",
            },
            {
              status: "registered",
              url: "https://github.com/*",
              report: {
                status: "error",
                action: "remove",
                isOpen: true,
                message: "ERROR_MSG",
              },
            },
          ]),
        })
      );
    });

    it("sets the status to `registered` and add error report when unregisterUrl failed with a normal error", async () => {
      const fakeError = new Error("ERROR_MSG");
      mockedUnregisterUrl.mockRejectedValue(fakeError);
      const { result } = renderHook(() => useProps());
      await act(async () => {
        result.current.onUnregisterDomain("https://github.com/*");
      });
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            {
              status: "registered",
              url: "https://gitlab.com/*",
            },
            {
              status: "registered",
              url: "https://github.com/*",
              report: {
                status: "error",
                action: "remove",
                isOpen: true,
                message: "An unexpected error occurred",
              },
            },
          ]),
        })
      );
    });

    it("sets the status to `isRemoving` with no report when the user retries after a failure", async () => {
      const fakeError = new Error("ERROR_MSG");
      mockedUnregisterUrl.mockRejectedValue(fakeError);
      const { result, waitForNextUpdate } = renderHook(() => useProps());
      await act(async () => {
        result.current.onUnregisterDomain("https://github.com/*");
      });
      act(() => {
        result.current.onUnregisterDomain("https://github.com/*");
      });
      const cleanup = waitForNextUpdate();
      addCleanup(() => cleanup);
      expect(result.current).toEqual(
        expect.objectContaining({
          urls: expect.arrayContaining([
            {
              status: "registered",
              url: "https://gitlab.com/*",
            },
            {
              status: "isRemoving",
              url: "https://github.com/*",
            },
          ]),
        })
      );
    });
  });
});

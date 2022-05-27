import getDomainFromUrl from "./getDomainFromUrl";

it.each`
  url                                                  | expectedResult
  ${"https://example.org"}                             | ${"https://example.org/*"}
  ${"https://example.org/"}                            | ${"https://example.org/*"}
  ${"https://example.org/path"}                        | ${"https://example.org/*"}
  ${"https://example.org/path/deep"}                   | ${"https://example.org/*"}
  ${"https://example.org/path/deep?search=hello"}      | ${"https://example.org/*"}
  ${"https://example.org/path/deep#main"}              | ${"https://example.org/*"}
  ${"https://example.org/path/deep?search=hello#main"} | ${"https://example.org/*"}
  ${"https://sub.example.org/"}                        | ${"https://sub.example.org/*"}
  ${"http://example.org/"}                             | ${"http://example.org/*"}
  ${""}                                                | ${null}
  ${"about:devtools-toolbox"}                          | ${null}
`("returns $expectedResult with $url", ({ url, expectedResult }) => {
  expect(getDomainFromUrl(url)).toEqual(expectedResult);
});

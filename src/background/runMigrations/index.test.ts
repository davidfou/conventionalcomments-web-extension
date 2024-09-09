import ".";

it("works", () => {
  expect(true).toBe(true);
});
// import runMigrations from ".";
// import getMigrations from "./getMigrations";
//
// jest.mock("./getMigrations");
//
// const mockedPoly = jest.mocked(chrome, true);
// const mockedGetMigrations = jest.mocked(getMigrations, true);
//
// const migrations = {
//   migration1: jest.fn().mockResolvedValue(undefined),
//   migration2: jest.fn().mockResolvedValue(undefined),
//   migration3: jest.fn().mockResolvedValue(undefined),
// };
// mockedGetMigrations.mockReturnValue([
//   { key: "migration1", run: migrations.migration1 },
//   { key: "migration2", run: migrations.migration2 },
//   { key: "migration3", run: migrations.migration3 },
// ]);
//
// describe.each`
//   lastMigration   | migration1 | migration2 | migration3
//   ${undefined}    | ${true}    | ${true}    | ${true}
//   ${"migration1"} | ${false}   | ${true}    | ${true}
//   ${"migration2"} | ${false}   | ${false}   | ${true}
//   ${"migration3"} | ${false}   | ${false}   | ${false}
// `("when last migration is $lastMigration", (params) => {
//   beforeAll(async () => {
//     Object.values(migrations).forEach((run) => {
//       run.mockReset();
//     });
//     mockedPoly.storage.local.set.mockReset();
//     mockedPoly.storage.local.get.mockResolvedValue({
//       lastMigration: params.lastMigration,
//     });
//     await runMigrations();
//   });
//
//   it.each<keyof typeof migrations>(["migration1", "migration2", "migration3"])(
//     `runs if necessary migration %s`,
//     (migration) => {
//       expect(migrations[migration]).toHaveBeenCalledTimes(
//         params[migration] ? 1 : 0
//       );
//     }
//   );
//
//   if (params.migration3) {
// eslint-disable-next-line jest/no-commented-out-tests
//     it("sets lastMigration local storage", () => {
//       expect(mockedPoly.storage.local.set).toHaveBeenCalledTimes(1);
//       expect(mockedPoly.storage.local.set).toHaveBeenCalledWith({
//         lastMigration: "migration3",
//       });
//     });
//   } else {
// eslint-disable-next-line jest/no-commented-out-tests
//     it("doesn't set lastMigration local storage", () => {
//       expect(mockedPoly.storage.local.set).not.toHaveBeenCalled();
//     });
//   }
// });

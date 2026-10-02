import axios from "axios";

import {
  createSpreadsheet,
  readLog,
  SheetsError,
  writeLog,
} from "@/features/google-sheets/services/sheets";

jest.mock("axios", () => ({
  ...jest.requireActual("axios"),
  request: jest.fn(),
}));

const mockRequest = jest.mocked(axios.request);

beforeEach(() => mockRequest.mockReset());

it("creates the spreadsheet with a frozen header on the log tab", async () => {
  mockRequest.mockResolvedValue({
    data: { spreadsheetId: "s1", spreadsheetUrl: "https://docs.google.com/s1" },
  });

  await expect(createSpreadsheet("tok")).resolves.toEqual({
    spreadsheetId: "s1",
    spreadsheetUrl: "https://docs.google.com/s1",
  });
  expect(mockRequest).toHaveBeenCalledWith(
    expect.objectContaining({
      method: "POST",
      url: "https://sheets.googleapis.com/v4/spreadsheets",
      headers: { Authorization: "Bearer tok" },
      data: {
        properties: { title: "Trade Plan – Trade log" },
        sheets: [
          {
            properties: {
              title: "Trade log",
              gridProperties: { frozenRowCount: 1 },
            },
          },
        ],
      },
    }),
  );
});

it("clears the tab, then writes the table as raw values", async () => {
  mockRequest.mockResolvedValue({ data: {} });

  await writeLog("tok", "s1", [
    ["code", "note"],
    ["BBCA", "=IMPORTXML(1)"],
    ["TLKM", null],
  ]);

  const [clear, write] = mockRequest.mock.calls.map(([config]) => config);
  expect(clear).toMatchObject({
    method: "POST",
    url: "https://sheets.googleapis.com/v4/spreadsheets/s1/values/'Trade%20log':clear",
  });
  expect(write).toMatchObject({
    method: "PUT",
    url: "https://sheets.googleapis.com/v4/spreadsheets/s1/values/'Trade%20log'!A1?valueInputOption=RAW",
    data: {
      values: [
        ["code", "note"],
        ["BBCA", "=IMPORTXML(1)"],
        ["TLKM", ""],
      ],
    },
  });
});

it.each([
  [{ response: { status: 401, data: {} } }, "unauthorized"],
  [{ response: { status: 403, data: {} } }, "forbidden"],
  [{ response: { status: 404, data: {} } }, "notFound"],
  [
    {
      response: {
        status: 400,
        data: { error: { message: "Unable to parse range: 'Trade log'" } },
      },
    },
    "missingTab",
  ],
  [{ response: undefined }, "offline"],
])("names a failed call (%#) as %p", async (failure, kind) => {
  mockRequest.mockRejectedValue(
    Object.assign(new Error("failed"), { isAxiosError: true, ...failure }),
  );

  await expect(createSpreadsheet("tok")).rejects.toEqual(
    expect.objectContaining({ kind }),
  );
  await expect(createSpreadsheet("tok")).rejects.toBeInstanceOf(SheetsError);
});

it("reads the tab as unformatted values, so prices arrive as numbers", async () => {
  mockRequest.mockResolvedValue({ data: { values: [["id"], ["p1"]] } });

  await expect(readLog("tok", "s1")).resolves.toEqual([["id"], ["p1"]]);
  expect(mockRequest).toHaveBeenCalledWith(
    expect.objectContaining({
      method: "GET",
      url: "https://sheets.googleapis.com/v4/spreadsheets/s1/values/'Trade%20log'?valueRenderOption=UNFORMATTED_VALUE",
    }),
  );
});

it("reads an empty tab as no rows", async () => {
  mockRequest.mockResolvedValue({ data: {} });

  await expect(readLog("tok", "s1")).resolves.toEqual([]);
});

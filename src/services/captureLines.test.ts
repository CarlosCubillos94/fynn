import { parseCaptureLines } from "@/services/captureLines";

describe("parseCaptureLines", () => {
  it("reads one phrase per line", () => {
    const text = '{"phrase":"Jumbo 18500","at":"2026-10-07T20:00:00Z"}\n{"phrase":"uber 4500"}\n';
    expect(parseCaptureLines(text)).toEqual(["Jumbo 18500", "uber 4500"]);
  });

  it("skips corrupt, empty and non-string entries", () => {
    const text = 'not json\n{"phrase":42}\n{"phrase":"  "}\n\n{"other":1}\n{"phrase":" cafe 2500 "}';
    expect(parseCaptureLines(text)).toEqual(["cafe 2500"]);
  });
});

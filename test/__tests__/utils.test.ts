import { describe, expect, test } from "@jest/globals";

import { useLilithLog } from "../../src/utils/log";
import { RequestUtils } from "../../src/utils/request";

const debug = true;
const { log } = useLilithLog(debug);

describe("Lilith", () => {
    describe("Test Utils ", () => {
        test("sanitizeImageSrc", () => {
            const { sanitizeImageSrc } = RequestUtils;
            const expectedPng = "https://a.com/b/c.png";
            const expectedJpg = "https://a.com/b/c.jpg";

            expect(sanitizeImageSrc("//a.com/b/c.png")).toBe(expectedPng);
            expect(sanitizeImageSrc("//a.com/b/c.jpg.png")).toBe(expectedJpg);
            expect(sanitizeImageSrc("//a.com/b/c.jpg.png.jpg.png")).toBe(
                expectedJpg,
            );
            expect(sanitizeImageSrc("a.com/b/c.png")).toBe(expectedPng);
            expect(sanitizeImageSrc("http://a.com/b/c.png")).toBe(expectedPng);
            expect(sanitizeImageSrc("https://a.com/b/c.png")).toBe(expectedPng);
            log(expectedPng);
        });
        test("removeDuplicateExtensions", () => {
            const { removeDuplicateExtensions } = RequestUtils;
            const expectedPng = "https://a.com/b/c.png";
            const expectedJpg = "https://a.com/b/c.jpg";
            expect(removeDuplicateExtensions("https://a.com/b/c.png")).toBe(
                expectedPng,
            );
            expect(removeDuplicateExtensions("https://a.com/b/c.jpg.png")).toBe(
                expectedJpg,
            );
            expect(
                removeDuplicateExtensions("https://a.com/b/c.jpg.png.jpg.png"),
            ).toBe(expectedJpg);
            log(expectedPng);
        });
    });
});

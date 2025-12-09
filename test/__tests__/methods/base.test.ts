import fs from "fs";
import path from "path";
import { describe, expect, test } from "@jest/globals";

import { LilithLanguage } from "@atsu/lilith";
import { useNHentaiMethods } from "../../../src/methods/base";
import { useCheerioDomParser } from "../../../src/impl/useCheerioDomParser";

const homepageHtml = fs.readFileSync(
    path.join(__dirname, "../../__mocks__/Homepage/2025/homepage.html"),
    "utf8",
);

describe("useNHentaiMethods.getGalleries (homepage snapshot)", () => {
    const { getGalleries } = useNHentaiMethods();

    test("extracts galleries with English available", () => {
        const document = useCheerioDomParser(homepageHtml);
        const galleries = getGalleries(document, [LilithLanguage.english]);

        expect(galleries.length).toBeGreaterThan(0);
        galleries.forEach((gallery) =>
            expect(gallery.cover.uri).toMatch(/^https:\/\//),
        );
    });
});

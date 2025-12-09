import fs from "fs";
import path from "path";
import { describe, expect, jest, test } from "@jest/globals";
import { CustomFetch, LilithLanguage } from "@atsu/lilith";

import { useNHentaiGetTrendingBooksMethod } from "../../../src/methods/getTrendingBooks";
import { useCheerioDomParser } from "../../../src/impl/useCheerioDomParser";
import { UseNHentaiMethodProps } from "../../../src/interfaces";
import { LilithRequest } from "../../../src/interfaces/fetch";

const homepageHtml = fs.readFileSync(
    path.join(__dirname, "../../__mocks__/Homepage/2025/homepage.html"),
    "utf8",
);

const request = async () => ({
    status: 200,
    statusCode: 200,
    json: async () => ({}),
    getDocument: async () => useCheerioDomParser(homepageHtml),
});

const props: UseNHentaiMethodProps = {
    domains: {
        baseUrl: "https://nhentai.net",
        apiUrl: "https://nhentai.net/api",
        imgBaseUrl: "https://i.nhentai.net/galleries",
        tinyImgBaseUrl: "https://t.nhentai.net/galleries",
    },
    options: { debug: false, requiredLanguages: [LilithLanguage.english] },
    fetch: jest.fn() as CustomFetch,
    domParser: useCheerioDomParser,
    request: request as LilithRequest,
};

describe("useNHentaiGetTrendingBooksMethod (homepage snapshot)", () => {
    test("returns trending books from saved homepage", async () => {
        const getTrending = useNHentaiGetTrendingBooksMethod(props);
        const results = await getTrending();

        expect(results.length).toBeGreaterThan(0);
        results.forEach((book) =>
            expect(book.cover.uri).toMatch(/^https:\/\//),
        );
    });
});

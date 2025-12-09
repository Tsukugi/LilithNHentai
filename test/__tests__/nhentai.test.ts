import fs from "fs";
import path from "path";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";

import { RepositoryBase, Book, Chapter } from "@atsu/lilith";

import getMock from "../__mocks__/getMock.json";
import { randomMock } from "../__mocks__/randomMock";
import { searchMock } from "../__mocks__/searchMock";
import { useCheerioDomParser } from "../../src/impl/useCheerioDomParser";
import { useLilithNHentai } from "../../src/index";

type MockBody = string | object;

const mockResponse = (body: MockBody) => ({
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
    json: async <T>() => body as T,
    status: 200,
});

const homepageHtml = fs.readFileSync(
    path.join(__dirname, "../__mocks__/Homepage/2025/homepage.html"),
    "utf8",
);

const apiListMock = { num_pages: 1, per_page: 25 };

const mockFetch = jest.fn(async (url: string) => {
    if (url.includes("/api/gallery/")) return mockResponse(getMock);
    if (url.includes("/api/galleries/all")) return mockResponse(apiListMock);
    if (url.includes("/random")) return mockResponse(randomMock);
    if (url.includes("/g/")) return mockResponse(randomMock);
    if (url.includes("/search")) return mockResponse(searchMock);
    return mockResponse(homepageHtml);
});

describe("Lilith (mocked)", () => {
    let loader: RepositoryBase;

    beforeEach(() => {
        mockFetch.mockClear();
        loader = useLilithNHentai({
            fetch: mockFetch,
            domParser: useCheerioDomParser,
            options: { debug: false },
            headers: { cookie: "", "User-Agent": "jest" },
        });
    });

    test("search uses cached HTML instead of the web", async () => {
        const search = await loader.search("ass");
        expect(search.totalPages).toBeGreaterThan(1);
        expect(search.results.length).toBeGreaterThan(0);
    });

    test("getTrendingBooks parses the homepage snapshot", async () => {
        const trending = await loader.getTrendingBooks();
        expect(trending.length).toBeGreaterThan(0);
        trending.forEach((book) =>
            expect(book.cover.uri).toMatch(/^https:\/\//),
        );
    });

    test("getLatestBooks mixes API numbers with homepage galleries", async () => {
        const latest = await loader.getLatestBooks(1);
        expect(latest.page).toBe(1);
        expect(latest.totalPages).toBe(apiListMock.num_pages);
        expect(latest.results.length).toBeGreaterThan(0);
    });

    test("getBook and getChapter reuse the mocked gallery HTML", async () => {
        const book: Book = await loader.getBook("480154");
        expect(book.id).toBe("480154");
        expect(book.cover.uri).toMatch(/^https:\/\//);
        expect(book.chapters[0].pages.length).toBeGreaterThan(0);

        const chapter: Chapter = await loader.getChapter("480154");
        expect(chapter.pages.length).toBeGreaterThan(0);
    });
});

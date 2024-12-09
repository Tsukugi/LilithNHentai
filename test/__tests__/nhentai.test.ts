import { beforeEach, describe, expect, test } from "@jest/globals";

import {
    RepositoryBase,
    Book,
    SearchResult,
    BookListResults,
    BookBase,
    Chapter,
} from "@atsu/lilith";

import { TextMocksForDomParser, headers, fetchMock } from "../nhentaiMock";
import { useCheerioDomParser } from "../../src/impl/useCheerioDomParser";

import { useNodeFetch } from "../../src/impl/useNodeFetch";
import { useLilithNHentai } from "../../src/index";
import { useLilithLog } from "../../src/utils/log";

const debug = true;
const { log } = useLilithLog(debug);

describe("Lilith", () => {
    describe("Test nhentai ", () => {
        let loader: RepositoryBase = {} as RepositoryBase;
        beforeEach(() => {
            loader = useLilithNHentai({
                headers,
                domParser: useCheerioDomParser,
                fetch: useNodeFetch,
                options: { debug },
            });
        });

        test("getBook", async () => {
            const book: Book = await loader.getBook("542191");
            expect(book).toBeDefined();
        });
        test("getChapter", async () => {
            const chapter: Chapter = await loader.getChapter("542191");
            expect(chapter).toBeDefined();
        });
        test("Search", async () => {
            const search: SearchResult = await loader.search("ass");
            expect(search.results[0].cover.uri).toBeTruthy();
            expect(search).toBeDefined();
        });
        test("Search offset", async () => {
            const search4: SearchResult = await loader.search("English", {
                page: 4,
            });
            expect(search4).toBeDefined();
        });
        test("GetLatestBooks", async () => {
            if (!loader.getLatestBooks) return;
            const page: BookListResults = await loader.getLatestBooks(1);
            expect(page).toBeDefined();
        });
        test("GetTrendingBooks", async () => {
            if (!loader.getTrendingBooks) return;
            const page: BookBase[] = await loader.getTrendingBooks();
            log(page.map((result) => result.title));
            expect(page).toBeDefined();
            expect(page.length).toBeGreaterThan(0);
        });
        test("RandomBook", async () => {
            const randomLoader = useLilithNHentai({
                headers,
                fetch: () => fetchMock({}, TextMocksForDomParser.Random),
                domParser: useCheerioDomParser,
            });
            const book: Book = await randomLoader.getRandomBook();
            log(book);
            expect(book).toBeDefined();
        });
        test("Supports webp", async () => {
            const book: Book = await loader.getBook("542733");
            const bookCoverExtension = book.cover.uri.split(".").slice(-1)[0];
            expect(bookCoverExtension).toBe("webp");
        });

        test("Has all extensions supported", async () => {
            const latestBooks: BookListResults = await loader.getLatestBooks(1);

            const extensions = latestBooks.results.map(
                (result) => result.cover.uri,
            );
            log(extensions);

            const undefinedExtensions = extensions.filter(
                (uri) => uri.split(".").slice(-1)[0] === undefined,
            );

            log(await fetch(extensions[0]));

            expect(undefinedExtensions.length).toBe(0);
        });
    });
});

import { describe, expect, jest, test } from "@jest/globals";
import { CustomFetch, LilithLanguage } from "@atsu/lilith";

import getMock from "../../__mocks__/getMock.json";
import { randomMock } from "../../__mocks__/randomMock";
import { useNHentaiGetChapterMethod } from "../../../src/methods/getChapter";
import { useCheerioDomParser } from "../../../src/impl/useCheerioDomParser";
import { UseNHentaiMethodProps } from "../../../src/interfaces";
import { LilithRequest } from "../../../src/interfaces/fetch";

const makeRequest = (): LilithRequest => {
    return async (url: string) => {
        const isApi = url.includes("/api/gallery/");
        const text = isApi ? JSON.stringify(getMock) : randomMock;
        return {
            json: async <T>() => getMock as unknown as T,
            status: 200,
            statusCode: 200,
            getDocument: async () => useCheerioDomParser(text),
        };
    };
};

const baseProps: UseNHentaiMethodProps = {
    domains: {
        apiUrl: "https://nhentai.net/api",
        baseUrl: "https://nhentai.net",
        imgBaseUrl: "https://i.nhentai.net/galleries",
        tinyImgBaseUrl: "https://t.nhentai.net/galleries",
    },
    options: {
        debug: false,
        requiredLanguages: [LilithLanguage.english],
    },
    fetch: jest.fn() as CustomFetch,
    domParser: useCheerioDomParser,
    request: makeRequest(),
};

describe("useNHentaiGetChapterMethod (fixtures)", () => {
    test("returns a chapter with pages from snapshots", async () => {
        const getChapter = useNHentaiGetChapterMethod(baseProps);
        const result = await getChapter("480154");

        expect(result.id).toBe("480154");
        expect(result.pages.length).toBeGreaterThan(0);
        expect(result.language).toBe(LilithLanguage.english);
    });
});

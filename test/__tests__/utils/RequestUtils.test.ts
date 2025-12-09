import { describe, expect, test } from "@jest/globals";

import { useLilithLog } from "../../../src/utils/log";
import { RequestUtils } from "../../../src/utils/request";

const debug = false;
const { log } = useLilithLog(debug);

describe("RequestUtils", () => {
    test("useParamIfExists", () => {
        const param = {
            test: true,
            test2: false,
        };
        const res = RequestUtils.useParamIfExists("test", param.test);

        log(res);
        expect(res).toEqual("test=true");

        const res2 = RequestUtils.useParamIfExists(
            "test",
            param["undefinedProp"],
        ); // Doesnt exist

        log(res2);
        expect(res2).toEqual("");

        const res3 = RequestUtils.useParamIfExists("test2", param.test2);

        log(res3);
        expect(res3).toEqual("test2=false");
    });

    test("useUrlWithParams", async () => {
        const res = RequestUtils.useUrlWithParams("https://test/demo", [
            ["test", true],
            ["test2", false],
            ["test3", "asd"],
        ]);

        log(res);
        expect(res).toEqual(
            "https://test/demo?test=true&test2=false&test3=asd",
        );
    });

    test("sanitizeImageSrc removes duplicate extensions and adds protocol", () => {
        const uri = RequestUtils.sanitizeImageSrc(
            "//t2.aa.net/galleries/3676047/thumb.jpg.webp",
        );
        expect(uri).toBe("https://t2.aa.net/galleries/3676047/thumb.jpg");
    });

    test("sanitizeImageSrcWithFallback returns primary and fallback", () => {
        const primary = "//t2.aa.net/galleries/1/thumb.png";
        const secondary = "//t4.aa.net/galleries/1/thumb.jpg.webp";
        const image = RequestUtils.sanitizeImageSrcWithFallback(
            primary,
            secondary,
        );
        expect(image.uri).toBe("https://t2.aa.net/galleries/1/thumb.png");
        expect(image.fallbackUri).toBe("https://t4.aa.net/galleries/1/thumb.jpg");
    });

    test("removeDuplicateExtensions collapses extra segments", () => {
        const uri = RequestUtils.removeDuplicateExtensions(
            "https://a.com/b/c.jpg.png",
        );
        expect(uri).toBe("https://a.com/b/c.jpg");
    });

    test("sanitizeImageSrcWithFallback uses data-src as primary and src as fallback", () => {
        const image = RequestUtils.sanitizeImageSrcWithFallback(
            "//t3.aa.net/galleries/3676357/thumb.jpg.webp",
            "//t2.aa.net/galleries/3676357/thumb.jpg.webp",
        );
        expect(image.uri).toBe(
            "https://t3.aa.net/galleries/3676357/thumb.jpg",
        );
        expect(image.fallbackUri).toBe(
            "https://t2.aa.net/galleries/3676357/thumb.jpg",
        );
    });
});

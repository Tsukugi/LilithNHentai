import { GetChapter, Chapter } from "@atsu/lilith";
import { NHentaiResult, UseNHentaiMethodProps } from "../interfaces";
import { useLilithLog } from "../utils/log";
import { useNHentaiMethods } from "./base";

/**
 * Hook for interacting with NHentai chapters.
 * @param {UseNHentaiMethodProps} props - Properties required for the hook.
 * @returns {GetChapter} - A function that retrieves information about a chapter based on its identifier.
 */
export const useNHentaiGetChapterMethod = (
    props: UseNHentaiMethodProps,
): GetChapter => {
    const {
        domains: { apiUrl, baseUrl },
        options: { debug },
        request,
    } = props;
    const { LanguageMapper, getLanguageFromTags } = useNHentaiMethods();

    const apiPromise = async (id: string) =>
        /* API call to get external info */
        await (await request<NHentaiResult>(`${apiUrl}/gallery/${id}`)).json();

    const getImages = async (id: string) => {
        /* Scrapper to get images */
        const response = await request(`${baseUrl}/g/${id}`);
        const document = await response.getDocument();

        const imagesSelector = ".thumb-container img.lazyload";

        const images = document
            .findAll(imagesSelector)
            .map((image) => image.getAttribute("data-src"));

        return images;
    };

    /**
     * Retrieves information about a chapter based on its identifier.
     * @param {string} chapterId - The unique identifier of the chapter.
     * @returns {Promise<Chapter>} - A Promise that resolves to the retrieved chapter.
     * @throws {LilithError} - Throws an error if the chapter is not found.
     */
    return async (chapterId: string): Promise<Chapter> => {
        /**
         * NHentai doesn't use chapters; it directly gets the pages from the book as 1 chapter books.
         */

        const [book, imageUrls] = await Promise.all([
            apiPromise(chapterId),
            getImages(chapterId),
        ]);

        useLilithLog(debug).log({
            language: LanguageMapper[getLanguageFromTags(book.tags)],
        });
        useLilithLog(debug).log({ imageUrls });

        return {
            id: chapterId,
            pages: book.images.pages.map((page, index) => ({
                uri: imageUrls[index],
                width: page.w,
                height: page.h,
            })),
            language: LanguageMapper[getLanguageFromTags(book.tags)],
            title:
                book.title[getLanguageFromTags(book.tags)] || book.title.pretty,
            chapterNumber: 1,
        };
    };
};

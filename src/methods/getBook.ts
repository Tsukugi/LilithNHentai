import {
    LilithError,
    LilithTag,
    LilithLanguage,
    GetBook,
    Book,
} from "@atsu/lilith";
import { NHentaiResult, UseNHentaiMethodProps } from "../interfaces";
import { useLilithLog } from "../utils/log";
import { useNHentaiMethods } from "./base";
import { DateUtils } from "../utils/date";
import { RequestUtils } from "../utils/request";

/**
 * Hook for interacting with NHentai books.
 * @param {UseNHentaiMethodProps} props - Properties required for the hook.
 * @returns {GetBook} - A function that retrieves information about a book based on its identifier.
 */
export const useNHentaiGetBookmethod = (
    props: UseNHentaiMethodProps,
): GetBook => {
    const {
        domains: { apiUrl, baseUrl },
        options: { debug, requiredLanguages },
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

        const coverSelector = "#cover img";

        const cover = RequestUtils.sanitizeImageSrc(
            document.find(coverSelector).getAttribute("data-src"),
        );

        const imagesSelector = ".thumb-container img.lazyload";

        const images = document
            .findAll(imagesSelector)
            .map((image) =>
                RequestUtils.sanitizeImageSrc(image.getAttribute("data-src")),
            );

        return {
            cover,
            images,
        };
    };

    const { getEpoch } = DateUtils;

    /**
     * Retrieves information about a book based on its identifier.
     * @param {string} id - The unique identifier of the book.
     * @param {LilithLanguage[]} [requiredLanguages] - Optional array of required languages.
     * @returns {Promise<Book>} - A Promise that resolves to the retrieved book.
     * @throws {LilithError} - Throws an error if the book is not found or no translation is available for the requested language.
     */
    return async (id: string): Promise<Book> => {
        try {
            const [book, images] = await Promise.all([
                apiPromise(id),
                getImages(id),
            ]);

            const tags: LilithTag[] = [];

            let author = "unknown";
            book.tags.forEach((tag) => {
                if (tag.type === "author" && author === "unknown") {
                    author = tag.name; // Get the first author
                }
                if (tag.type === "tag") {
                    tags.push({
                        id: `${tag.id}`,
                        name: tag.name,
                    });
                }
            });

            const lilithLanguage: LilithLanguage =
                LanguageMapper[getLanguageFromTags(book.tags)];

            const matchesTranslation =
                requiredLanguages.includes(lilithLanguage);
            useLilithLog(debug).log({
                requiredLanguages,
                lilithLanguage,
                matchesTranslation,
                tags: book.tags.map((tag) => [tag.type, tag.name]),
            });

            if (!matchesTranslation) {
                throw new LilithError(
                    404,
                    `No translation for the requested language available, retrieved: ${lilithLanguage}`,
                );
            }

            const { english, japanese, pretty } = book.title;

            useLilithLog(debug).log({ coverUri: images });
            return {
                title: english || japanese || pretty,
                id: `${book.id}`,
                author,
                tags,
                cover: {
                    uri: images.cover,
                    width: book.images.cover.w,
                    height: book.images.cover.h,
                },
                // NHentai always provides 1 chapter books
                chapters: [
                    {
                        id: `${book.id}`,
                        title:
                            book.title[getLanguageFromTags(book.tags)] ||
                            book.title.pretty,
                        language: lilithLanguage,
                        chapterNumber: 1,
                        pages: images.images.map((image) => ({
                            uri: image,
                        })),
                        savedAt: getEpoch(),
                    },
                ],
                availableLanguages: [lilithLanguage],
                savedAt: getEpoch(),
            };
        } catch (error) {
            console.error(error);
            return {
                title: "",
                id: "",
                author: "",
                tags: [],
                cover: { uri: "" },
                chapters: [],
                availableLanguages: [],
                savedAt: getEpoch(),
            };
        }
    };
};

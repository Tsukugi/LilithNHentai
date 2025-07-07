import { GetLatestBooks, BookListResults } from "@atsu/lilith";
import { useLilithLog } from "../utils/log";
import { NHentaiPaginateResult, UseNHentaiMethodProps } from "../interfaces";
import { useNHentaiMethods } from "./base";

/**
 * Custom hook for fetching the latest NHentai books using the provided options and methods.
 *
 * @param {UseNHentaiMethodProps} props - The options and methods needed for NHentai latest book retrieval.
 * @returns {GetLatestBooks} - The function for fetching the latest books.
 */
export const useNHentaiGetLatestBooksMethod = (
    props: UseNHentaiMethodProps,
): GetLatestBooks => {
    const {
        domains: { baseUrl, apiUrl },
        options: { debug, requiredLanguages },
        request,
    } = props;

    const { getGalleries } = useNHentaiMethods();

    const apiPromise = async (page: number) =>
        /* API call to get external info */
        await (
            await request<NHentaiPaginateResult>(
                `${apiUrl}/galleries/all?page=${page}`,
            )
        ).json();

    const getGalleriesFromMainPage = async (page: number) => {
        /* Scrapper to get images */
        const response = await request(`${baseUrl}`, [["page", page]]);
        const document = await response.getDocument();

        const popularGalleriesContainerSelector =
            "div.container.index-container:not(.index-popular)";

        const galleries = getGalleries(
            document,
            requiredLanguages,
            popularGalleriesContainerSelector,
        );

        return galleries;
    };

    /**
     * Function for fetching the latest NHentai books for a specific page.
     *
     * @param {number} page - The page number for pagination.
     * @returns {Promise<BookListResults>} - The pagination result containing the latest books.
     */
    return async (page: number): Promise<BookListResults> => {
        try {
            const [latestBooks, galleries] = await Promise.all([
                apiPromise(page),
                getGalleriesFromMainPage(page),
            ]);

            const numPages = latestBooks.num_pages || 0;
            const perPageEntries = latestBooks.per_page || 0;
            const totalResults = numPages * perPageEntries;

            useLilithLog(debug).log({ galleries });
            return {
                page,
                totalResults,
                totalPages: numPages,
                results: galleries,
            };
        } catch (error) {
            console.error(error);
            return {
                page,
                results: [],
            };
        }
    };
};

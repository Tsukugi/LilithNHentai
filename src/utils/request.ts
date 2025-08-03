import {
    UrlParamValue,
    UrlParamPair,
    RepositoryBaseProps,
    CustomFetchInitOptions,
    LilithError,
} from "@atsu/lilith";
import { Result } from "../interfaces/fetch";
import { useLilithLog } from "./log";
import { NHentaiImageExtension } from "../interfaces";

const useParamIfExists = (
    key: string,
    value: UrlParamValue | undefined,
): string => {
    return value !== undefined ? `${key}=${value}` : "";
};
const useUrlWithParams = (url: string, params?: UrlParamPair[]) => {
    if (!params || params.length === 0) return url;

    let useParams = "";
    params.forEach((param) => {
        const value = useParamIfExists(param[0], param[1]);
        if (!value) return;
        const separator = useParams ? "&" : "";
        useParams = `${useParams}${separator}${value}`;
    });

    return `${url}?${useParams}`;
};

export const useRequest = ({
    fetch,
    domParser,
    options: { debug },
}: RepositoryBaseProps) => {
    const doRequest = async <T>(
        url: string,
        params?: UrlParamPair[],
        requestOptions: Partial<CustomFetchInitOptions> = {},
    ): Promise<Result<T>> => {
        try {
            const apiUrl = useUrlWithParams(url, params);

            useLilithLog(debug).log(apiUrl);

            const response = await fetch(apiUrl, requestOptions);

            const getDocument = async () => domParser(await response.text());

            return {
                json: response.json,
                statusCode: response.status,
                getDocument,
            };
        } catch (error) {
            throw new LilithError(
                error.status || 500,
                "There was an error on the request",
                error,
            );
        }
    };

    return { doRequest };
};

const removeDuplicateExtensions = (url: string): string => {
    const lastDotIndex = url.lastIndexOf(".");
    if (lastDotIndex === -1) throw new Error("No extensions at all");

    const paths = url.split(".");
    const validExtensions = Object.values(NHentaiImageExtension);

    const checkIsValidExtension = (ext: string) =>
        !!validExtensions.find((valExt) => ext === valExt);

    // Find the last valid extension
    const lastExtension = paths[paths.length - 1];

    // If a valid extension was found, reconstruct the URL
    if (!checkIsValidExtension(lastExtension))
        throw new Error("No valid extension");

    return `${paths
        .filter((path) => !checkIsValidExtension(path))
        .join(".")}.${lastExtension}`;
};

const sanitizeImageSrc = (image: string | null): string | null => {
    if (!image) {
        return null; // Return null if the input is null
    }

    // Trim whitespace from the image URL
    image = image.trim();

    // Attempt to fix common issues
    if (!/^https?:\/\//i.test(image)) {
        // If the URL doesn't start with http:// or https://, add https://
        image = "https://" + image;
    }

    try {
        const url = new URL(image); // Validate the URL

        // Check if the protocol is not HTTPS
        if (url.protocol !== "https:") {
            url.protocol = "https:"; // Change to HTTPS
        }

        // Remove duplicate extensions
        url.pathname = removeDuplicateExtensions(url.pathname);

        return url.toString(); // Return the sanitized URL
    } catch (error) {
        console.error("Invalid URL:", image); // Log the error for debugging
        return null; // Return null if the URL is still invalid
    }
};

export const RequestUtils = {
    useUrlWithParams,
    useParamIfExists,
    sanitizeImageSrc,
};

import {
    UrlParamValue,
    UrlParamPair,
    RepositoryBaseProps,
    CustomFetchInitOptions,
    LilithError,
    LilithImage,
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
    const segments = url.split(".");
    const validExtensions = Object.values(NHentaiImageExtension);

    const firstValidIndex = segments.findIndex((segment) =>
        validExtensions.includes(segment as NHentaiImageExtension),
    );

    if (firstValidIndex === -1) {
        throw new Error("No valid extension");
    }

    return segments.slice(0, firstValidIndex + 1).join(".");
};

const removeProtocol = (url: string): string => {
    return url
        .replace(/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//, "")
        .replace(/^\/\//, "");
};

const sanitizeImageSrc = (image: string | null): string | null => {
    if (!image) {
        console.warn("Provided image is null");
        return null; // Return null if the input is null
    }

    try {
        const trimmedImage = removeProtocol(image.trim());
        const normalizedImage = removeDuplicateExtensions(trimmedImage);
        return `https://${normalizedImage}`;
    } catch (error) {
        console.error("Invalid URL:", image); // Log the error for debugging
        return null; // Return null if the URL is still invalid
    }
};

export type SanitizedImage = { uri: string | null; fallbackUri?: string };

const sanitizeImageSrcWithFallback = (
    ...images: Array<string | null | undefined>
): SanitizedImage => {
    const sanitizedCandidates = images
        .map((candidate) => sanitizeImageSrc(candidate || null))
        .filter((candidate): candidate is string => !!candidate);

    const [uri] = sanitizedCandidates;
    const fallbackUri = sanitizedCandidates.find(
        (candidate) => candidate !== uri,
    );

    return { uri: uri || null, fallbackUri: fallbackUri || undefined };
};

const toLilithImage = (image: SanitizedImage): LilithImage => ({
    uri: image.uri ?? "",
    ...(image.fallbackUri ? { fallbackUri: image.fallbackUri } : {}),
});

export const RequestUtils = {
    useUrlWithParams,
    useParamIfExists,
    sanitizeImageSrc,
    sanitizeImageSrcWithFallback,
    removeDuplicateExtensions,
    toLilithImage,
};

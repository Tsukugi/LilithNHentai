import { CustomFetch, CustomFetchResponse } from "../interfaces/fetch";

export const useNodeFetch: CustomFetch = async (
    url,
    options,
): Promise<CustomFetchResponse> => {
    // Use the global fetch so React Native and Node share the same implementation
    const res = await fetch(url, options as RequestInit);
    return {
        text: () => res.text(), // We need this to avoid fetch/node-fetch "cannot find property 'disturbed' from undefined"
        json: <T>() => res.json() as T,
        status: res.status,
    };
};

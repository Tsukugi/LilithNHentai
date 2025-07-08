const getEpoch = (date?: Date): number => {
    return Math.floor((date.getTime() || Date.now()) / 1000);
};

export const DateUtils = {
    getEpoch,
};

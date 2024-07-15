let globalRefresh = false;
let globalReviewRefresh = false;

export const setGlobalRefresh = (newValue) => {
    globalRefresh = newValue;
};
export const setReviewRefresh = (newValue) => {
    globalReviewRefresh = newValue;
};

export const getGlobalRefresh = () => globalRefresh;
export const getReviewRefresh = () => globalReviewRefresh;
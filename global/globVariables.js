let globalRefresh = false;
let globalReviewRefresh = false;
let globalProfileRefresh = false;

export const setGlobalRefresh = (newValue) => {
    globalRefresh = newValue;
};
export const setReviewRefresh = (newValue) => {
    globalReviewRefresh = newValue;
};
export const setProfileRefresh = (newValue) => {
    globalReviewRefresh = newValue;
};

export const getGlobalRefresh = () => globalRefresh;
export const getReviewRefresh = () => globalReviewRefresh;
export const getProfileRefresh = () => globalProfileRefresh;
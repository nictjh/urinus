let globalRefresh = false;
let globalReviewRefresh = false;
let globalProfileRefresh = false;
let globalErrorRefresh = false;

export const setGlobalRefresh = (newValue) => {
    globalRefresh = newValue;
};
export const setReviewRefresh = (newValue) => {
    globalReviewRefresh = newValue;
};
export const setProfileRefresh = (newValue) => {
    globalReviewRefresh = newValue;
};

export const setErrorRefresh = (newValue) => {
    globalErrorRefresh = newValue;
};

export const getGlobalRefresh = () => globalRefresh;
export const getReviewRefresh = () => globalReviewRefresh;
export const getProfileRefresh = () => globalProfileRefresh;
export const getErrorRefresh = () => globalErrorRefresh;
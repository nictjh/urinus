let globalRefresh = false;

export const setGlobalRefresh = (newValue) => {
    globalRefresh = newValue;
};

export const getGlobalRefresh = () => globalRefresh;
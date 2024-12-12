let stopProcessing = false;

export const getStopProcessing = (): boolean => stopProcessing;

export const setStopProcessing = (value: boolean): void => {
  stopProcessing = value;
};

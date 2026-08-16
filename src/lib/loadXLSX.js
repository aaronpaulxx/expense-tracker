// Cached at module scope so re-opening Settings (or using both export and
// import in the same session) doesn't re-fetch the xlsx chunk more than once.
let xlsxModulePromise = null;

export const loadXLSX = () => {
  if (!xlsxModulePromise) {
    xlsxModulePromise = import("xlsx/dist/xlsx.mini.min.js");
  }
  return xlsxModulePromise;
};

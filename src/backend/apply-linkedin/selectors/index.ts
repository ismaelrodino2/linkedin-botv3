const modal =
  ".artdeco-modal .artdeco-modal--layer-default .jobs-easy-apply-modal";

export const selectors = {
  // container with jobs
  jobs_container: 'li[class*="jobs-search-results__list-item"]',
  easyApplyButtonEnabled: "button.jobs-apply-button:enabled",
  applyButton: "button.jobs-apply-button",
  apply_modal: modal,
  nextButton:
  ".jobs-easy-apply-modal footer button[aria-label*='next'], .jobs-easy-apply-modal footer button[aria-label*='Review'], .jobs-easy-apply-modal footer button[aria-label*='Submit application']:enabled, .jobs-easy-apply-modal footer button[aria-label*='Review your application']:enabled, .jobs-easy-apply-modal footer button[aria-label*='Done']:enabled",
  submitEn: ".jobs-easy-apply-modal footer button[aria-label*='Submit application']",//to-do: ver qual seria
  submitPt: ".jobs-easy-apply-modal footer button[aria-label*='Enviar candidatura']",//to-do: ver qual seria

  //pagination
  pagination: ".artdeco-pagination__pages.artdeco-pagination__pages--number",

  //form
  select: `${modal} form select`,

  //cv
  documentUpload: ".jobs-easy-apply-modal div[class*='jobs-document-upload']",
  documentUploadLabel: "label[class*='jobs-document-upload']",
  documentUploadInput: "input[type='file'][id*='jobs-document-upload']",
};

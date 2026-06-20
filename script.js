const chatWindow = document.getElementById("chatWindow");
const quickReplies = document.getElementById("quickReplies");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatBotPanel = document.getElementById("chatbot");
const stateSelect = document.getElementById("stateSelect");
const stateOptions = document.getElementById("stateOptions");
const chatContactFields = document.getElementById("chatContactFields");
const chatNameInput = document.getElementById("chatNameInput");
const chatPhoneInput = document.getElementById("chatPhoneInput");
const chatEmailInput = document.getElementById("chatEmailInput");
const chatJumpLinks = document.querySelectorAll(".js-chat-jump");
const pathStartActions = document.getElementById("pathStartActions");
const pathChoiceButtons = document.querySelectorAll(".path-choice-button");
const pathIntake = document.getElementById("pathIntake");
const pathPrompt = document.getElementById("pathPrompt");
const pathReplies = document.getElementById("pathReplies");
const pathSelectionCard = document.querySelector(".path-selection-card");
const pathForm = document.getElementById("pathForm");
const pathInput = document.getElementById("pathInput");
const pathNextButton = document.getElementById("pathNextButton");
const pathStateMap = document.getElementById("pathStateMap");
const pathStateSelect = document.getElementById("pathStateSelect");
const pathContactFields = document.getElementById("pathContactFields");
const pathNameInput = document.getElementById("pathNameInput");
const pathEmailInput = document.getElementById("pathEmailInput");
const pathPhoneInput = document.getElementById("pathPhoneInput");
const ratesGrid = document.getElementById("ratesGrid");
const ratesUpdated = document.getElementById("ratesUpdated");
const ratesDisclaimer = document.getElementById("ratesDisclaimer");

chatForm.noValidate = true;
pathForm.noValidate = true;

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

const loanApplicationUrl = "https://gamai.mymortgage-online.com/loan-app/?workFlowId=261281&siteId=7423560722";
const googleSheetsWebAppUrl = "https://script.google.com/macros/s/AKfycbwwBdMF4SfMTF6-WyKc0qhrCQYP_6gX4mN_MX0-uVqVu9u0wrfdfigo2ufOu8Q618sedA/exec";
const mortgageRatesWebAppUrl = "https://script.google.com/macros/s/AKfycbz8edJZakd0G8LpuwBKo7i7QsdkS2vnCnZxqDay5fzmiuQnMRn8bxBvhkeESBmqzVP6fQ/exec";
const contactConsentDisclosure = "By selecting I Agree, you authorize Get Approved Mortgage, Inc. to contact you at the phone number and email you provided about mortgage products and services, including by call, text message, or email. Calls or texts may use automated technology, prerecorded messages, or artificial voice. Consent is not required to buy goods or services. Message and data rates may apply. Reply STOP to opt out.";

const leadSubmissionFields = [
  "leadId",
  "status",
  "submittedAt",
  "lastUpdatedAt",
  "completedAt",
  "source",
  "fullName",
  "email",
  "phone",
  "intent",
  "firstTimeBuyer",
  "purchasePropertyUse",
  "refinancePurpose",
  "state",
  "creditRange",
  "downPayment",
  "purchasePriceRange",
  "desiredHomeType",
  "bankruptcy",
  "veteran",
  "borrowAmount",
  "equity",
  "homeValue",
  "refinancePropertyUse",
  "currentHomeType",
  "currentMortgage",
  "interestRate",
  "secondMortgage",
  "amountOwed",
  "adverseCreditEvents",
  "bestContactTime",
  "wantsApplication",
  "contactConsent",
  "consentDisclosure",
  "consentedAt"
];

function createLeadId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `lead-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function resetHomePageScrollPosition() {
  const hash = window.location.hash;
  const shouldHonorHash = hash && hash !== "#top";

  if (shouldHonorHash) {
    return;
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto"
    });
  };

  scrollToTop();
  window.requestAnimationFrame(scrollToTop);
  window.setTimeout(scrollToTop, 0);
}

const states = [
  "Alabama", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

function createLeadState() {
  return {
    leadId: createLeadId(),
    status: "Started",
    submittedAt: "",
    lastUpdatedAt: "",
    completedAt: "",
    fullName: "",
    email: "",
    phone: "",
    intent: "",
    firstTimeBuyer: "",
    purchasePropertyUse: "",
    refinancePurpose: "",
    state: "",
    creditRange: "",
    downPayment: "",
    purchasePriceRange: "",
    desiredHomeType: "",
    bankruptcy: "",
    veteran: "",
    borrowAmount: "",
    equity: "",
    homeValue: "",
    refinancePropertyUse: "",
    currentHomeType: "",
    currentMortgage: "",
    interestRate: "",
    secondMortgage: "",
    amountOwed: "",
    adverseCreditEvents: "",
    bestContactTime: "",
    wantsApplication: "",
    contactConsent: "",
    consentDisclosure: "",
    consentedAt: ""
  };
}

const lead = createLeadState();
const pathLead = createLeadState();

const initialFlow = [
  {
    key: "contactDetails",
    prompt: "If so, I'd love to help you get started. Please enter your name, phone number, and email. Otherwise, scroll below to see some of the products we offer."
  },
  {
    key: "intent",
    prompt: "Let's get started. Are you planning on buying a home or refinancing?",
    replies: ["Buying a Home", "Refinancing"]
  }
];

const contactDetailsQuestion = {
  key: "contactDetails",
  prompt: "Great, I have the basics. Please enter your contact details so we can follow up."
};

const closingQuestions = [
  {
    key: "bestContactTime",
    prompt: "When would be the best time to reach you?",
    replies: ["Morning", "Afternoon", "Evening"]
  },
  {
    key: "wantsApplication",
    prompt: "That wraps up this set of questions. Would you like to get the loan application process started?",
    replies: ["Yes", "No"]
  },
  {
    key: "contactConsent",
    prompt: contactConsentDisclosure,
    replies: ["I Agree", "No Thanks"],
    end: true
  }
];

const purchaseQuestions = [
  {
    key: "state",
    prompt: (leadContext = lead) => leadContext.firstTimeBuyer === "Yes"
      ? "Great, you may qualify for first-time homebuyer incentives. What state are you looking to buy in?"
      : "Great, so you are familiar with the process. Let's get started with the state you plan on buying a home in.",
    useStateList: true
  },
  {
    key: "purchasePropertyUse",
    prompt: "What type of property is this?",
    replies: ["Primary Residence", "Investment Property", "Vacation Home"]
  },
  {
    key: "creditRange",
    prompt: "Do you have an idea of what your credit score is around?",
    replies: ["750+", "749-700", "699-651", "650-600", "599-550", "550 to 450"]
  },
  {
    key: "downPayment",
    prompt: "How much do you plan on putting down?",
    replies: ["5% to 10%", "10% to 15%", "15% or more"]
  },
  {
    key: "purchasePriceRange",
    prompt: "What price range do you have in mind?",
    replies: ["Above $1MM", "$999k to $750k", "$749k to $500k", "$499k to $250k", "$249k - $100k", "$100k and below"]
  },
  {
    key: "desiredHomeType",
    prompt: "What type of property are you looking for?",
    replies: ["Single Family Home", "Condo", "Town-House", "Multi-Family Home", "Commercial", "Agricultural"]
  },
  {
    key: "bankruptcy",
    prompt: "Have you had a bankruptcy in the last seven years?",
    replies: ["Yes", "No"]
  },
  {
    key: "veteran",
    prompt: "Are you a veteran?",
    replies: ["Yes", "No"]
  },
  {
    key: "bestContactTime",
    prompt: "When would be the best time to reach you?",
    replies: ["Morning", "Afternoon", "Evening"]
  },
  {
    key: "wantsApplication",
    prompt: "That wraps up this set of questions. Would you like to get the loan application process started?",
    replies: ["Yes", "No"]
  },
  {
    key: "contactConsent",
    prompt: contactConsentDisclosure,
    replies: ["I Agree", "No Thanks"],
    end: true
  }
];

const refinanceQuestions = [
  {
    key: "refinancePurpose",
    prompt: "Are you looking to:",
    replies: ["Cash-Out", "Debt-Consolidation", "Home Improvement"]
  },
  {
    key: "state",
    prompt: "What state are you looking to refinance in?",
    useStateList: true
  },
  {
    key: "refinancePropertyUse",
    prompt: "What type of property is this?",
    replies: ["Primary Residence", "Investment Property", "Vacation Home"]
  },
  {
    key: "creditRange",
    prompt: "Do you have an idea of what your credit score is around?",
    replies: ["750+", "749-700", "699-651", "650-600", "599-550", "550 to 450"]
  },
  {
    key: "borrowAmount",
    prompt: "How much are you looking to borrow?",
    replies: ["Above $1MM", "$999k to $750K", "$749K To $500k", "$499k to $300k", "$299k to $200k", "$200k or Below"]
  },
  {
    key: "equity",
    prompt: "How much equity do you have in your home?",
    replies: ["Above $1MM", "$999k to $750K", "$749K To $500k", "$499k to $300k", "$299k to $200k", "$200k or Below"]
  },
  {
    key: "homeValue",
    prompt: "Do you know how much your home is currently worth?",
    replies: ["Above $1MM", "$999k to $750K", "$749K To $500k", "$499k to $300k", "$299k to $200k", "$200k or Below"]
  },
  {
    key: "currentHomeType",
    prompt: "What type of home do you currently own?",
    replies: ["Single Family Home", "Condo", "Town-House", "Multi-Family Home", "Commercial", "Agricultural"]
  },
  {
    key: "currentMortgage",
    prompt: "Do you currently have a mortgage on your home?",
    replies: ["Yes", "No"]
  },
  {
    key: "interestRate",
    prompt: "What is your current interest rate around?",
    replies: ["No Mortgage", "Don't Know", "Above 9%", "Above 8%", "Above 7%", "Above 6%", "Above 5%", "Above 4%", "Above 3%"]
  },
  {
    key: "secondMortgage",
    prompt: "Do you have a second mortgage?",
    replies: ["Yes", "No"]
  },
  {
    key: "amountOwed",
    prompt: "How much do you owe on the home?",
    replies: ["$500k or more", "$250k or more", "$200k to $150k", "$150k to $100k", "$100k to $50k", "$50k or less"]
  },
  {
    key: "bankruptcy",
    prompt: "Have you filed bankruptcy in the last seven years?",
    replies: ["Yes", "No"]
  },
  {
    key: "adverseCreditEvents",
    prompt: "Do you have any judgments, foreclosures, or student loan defaults?",
    replies: ["Yes", "No", "Judgments", "Foreclosures", "Student Loan Defaults", "Other Defaults"]
  },
  {
    key: "veteran",
    prompt: "Are you a veteran?",
    replies: ["Yes", "No"]
  },
  {
    key: "bestContactTime",
    prompt: "When would be the best time to reach you?",
    replies: ["Morning", "Afternoon", "Evening"]
  },
  {
    key: "wantsApplication",
    prompt: "That wraps up this set of questions. Would you like to get the loan application process started?",
    replies: ["Yes", "No"]
  },
  {
    key: "contactConsent",
    prompt: contactConsentDisclosure,
    replies: ["I Agree", "No Thanks"],
    end: true
  }
];

const pathPurchaseQuestions = purchaseQuestions.slice(0, -3).concat(contactDetailsQuestion, closingQuestions);
const pathRefinanceQuestions = refinanceQuestions.slice(0, -3).concat(contactDetailsQuestion, closingQuestions);

let activeFlow = [...initialFlow];
let stepIndex = 0;
let historyStack = [];
let pathActiveFlow = [];
let pathStepIndex = 0;
let pathHistoryStack = [];

function getFirstName() {
  return lead.fullName.trim().split(/\s+/)[0] || "there";
}

function normalizeName(answer) {
  let name = answer
    .replace(/["']/g, "")
    .replace(/\b(hi|hello|hey|good morning|good afternoon|good evening)\b,?/gi, " ")
    .replace(/\b(my name is|name is|i am|i'm|im|this is|it's|its)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!name) {
    return answer.trim();
  }

  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function addMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addApplicationButton() {
  const link = document.createElement("a");
  link.className = "loan-application-button";
  link.href = loanApplicationUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.textContent = "Start Loan Application";
  quickReplies.innerHTML = "";
  quickReplies.appendChild(link);
  appendBackButton();
}

function getCurrentStep() {
  return activeFlow[stepIndex];
}

function isPhoneStep() {
  const step = getCurrentStep();
  return step?.key === "phone";
}

function getPrompt(step, leadContext = lead) {
  return typeof step.prompt === "function" ? step.prompt(leadContext) : step.prompt;
}

function getReplies(step) {
  return typeof step.replies === "function" ? step.replies() : step.replies || [];
}

function appendBackButton() {
  if (!historyStack.length) {
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "back-reply";
  button.textContent = "Back";
  button.addEventListener("click", goBack);
  quickReplies.appendChild(button);
}

function setReplies(options = []) {
  quickReplies.innerHTML = "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = option;
    button.addEventListener("click", () => submitAnswer(option));
    quickReplies.appendChild(button);
  });

  appendBackButton();
}

function configureInput(step) {
  const isContactDetailsStep = step.key === "contactDetails";
  chatInput.value = "";
  stateSelect.value = "";
  stateSelect.hidden = !step.useStateList;
  stateSelect.name = step.useStateList ? "address-level1" : "unused-state";
  chatContactFields.hidden = !isContactDetailsStep;
  chatInput.hidden = isContactDetailsStep;
  chatInput.type = step.inputType || "text";
  chatInput.name = isContactDetailsStep ? "unused-message" : getInputNameValue(step);
  chatInput.placeholder = step.placeholder || (step.useStateList ? "Start typing a state" : "Type your answer");
  chatInput.classList.toggle("attention-placeholder", step.key === "fullName");
  chatInput.removeAttribute("pattern");
  chatInput.removeAttribute("inputmode");
  chatInput.setAttribute("autocomplete", getAutocompleteValue(step));

  if (step.useStateList) {
    chatInput.setAttribute("list", "stateOptions");
  } else {
    chatInput.removeAttribute("list");
  }

  if (step.inputType === "email") {
    chatInput.placeholder = "person@mail.com";
    chatInput.setAttribute("inputmode", "email");
    chatInput.setAttribute("pattern", "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");
  }

  if (step.inputType === "tel") {
    chatInput.setAttribute("inputmode", "tel");
    chatInput.placeholder = "555-555-5555";
    chatInput.setAttribute("pattern", "^(?:\\+?1[\\s.-]?)?(?:\\([2-9]\\d{2}\\)|[2-9]\\d{2})[\\s.-]?[2-9]\\d{2}[\\s.-]?\\d{4}$");
  }

  if (isContactDetailsStep) {
    chatNameInput.focus();
  }
}

function getAutocompleteValue(step) {
  const autocompleteMap = {
    fullName: "name",
    email: "email",
    phone: "tel",
    state: "address-level1"
  };

  return autocompleteMap[step.key] || "off";
}

function getInputNameValue(step) {
  const nameMap = {
    fullName: "name",
    email: "email",
    phone: "tel",
    state: "address-level1"
  };

  return nameMap[step.key] || "message";
}

function getChatContactDetails() {
  return {
    fullName: normalizeName(chatNameInput.value.trim()),
    phone: chatPhoneInput.value.trim(),
    email: chatEmailInput.value.trim()
  };
}

function flagChatContactField(field, shouldFlag) {
  field.classList.toggle("attention-placeholder", shouldFlag);
  field.setAttribute("aria-invalid", shouldFlag ? "true" : "false");
}

function askCurrentStep() {
  const step = getCurrentStep();
  configureInput(step);
  addMessage("bot", getPrompt(step));
  setReplies(getReplies(step));
}

function renderCurrentControls() {
  const step = getCurrentStep();
  configureInput(step);
  setReplies(getReplies(step));
}

function classifyIntent(answer) {
  const value = answer.toLowerCase().replace(/[^a-z\s]/g, " ");
  const buyWords = ["buy", "buying", "purchase", "purchasing", "home", "house", "first"];
  const refiWords = ["refi", "refinance", "refinancing", "cash", "equity", "rate"];
  const buyScore = buyWords.filter((word) => value.includes(word)).length;
  const refiScore = refiWords.filter((word) => value.includes(word)).length;

  if (refiScore > buyScore) {
    return "Refinance";
  }

  if (buyScore > 0) {
    return "Buying a Home";
  }

  return "";
}

function normalizeYesNo(answer) {
  const value = answer.toLowerCase();
  if (["yes", "y", "yeah", "yep", "sure"].some((word) => value.includes(word))) {
    return "Yes";
  }
  if (["no", "n", "nope", "not"].some((word) => value.includes(word))) {
    return "No";
  }
  return answer;
}

function isValidEmail(answer) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(answer);
}

function isValidUsPhone(answer) {
  return /^(?:\+?1[\s.-]?)?(?:\([2-9]\d{2}\)|[2-9]\d{2})[\s.-]?[2-9]\d{2}[\s.-]?\d{4}$/.test(answer);
}

function formatUsPhone(answer) {
  let digits = answer.replace(/\D/g, "");

  if (digits.startsWith("1")) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 10);

  if (!digits) {
    return "";
  }

  if (digits.length <= 3) {
    return `+1 ${digits}`;
  }

  if (digits.length <= 6) {
    return `+1 ${digits.slice(0, 3)}-${digits.slice(3)}`;
  }

  return `+1 ${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function saveHistorySnapshot() {
  historyStack.push({
    activeFlow: [...activeFlow],
    stepIndex,
    lead: { ...lead },
    chatWindowHtml: chatWindow.innerHTML
  });
}

function goBack() {
  const previous = historyStack.pop();

  if (!previous) {
    return;
  }

  activeFlow = [...previous.activeFlow];
  stepIndex = previous.stepIndex;

  Object.keys(lead).forEach((key) => {
    lead[key] = previous.lead[key] || "";
  });

  chatWindow.innerHTML = previous.chatWindowHtml;
  renderCurrentControls();
  chatWindow.scrollTop = chatWindow.scrollHeight;
  chatInput.focus();
}

function appendNextFlowForIntent(answer) {
  const intent = classifyIntent(answer);

  if (!intent) {
    addMessage("bot", "I want to make sure I route you correctly. Please choose Buying a Home or Refinancing.");
    setReplies(["Buying a Home", "Refinancing"]);
    return false;
  }

  lead.intent = intent;

  if (intent === "Refinance") {
    activeFlow = activeFlow.slice(0, stepIndex + 1).concat(refinanceQuestions);
    return true;
  }

  activeFlow = activeFlow.slice(0, stepIndex + 1).concat({
    key: "firstTimeBuyer",
    prompt: "Are you a first-time home buyer?",
    replies: ["Yes", "No"]
  });
  return true;
}

function appendPurchaseFlowAfterFirstTime(answer) {
  lead.firstTimeBuyer = normalizeYesNo(answer);
  activeFlow = activeFlow.slice(0, stepIndex + 1).concat(purchaseQuestions);
}

function finishFlow() {
  submitLeadToGoogleSheets("Partial");
  lead.status = "Completed";

  if (lead.contactConsent !== "Yes") {
    addMessage("bot", "Thank you. We captured your request and will only contact you as permitted.");
    setReplies(["Start over"]);
    return;
  }

  if (lead.wantsApplication === "Yes") {
    addMessage("bot", "Great. You can start the loan application now using our secure portal. Fill out the forms and one of our loan officers will give you a call. Thank you.");
    addApplicationButton();
    return;
  }

  addMessage("bot", "Thank you for speaking to me today. One of our loan professionals will contact you soon.");
  setReplies(["Start over"]);
}

function hasEnoughLeadInfoToSubmit() {
  return Boolean(lead.fullName && (lead.email || lead.phone));
}

function hasEnoughLeadInfo(leadContext) {
  return Boolean(leadContext.fullName && (leadContext.email || leadContext.phone));
}

function hasCompletedFirstThreeChatbotQuestions() {
  return Boolean(lead.fullName && lead.email && lead.phone);
}

function shouldDelayChatbotLeadSubmission(status = "Partial", leadContext = lead) {
  return leadContext === lead && status !== "Completed" && !hasCompletedFirstThreeChatbotQuestions();
}

function buildLeadSubmission(status = "Partial", leadContext = lead) {
  const now = new Date().toISOString();

  if (!leadContext.submittedAt) {
    leadContext.submittedAt = now;
  }

  leadContext.status = status;
  leadContext.lastUpdatedAt = now;
  leadContext.completedAt = status === "Completed" ? now : leadContext.completedAt || "";

  return leadSubmissionFields.reduce((payload, field) => {
    if (field === "source") {
      payload[field] = window.location.href;
      return payload;
    }

    payload[field] = leadContext[field] || "";
    return payload;
  }, {});
}

function getNextStepIncrement(flow, currentIndex, leadContext) {
  let increment = 1;
  const currentStep = flow[currentIndex];
  const nextStep = flow[currentIndex + 1];

  if (
    currentStep?.key === "currentMortgage"
    && leadContext.currentMortgage === "No"
    && nextStep?.key === "interestRate"
  ) {
    increment += 1;
  }

  if (
    currentStep?.key === "secondMortgage"
    && leadContext.currentMortgage === "No"
    && nextStep?.key === "amountOwed"
  ) {
    increment += 1;
  }

  return increment;
}

function submitLeadPayload(status = "Partial", leadContext = lead) {
  if (!googleSheetsWebAppUrl || !hasEnoughLeadInfo(leadContext) || shouldDelayChatbotLeadSubmission(status, leadContext)) {
    return;
  }

  const formData = new FormData();
  formData.append("payload", JSON.stringify(buildLeadSubmission(status, leadContext)));

  fetch(googleSheetsWebAppUrl, {
    method: "POST",
    mode: "no-cors",
    body: formData
  }).catch((error) => {
    console.error("Google Sheets lead submission failed:", error);
  });
}

function submitLeadToGoogleSheets(status = "Partial") {
  submitLeadPayload(status, lead);
}

function submitLeadOnExit() {
  if (!googleSheetsWebAppUrl || !hasEnoughLeadInfoToSubmit() || !hasCompletedFirstThreeChatbotQuestions() || lead.status === "Completed") {
    return;
  }

  const formData = new FormData();
  formData.append("payload", JSON.stringify(buildLeadSubmission("Partial")));

  if (navigator.sendBeacon?.(googleSheetsWebAppUrl, formData)) {
    return;
  }

  fetch(googleSheetsWebAppUrl, {
    method: "POST",
    mode: "no-cors",
    body: formData,
    keepalive: true
  }).catch(() => {});
}

function formatRatesUpdated(value) {
  if (!value) {
    return "Rates are being updated.";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return `Updated ${value}`;
  }

  return `Updated ${date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  })}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function createRateDetail(label, value) {
  if (!value) {
    return "";
  }

  return `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`;
}

function formatRatePercent(value) {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "number") {
    const percent = value <= 1 ? value * 100 : value;
    return `${percent.toFixed(3).replace(/\.?0+$/, "")}%`;
  }

  const textValue = String(value).trim();

  if (textValue.includes("%")) {
    return textValue;
  }

  const numericValue = Number(textValue);

  if (!Number.isNaN(numericValue)) {
    const percent = numericValue <= 1 ? numericValue * 100 : numericValue;
    return `${percent.toFixed(3).replace(/\.?0+$/, "")}%`;
  }

  return textValue;
}

function renderMortgageRates(data) {
  if (!ratesGrid) {
    return;
  }

  const rates = Array.isArray(data?.rates) ? data.rates.filter((rate) => rate.program && rate.rate) : [];

  if (!rates.length) {
    return;
  }

  ratesGrid.innerHTML = rates.map((rate) => `
    <article class="rate-card">
      <h3>${escapeHtml(rate.program)}</h3>
      <strong>${escapeHtml(formatRatePercent(rate.rate))}</strong>
      <dl>
        ${createRateDetail("APR", formatRatePercent(rate.apr))}
        ${createRateDetail("Points", rate.points)}
        ${createRateDetail("Term", rate.term)}
      </dl>
      ${rate.notes ? `<p>${escapeHtml(rate.notes)}</p>` : ""}
    </article>
  `).join("");

  if (ratesUpdated) {
    ratesUpdated.textContent = formatRatesUpdated(data.updatedAt);
  }

  if (ratesDisclaimer && data.disclaimer) {
    ratesDisclaimer.textContent = data.disclaimer;
  }
}

function loadMortgageRates() {
  if (!mortgageRatesWebAppUrl || !ratesGrid) {
    return;
  }

  fetch(mortgageRatesWebAppUrl, {
    method: "GET",
    cache: "no-store"
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Rates request failed with status ${response.status}`);
      }

      return response.json();
    })
    .then(renderMortgageRates)
    .catch((error) => {
      console.error("Mortgage rates could not be loaded:", error);
    });
}

function getPathStep() {
  return pathActiveFlow[pathStepIndex];
}

function configurePathInput(step) {
  const hasReplyButtons = getReplies(step).length > 0;
  const usesContactFields = step.key === "contactDetails";

  pathInput.value = "";
  pathStateSelect.value = "";
  pathNameInput.value = pathLead.fullName || "";
  pathEmailInput.value = pathLead.email || "";
  pathPhoneInput.value = pathLead.phone || "";
  [pathNameInput, pathEmailInput, pathPhoneInput].forEach((field) => {
    field.classList.remove("attention-placeholder");
  });
  pathStateSelect.hidden = !step.useStateList;
  pathStateMap.hidden = !step.useStateList;
  pathNextButton.hidden = Boolean(step.useStateList);
  pathForm.hidden = hasReplyButtons && !step.useStateList;
  pathContactFields.hidden = !usesContactFields;
  pathInput.hidden = Boolean(step.useStateList || hasReplyButtons || usesContactFields);
  pathInput.type = step.inputType || "text";
  pathInput.name = getPathInputNameValue(step);
  pathInput.placeholder = step.placeholder || (step.useStateList ? "Start typing a state" : "Type your answer");
  pathInput.setAttribute("autocomplete", getAutocompleteValue(step));
  pathInput.classList.toggle("attention-placeholder", step.key === "fullName" || usesContactFields);
  pathInput.removeAttribute("pattern");
  pathInput.removeAttribute("inputmode");

  if (step.inputType === "email") {
    pathInput.placeholder = "person@mail.com";
    pathInput.setAttribute("inputmode", "email");
    pathInput.setAttribute("pattern", "^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$");
  }

  if (step.inputType === "tel") {
    pathInput.setAttribute("inputmode", "tel");
    pathInput.placeholder = "555-555-5555";
    pathInput.setAttribute("pattern", "^(?:\\+?1[\\s.-]?)?(?:\\([2-9]\\d{2}\\)|[2-9]\\d{2})[\\s.-]?[2-9]\\d{2}[\\s.-]?\\d{4}$");
  }

}

function getPathInputNameValue(step) {
  if (step.useStateList) {
    return "address-level1";
  }

  return getInputNameValue(step);
}

function getPathContactDetails() {
  return {
    fullName: normalizeName(pathNameInput.value.trim()),
    email: pathEmailInput.value.trim(),
    phone: pathPhoneInput.value.trim()
  };
}

function flagPathContactField(field, shouldFlag) {
  field.classList.toggle("attention-placeholder", shouldFlag);
}

function setPathReplies(options = []) {
  pathReplies.innerHTML = "";
  pathReplies.dataset.stepKey = getPathStep()?.key || "";

  if (pathHistoryStack.length) {
    const backButton = document.createElement("button");
    backButton.type = "button";
    backButton.className = "path-reply-button path-back-button";
    const backIcon = document.createElement("span");
    backIcon.className = "path-reply-icon";
    backIcon.textContent = "<";
    backIcon.setAttribute("aria-hidden", "true");
    const backLabel = document.createElement("span");
    backLabel.textContent = "Back";
    backButton.append(backIcon, backLabel);
    backButton.addEventListener("click", goBackPath);
    pathReplies.appendChild(backButton);
  }

  options.forEach((option) => {
    const button = document.createElement("button");
    const optionValue = option.toLowerCase();
    const shouldUseTextOnly = getPathStep()?.key === "adverseCreditEvents" && ["yes", "no"].includes(optionValue);
    const isImageOnlyOption = !shouldUseTextOnly
      && ["yes", "no", "primary residence", "investment property", "vacation home"].includes(optionValue);
    const usesTextOnlyButtons = !isImageOnlyOption;
    button.type = "button";
    button.className = usesTextOnlyButtons
      ? "path-reply-button path-text-reply-button"
      : isImageOnlyOption
        ? "path-reply-button path-image-reply-button"
        : "path-reply-button";
    const replyImage = usesTextOnlyButtons ? null : getPathReplyImage(option);
    const photo = usesTextOnlyButtons ? null : document.createElement(isImageOnlyOption ? "img" : "span");

    if (isImageOnlyOption) {
      photo.className = "path-reply-full-image";
      photo.src = replyImage.src;
      photo.alt = option;
    } else if (photo) {
      photo.className = "path-reply-photo";
      photo.style.setProperty("--reply-image", `url("${replyImage.src}")`);
      photo.style.setProperty("--reply-position", replyImage.position);
      photo.setAttribute("aria-hidden", "true");
    }

    const label = document.createElement("span");
    label.textContent = option;
    label.className = isImageOnlyOption ? "sr-only" : "";
    if (photo) {
      button.append(photo, label);
    } else {
      button.append(label);
    }
    button.addEventListener("click", () => submitPathAnswer(option));
    pathReplies.appendChild(button);
  });
}

function getPathReplyImage(option) {
  const value = option.toLowerCase();

  if (value === "yes") {
    return { src: "assets/yes-button.png", position: "50% 50%" };
  }

  if (value === "no") {
    return { src: "assets/no-button.png", position: "50% 50%" };
  }

  if (value === "primary residence") {
    return { src: "assets/primary-residence-button.png", position: "50% 50%" };
  }

  if (value === "investment property") {
    return { src: "assets/investment-property-button.png", position: "50% 50%" };
  }

  if (value === "vacation home") {
    return { src: "assets/vacation-home-button.png", position: "50% 50%" };
  }

  if (value.includes("refinance") || value.includes("cash") || value.includes("debt") || value.includes("term")) {
    return { src: "assets/hero.jpg", position: "55% 42%" };
  }

  if (value.includes("buy") || value.includes("home") || value.includes("primary")) {
    return { src: "assets/mortgage-scene.png", position: "78% 58%" };
  }

  if (value.includes("investment") || value.includes("rental")) {
    return { src: "assets/mortgage-scene.png", position: "63% 44%" };
  }

  if (value.includes("vacation")) {
    return { src: "assets/hero.jpg", position: "50% 50%" };
  }

  if (value.includes("yes") || value.includes("agree") || value.includes("excellent") || value.includes("good")) {
    return { src: "assets/mortgage-scene.png", position: "82% 62%" };
  }

  if (value.includes("no") || value.includes("thanks") || value.includes("fair") || value.includes("rebuilding")) {
    return { src: "assets/hero.jpg", position: "26% 55%" };
  }

  if (value.includes("morning")) {
    return { src: "assets/mortgage-scene.png", position: "18% 54%" };
  }

  if (value.includes("afternoon")) {
    return { src: "assets/hero.jpg", position: "48% 55%" };
  }

  if (value.includes("evening")) {
    return { src: "assets/mortgage-scene.png", position: "12% 76%" };
  }

  return { src: "assets/mortgage-scene.png", position: "72% 54%" };
}

function savePathSnapshot() {
  pathHistoryStack.push({
    pathActiveFlow: [...pathActiveFlow],
    pathStepIndex,
    pathLead: { ...pathLead }
  });
}

function goBackPath() {
  const previous = pathHistoryStack.pop();

  if (!previous) {
    pathIntake.hidden = true;
    pathForm.hidden = false;
    pathStartActions.hidden = false;
    pathReplies.innerHTML = "";
    pathPrompt.textContent = "";
    return;
  }

  pathActiveFlow = [...previous.pathActiveFlow];
  pathStepIndex = previous.pathStepIndex;
  Object.keys(pathLead).forEach((key) => {
    pathLead[key] = previous.pathLead[key] || "";
  });
  pathForm.hidden = false;

  if (!pathActiveFlow.length) {
    pathIntake.hidden = true;
    pathStartActions.hidden = false;
    pathReplies.innerHTML = "";
    pathPrompt.textContent = "";
    return;
  }

  askPathStep();
}

function askPathStep() {
  const step = getPathStep();

  if (!step) {
    finishPathFlow();
    return;
  }

  pathPrompt.textContent = getPrompt(step, pathLead);
  configurePathInput(step);
  setPathReplies(getReplies(step));
  scrollPathCardToTopOnMobile();
}

function scrollPathCardToTopOnMobile() {
  if (!pathSelectionCard || window.innerWidth > 760) {
    return;
  }

  requestAnimationFrame(() => {
    const cardTop = pathSelectionCard.getBoundingClientRect().top + window.scrollY - 12;
    window.scrollTo({
      top: Math.max(0, cardTop),
      behavior: "smooth"
    });
  });
}

function appendPathFlowForIntent(intentAnswer) {
  savePathSnapshot();
  const intent = classifyIntent(intentAnswer);

  if (!intent) {
    pathPrompt.textContent = "Please choose Buying a Home or Refinancing.";
    setPathReplies(["Buying a Home", "Refinancing"]);
    return false;
  }

  pathLead.intent = intent;

  if (intent === "Refinance") {
    pathActiveFlow = pathRefinanceQuestions;
    pathStepIndex = 0;
    return true;
  }

  pathActiveFlow = [{
    key: "firstTimeBuyer",
    prompt: "Are you a first-time home buyer?",
    replies: ["Yes", "No"]
  }];
  pathStepIndex = 0;
  return true;
}

function appendPathPurchaseFlow(answer) {
  pathLead.firstTimeBuyer = normalizeYesNo(answer);
  pathActiveFlow = pathPurchaseQuestions;
  pathStepIndex = 0;
}

function finishPathFlow() {
  submitLeadPayload("Completed", pathLead);
  pathPrompt.textContent = pathLead.contactConsent === "Yes"
    ? "Thank you. One of our loan professionals will contact you soon."
    : "Thank you. We captured your request and will only contact you as permitted.";
  pathReplies.innerHTML = "";
  pathForm.hidden = true;
  pathInput.hidden = false;
  pathNextButton.hidden = false;
  pathStateSelect.hidden = true;
  pathStateMap.hidden = true;
  pathContactFields.hidden = true;

  if (pathLead.contactConsent === "Yes" && pathLead.wantsApplication === "Yes") {
    const link = document.createElement("a");
    link.className = "loan-application-button";
    link.href = loanApplicationUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Start Loan Application";
    pathReplies.appendChild(link);
  }

  scrollPathCardToTopOnMobile();
}

function submitPathAnswer(rawAnswer) {
  const step = getPathStep();
  const answer = rawAnswer.trim();

  if (!step) {
    return;
  }

  if (!answer && step.key !== "contactDetails") {
    if (getPathStep()?.key === "fullName") {
      pathInput.classList.add("attention-placeholder");
    }

    return;
  }

  savePathSnapshot();

  if (step.key === "contactDetails") {
    const contactDetails = getPathContactDetails();
    const missingName = !contactDetails.fullName;
    const invalidEmail = !isValidEmail(contactDetails.email);
    const invalidPhone = !isValidUsPhone(contactDetails.phone);

    flagPathContactField(pathNameInput, missingName);
    flagPathContactField(pathEmailInput, invalidEmail);
    flagPathContactField(pathPhoneInput, invalidPhone);

    if (missingName || invalidEmail || invalidPhone) {
      pathHistoryStack.pop();
      pathPrompt.textContent = "Please enter your name, a valid email address, and a valid US phone number.";
      (missingName ? pathNameInput : invalidEmail ? pathEmailInput : pathPhoneInput).focus();
      return;
    }

    pathLead.fullName = contactDetails.fullName;
    pathLead.email = contactDetails.email;
    pathLead.phone = formatUsPhone(contactDetails.phone);
  } else if (step.key === "email" && !isValidEmail(answer)) {
    pathHistoryStack.pop();
    pathPrompt.textContent = "Please enter a valid email address in this format: person@mail.com.";
    pathInput.value = "";
    pathInput.focus();
    return;
  }

  if (step.key === "phone" && !isValidUsPhone(answer)) {
    pathHistoryStack.pop();
    pathPrompt.textContent = "Please enter a valid US phone number, like 555-555-5555.";
    pathInput.value = "";
    pathInput.focus();
    return;
  }

  if (step.key === "fullName") {
    pathLead.fullName = normalizeName(answer);
  } else if (step.key === "contactDetails") {
    // Contact details are handled together above.
  } else if (step.key === "firstTimeBuyer") {
    appendPathPurchaseFlow(answer);
    askPathStep();
    return;
  } else if (step.key === "contactConsent") {
    const consented = /agree|yes/i.test(answer);
    pathLead.contactConsent = consented ? "Yes" : "No";
    pathLead.consentDisclosure = contactConsentDisclosure;
    pathLead.consentedAt = consented ? new Date().toISOString() : "";
  } else if (["bankruptcy", "veteran", "currentMortgage", "secondMortgage", "wantsApplication"].includes(step.key)) {
    pathLead[step.key] = normalizeYesNo(answer);
  } else {
    pathLead[step.key] = answer;
  }

  pathStepIndex += getNextStepIncrement(pathActiveFlow, pathStepIndex, pathLead);
  submitLeadPayload("Partial", pathLead);

  if (step.end || pathStepIndex >= pathActiveFlow.length) {
    finishPathFlow();
    return;
  }

  askPathStep();
}

function startPathIntake(intent) {
  Object.assign(pathLead, createLeadState());
  pathHistoryStack = [];
  pathIntake.hidden = false;
  pathForm.hidden = false;
  pathReplies.innerHTML = "";
  pathStartActions.hidden = true;

  if (appendPathFlowForIntent(intent)) {
    askPathStep();
  }
}

function submitAnswer(rawAnswer) {
  let answer = rawAnswer.trim();
  const currentStep = getCurrentStep();
  const isContactDetailsStep = currentStep?.key === "contactDetails";

  if (!answer && !isContactDetailsStep) {
    if (currentStep?.key === "fullName") {
      chatInput.classList.add("attention-placeholder");
    }

    return;
  }

  if (answer.toLowerCase() === "back") {
    goBack();
    chatInput.value = "";
    return;
  }

  if (stepIndex >= activeFlow.length) {
    if (answer.toLowerCase() === "start over") {
      resetFlow();
    }
    return;
  }

  const step = getCurrentStep();

  if (step.key === "contactDetails") {
    const contactDetails = getChatContactDetails();
    const missingName = !contactDetails.fullName;
    const invalidPhone = !isValidUsPhone(contactDetails.phone);
    const invalidEmail = !isValidEmail(contactDetails.email);

    flagChatContactField(chatNameInput, missingName);
    flagChatContactField(chatPhoneInput, invalidPhone);
    flagChatContactField(chatEmailInput, invalidEmail);

    if (missingName || invalidPhone || invalidEmail) {
      addMessage("bot", "Please enter your name, a valid US phone number, and a valid email address.");
      const firstInvalidField = missingName ? chatNameInput : invalidPhone ? chatPhoneInput : chatEmailInput;
      firstInvalidField.focus();
      return;
    }

    answer = "Contact information submitted.";
    lead.fullName = contactDetails.fullName;
    lead.phone = formatUsPhone(contactDetails.phone);
    lead.email = contactDetails.email;
  }

  if (step.key === "email" && !isValidEmail(answer)) {
    addMessage("bot", "Please enter a valid email address in this format: person@mail.com.");
    chatInput.value = "";
    chatInput.focus();
    return;
  }

  if (step.key === "phone" && !isValidUsPhone(answer)) {
    addMessage("bot", "Please enter a valid US phone number, like 555-555-5555.");
    chatInput.value = "";
    chatInput.focus();
    return;
  }

  saveHistorySnapshot();
  addMessage("user", answer);

  if (step.key === "contactDetails") {
    // Contact values are saved together above to support browser autofill.
  } else if (step.key === "fullName") {
    lead.fullName = normalizeName(answer);
  } else if (step.key === "intent" && !appendNextFlowForIntent(answer)) {
    chatInput.value = "";
    return;
  } else if (step.key === "firstTimeBuyer") {
    appendPurchaseFlowAfterFirstTime(answer);
  } else if (step.key === "contactConsent") {
    const consented = /agree|yes/i.test(answer);
    lead.contactConsent = consented ? "Yes" : "No";
    lead.consentDisclosure = contactConsentDisclosure;
    lead.consentedAt = consented ? new Date().toISOString() : "";
  } else if (["bankruptcy", "veteran", "currentMortgage", "secondMortgage", "wantsApplication"].includes(step.key)) {
    lead[step.key] = normalizeYesNo(answer);
  } else {
    lead[step.key] = answer;
  }

  stepIndex += getNextStepIncrement(activeFlow, stepIndex, lead);
  chatInput.value = "";

  if (step.end || stepIndex >= activeFlow.length) {
    window.setTimeout(finishFlow, 320);
    return;
  }

  submitLeadToGoogleSheets("Partial");

  window.setTimeout(() => {
    askCurrentStep();
  }, 280);
}

function resetFlow() {
  stepIndex = 0;
  activeFlow = [...initialFlow];
  historyStack = [];

  Object.keys(lead).forEach((key) => {
    lead[key] = "";
  });

  lead.leadId = createLeadId();
  lead.status = "Started";
  chatWindow.innerHTML = "";
  askCurrentStep();
}

function scrollChatFormIntoActionPosition() {
  const rect = chatForm.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const targetTop = window.scrollY + rect.bottom - viewportHeight + 12;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: "smooth"
  });

  window.setTimeout(() => {
    const focusTarget = chatContactFields.hidden ? chatInput : chatNameInput;
    focusTarget.focus({ preventScroll: true });
  }, 260);
}

states.forEach((state) => {
  const option = document.createElement("option");
  option.value = state;
  stateOptions.appendChild(option);

  const selectOption = document.createElement("option");
  selectOption.value = state;
  selectOption.textContent = state;
  stateSelect.appendChild(selectOption);

  const pathSelectOption = document.createElement("option");
  pathSelectOption.value = state;
  pathSelectOption.textContent = state;
  pathStateSelect.appendChild(pathSelectOption);
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAnswer(chatInput.value);
});

stateSelect.addEventListener("change", () => {
  if (!stateSelect.value) {
    return;
  }

  submitAnswer(stateSelect.value);
});

pathForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitPathAnswer(pathInput.value);
});

pathStateSelect.addEventListener("change", () => {
  if (!pathStateSelect.value) {
    return;
  }

  submitPathAnswer(pathStateSelect.value);
});

chatInput.addEventListener("input", () => {
  chatInput.classList.remove("attention-placeholder");

  if (!isPhoneStep()) {
    return;
  }

  chatInput.value = formatUsPhone(chatInput.value);
});

pathInput.addEventListener("input", () => {
  pathInput.classList.remove("attention-placeholder");

  if (getPathStep()?.key !== "phone") {
    return;
  }

  pathInput.value = formatUsPhone(pathInput.value);
});

pathPhoneInput.addEventListener("input", () => {
  pathPhoneInput.classList.remove("attention-placeholder");
  pathPhoneInput.value = formatUsPhone(pathPhoneInput.value);
});

chatPhoneInput.addEventListener("input", () => {
  flagChatContactField(chatPhoneInput, false);
  chatPhoneInput.value = formatUsPhone(chatPhoneInput.value);
});

[chatNameInput, chatEmailInput].forEach((field) => {
  field.addEventListener("input", () => {
    flagChatContactField(field, false);
  });
});

[pathNameInput, pathEmailInput].forEach((field) => {
  field.addEventListener("input", () => {
    field.classList.remove("attention-placeholder");
  });
});

chatInput.addEventListener("focus", () => {
  chatInput.classList.remove("attention-placeholder");
});

pathInput.addEventListener("focus", () => {
  pathInput.classList.remove("attention-placeholder");
});

chatJumpLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    scrollChatFormIntoActionPosition();
  });
});

pathChoiceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    startPathIntake(button.dataset.intentChoice || "");
  });
});

window.addEventListener("pagehide", submitLeadOnExit);

resetHomePageScrollPosition();
loadMortgageRates();
askCurrentStep();

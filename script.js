const chatWindow = document.getElementById("chatWindow");
const quickReplies = document.getElementById("quickReplies");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const stateSelect = document.getElementById("stateSelect");
const stateOptions = document.getElementById("stateOptions");
const chatJumpLinks = document.querySelectorAll(".js-chat-jump");

chatForm.noValidate = true;

const loanApplicationUrl = "https://gamai.mymortgage-online.com/loan-app/?workFlowId=261281&siteId=7423560722";
const googleSheetsWebAppUrl = "https://script.google.com/macros/s/AKfycbxdfAkFxQ2i8z1orh6n4gwu5qd_G_YVnKOxqLDco0j9sdmzDe4kF4GaRwx4BHpz78NVZw/exec";
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

const states = [
  "Alabama", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
];

const lead = {
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

const initialFlow = [
  {
    key: "fullName",
    prompt: "If so, I'd love to help you get started? Can I have your name? Otherwise, scroll below to see some of the products we offer.",
    placeholder: "Enter Name Here"
  },
  {
    key: "email",
    prompt: "Hi, what would be the best email address to use for our communications?",
    inputType: "email"
  },
  {
    key: "phone",
    prompt: "What is the best phone number to contact you?",
    inputType: "tel"
  },
  {
    key: "intent",
    prompt: "Let's get started. Are you planning on buying a home or refinancing?",
    replies: ["Buying a Home", "Refinancing"]
  }
];

const purchaseQuestions = [
  {
    key: "state",
    prompt: () => lead.firstTimeBuyer === "Yes"
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
    replies: ["750+", "750-650", "650-550", "550 to 450"]
  },
  {
    key: "downPayment",
    prompt: "How much do you plan on putting down?",
    replies: ["5% to 10%", "10% to 15%", "15% or more"]
  },
  {
    key: "purchasePriceRange",
    prompt: "What price range do you have in mind?",
    replies: ["Above $500k", "$500k to $300k", "$300k to $200k", "$200k and below"]
  },
  {
    key: "desiredHomeType",
    prompt: "What type of property are you looking for?",
    replies: ["Single Family Home", "Condo", "Town-House", "Multi-Family Home", "Commercial"]
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
    replies: ["750+", "750-650", "650-550", "550 to 450"]
  },
  {
    key: "borrowAmount",
    prompt: "How much are you looking to borrow?",
    replies: ["Above $500k", "$500k to $300k", "$300k to $200k", "$200k and below"]
  },
  {
    key: "equity",
    prompt: "How much equity do you have in your home?",
    replies: ["$500k or more", "$500k to $400k", "$400k to $300k", "$300k or lower"]
  },
  {
    key: "homeValue",
    prompt: "Do you know how much your home is currently worth?",
    replies: ["$500k or more", "$500k to $400k", "$400k to $300k", "$300k or lower"]
  },
  {
    key: "currentHomeType",
    prompt: "What type of home do you currently own?",
    replies: ["Single Family Home", "Condo", "Town-House", "Multi-Family Home"]
  },
  {
    key: "currentMortgage",
    prompt: "Do you currently have a mortgage on your home?",
    replies: ["Yes", "No"]
  },
  {
    key: "interestRate",
    prompt: "What is your current interest rate around?",
    replies: ["No Mortgage", "Above 9%", "Above 8%", "Above 7%", "Above 6%", "Above 5%", "Under 5%"]
  },
  {
    key: "secondMortgage",
    prompt: "Do you have a second mortgage?",
    replies: ["Yes", "No"]
  },
  {
    key: "amountOwed",
    prompt: "How much do you owe on the home?",
    replies: ["$250k or more", "$200k to $150k", "$150k to $100k", "$100k to $50k", "$50k or less"]
  },
  {
    key: "bankruptcy",
    prompt: "Have you filed bankruptcy in the last seven years?",
    replies: ["Yes", "No"]
  },
  {
    key: "adverseCreditEvents",
    prompt: "Do you have any judgments, foreclosures, or student loan defaults?",
    replies: ["Yes", "No", "Judgments", "Foreclosures", "Student Loan Defaults"]
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

let activeFlow = [...initialFlow];
let stepIndex = 0;
let historyStack = [];

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

function getPrompt(step) {
  return typeof step.prompt === "function" ? step.prompt() : step.prompt;
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
  chatInput.value = "";
  stateSelect.value = "";
  stateSelect.hidden = !step.useStateList;
  chatInput.type = step.inputType || "text";
  chatInput.placeholder = step.placeholder || (step.useStateList ? "Start typing a state" : "Type your answer");
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
  submitLeadToGoogleSheets("Completed");

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

function buildLeadSubmission(status = "Partial") {
  const now = new Date().toISOString();

  if (!lead.submittedAt) {
    lead.submittedAt = now;
  }

  lead.status = status;
  lead.lastUpdatedAt = now;
  lead.completedAt = status === "Completed" ? now : lead.completedAt || "";

  return leadSubmissionFields.reduce((payload, field) => {
    if (field === "source") {
      payload[field] = window.location.href;
      return payload;
    }

    payload[field] = lead[field] || "";
    return payload;
  }, {});
}

function submitLeadToGoogleSheets(status = "Partial") {
  if (!googleSheetsWebAppUrl || !hasEnoughLeadInfoToSubmit()) {
    return;
  }

  const formData = new FormData();
  formData.append("payload", JSON.stringify(buildLeadSubmission(status)));

  fetch(googleSheetsWebAppUrl, {
    method: "POST",
    mode: "no-cors",
    body: formData
  }).catch((error) => {
    console.error("Google Sheets lead submission failed:", error);
  });
}

function submitLeadOnExit() {
  if (!googleSheetsWebAppUrl || !hasEnoughLeadInfoToSubmit() || lead.status === "Completed") {
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

function submitAnswer(rawAnswer) {
  const answer = rawAnswer.trim();

  if (!answer) {
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

  if (step.key === "fullName") {
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

  stepIndex += 1;
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
    chatInput.focus({ preventScroll: true });
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

chatInput.addEventListener("input", () => {
  if (!isPhoneStep()) {
    return;
  }

  chatInput.value = formatUsPhone(chatInput.value);
});

chatJumpLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    scrollChatFormIntoActionPosition();
  });
});

window.addEventListener("pagehide", submitLeadOnExit);

askCurrentStep();

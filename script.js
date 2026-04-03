const chatWindow = document.getElementById("chatWindow");
const quickReplies = document.getElementById("quickReplies");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const leadSummary = document.getElementById("leadSummary");
const summaryFields = document.getElementById("summaryFields");

const lead = {
  intent: "",
  loanType: "",
  priceRange: "",
  timeline: "",
  creditRange: "",
  downPayment: "",
  state: "",
  firstName: "",
  contact: "",
  notes: ""
};

const flow = [
  {
    key: "intent",
    prompt: "Hi, I'm Ava. I can help you get matched with the right mortgage options. Are you buying a home or refinancing an existing one?",
    replies: ["Buying a home", "Refinancing"],
    normalize: (value) => {
      const lower = value.toLowerCase();
      if (lower.includes("buy")) {
        return "Home purchase";
      }
      if (lower.includes("refi") || lower.includes("refinan")) {
        return "Refinance";
      }
      return value;
    }
  },
  {
    key: "loanType",
    prompt: () => lead.intent === "Refinance"
      ? "What kind of refinance are you exploring today?"
      : "What type of loan sounds closest to what you need?",
    replies: () => lead.intent === "Refinance"
      ? ["Lower my rate", "Cash-out refinance", "Not sure yet"]
      : ["Conventional", "FHA", "VA", "Not sure yet"]
  },
  {
    key: "priceRange",
    prompt: () => lead.intent === "Refinance"
      ? "About how much is your current home worth?"
      : "What price range are you targeting?",
    replies: () => lead.intent === "Refinance"
      ? ["$300k-$450k", "$450k-$700k", "$700k+"]
      : ["Under $350k", "$350k-$550k", "$550k-$850k", "$850k+"]
  },
  {
    key: "timeline",
    prompt: () => lead.intent === "Refinance"
      ? "How soon would you like to refinance if the numbers look right?"
      : "When are you hoping to move forward?",
    replies: ["ASAP", "30-60 days", "2-6 months", "Just researching"]
  },
  {
    key: "creditRange",
    prompt: "What's your estimated credit score range?",
    replies: ["760+", "700-759", "640-699", "Below 640"]
  },
  {
    key: "downPayment",
    prompt: () => lead.intent === "Refinance"
      ? "What best describes your current equity position?"
      : "How much are you planning to put down?",
    replies: () => lead.intent === "Refinance"
      ? ["20%+ equity", "10-20% equity", "Less than 10%", "Not sure"]
      : ["3-5%", "10-15%", "20%+", "Need guidance"]
  },
  {
    key: "state",
    prompt: "Which state is the property in?",
    replies: ["California", "Texas", "Florida", "Other"]
  },
  {
    key: "firstName",
    prompt: "Great. What's your first name?"
  },
  {
    key: "contact",
    prompt: "What's the best email or phone number for a loan specialist to reach you?"
  }
];

let stepIndex = 0;

function addMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
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
}

function getCurrentStep() {
  return flow[stepIndex];
}

function getPrompt(step) {
  return typeof step.prompt === "function" ? step.prompt() : step.prompt;
}

function getReplies(step) {
  if (!step.replies) {
    return [];
  }

  return typeof step.replies === "function" ? step.replies() : step.replies;
}

function askCurrentStep() {
  const step = getCurrentStep();
  addMessage("bot", getPrompt(step));
  setReplies(getReplies(step));
}

function normalizeAnswer(step, answer) {
  if (step.normalize) {
    return step.normalize(answer.trim());
  }
  return answer.trim();
}

function buildRecommendation() {
  const credit = lead.creditRange;
  const intent = lead.intent;

  if (intent === "Home purchase" && (credit === "760+" || credit === "700-759")) {
    return "Strong candidate for conventional options with competitive pricing.";
  }

  if (intent === "Home purchase" && credit === "640-699") {
    return "Likely worth comparing FHA and flexible conventional programs.";
  }

  if (intent === "Refinance" && lead.loanType === "Cash-out refinance") {
    return "A cash-out specialist should review equity, LTV, and rate tradeoffs.";
  }

  return "A loan advisor should review program fit and next-best rate scenarios.";
}

function renderSummary() {
  const entries = [
    ["Journey", lead.intent],
    ["Program", lead.loanType],
    ["Budget / Value", lead.priceRange],
    ["Timeline", lead.timeline],
    ["Credit", lead.creditRange],
    ["Down / Equity", lead.downPayment],
    ["State", lead.state],
    ["Name", lead.firstName],
    ["Contact", lead.contact],
    ["Next step", buildRecommendation()]
  ];

  summaryFields.innerHTML = "";

  entries.forEach(([label, value]) => {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const desc = document.createElement("dd");
    term.textContent = label;
    desc.textContent = value || "Not provided";
    wrapper.appendChild(term);
    wrapper.appendChild(desc);
    summaryFields.appendChild(wrapper);
  });

  leadSummary.hidden = false;
}

function finishFlow() {
  addMessage(
    "bot",
    `${lead.firstName}, thanks. I've pulled together a lead summary and your loan team now has enough to follow up with context instead of a cold handoff.`
  );
  addMessage(
    "bot",
    `${buildRecommendation()} If you wire this into a CRM, this is the moment to send the payload to your lead intake endpoint.`
  );
  setReplies(["Start over"]);
  renderSummary();
}

function submitAnswer(rawAnswer) {
  const answer = rawAnswer.trim();

  if (!answer) {
    return;
  }

  if (stepIndex >= flow.length) {
    if (answer.toLowerCase() === "start over") {
      resetFlow();
    }
    return;
  }

  const step = getCurrentStep();
  addMessage("user", answer);

  lead[step.key] = normalizeAnswer(step, answer);
  stepIndex += 1;
  chatInput.value = "";

  if (stepIndex >= flow.length) {
    window.setTimeout(finishFlow, 350);
    return;
  }

  const nextStep = getCurrentStep();
  window.setTimeout(() => {
    addMessage("bot", getPrompt(nextStep));
    setReplies(getReplies(nextStep));
  }, 300);
}

function resetFlow() {
  stepIndex = 0;

  Object.keys(lead).forEach((key) => {
    lead[key] = "";
  });

  chatWindow.innerHTML = "";
  summaryFields.innerHTML = "";
  leadSummary.hidden = true;
  askCurrentStep();
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitAnswer(chatInput.value);
});

askCurrentStep();

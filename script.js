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
  contact: ""
};

const flow = [
  {
    key: "intent",
    prompt: "Welcome to Get Approved Mortgage Inc. Tell me what brings you in today. Are you thinking about buying a home, or does a refinance feel more likely?",
    replies: ["Buy a home", "Refinance"]
  },
  {
    key: "loanType",
    prompt: () => lead.intent === "Refinance"
      ? "Got it. What would you most like a refinance to do for you?"
      : "That helps. What kind of mortgage guidance would be most useful right now?",
    replies: () => lead.intent === "Refinance"
      ? ["Lower my payment", "Cash out equity", "Shorten my term", "Not sure yet"]
      : ["Conventional", "FHA", "VA", "Not sure yet"]
  },
  {
    key: "priceRange",
    prompt: () => lead.intent === "Refinance"
      ? "To help me frame the options, about how much do you think your home is worth today?"
      : "What price range are you shopping in right now?",
    replies: () => lead.intent === "Refinance"
      ? ["Under $350k", "$350k-$600k", "$600k-$900k", "$900k+"]
      : ["Under $300k", "$300k-$500k", "$500k-$800k", "$800k+"]
  },
  {
    key: "timeline",
    prompt: () => lead.intent === "Refinance"
      ? "If the numbers look good, how soon would you want to move forward?"
      : "When would you ideally like to buy?",
    replies: ["Immediately", "30-60 days", "2-6 months", "Just exploring"]
  },
  {
    key: "creditRange",
    prompt: "Where would you estimate your credit score today? A rough range is totally fine.",
    replies: ["760+", "700-759", "640-699", "Below 640"]
  },
  {
    key: "downPayment",
    prompt: () => lead.intent === "Refinance"
      ? "And what best describes your equity position today?"
      : "What are you thinking for down payment?",
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
    prompt: "Thanks. What should I call you?"
  },
  {
    key: "contact",
    prompt: "Last step. What is the best phone number or email for a mortgage specialist to reach you?"
  }
];

let stepIndex = 0;

function normalizeIntent(value) {
  const lower = value.toLowerCase();
  if (lower.includes("buy")) {
    return "Home purchase";
  }
  if (lower.includes("refi")) {
    return "Refinance";
  }
  return value;
}

function addMessage(role, text) {
  const bubble = document.createElement("div");
  bubble.className = `message ${role}`;
  bubble.textContent = text;
  chatWindow.appendChild(bubble);
  chatWindow.scrollTop = chatWindow.scrollHeight;
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

function askCurrentStep() {
  const step = getCurrentStep();
  addMessage("bot", getPrompt(step));
  setReplies(getReplies(step));
}

function buildRecommendation() {
  if (lead.intent === "Refinance" && lead.loanType === "Cash out equity") {
    return "Route to a cash-out conversation with equity, payment impact, and rate scenarios.";
  }

  if (lead.intent === "Home purchase" && (lead.creditRange === "760+" || lead.creditRange === "700-759")) {
    return "Strong purchase lead for conventional pricing review and next-step consultation.";
  }

  if (lead.intent === "Home purchase" && lead.creditRange === "640-699") {
    return "Good lead for FHA or flexible conventional comparisons with coaching on readiness.";
  }

  return "Have a licensed mortgage specialist review program fit and outreach timing.";
}

function renderSummary() {
  const entries = [
    ["Borrower path", lead.intent],
    ["Program interest", lead.loanType],
    ["Price or value", lead.priceRange],
    ["Timeline", lead.timeline],
    ["Credit range", lead.creditRange],
    ["Down payment or equity", lead.downPayment],
    ["Property state", lead.state],
    ["First name", lead.firstName],
    ["Best contact", lead.contact],
    ["Suggested next step", buildRecommendation()]
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
    `${lead.firstName}, thanks. I have enough to create a strong lead summary for Get Approved Mortgage Inc.`
  );
  addMessage(
    "bot",
    `${buildRecommendation()} This is the point where you would post the lead to your CRM or notify your loan team.`
  );
  renderSummary();
  setReplies(["Start over"]);
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

  lead[step.key] = step.key === "intent" ? normalizeIntent(answer) : answer;
  stepIndex += 1;
  chatInput.value = "";

  if (stepIndex >= flow.length) {
    window.setTimeout(finishFlow, 320);
    return;
  }

  window.setTimeout(() => {
    askCurrentStep();
  }, 280);
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

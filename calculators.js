const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function getNumber(formData, key) {
  return Number(formData.get(key)) || 0;
}

function calculatePrincipalAndInterest(loanAmount, annualRate, years) {
  const months = years * 12;
  const monthlyRate = annualRate / 100 / 12;

  if (loanAmount <= 0 || months <= 0) {
    return 0;
  }

  if (monthlyRate === 0) {
    return loanAmount / months;
  }

  return loanAmount * (monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);
}

function renderDetails(container, details) {
  const list = container.querySelector("dl");
  list.innerHTML = "";

  details.forEach(([label, value]) => {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    const desc = document.createElement("dd");
    term.textContent = label;
    desc.textContent = value;
    wrapper.append(term, desc);
    list.appendChild(wrapper);
  });
}

function calculatePayment(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const homePrice = getNumber(formData, "homePrice");
  const downPayment = getNumber(formData, "downPayment");
  const interestRate = getNumber(formData, "interestRate");
  const loanTerm = getNumber(formData, "loanTerm");
  const propertyTax = getNumber(formData, "propertyTax") / 12;
  const insurance = getNumber(formData, "insurance") / 12;
  const hoa = getNumber(formData, "hoa");
  const loanAmount = Math.max(0, homePrice - downPayment);
  const principalAndInterest = calculatePrincipalAndInterest(loanAmount, interestRate, loanTerm);
  const totalPayment = principalAndInterest + propertyTax + insurance + hoa;
  const result = document.getElementById("paymentResult");

  result.querySelector("strong").textContent = currencyFormatter.format(totalPayment);
  renderDetails(result, [
    ["Loan amount", currencyFormatter.format(loanAmount)],
    ["Principal and interest", currencyFormatter.format(principalAndInterest)],
    ["Property tax", currencyFormatter.format(propertyTax)],
    ["Home insurance", currencyFormatter.format(insurance)],
    ["HOA dues", currencyFormatter.format(hoa)]
  ]);
}

function estimateAffordablePrice({
  maxHousingPayment,
  downPayment,
  interestRate,
  loanTerm,
  propertyTaxRate,
  insuranceMonthly
}) {
  let low = downPayment;
  let high = 3000000;

  for (let i = 0; i < 48; i += 1) {
    const price = (low + high) / 2;
    const loanAmount = Math.max(0, price - downPayment);
    const principalAndInterest = calculatePrincipalAndInterest(loanAmount, interestRate, loanTerm);
    const taxes = price * (propertyTaxRate / 100) / 12;
    const payment = principalAndInterest + taxes + insuranceMonthly;

    if (payment > maxHousingPayment) {
      high = price;
    } else {
      low = price;
    }
  }

  return low;
}

function calculateAffordability(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const annualIncome = getNumber(formData, "annualIncome");
  const monthlyDebt = getNumber(formData, "monthlyDebt");
  const downPayment = getNumber(formData, "downPayment");
  const interestRate = getNumber(formData, "interestRate");
  const loanTerm = getNumber(formData, "loanTerm");
  const propertyTaxRate = getNumber(formData, "propertyTaxRate");
  const insuranceMonthly = getNumber(formData, "insurance") / 12;
  const monthlyIncome = annualIncome / 12;
  const housingCap = monthlyIncome * 0.28;
  const totalDebtCap = Math.max(0, monthlyIncome * 0.36 - monthlyDebt);
  const maxHousingPayment = Math.max(0, Math.min(housingCap, totalDebtCap));
  const price = estimateAffordablePrice({
    maxHousingPayment,
    downPayment,
    interestRate,
    loanTerm,
    propertyTaxRate,
    insuranceMonthly
  });
  const comfortablePrice = price * 0.9;
  const loanAmount = Math.max(0, price - downPayment);
  const result = document.getElementById("affordabilityResult");

  result.querySelector("strong").textContent = currencyFormatter.format(price);
  renderDetails(result, [
    ["Comfortable range", currencyFormatter.format(comfortablePrice)],
    ["Estimated loan amount", currencyFormatter.format(loanAmount)],
    ["Max housing payment", currencyFormatter.format(maxHousingPayment)],
    ["Monthly income", currencyFormatter.format(monthlyIncome)],
    ["Monthly debts", currencyFormatter.format(monthlyDebt)]
  ]);
}

function buildAmortizationSchedule(loanAmount, annualRate, years, extraPrincipal) {
  const monthlyRate = annualRate / 100 / 12;
  const scheduledPayment = calculatePrincipalAndInterest(loanAmount, annualRate, years);
  let balance = loanAmount;
  let totalInterest = 0;
  let totalPrincipal = 0;
  const schedule = [];
  const maxMonths = years * 12;

  for (let month = 1; month <= maxMonths && balance > 0.01; month += 1) {
    const interest = balance * monthlyRate;
    const principal = Math.min(balance, scheduledPayment - interest + extraPrincipal);
    balance = Math.max(0, balance - principal);
    totalInterest += interest;
    totalPrincipal += principal;

    const yearIndex = Math.ceil(month / 12) - 1;
    if (!schedule[yearIndex]) {
      schedule[yearIndex] = {
        year: yearIndex + 1,
        principal: 0,
        interest: 0,
        balance: 0
      };
    }

    schedule[yearIndex].principal += principal;
    schedule[yearIndex].interest += interest;
    schedule[yearIndex].balance = balance;
  }

  return {
    scheduledPayment,
    totalMonthlyPayment: scheduledPayment + extraPrincipal,
    totalPrincipal,
    totalInterest,
    payoffYears: schedule.length,
    schedule
  };
}

function renderAmortizationRows(rows) {
  const tableBody = document.querySelector("#amortizationResult tbody");
  tableBody.innerHTML = "";

  rows.forEach((row) => {
    const tableRow = document.createElement("tr");
    [row.year, row.principal, row.interest, row.balance].forEach((value, index) => {
      const cell = document.createElement("td");
      cell.textContent = index === 0 ? value : currencyFormatter.format(value);
      tableRow.appendChild(cell);
    });
    tableBody.appendChild(tableRow);
  });
}

function calculateAmortization(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const loanAmount = getNumber(formData, "loanAmount");
  const interestRate = getNumber(formData, "interestRate");
  const loanTerm = getNumber(formData, "loanTerm");
  const extraPrincipal = getNumber(formData, "extraPrincipal");
  const result = document.getElementById("amortizationResult");
  const amortization = buildAmortizationSchedule(loanAmount, interestRate, loanTerm, extraPrincipal);

  result.querySelector("strong").textContent = currencyFormatter.format(amortization.totalMonthlyPayment);
  renderDetails(result, [
    ["Scheduled payment", currencyFormatter.format(amortization.scheduledPayment)],
    ["Extra principal", currencyFormatter.format(extraPrincipal)],
    ["Total principal", currencyFormatter.format(amortization.totalPrincipal)],
    ["Total interest", currencyFormatter.format(amortization.totalInterest)],
    ["Estimated payoff", `${amortization.payoffYears} years`]
  ]);
  renderAmortizationRows(amortization.schedule);
}

function calculateRemainingBalance(loanAmount, annualRate, years, paymentsMade) {
  const monthlyRate = annualRate / 100 / 12;
  const payment = calculatePrincipalAndInterest(loanAmount, annualRate, years);
  let balance = loanAmount;

  for (let month = 0; month < paymentsMade && balance > 0.01; month += 1) {
    const interest = balance * monthlyRate;
    const principal = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principal);
  }

  return balance;
}

function calculateRentOwn(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const monthlyRent = getNumber(formData, "monthlyRent");
  const rentIncrease = getNumber(formData, "rentIncrease") / 100;
  const homePrice = getNumber(formData, "homePrice");
  const downPayment = getNumber(formData, "downPayment");
  const interestRate = getNumber(formData, "interestRate");
  const loanTerm = getNumber(formData, "loanTerm");
  const propertyTax = getNumber(formData, "propertyTax") / 12;
  const insurance = getNumber(formData, "insurance") / 12;
  const maintenance = getNumber(formData, "maintenance");
  const appreciation = getNumber(formData, "appreciation") / 100;
  const yearsToCompare = Math.max(1, Math.min(40, getNumber(formData, "yearsToCompare")));
  const monthsToCompare = yearsToCompare * 12;
  const loanAmount = Math.max(0, homePrice - downPayment);
  const principalAndInterest = calculatePrincipalAndInterest(loanAmount, interestRate, loanTerm);
  let totalRent = 0;

  for (let year = 0; year < yearsToCompare; year += 1) {
    totalRent += monthlyRent * (1 + rentIncrease) ** year * 12;
  }

  const ownerMonthlyCost = principalAndInterest + propertyTax + insurance + maintenance;
  const ownerCashOut = downPayment + ownerMonthlyCost * monthsToCompare;
  const futureHomeValue = homePrice * (1 + appreciation) ** yearsToCompare;
  const remainingBalance = calculateRemainingBalance(loanAmount, interestRate, loanTerm, monthsToCompare);
  const estimatedEquity = Math.max(0, futureHomeValue - remainingBalance);
  const netOwnCost = ownerCashOut - estimatedEquity;
  const advantage = totalRent - netOwnCost;
  const result = document.getElementById("rentOwnResult");
  const advantageLabel = advantage >= 0 ? "Owning advantage" : "Renting advantage";

  result.querySelector("strong").textContent = currencyFormatter.format(Math.abs(advantage));
  renderDetails(result, [
    [advantageLabel, currencyFormatter.format(Math.abs(advantage))],
    ["Total rent paid", currencyFormatter.format(totalRent)],
    ["Estimated owner cash out", currencyFormatter.format(ownerCashOut)],
    ["Estimated home value", currencyFormatter.format(futureHomeValue)],
    ["Estimated equity", currencyFormatter.format(estimatedEquity)],
    ["Net owning cost", currencyFormatter.format(netOwnCost)]
  ]);
}

function calculateMonthlyRateFromPayment(payment, amountFinanced, months) {
  let low = 0;
  let high = 1;

  for (let i = 0; i < 80; i += 1) {
    const rate = (low + high) / 2;
    const estimatedPayment = amountFinanced * (rate * (1 + rate) ** months) / ((1 + rate) ** months - 1);

    if (estimatedPayment > payment) {
      high = rate;
    } else {
      low = rate;
    }
  }

  return (low + high) / 2;
}

function calculateApr(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const loanAmount = getNumber(formData, "loanAmount");
  const interestRate = getNumber(formData, "interestRate");
  const loanTerm = getNumber(formData, "loanTerm");
  const origination = getNumber(formData, "origination");
  const financeCharges = getNumber(formData, "financeCharges");
  const totalFinanceCharges = origination + financeCharges;
  const amountFinanced = Math.max(0, loanAmount - totalFinanceCharges);
  const months = loanTerm * 12;
  const monthlyPayment = calculatePrincipalAndInterest(loanAmount, interestRate, loanTerm);
  const monthlyAprRate = amountFinanced > 0
    ? calculateMonthlyRateFromPayment(monthlyPayment, amountFinanced, months)
    : 0;
  const apr = monthlyAprRate * 12 * 100;
  const result = document.getElementById("aprResult");

  result.querySelector("strong").textContent = `${apr.toFixed(3)}%`;
  renderDetails(result, [
    ["Note rate", `${interestRate.toFixed(3)}%`],
    ["Monthly principal and interest", currencyFormatter.format(monthlyPayment)],
    ["Loan amount", currencyFormatter.format(loanAmount)],
    ["Amount financed", currencyFormatter.format(amountFinanced)],
    ["Finance charges", currencyFormatter.format(totalFinanceCharges)]
  ]);
}

function calculateDebtConsolidation(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const cardBalance = getNumber(formData, "cardBalance");
  const cardPayment = getNumber(formData, "cardPayment");
  const loanBalance = getNumber(formData, "loanBalance");
  const loanPayment = getNumber(formData, "loanPayment");
  const otherBalance = getNumber(formData, "otherBalance");
  const otherPayment = getNumber(formData, "otherPayment");
  const consolidationRate = getNumber(formData, "consolidationRate");
  const consolidationTerm = getNumber(formData, "consolidationTerm");
  const closingCosts = getNumber(formData, "closingCosts");
  const totalDebt = cardBalance + loanBalance + otherBalance;
  const totalCurrentPayments = cardPayment + loanPayment + otherPayment;
  const consolidationLoanAmount = totalDebt + closingCosts;
  const consolidatedPayment = calculatePrincipalAndInterest(
    consolidationLoanAmount,
    consolidationRate,
    consolidationTerm
  );
  const monthlySavings = totalCurrentPayments - consolidatedPayment;
  const result = document.getElementById("debtConsolidationResult");
  const savingsLabel = monthlySavings >= 0 ? "Estimated monthly savings" : "Estimated monthly increase";

  result.querySelector("strong").textContent = currencyFormatter.format(Math.abs(monthlySavings));
  renderDetails(result, [
    [savingsLabel, currencyFormatter.format(Math.abs(monthlySavings))],
    ["Current monthly payments", currencyFormatter.format(totalCurrentPayments)],
    ["Consolidated payment", currencyFormatter.format(consolidatedPayment)],
    ["Debt being consolidated", currencyFormatter.format(totalDebt)],
    ["Loan amount with fees", currencyFormatter.format(consolidationLoanAmount)]
  ]);
}

function calculatePrepayment(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const loanAmount = getNumber(formData, "loanAmount");
  const interestRate = getNumber(formData, "interestRate");
  const loanTerm = getNumber(formData, "loanTerm");
  const extraPrincipal = getNumber(formData, "extraPrincipal");
  const baseSchedule = buildAmortizationSchedule(loanAmount, interestRate, loanTerm, 0);
  const prepaySchedule = buildAmortizationSchedule(loanAmount, interestRate, loanTerm, extraPrincipal);
  const interestSavings = baseSchedule.totalInterest - prepaySchedule.totalInterest;
  const yearsSaved = Math.max(0, baseSchedule.payoffYears - prepaySchedule.payoffYears);
  const result = document.getElementById("prepaymentResult");

  result.querySelector("strong").textContent = currencyFormatter.format(Math.max(0, interestSavings));
  renderDetails(result, [
    ["Extra monthly principal", currencyFormatter.format(extraPrincipal)],
    ["Regular payoff", `${baseSchedule.payoffYears} years`],
    ["Estimated payoff with prepayment", `${prepaySchedule.payoffYears} years`],
    ["Years saved", `${yearsSaved} years`],
    ["Interest without prepayment", currencyFormatter.format(baseSchedule.totalInterest)],
    ["Interest with prepayment", currencyFormatter.format(prepaySchedule.totalInterest)]
  ]);
}

document.getElementById("paymentCalculator").addEventListener("submit", calculatePayment);
document.getElementById("affordabilityCalculator").addEventListener("submit", calculateAffordability);
document.getElementById("amortizationCalculator").addEventListener("submit", calculateAmortization);
document.getElementById("rentOwnCalculator").addEventListener("submit", calculateRentOwn);
document.getElementById("aprCalculator").addEventListener("submit", calculateApr);
document.getElementById("debtConsolidationCalculator").addEventListener("submit", calculateDebtConsolidation);
document.getElementById("prepaymentCalculator").addEventListener("submit", calculatePrepayment);
document.getElementById("paymentCalculator").requestSubmit();
document.getElementById("affordabilityCalculator").requestSubmit();
document.getElementById("amortizationCalculator").requestSubmit();
document.getElementById("rentOwnCalculator").requestSubmit();
document.getElementById("aprCalculator").requestSubmit();
document.getElementById("debtConsolidationCalculator").requestSubmit();
document.getElementById("prepaymentCalculator").requestSubmit();

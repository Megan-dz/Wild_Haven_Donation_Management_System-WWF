const campaignAuditLedger = [
  {
    transactionId: "WH-CA-0001",
    timestamp: "2026-09-13T00:00:00.000Z",
    campaign: {
      campaignId: "CAMP-2026-HABITAT-001",
      campaignName: "Habitat Corridor Restoration",
      campaignType: "habitat-restoration",
      programRegion: "Western Ghats",
      country: "India",
      fiscalYear: 2026,
      status: "active",
    },
    donor: {
      donorId: "DONOR-0001",
      donorName: "Aarav Sharma",
      donorType: "individual",
      donorSegment: "high-value-global-donor",
      demographic: {
        ageBand: "35-44",
        gender: "male",
        incomeBand: "₹10L-₹25L",
        profession: "Operations Lead",
        geography: "Mumbai, India",
        givingHistory: {
          lifetimeDonations: 12,
          averageDonation: 2450,
          preferredCampaignType: "habitat-restoration",
          relationshipTenureMonths: 18,
        },
      },
    },
    currency: {
      baseCurrency: "INR",
      conversionSet: [
        { currency: "USD", rateToBase: 0.012, amount: 125 },
        { currency: "EUR", rateToBase: 0.011, amount: 115 },
        { currency: "GBP", rateToBase: 0.010, amount: 105 },
        { currency: "JPY", rateToBase: 1.82, amount: 18200 },
        { currency: "CAD", rateToBase: 0.016, amount: 160 },
      ],
      settlementCurrency: "INR",
      exchangeRateSnapshot: "2026-09-13T00:00:00.000Z",
    },
    financial: {
      donationAmountBase: 12000,
      donationAmountConverted: {
        USD: 145,
        EUR: 133,
        GBP: 120,
        JPY: 18300,
        CAD: 190,
      },
      allocation: {
        fieldOperations: {
          amount: 6200,
          description: "Field patrols, monitoring and field logistics",
        },
        administration: {
          amount: 1800,
          description: "Operations and processing overhead",
        },
        communityOutreach: {
          amount: 1500,
          description: "Community programs and local engagement",
        },
        technology: {
          amount: 1100,
          description: "Data systems and field reporting",
        },
        grantsAndRescue: {
          amount: 2400,
          description: "Emergency intervention funding",
        },
      },
      matchingFunds: {
        amount: 500,
        source: "Wild Haven global matching fund",
      },
    },
    compliance: {
      riskScore: 21,
      riskLevel: "low",
      taxDeductible: true,
      taxDeductibleStatus: "tax-deductible-approved",
      complianceFlags: [
        "donor_identity_verified",
        "source_of_funds_documented",
        "campaign_alignment_checked",
      ],
      auditNotes: [
        "Gift direction recorded against campaign and regional program ledger.",
        "Administrative allocation reviewed and aligned to project budget allocation policy.",
        "Field spend note confirmed by regional operations manager and copied to records.",
      ],
    },
    payment: {
      method: "card",
      paymentProvider: "stripe",
      gatewayTransactionId: "GW-STRIPE-000001",
      status: "completed",
      retries: 0,
    },
  },
];

const currencyCodes = ["USD", "EUR", "GBP", "JPY", "CAD"];
const donorNames = [
  "Aarav Sharma", "Mina Laurent", "Lina Meyer", "Mary Njeri", "Sofia Garcia",
  "Priya Menon", "Rohan Kumar", "Anne Dubois", "Nora Smith", "John Mensah",
];
const campaigns = [
  "Habitat Corridor Restoration",
  "Sundarbans Mangrove Protection",
  "Snow Leopard Guardian Patrol",
  "Elephant Corridor Safety",
  "Community Protection Network",
  "Wetland Species Recovery",
  "Forest Guardian Fund",
  "River Basin Resilience",
];

function makeCurrencySet(baseAmount) {
  const rates = {
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.010,
    JPY: 1.82,
    CAD: 0.016,
  };
  return currencyCodes.map((code) => ({
    currency: code,
    rateToBase: rates[code],
    amount: Math.round(baseAmount * rates[code]),
  }));
}

function makeConversionObject(baseAmount) {
  return {
    USD: Math.round(baseAmount * 0.012),
    EUR: Math.round(baseAmount * 0.011),
    GBP: Math.round(baseAmount * 0.010),
    JPY: Math.round(baseAmount * 1.82),
    CAD: Math.round(baseAmount * 0.016),
  };
}

function makeLedgerEntry(i) {
  const baseAmount = 1000 + ((i * 1737) % 90000);
  const campaign = campaigns[i % campaigns.length];
  const donor = donorNames[i % donorNames.length];
  const currencySet = makeCurrencySet(baseAmount);
  const allocationBase = {
    fieldOperations: Math.round(baseAmount * 0.44),
    administration: Math.round(baseAmount * 0.14),
    communityOutreach: Math.round(baseAmount * 0.13),
    technology: Math.round(baseAmount * 0.11),
    grantsAndRescue: Math.round(baseAmount * 0.18),
  };

  return {
    transactionId: `WH-CA-${String(i + 1).padStart(4, "0")}`,
    timestamp: `2026-${String(9 + (i % 4)).padStart(2, "0")}-${String(10 + (i % 20)).padStart(2, "0")}T${String(8 + (i % 14)).padStart(2, "0")}:${String(10 + (i % 50)).padStart(2, "0")}:${String(10 + (i % 55)).padStart(2, "0")}.000Z`,
    campaign: {
      campaignId: `CAMP-2026-${String(100 + i).padStart(4, "0")}`,
      campaignName: campaign,
      campaignType: i % 3 === 0 ? "field-program" : i % 3 === 1 ? "community-program" : "habitat-restoration",
      programRegion: i % 5 === 0 ? "Sundarbans" : i % 5 === 1 ? "Ladakh" : i % 5 === 2 ? "Eastern Ghats" : i % 5 === 3 ? "Kaziranga" : "Western Ghats",
      country: i % 4 === 0 ? "Nepal" : i % 4 === 1 ? "Kenya" : i % 4 === 2 ? "Brazil" : "India",
      fiscalYear: 2026,
      status: i % 12 === 0 ? "review" : "active",
    },
    donor: {
      donorId: `DONOR-${String(1000 + i).padStart(4, "0")}`,
      donorName: donor,
      donorType: i % 2 === 0 ? "individual" : "foundation",
      donorSegment: i % 6 === 0 ? "corporate-partner" : i % 4 === 0 ? "monthly-giver" : "individual-giver",
      demographic: {
        ageBand: i % 5 === 0 ? "18-24" : i % 5 === 1 ? "25-34" : i % 5 === 2 ? "35-44" : i % 5 === 3 ? "45-54" : "55+",
        gender: i % 2 === 0 ? "female" : "male",
        incomeBand: i % 3 === 0 ? "₹1L-₹5L" : i % 3 === 1 ? "₹5L-₹10L" : "₹10L-₹25L",
        profession: i % 4 === 0 ? "Teacher" : i % 4 === 1 ? "Engineer" : i % 4 === 2 ? "Health Professional" : "Social Entrepreneur",
        geography: i % 3 === 0 ? "Bengaluru, India" : i % 3 === 1 ? "London, UK" : i % 3 === 2 ? "Nairobi, Kenya" : "New York, USA",
        givingHistory: {
          lifetimeDonations: 2 + (i % 18),
          averageDonation: Math.round(baseAmount * 0.6),
          preferredCampaignType: campaigns[i % campaigns.length].toLowerCase().replace(/[^a-z]+/g, "-") ,
          relationshipTenureMonths: 6 + (i % 72),
        },
      },
    },
    currency: {
      baseCurrency: "INR",
      conversionSet: currencySet,
      settlementCurrency: "INR",
      exchangeRateSnapshot: `2026-09-13T${String(7 + (i % 10)).padStart(2, "0")}:${String(10 + (i % 50)).padStart(2, "0")}:00.000Z`,
    },
    financial: {
      donationAmountBase: baseAmount,
      donationAmountConverted: makeConversionObject(baseAmount),
      allocation: {
        fieldOperations: {
          amount: allocationBase.fieldOperations,
          description: "Field patrols, monitoring, habitat stewardship and conservation operations",
        },
        administration: {
          amount: allocationBase.administration,
          description: "Finance operations, compliance controls and grant administration",
        },
        communityOutreach: {
          amount: allocationBase.communityOutreach,
          description: "Local partner organizations, public engagement and education",
        },
        technology: {
          amount: allocationBase.technology,
          description: "Monitoring systems, secure records and data collection",
        },
        grantsAndRescue: {
          amount: allocationBase.grantsAndRescue,
          description: "Emergency aid, medical rescue operations and field response",
        },
      },
      matchingFunds: {
        amount: Math.round(baseAmount * 0.04),
        source: "Wild Haven global matching fund",
      },
    },
    compliance: {
      riskScore: 8 + (i % 80),
      riskLevel: i % 7 === 0 ? "medium" : i % 11 === 0 ? "high" : "low",
      taxDeductible: i % 2 === 0,
      taxDeductibleStatus: i % 2 === 0 ? "tax-deductible-approved" : "not-tax-deductible",
      complianceFlags: i % 2 === 0
        ? ["donor_identity_verified", "source_of_funds_documented", "campaign_alignment_checked"]
        : ["donor_identity_verified", "manual_review_required", "campaign_alignment_checked"],
      auditNotes: [
        `Audit note ${i + 1}: donation source verified and matched to the campaign ledger for ${campaign}.`,
        `Regional compliance review completed on ${new Date().toISOString().slice(0, 10)} with settlement currency INR and tax-deductible eligibility checked.`,
        `Administrative allocation confirmed as ${allocationBase.administration} INR; field allocation confirmed as ${allocationBase.fieldOperations} INR for field operations and restoration support.`,
      ],
    },
    payment: {
      method: i % 3 === 0 ? "card" : i % 3 === 1 ? "bank_transfer" : "upi",
      paymentProvider: i % 3 === 0 ? "stripe" : i % 3 === 1 ? "bank" : "upi_gateway",
      gatewayTransactionId: `GW-${String(100000 + i).padStart(6, "0")}`,
      status: i % 10 === 0 ? "pending_review" : "completed",
      retries: i % 4,
    },
  };
}

const ledger = [];
for (let i = 0; i < 200; i++) {
  ledger.push(makeLedgerEntry(i));
}

const campaignAuditLedger = ledger;

module.exports = {
  campaignAuditLedger,
};

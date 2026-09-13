const e2eTestFixtures = {
  metadata: {
    version: "1.0.0",
    generatedAt: "2026-09-13T00:00:00.000Z",
    platform: "Wild Haven Donation Management System",
    scenarioCount: 150,
    locale: "en-US",
    coverage: [
      "donor checkout flows",
      "admin dashboard permissions",
      "edge-case failure modes",
      "api response payloads",
      "network error mocks"
    ]
  },
  scenarios: []
};

const scenarioNames = [
  "donation-card-payment-success",
  "donation-upi-payment-success",
  "donation-bank-transfer-review",
  "donation-card-payment-decline",
  "donation-upi-payment-timeout",
  "donation-card-cvv-failure",
  "donation-card-expiry-failure",
  "donation-anonymous-checkout",
  "donation-monthly-frequency",
  "donation-yearly-frequency",
  "donation-one-time-mobile",
  "donation-project-switch",
  "donation-amount-validation",
  "donation-email-validation",
  "donation-phone-validation",
  "donation-address-validation",
  "donation-form-reset",
  "donation-confirmation",
  "impact-dashboard-visit",
  "program-browse",
  "program-detail-access",
  "volunteer-signup-success",
  "volunteer-signup-skills-required",
  "volunteer-signup-validation-error",
  "volunteer-signup-duplicate-email",
  "contact-form-message-success",
  "contact-form-capcha-missing",
  "contact-form-email-error",
  "admin-login-success",
  "admin-login-failure",
  "admin-dashboard-authenticated",
  "admin-dashboard-reports-export",
  "admin-project-create",
  "admin-project-update",
  "admin-project-delete",
  "admin-permission-viewer",
  "admin-permission-editor",
  "admin-permission-admin",
  "donor-dashboard-profile-update",
  "donor-dashboard-donation-history",
  "donor-dashboard-impact-report",
  "api-404-project",
  "api-500-payment",
  "api-503-queue",
  "network-timeout",
  "network-offline",
  "network-cors-error",
  "empty-project-list",
  "empty-donation-history",
  "unsupported-browser"
];

const statuses = ["success", "failure", "pending", "authenticated", "unauthorized", "validation_error", "network_error"];
const paymentMethods = ["card", "upi", "bank_transfer"];
const frequencies = ["one_time", "monthly", "yearly"];
const projects = [
  "Forest Corridor Recovery",
  "Sundarbans Mangrove Protection",
  "Kaziranga Rhino Reserve",
  "Laikipia Lion Corridors",
  "Amazon Habitat Resilience",
  "Wild Dog Recovery Network"
];

const donors = [
  { id: "donor-1001", name: "Aarav Sharma", email: "aarav@example.com", phone: "+91 90000 11111", country: "India" },
  { id: "donor-1002", name: "Mina Laurent", email: "mina@example.com", phone: "+33 612 123 456", country: "France" },
  { id: "donor-1003", name: "Lina Meyer", email: "lina@example.com", phone: "+49 151 2000 5500", country: "Germany" },
  { id: "donor-1004", name: "Mary Njeri", email: "mary@example.com", phone: "+254 712 223 334", country: "Kenya" },
  { id: "donor-1005", name: "Sofia Garcia", email: "sofia@example.com", phone: "+34 623 111 222", country: "Spain" }
];

for (let i = 0; i < 150; i++) {
  const scenarioName = scenarioNames[i % scenarioNames.length];
  const donor = donors[i % donors.length];
  const project = projects[i % projects.length];
  const status = statuses[i % statuses.length];

  e2eTestFixtures.scenarios.push({
    id: `scenario-${String(i + 1).padStart(3, "0")}`,
    name: scenarioName,
    title: `${scenarioName.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase())}`,
    type: scenarioName.startsWith("admin") ? "admin" : scenarioName.startsWith("donation") ? "checkout" : scenarioName.startsWith("volunteer") ? "volunteer" : scenarioName.startsWith("contact") ? "contact" : scenarioName.startsWith("donor") ? "donor" : scenarioName.startsWith("api") || scenarioName.startsWith("network") || scenarioName.startsWith("empty") ? "api-or-network" : "support",
    priority: i % 5 === 0 ? "high" : i % 3 === 0 ? "medium" : "low",
    userAgent: i % 2 === 0 ? "desktop-web" : "mobile-web",
    locale: "en-US",
    flow: {
      step: i % 10,
      stage: i % 4 === 0 ? "review" : i % 4 === 1 ? "payment" : i % 4 === 2 ? "success" : "form",
      route: i % 7 === 0 ? "/payment" : i % 7 === 1 ? "/programs" : i % 7 === 2 ? "/dashboard" : i % 7 === 3 ? "/volunteer" : i % 7 === 4 ? "/contact" : i % 7 === 5 ? "/admin" : "/"
    },
    donor: donor,
    project: {
      id: `project-${100 + i}`,
      name: project,
      slug: project.toLowerCase().replace(/[^a-z]+/g, "-")
    },
    payment: {
      method: paymentMethods[i % paymentMethods.length],
      frequency: frequencies[i % frequencies.length],
      amount: 100 + ((i * 250) % 1500),
      currency: "INR",
      cardLast4: i % 4 === 0 ? "4242" : "1111",
      status: status
    },
    validation: {
      emailError: i % 5 === 0 ? "invalid_email" : null,
      phoneError: i % 6 === 0 ? "invalid_phone" : null,
      projectError: i % 10 === 0 ? "project_required" : null,
      amountError: i % 11 === 0 ? "amount_too_low" : null
    },
    api: {
      request: {
        path: scenarioName.startsWith("admin") ? "/api/admin" : "/api/donations",
        method: i % 2 === 0 ? "POST" : "GET"
      },
      response: {
        statusCode: i % 17 === 0 ? 500 : i % 8 === 0 ? 404 : i % 9 === 0 ? 422 : 200,
        success: status !== "failure" && status !== "network_error" && status !== "unauthorized" && status !== "validation_error",
        body: {
          id: `txn-${i + 1}`,
          donorId: donor.id,
          projectId: `project-${100 + i}`,
          amount: 100 + ((i * 250) % 1500),
          currency: "INR",
          status: status,
          createdAt: `2026-09-13T00:00:${String(10 + (i % 50)).padStart(2, "0")}.000Z`
        }
      }
    },
    network: {
      errorType: i % 13 === 0 ? "timeout" : i % 14 === 0 ? "offline" : i % 15 === 0 ? "server_error" : i % 16 === 0 ? "cors" : "none",
      retryable: i % 4 === 0,
      latencyMs: 80 + (i % 400)
    },
    permissions: {
      role: scenarioName.startsWith("admin") ? (i % 3 === 0 ? "admin" : i % 3 === 1 ? "editor" : "viewer") : "donor",
      canCreateProject: scenarioName.startsWith("admin") && i % 3 === 0,
      canUpdateProject: scenarioName.startsWith("admin") && i % 3 !== 2,
      canDeleteProject: scenarioName.startsWith("admin") && i % 3 === 0,
      canExportReports: scenarioName.startsWith("admin") && i % 4 === 0
    },
    expected: {
      status: status,
      redirect: status === "success" || status === "authenticated" ? "/payment/success" : "/payment/error",
      toast: status === "network_error" ? "network_error" : status === "validation_error" ? "validation_error" : "generic_success"
    }
  });
}

module.exports = {
  e2eTestFixtures,
  scenarioNames,
};

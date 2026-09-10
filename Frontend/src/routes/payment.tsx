import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Search = { amount?: number; frequency?: "one-time" | "monthly" };

export const Route = createFileRoute("/payment")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    amount: s.amount ? Number(s.amount) : undefined,
    frequency: s.frequency === "monthly" ? "monthly" : "one-time",
  }),
  head: () => ({
    meta: [
      { title: "Payment — Wild Haven" },
      { name: "description", content: "Complete your donation to Wild Haven." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PaymentPage,
});

function PaymentPage() {
  const { amount = 0, frequency = "one-time" } = Route.useSearch();
  const [method, setMethod] = useState<"card" | "upi">("card");
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [upi, setUpi] = useState("");
  const [done, setDone] = useState(false);

  // Random transaction id + QR payload, stable across renders
  const txn = useMemo(
    () => "WH-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    [],
  );
  const qrPayload = useMemo(() => {
    const upiUri = `upi://pay?pa=wildhaven@upi&pn=Wild%20Haven&am=${amount}&cu=INR&tn=${txn}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;
  }, [amount, txn]);

  const canPay =
    method === "card"
      ? name.trim() && card.replace(/\s/g, "").length >= 12 && expiry && cvv.length >= 3
      : upi.includes("@");

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canPay) return;
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="container-page py-4 flex items-center justify-between">
          <Link to="/" className="font-display text-lg text-primary">Wild Haven</Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
        </div>
      </header>

      <main className="container-page py-10 max-w-3xl">
        {done ? (
          <div className="rounded-2xl border border-border/60 p-8 text-center bg-card">
            <div className="text-4xl mb-3">✅</div>
            <h1 className="font-display text-2xl mb-2">Thank you!</h1>
            <p className="text-muted-foreground">
              Your {frequency === "monthly" ? "monthly" : "one-time"} gift of{" "}
              <span className="font-semibold text-foreground">₹{amount.toLocaleString("en-IN")}</span>{" "}
              was received. Transaction ID: <span className="font-mono">{txn}</span>
            </p>
            <Link to="/" className="inline-block mt-6 text-primary hover:underline">Return home</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-[1fr_320px] gap-8">
            <form onSubmit={handlePay} className="rounded-2xl border border-border/60 p-6 bg-card space-y-5">
              <div>
                <h1 className="font-display text-2xl">Complete your donation</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {frequency === "monthly" ? "Monthly" : "One-time"} gift of{" "}
                  <span className="font-semibold text-foreground">₹{amount.toLocaleString("en-IN")}</span>
                </p>
              </div>

              <div className="flex gap-2">
                {(["card", "upi"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`flex-1 rounded-full border px-4 py-2 text-sm capitalize transition ${
                      method === m
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {m === "card" ? "Card" : "UPI / QR"}
                  </button>
                ))}
              </div>

              {method === "card" ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="name">Name on card</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                  </div>
                  <div>
                    <Label htmlFor="card">Card number</Label>
                    <Input
                      id="card"
                      inputMode="numeric"
                      value={card}
                      onChange={(e) => setCard(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="expiry">Expiry</Label>
                      <Input id="expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" value={cvv} onChange={(e) => setCvv(e.target.value)} placeholder="123" />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <Label htmlFor="upi">UPI ID</Label>
                  <Input id="upi" value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="name@bank" />
                  <p className="text-xs text-muted-foreground mt-2">Or scan the QR on the right to pay.</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={!canPay}
                className="w-full h-12 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Pay ₹{amount.toLocaleString("en-IN")}
              </Button>
              <p className="text-[11px] text-center text-muted-foreground">
                This is a demo checkout. No real payment is processed.
              </p>
            </form>

            <aside className="rounded-2xl border border-border/60 p-6 bg-card text-center">
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Scan to pay</div>
              <img
                src={qrPayload}
                alt="Payment QR code"
                width={220}
                height={220}
                className="mx-auto rounded-lg bg-white p-2"
              />
              <div className="mt-4 text-xs text-muted-foreground">Txn ID</div>
              <div className="font-mono text-sm">{txn}</div>
              <div className="mt-3 text-xs text-muted-foreground">UPI: wildhaven@upi</div>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

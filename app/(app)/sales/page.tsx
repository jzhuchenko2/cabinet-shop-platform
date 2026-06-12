"use client";

import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { PageHeader } from "@/components/ui/page-header";

const salesWork = [
  { title: "Open quotes", detail: "New cabinet packages that still need scope, pricing, or customer approval.", count: 5 },
  { title: "Additional contracts", detail: "Change orders, added rooms, and contract revisions waiting for signature.", count: 2 },
  { title: "Ready for design", detail: "Signed work that can move into drawings and field verification.", count: 3 }
];

type Quote = {
  id: string;
  client: string;
  scope: string;
  value: string;
  stage: "Quote sent" | "Needs revision" | "Contract ready" | "Waiting on customer";
};

type UploadedContract = {
  id: string;
  name: string;
  size: string;
};

const initialQuotePipeline: Quote[] = [
  { id: "nolan-vanity", client: "Nolan Residence", scope: "Primary suite vanity", value: "$18,400", stage: "Quote sent" },
  { id: "mesa-lot-27", client: "Mesa Builders", scope: "Lot 27 kitchen", value: "$42,900", stage: "Needs revision" },
  { id: "harlow-mudroom", client: "Harlow Homes", scope: "Mudroom add-on", value: "$9,750", stage: "Contract ready" }
];

const quoteStorageKey = "cabinet-shop.sales.quotes";
const contractStorageKey = "cabinet-shop.sales.contracts";
const filters = ["Quotes", "Contracts", "Waiting on customer", "Ready for design"] as const;

export default function SalesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [quotes, setQuotes] = useState(initialQuotePipeline);
  const [contracts, setContracts] = useState<UploadedContract[]>([]);
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>("Quotes");
  const [isAddingQuote, setIsAddingQuote] = useState(false);

  useEffect(() => {
    const storedQuotes = window.localStorage.getItem(quoteStorageKey);
    const storedContracts = window.localStorage.getItem(contractStorageKey);

    if (storedQuotes) {
      setQuotes(JSON.parse(storedQuotes) as Quote[]);
    }

    if (storedContracts) {
      setContracts(JSON.parse(storedContracts) as UploadedContract[]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(quoteStorageKey, JSON.stringify(quotes));
  }, [quotes]);

  useEffect(() => {
    window.localStorage.setItem(contractStorageKey, JSON.stringify(contracts));
  }, [contracts]);

  const visibleQuotes = useMemo(
    () =>
      quotes.filter((quote) => {
        if (activeFilter === "Waiting on customer") {
          return quote.stage === "Waiting on customer" || quote.stage === "Quote sent";
        }

        if (activeFilter === "Ready for design") {
          return quote.stage === "Contract ready";
        }

        return activeFilter !== "Contracts";
      }),
    [activeFilter, quotes]
  );

  const openValue = quotes.reduce((total, quote) => total + Number(quote.value.replace(/[^0-9.]/g, "")), 0);

  function addQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const nextQuote: Quote = {
      id: `quote-${Date.now()}`,
      client: String(formData.get("client") ?? "").trim(),
      scope: String(formData.get("scope") ?? "").trim(),
      value: String(formData.get("value") ?? "").trim(),
      stage: String(formData.get("stage") ?? "Quote sent") as Quote["stage"]
    };

    if (!nextQuote.client || !nextQuote.scope || !nextQuote.value) {
      return;
    }

    setQuotes((currentQuotes) => [nextQuote, ...currentQuotes]);
    setActiveFilter(nextQuote.stage === "Contract ready" ? "Ready for design" : "Quotes");
    setIsAddingQuote(false);
    event.currentTarget.reset();
  }

  function addContracts(files: FileList | null) {
    if (!files) {
      return;
    }

    const nextContracts = Array.from(files).map((file) => ({
      id: `contract-${file.name}-${Date.now()}`,
      name: file.name,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`
    }));

    setContracts((currentContracts) => [...nextContracts, ...currentContracts]);
    setActiveFilter("Contracts");
  }

  return (
    <>
      <PageHeader
        eyebrow="Revenue"
        title="Sales"
        description="Quotes, customer approvals, added scope, and additional contracts before work moves into design."
        action={
          <div className="header-actions">
            <button className="button secondary" onClick={() => fileInputRef.current?.click()} type="button">
              Upload contract
            </button>
            <button className="button" onClick={() => setIsAddingQuote((current) => !current)} type="button">
              New quote
            </button>
            <input
              className="visually-hidden"
              multiple
              onChange={(event) => addContracts(event.target.files)}
              ref={fileInputRef}
              type="file"
            />
          </div>
        }
      />

      <section className="work-toolbar" aria-label="Sales filters">
        {filters.map((filter) => (
          <button
            className={filter === activeFilter ? "toolbar-chip active" : "toolbar-chip"}
            key={filter}
            onClick={() => setActiveFilter(filter)}
            type="button"
          >
            {filter}
          </button>
        ))}
      </section>

      {isAddingQuote ? (
        <form className="card inline-form" onSubmit={addQuote}>
          <div className="field">
            <label htmlFor="quote-client">Client</label>
            <input id="quote-client" name="client" placeholder="Nolan Residence" required />
          </div>
          <div className="field">
            <label htmlFor="quote-scope">Scope</label>
            <input id="quote-scope" name="scope" placeholder="Kitchen package" required />
          </div>
          <div className="field">
            <label htmlFor="quote-value">Value</label>
            <input id="quote-value" name="value" placeholder="$24,500" required />
          </div>
          <div className="field">
            <label htmlFor="quote-stage">Stage</label>
            <select id="quote-stage" name="stage">
              <option>Quote sent</option>
              <option>Needs revision</option>
              <option>Contract ready</option>
              <option>Waiting on customer</option>
            </select>
          </div>
          <button className="button" type="submit">Save quote</button>
        </form>
      ) : null}

      <section className="grid grid-3">
        {salesWork.map((item) => (
          <article className="card" key={item.title}>
            <div className="metric">{item.count}</div>
            <h2>{item.title}</h2>
            <p className="muted">{item.detail}</p>
          </article>
        ))}
      </section>

      <section className="card work-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Pipeline</p>
            <h2>Quote and contract tracker</h2>
          </div>
          <span className="status-pill done">${openValue.toLocaleString()} open</span>
        </div>
        {activeFilter === "Contracts" ? (
          <div className="compact-list">
            {contracts.map((contract) => (
              <div className="compact-list-row" key={contract.id}>
                <div>
                  <strong>{contract.name}</strong>
                  <span className="muted">{contract.size}</span>
                </div>
                <span className="status-pill ready">Uploaded</span>
              </div>
            ))}
            {contracts.length === 0 ? <p className="muted empty-state">No contracts uploaded yet.</p> : null}
          </div>
        ) : (
          <table className="table responsive-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Scope</th>
                <th>Value</th>
                <th>Stage</th>
              </tr>
            </thead>
            <tbody>
              {visibleQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td data-label="Client">{quote.client}</td>
                  <td data-label="Scope">{quote.scope}</td>
                  <td data-label="Value">{quote.value}</td>
                  <td data-label="Stage">{quote.stage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}

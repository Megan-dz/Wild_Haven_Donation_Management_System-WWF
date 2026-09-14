import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { customFetch } from "@workspace/api-client-react";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

export type RescueCase = {
  id: number; caseNumber: string; animalName: string; species: string; rescueType: string;
  rescueLocation: string; reportedBy: string; contactInformation: string; reportedAt: string;
  rescueDate: string; severity: string; condition: string; description: string;
  assignedEmployeeId: string | null; status: string; priority: string; estimatedCost: number; actualCost: number;
};

export type CaseForm = Omit<RescueCase, "id" | "reportedAt" | "rescueDate" | "assignedEmployeeId" | "actualCost"> & {
  reportedAt: string; rescueDate: string; assignedEmployeeId: string;
};

const statuses = ["reported", "assigned", "rescuing", "rescued", "rehabilitation", "released", "closed", "cancelled"];
const priorities = ["low", "medium", "high", "critical"];
const types = ["injury", "orphaned", "entanglement", "poaching", "habitat", "other"];
const emptyForm: CaseForm = {
  caseNumber: "", animalName: "", species: "", rescueType: "injury", rescueLocation: "", reportedBy: "", contactInformation: "",
  reportedAt: new Date().toISOString().slice(0, 16), rescueDate: new Date().toISOString().slice(0, 16), severity: "medium",
  condition: "", description: "", assignedEmployeeId: "", status: "reported", priority: "medium", estimatedCost: 0,
};

function statusVariant(status: string) {
  if (["released", "closed"].includes(status)) return "success";
  if (["critical", "cancelled"].includes(status)) return "destructive";
  if (["assigned", "rescuing", "rehabilitation"].includes(status)) return "warning";
  return "secondary";
}

export function CaseFormFields({ form, setForm }: { form: CaseForm; setForm: (form: CaseForm) => void }) {
  const update = (key: keyof CaseForm, value: string | number) => setForm({ ...form, [key]: value });
  return <div className="grid gap-4 sm:grid-cols-2">
    <label className="space-y-1 text-sm"><span>Case number</span><Input required value={form.caseNumber} onChange={(e) => update("caseNumber", e.target.value)} placeholder="WH-RC-2026-001" /></label>
    <label className="space-y-1 text-sm"><span>Animal name</span><Input required value={form.animalName} onChange={(e) => update("animalName", e.target.value)} /></label>
    <label className="space-y-1 text-sm"><span>Species</span><Input required value={form.species} onChange={(e) => update("species", e.target.value)} /></label>
    <label className="space-y-1 text-sm"><span>Rescue type</span><Select value={form.rescueType} onValueChange={(value) => update("rescueType", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{types.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></label>
    <label className="space-y-1 text-sm"><span>Location</span><Input required value={form.rescueLocation} onChange={(e) => update("rescueLocation", e.target.value)} /></label>
    <label className="space-y-1 text-sm"><span>Reported by</span><Input required value={form.reportedBy} onChange={(e) => update("reportedBy", e.target.value)} /></label>
    <label className="space-y-1 text-sm"><span>Contact information</span><Input required value={form.contactInformation} onChange={(e) => update("contactInformation", e.target.value)} /></label>
    <label className="space-y-1 text-sm"><span>Assigned employee ID</span><Input value={form.assignedEmployeeId} onChange={(e) => update("assignedEmployeeId", e.target.value)} placeholder="staff-123" /></label>
    <label className="space-y-1 text-sm"><span>Reported date</span><Input required type="datetime-local" value={form.reportedAt} onChange={(e) => update("reportedAt", e.target.value)} /></label>
    <label className="space-y-1 text-sm"><span>Rescue date</span><Input required type="datetime-local" value={form.rescueDate} onChange={(e) => update("rescueDate", e.target.value)} /></label>
    <label className="space-y-1 text-sm"><span>Status</span><Select value={form.status} onValueChange={(value) => update("status", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></label>
    <label className="space-y-1 text-sm"><span>Priority</span><Select value={form.priority} onValueChange={(value) => update("priority", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{priorities.map((priority) => <SelectItem key={priority} value={priority}>{priority}</SelectItem>)}</SelectContent></Select></label>
    <label className="space-y-1 text-sm"><span>Severity</span><Select value={form.severity} onValueChange={(value) => update("severity", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{priorities.map((severity) => <SelectItem key={severity} value={severity}>{severity}</SelectItem>)}</SelectContent></Select></label>
    <label className="space-y-1 text-sm"><span>Estimated cost</span><Input type="number" min="0" value={form.estimatedCost} onChange={(e) => update("estimatedCost", Number(e.target.value))} /></label>
    <label className="space-y-1 text-sm sm:col-span-2"><span>Condition</span><Input required value={form.condition} onChange={(e) => update("condition", e.target.value)} /></label>
    <label className="space-y-1 text-sm sm:col-span-2"><span>Description</span><Textarea required value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} /></label>
  </div>;
}

export function toPayload(form: CaseForm) {
  return { ...form, reportedAt: new Date(form.reportedAt).toISOString(), rescueDate: new Date(form.rescueDate).toISOString(), assignedEmployeeId: form.assignedEmployeeId || null };
}

export function RescueCases() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [sort, setSort] = useState("createdAt");
  const [offset, setOffset] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const limit = 10;
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset), sort });
  if (search.trim()) query.set("search", search.trim());
  if (status !== "all") query.set("status", status);
  if (priority !== "all") query.set("priority", priority);
  const casesQuery = useQuery({ queryKey: ["rescue-cases", query.toString()], queryFn: () => customFetch<RescueCase[]>(`/api/rescue-cases?${query}`) });
  const statsQuery = useQuery({ queryKey: ["rescue-dashboard"], queryFn: () => customFetch<{ totalRescueCases: number; activeCases: number; completedCases: number; highPriorityCases: number; totalRescueExpenses: number }>("/api/rescue-dashboard") });
  const createCase = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await customFetch("/api/rescue-cases", { method: "POST", body: JSON.stringify(toPayload(form)), headers: { "Content-Type": "application/json" } });
      await queryClient.invalidateQueries({ queryKey: ["rescue-cases"] });
      setOpen(false); setForm(emptyForm); toast({ title: "Rescue case created" });
    } catch { toast({ title: "Unable to create rescue case", variant: "destructive" }); }
  };

  return <div className="flex-1 space-y-6 p-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="font-serif text-2xl font-bold tracking-tight text-primary">Rescue Case Management</h2><p className="text-muted-foreground">Coordinate wildlife rescues, care, and field follow-up.</p></div><Button onClick={() => { setForm(emptyForm); setOpen(true); }}><Plus className="mr-2 h-4 w-4" /> New rescue case</Button></div>
    <Card><CardContent className="grid gap-3 p-4 md:grid-cols-4"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search cases, animals, species..." value={search} onChange={(e) => { setSearch(e.target.value); setOffset(0); }} /></div><Select value={status} onValueChange={(value) => { setStatus(value); setOffset(0); }}><SelectTrigger><SelectValue placeholder="All statuses" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={priority} onValueChange={(value) => { setPriority(value); setOffset(0); }}><SelectTrigger><SelectValue placeholder="All priorities" /></SelectTrigger><SelectContent><SelectItem value="all">All priorities</SelectItem>{priorities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select><Select value={sort} onValueChange={setSort}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="createdAt">Newest created</SelectItem><SelectItem value="reportedAt">Recently reported</SelectItem><SelectItem value="priority">Priority</SelectItem></SelectContent></Select></CardContent></Card>
    {statsQuery.data ? <div className="grid gap-4 md:grid-cols-5"><Card><CardHeader><CardTitle className="text-sm">Total cases</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{statsQuery.data.totalRescueCases}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Active cases</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{statsQuery.data.activeCases}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Completed</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{statsQuery.data.completedCases}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">High priority</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{statsQuery.data.highPriorityCases}</CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Expenses</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{statsQuery.data.totalRescueExpenses.toLocaleString("en-IN")}</CardContent></Card></div> : null}
    {casesQuery.isLoading ? <div className="space-y-3"><div className="h-16 animate-pulse rounded-lg bg-muted" /><div className="h-16 animate-pulse rounded-lg bg-muted" /><div className="h-16 animate-pulse rounded-lg bg-muted" /></div> : casesQuery.isError ? <Card><CardContent className="p-10 text-center text-sm text-destructive">Unable to load rescue cases. Please try again.</CardContent></Card> : casesQuery.data?.length === 0 ? <Card><CardContent className="flex flex-col items-center gap-3 p-12 text-center"><AlertTriangle className="h-8 w-8 text-muted-foreground" /><p className="font-medium">No rescue cases found</p><p className="text-sm text-muted-foreground">Adjust the filters or create a new case.</p></CardContent></Card> : <Card><CardHeader><CardTitle>Cases</CardTitle></CardHeader><CardContent className="space-y-3">{casesQuery.data?.map((item) => <Link key={item.id} href={`/rescue-cases/${item.id}`}><div className="flex flex-col gap-3 rounded-md border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-medium">{item.caseNumber}</span><Badge variant={statusVariant(item.priority) as any} className="capitalize">{item.priority}</Badge><Badge variant={statusVariant(item.status) as any} className="capitalize">{item.status}</Badge></div><p className="mt-1 truncate text-sm text-muted-foreground">{item.animalName} · {item.species} · {item.rescueLocation}</p></div><div className="text-left text-sm text-muted-foreground sm:text-right"><p>{formatDate(item.reportedAt)}</p><p>{item.assignedEmployeeId || "Unassigned"}</p></div></div></Link>)}</CardContent></Card>}
    <div className="flex justify-end gap-2"><Button variant="outline" size="sm" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}><ChevronLeft className="mr-1 h-4 w-4" /> Previous</Button><Button variant="outline" size="sm" disabled={!casesQuery.data || casesQuery.data.length < limit} onClick={() => setOffset(offset + limit)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button></div>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>Create rescue case</DialogTitle></DialogHeader><form className="space-y-5" onSubmit={createCase}><CaseFormFields form={form} setForm={setForm} /><Button type="submit" className="w-full">Create case</Button></form></DialogContent></Dialog>
  </div>;
}

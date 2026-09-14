import { BellOff, Settings2 } from "lucide-react";
import type { NotificationCategory, NotificationPreferences as Preferences } from "@/features/notifications/notification-types";
import { categoryLabel } from "@/features/notifications/notification-utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const categories: NotificationCategory[] = ["rescue", "medical", "volunteer", "adoption", "inventory", "donation", "campaign", "system"];

export function NotificationPreferences({ preferences, onChange }: { preferences: Preferences; onChange: (next: Partial<Preferences>) => void }) {
  const { toast } = useToast();
  const updateCategory = (category: NotificationCategory, checked: boolean) => { onChange({ categories: { ...preferences.categories, [category]: checked } }); toast({ title: `${categoryLabel(category)} notifications ${checked ? "enabled" : "muted"}` }); };
  const updateReadVisibility = (checked: boolean) => { onChange({ showReadNotifications: checked }); toast({ title: checked ? "Read notifications are visible" : "Read notifications are hidden" }); };
  return <Card><CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5 text-primary" /> Notification preferences</CardTitle><CardDescription className="mt-1">Choose which categories appear in your in-app feed.</CardDescription></div><Badge variant="secondary">This device</Badge></div></CardHeader><CardContent className="space-y-1">{categories.map((category) => <label key={category} className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted"><span className="text-sm font-medium">{categoryLabel(category)}</span><Switch checked={preferences.categories[category]} onCheckedChange={(checked) => updateCategory(category, checked)} aria-label={`Toggle ${categoryLabel(category)} notifications`} /></label>)}<div className="my-3 border-t" /><label className="flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted"><span><span className="block text-sm font-medium">Show read notifications</span><span className="mt-0.5 block text-xs text-muted-foreground">Keep completed items visible in the feed.</span></span><Switch checked={preferences.showReadNotifications} onCheckedChange={updateReadVisibility} aria-label="Toggle read notification visibility" /></label><div className="mt-3 flex items-start gap-2 rounded-md bg-muted/60 p-3 text-xs leading-5 text-muted-foreground"><BellOff className="mt-0.5 h-4 w-4 shrink-0" />Preferences and read status are saved locally for the signed-in staff member on this device.</div></CardContent></Card>;
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, Sparkles, Eye, BarChart3, Clock, Download, LogIn } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";

interface AnalyticsData {
  totalVisits: number;
  totalGenerations: number;
  totalUsers: number;
  totalLogins: number;
  avgSessionMinutes: number;
  typeBreakdown: Record<string, number>;
  dailyVisits: Record<string, number>;
  dailySignups: Record<string, number>;
  dailyDAU: Record<string, number>;
  providerBreakdown: Record<string, number>;
  recentUsage: any[];
  recentVisits: any[];
  recentLogins: any[];
  profiles: any[];
}

const COLORS = [
  "hsl(174, 72%, 36%)",
  "hsl(210, 60%, 50%)",
  "hsl(340, 65%, 55%)",
  "hsl(45, 80%, 50%)",
  "hsl(280, 60%, 55%)",
];

const Admin = () => {
  
  const navigate = useNavigate();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    
    const fetchAnalytics = async () => {
      const { data: result, error } = await supabase.functions.invoke("admin-analytics");
      if (!error && result) setData(result);
      setFetching(false);
    };
    fetchAnalytics();
  }, []);

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Build trend chart data (merge all daily metrics)
  const allDays = new Set([
    ...Object.keys(data?.dailyVisits || {}),
    ...Object.keys(data?.dailySignups || {}),
    ...Object.keys(data?.dailyDAU || {}),
  ]);
  const trendData = [...allDays]
    .sort()
    .map((date) => ({
      date: date.slice(5),
      visits: data?.dailyVisits[date] || 0,
      signups: data?.dailySignups[date] || 0,
      dau: data?.dailyDAU[date] || 0,
    }));

  const pieData = data
    ? Object.entries(data.typeBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const providerData = data
    ? Object.entries(data.providerBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  const handleExportCSV = async () => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/admin-analytics?export=csv`,
        {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "analytics.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">Analytics Dashboard</h1>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {fetching ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <p className="text-muted-foreground text-center py-20">Failed to load analytics data.</p>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Total Users</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{data.totalUsers}</div>
                </CardContent>
              </Card>
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Page Visits</CardTitle>
                  <Eye className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{data.totalVisits}</div>
                </CardContent>
              </Card>
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Generations</CardTitle>
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{data.totalGenerations}</div>
                </CardContent>
              </Card>
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Total Logins</CardTitle>
                  <LogIn className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{data.totalLogins}</div>
                </CardContent>
              </Card>
              <Card className="border-border/60 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">Avg Session</CardTitle>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{data.avgSessionMinutes}m</div>
                </CardContent>
              </Card>
            </div>

            {/* Engagement Trends */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Engagement Trends</CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="visits" stroke="hsl(174, 72%, 36%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="dau" stroke="hsl(210, 60%, 50%)" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="signups" stroke="hsl(340, 65%, 55%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Generations by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base text-foreground">Login Providers</CardTitle>
                </CardHeader>
                <CardContent>
                  {providerData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={providerData}>
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Bar dataKey="value" fill="hsl(210, 60%, 50%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">No data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Recent Generations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 text-muted-foreground font-medium">Type</th>
                        <th className="text-left py-2 text-muted-foreground font-medium">Prompt</th>
                        <th className="text-left py-2 text-muted-foreground font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentUsage.slice(0, 20).map((log: any, i: number) => (
                        <tr key={i} className="border-b border-border/40">
                          <td className="py-2 capitalize text-foreground">{log.design_type}</td>
                          <td className="py-2 text-muted-foreground max-w-xs truncate">{log.prompt}</td>
                          <td className="py-2 text-muted-foreground whitespace-nowrap">
                            {new Date(log.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                      {data.recentUsage.length === 0 && (
                        <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No data yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;

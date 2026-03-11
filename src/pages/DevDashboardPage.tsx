import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Code2,
  Loader2,
  ShieldAlert,
  Database,
  ExternalLink,
  Server,
  Link2,
  Layers,
  Shield,
  UserPlus,
  UserMinus,
} from 'lucide-react';

type TableStat = { table: string; count: number };
type DevProfile = { id: string; full_name: string | null; username: string | null; is_dev: boolean };

const DevDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [isDev, setIsDev] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [tableStats, setTableStats] = useState<TableStat[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [devProfiles, setDevProfiles] = useState<DevProfile[]>([]);
  const [devProfilesLoading, setDevProfilesLoading] = useState(true);
  const [updatingDevId, setUpdatingDevId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    (async () => {
      let data: { role: string | null; is_dev: boolean | null } | null = null;
      const byId = await supabase.from('profiles').select('role, is_dev').eq('id', user.id).maybeSingle();
      data = byId.data;
      if (data == null) {
        const byUserId = await supabase.from('profiles').select('role, is_dev').eq('user_id', user.id).maybeSingle();
        data = byUserId.data;
      }
      setProfileRole(data?.role ?? null);
      setIsDev(data?.is_dev === true);
      setProfileLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!isDev) return;
    (async () => {
      const tables = [
        'profiles',
        'shops',
        'products',
        'product_images',
        'product_likes',
        'product_engagement',
        'categories',
        'cart_items',
        'orders',
        'order_items',
        'reviews',
        'shop_followers',
      ] as const;
      const results: TableStat[] = [];
      for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (!error && typeof count === 'number') {
          results.push({ table, count });
        }
      }
      setTableStats(results);
      setStatsLoading(false);
    })();
  }, [isDev]);

  useEffect(() => {
    if (!isDev) return;
    (async () => {
      const { data, error } = await supabase.rpc('get_profiles_for_dev');
      if (!error && data) setDevProfiles(data as DevProfile[]);
      setDevProfilesLoading(false);
    })();
  }, [isDev]);

  const handleSetDev = async (profile: DevProfile, makeDev: boolean) => {
    const name = profile.full_name || profile.username || profile.id;
    const firstMessage = makeDev
      ? `Grant ${name} access to the dev panel? They will be able to see database stats and dev tools.`
      : `Remove dev panel access from ${name}? They will no longer see the dev panel.`;
    const secondMessage = makeDev
      ? 'Are you sure? This will give them access to the dev panel.'
      : 'Are you sure? This will remove their dev panel access.';

    if (!window.confirm(firstMessage)) return;
    if (!window.confirm(secondMessage)) return;

    setUpdatingDevId(profile.id);
    const { error } = await supabase.rpc('set_user_dev', {
      target_profile_id: profile.id,
      new_is_dev: makeDev,
    });
    setUpdatingDevId(null);
    if (error) {
      toast({ title: 'Failed to update dev access', description: error.message, variant: 'destructive' });
      return;
    }
    setDevProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, is_dev: makeDev } : p))
    );
    toast({ title: makeDev ? 'Dev access granted' : 'Dev access removed' });
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\./)?.[1] ?? null;
  const supabaseDashboardLink = projectRef
    ? `https://supabase.com/dashboard/project/${projectRef}`
    : 'https://supabase.com/dashboard';

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    navigate('/auth', { replace: true });
    return null;
  }

  if (!isDev) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 flex flex-col items-center justify-center gap-4">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground text-center max-w-md">
            You don’t have permission to view this page. Only users with the <strong>dev</strong> role can access the dev panel.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 sm:py-12 px-4 sm:px-6 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Code2 className="h-8 w-8" />
            Dev panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Database stats, environment info, and quick links for development.
          </p>
        </div>

        {/* Environment & links */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Environment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Mode:</span>
              <span className="text-sm font-medium">
                {import.meta.env.DEV ? 'Development' : 'Production'}
              </span>
            </div>
            {supabaseUrl && (
              <div className="flex flex-wrap items-center gap-2">
                <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground truncate max-w-full">
                  {supabaseUrl}
                </span>
              </div>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" variant="outline" asChild>
                <a href={supabaseDashboardLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Supabase Dashboard
                </a>
              </Button>
              {profileRole === 'admin' && (
                <Button size="sm" variant="outline" asChild>
                  <Link to="/admin">
                    <Shield className="h-4 w-4 mr-1" />
                    Admin dashboard
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dev access management */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Dev access
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Grant or revoke dev panel access for other users. You will be asked to confirm twice before making changes.
            </p>
          </CardHeader>
          <CardContent>
            {devProfilesLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : devProfiles.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No profiles found.</p>
            ) : (
              <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background border-b border-border">
                    <tr>
                      <th className="text-left py-3 font-medium">Name</th>
                      <th className="text-left py-3 font-medium">Username</th>
                      <th className="text-left py-3 font-medium">Dev access</th>
                      <th className="text-right py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {devProfiles.map((p) => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-3">{p.full_name || '—'}</td>
                        <td className="py-3 text-muted-foreground">@{p.username ?? '—'}</td>
                        <td className="py-3">
                          {p.is_dev ? (
                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                              <Code2 className="h-4 w-4" /> Yes
                            </span>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {p.id !== user.id && (
                            p.is_dev ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetDev(p, false)}
                                disabled={updatingDevId === p.id}
                              >
                                {updatingDevId === p.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <><UserMinus className="h-4 w-4 mr-1" /> Remove dev</>
                                )}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSetDev(p, true)}
                                disabled={updatingDevId === p.id}
                              >
                                {updatingDevId === p.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <><UserPlus className="h-4 w-4 mr-1" /> Make dev</>
                                )}
                              </Button>
                            )
                          )}
                          {p.id === user.id && (
                            <span className="text-muted-foreground text-xs">(you)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Database table stats */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Table row counts
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Live counts from the connected Supabase project.
            </p>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tableStats.map(({ table, count }) => (
                  <div
                    key={table}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
                  >
                    <span className="text-sm font-medium font-mono">{table}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              About
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Use the <strong>Admin</strong> dashboard to approve shops, manage users, and toggle
              trending/featured.
            </p>
            <p>
              Run migrations from the Supabase Dashboard or CLI to keep the database schema in sync.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default DevDashboardPage;

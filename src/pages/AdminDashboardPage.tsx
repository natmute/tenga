import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { Store, Check, X, ShieldAlert, Loader2, Users, Shield, Trash2, ExternalLink, Star, TrendingUp, Truck } from 'lucide-react';

type Shop = Tables<'shops'>;
type Product = Tables<'products'> & { shops?: { name: string; slug: string } | null; product_images?: { image_url: string }[] };
type OrderRow = Tables<'orders'> & {
  order_items?: (Tables<'order_items'> & { products?: { name: string } | null })[];
  shops?: { name: string; slug: string } | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string | null;
  created_at: string | null;
};

const AdminDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileRole, setProfileRole] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [pendingShops, setPendingShops] = useState<Shop[]>([]);
  const [allShops, setAllShops] = useState<Shop[]>([]);
  const [ownerByShopId, setOwnerByShopId] = useState<Record<string, { full_name: string | null; username: string | null }>>({});
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [deletingShopId, setDeletingShopId] = useState<string | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [togglingFeaturedId, setTogglingFeaturedId] = useState<string | null>(null);
  const [togglingTrendingId, setTogglingTrendingId] = useState<string | null>(null);
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [orderTrackingDraft, setOrderTrackingDraft] = useState<Record<string, { status: string; tracking_carrier: string; tracking_number: string }>>({});

  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      return;
    }
    (async () => {
      let data: { role: string | null } | null = null;
      const byId = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
      data = byId.data;
      if (data == null) {
        const byUserId = await supabase.from('profiles').select('role').eq('user_id', user.id).maybeSingle();
        data = byUserId.data;
      }
      setProfileRole(data?.role ?? null);
      setProfileLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (profileRole !== 'admin') return;
    (async () => {
      const [pendingRes, allRes] = await Promise.all([
        supabase.from('shops').select('*').eq('is_verified', false).order('created_at', { ascending: false }),
        supabase.from('shops').select('*').order('created_at', { ascending: false }),
      ]);
      const pending = pendingRes.data ?? [];
      const all = allRes.data ?? [];
      if (!pendingRes.error) setPendingShops(pending);
      if (!allRes.error) setAllShops(all);
      const ownerIds = [...new Set([...pending, ...all].map((s) => s.owner_id).filter(Boolean))] as string[];
      const ownerMap: Record<string, { full_name: string | null; username: string | null }> = {};
      if (ownerIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', ownerIds);
        (profiles ?? []).forEach((row: { id: string; full_name: string | null; username: string | null }) => {
          ownerMap[row.id] = { full_name: row.full_name, username: row.username };
        });
      }
      const byShopId: Record<string, { full_name: string | null; username: string | null }> = {};
      [...pending, ...all].forEach((s) => {
        if (s.owner_id && ownerMap[s.owner_id]) byShopId[s.id] = ownerMap[s.owner_id];
      });
      setOwnerByShopId(byShopId);
      setShopsLoading(false);
    })();
  }, [profileRole]);

  useEffect(() => {
    if (profileRole !== 'admin') return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, username, role, created_at')
        .order('created_at', { ascending: false });
      if (!error) setUsers((data as ProfileRow[]) ?? []);
      setUsersLoading(false);
    })();
  }, [profileRole]);

  useEffect(() => {
    if (profileRole !== 'admin') return;
    (async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(image_url), shops(name, slug)')
        .order('created_at', { ascending: false });
      if (!error && data) setAllProducts(data as Product[]);
      setProductsLoading(false);
    })();
  }, [profileRole]);

  useEffect(() => {
    if (profileRole !== 'admin') return;
    (async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name)), shops(name, slug)')
        .order('created_at', { ascending: false });
      if (!error && data) setAllOrders(data as OrderRow[]);
      setOrdersLoading(false);
    })();
  }, [profileRole]);

  const getOrderDraft = (order: OrderRow) => {
    const id = order.id;
    if (orderTrackingDraft[id]) return orderTrackingDraft[id];
    const o = order as OrderRow & { tracking_carrier?: string | null; tracking_number?: string | null };
    return {
      status: order.status ?? 'pending',
      tracking_carrier: o.tracking_carrier ?? '',
      tracking_number: o.tracking_number ?? '',
    };
  };

  const setOrderDraft = (orderId: string, field: 'status' | 'tracking_carrier' | 'tracking_number', value: string) => {
    setOrderTrackingDraft((prev) => {
      const current = prev[orderId] ?? { status: 'pending', tracking_carrier: '', tracking_number: '' };
      return { ...prev, [orderId]: { ...current, [field]: value } };
    });
  };

  const handleUpdateOrderTracking = async (order: OrderRow) => {
    const draft = getOrderDraft(order);
    setUpdatingOrderId(order.id);
    const { error } = await supabase
      .from('orders')
      .update({
        status: draft.status || null,
        tracking_carrier: draft.tracking_carrier.trim() || null,
        tracking_number: draft.tracking_number.trim() || null,
      } as Record<string, unknown>)
      .eq('id', order.id);
    setUpdatingOrderId(null);
    if (error) {
      toast({ title: 'Failed to update order', description: error.message, variant: 'destructive' });
      return;
    }
    setAllOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? { ...o, status: draft.status, tracking_carrier: draft.tracking_carrier.trim() || null, tracking_number: draft.tracking_number.trim() || null } as OrderRow
          : o
      )
    );
    setOrderTrackingDraft((prev) => {
      const next = { ...prev };
      delete next[order.id];
      return next;
    });
    toast({ title: 'Order updated', description: 'Status and tracking have been saved.' });
  };

  const handleToggleFeatured = async (shop: Shop) => {
    setTogglingFeaturedId(shop.id);
    const next = !(shop as Shop & { is_featured?: boolean }).is_featured;
    const { error } = await supabase.from('shops').update({ is_featured: next }).eq('id', shop.id);
    setTogglingFeaturedId(null);
    if (!error) {
      setAllShops((prev) => prev.map((s) => (s.id === shop.id ? { ...s, is_featured: next } : s)));
      toast({ title: next ? 'Shop featured' : 'Shop unfeatured' });
    } else toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
  };

  const handleToggleTrending = async (product: Product) => {
    setTogglingTrendingId(product.id);
    const next = !(product as Product & { is_trending?: boolean }).is_trending;
    const { error } = await supabase.from('products').update({ is_trending: next }).eq('id', product.id);
    setTogglingTrendingId(null);
    if (!error) {
      setAllProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_trending: next } : p)));
      toast({ title: next ? 'Product set as trending' : 'Product removed from trending' });
    } else toast({ title: 'Failed to update', description: error.message, variant: 'destructive' });
  };

  const handleApprove = async (shop: Shop) => {
    setApprovingId(shop.id);
    const { error } = await supabase.from('shops').update({ is_verified: true }).eq('id', shop.id);
    setApprovingId(null);
    if (!error) {
      setPendingShops((prev) => prev.filter((s) => s.id !== shop.id));
      setAllShops((prev) => prev.map((s) => (s.id === shop.id ? { ...s, is_verified: true } : s)));
      toast({ title: 'Shop approved', description: `${shop.name} is now live.` });
    } else toast({ title: 'Failed to approve', description: error.message, variant: 'destructive' });
  };

  const handleReject = async (shop: Shop) => {
    if (!confirm(`Are you sure you want to reject "${shop.name}"? This will remove the shop application.`)) return;
    setRejectingId(shop.id);
    const { error } = await supabase.from('shops').delete().eq('id', shop.id);
    setRejectingId(null);
    if (!error) {
      setPendingShops((prev) => prev.filter((s) => s.id !== shop.id));
      setAllShops((prev) => prev.filter((s) => s.id !== shop.id));
      toast({ title: 'Shop rejected', description: 'The shop application has been removed.' });
    } else toast({ title: 'Failed to reject', description: error.message, variant: 'destructive' });
  };

  const handleDeleteShop = async (shop: Shop) => {
    if (!confirm(`Are you sure you want to permanently delete "${shop.name}"? This cannot be undone.`)) return;
    setDeletingShopId(shop.id);
    const { error } = await supabase.from('shops').delete().eq('id', shop.id);
    setDeletingShopId(null);
    if (!error) {
      setAllShops((prev) => prev.filter((s) => s.id !== shop.id));
      setPendingShops((prev) => prev.filter((s) => s.id !== shop.id));
      toast({ title: 'Shop deleted', description: `${shop.name} has been removed.` });
    } else toast({ title: 'Failed to delete shop', description: error.message, variant: 'destructive' });
  };

  const handleSetAdmin = async (profile: ProfileRow, makeAdmin: boolean) => {
    const name = profile.full_name || profile.username || profile.id;
    const message = makeAdmin
      ? `Are you sure you want to make "${name}" an admin? They will have full access to the admin dashboard.`
      : `Are you sure you want to remove admin access from "${name}"? They will no longer be able to access the admin dashboard.`;
    if (!confirm(message)) return;
    setUpdatingRoleId(profile.id);
    const { error } = await supabase.rpc('set_user_role', {
      target_profile_id: profile.id,
      new_role: makeAdmin ? 'admin' : 'user',
    });
    setUpdatingRoleId(null);
    if (!error) {
      setUsers((prev) => prev.map((p) => (p.id === profile.id ? { ...p, role: makeAdmin ? 'admin' : 'user' } : p)));
      toast({ title: makeAdmin ? 'User is now an admin' : 'Admin role removed' });
    } else {
      toast({ title: 'Failed to update role', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (profile: ProfileRow) => {
    const name = profile.full_name || profile.username || profile.id;
    if (!confirm(`Are you sure you want to permanently delete user "${name}"? They will be signed out and will not be able to sign in again. This cannot be undone.`)) return;
    setDeletingUserId(profile.id);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user', {
        body: { user_id: profile.id },
      });
      setDeletingUserId(null);
      if (error) throw new Error(error);
      const body = typeof data === 'string' ? JSON.parse(data || '{}') : data || {};
      if (body.error) throw new Error(body.error);
      setUsers((prev) => prev.filter((p) => p.id !== profile.id));
      toast({ title: 'User deleted', description: 'The user account has been removed.' });
    } catch (e) {
      setDeletingUserId(null);
      toast({ title: 'Failed to delete user', description: (e as Error).message, variant: 'destructive' });
    }
  };

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

  if (profileRole !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 flex flex-col items-center justify-center gap-4">
          <ShieldAlert className="h-12 w-12 text-destructive" />
          <h1 className="text-xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground text-center max-w-md">
            You don’t have permission to view this page. Only administrators can access the admin dashboard.
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
      <main className="flex-1 container py-8 sm:py-12 px-4 sm:px-6 max-w-5xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Admin dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage shops, users, and approvals.</p>
        </div>

        {/* Pending shops */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Pending shops ({pendingShops.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shopsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : pendingShops.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No pending applications.</p>
            ) : (
              <div className="space-y-4">
                {pendingShops.map((shop) => (
                  <div
                    key={shop.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-lg border border-border p-4"
                  >
                    <div className="flex-1 min-w-0 flex items-start gap-4">
                      {shop.logo ? (
                        <img src={shop.logo} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="h-14 w-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                          <Store className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{shop.name}</p>
                        <p className="text-sm text-muted-foreground">/{shop.slug}</p>
                        {ownerByShopId[shop.id] && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Owner: {ownerByShopId[shop.id].full_name || ownerByShopId[shop.id].username || '—'}
                            {ownerByShopId[shop.id].username && (
                              <span className="ml-1">@{ownerByShopId[shop.id].username}</span>
                            )}
                          </p>
                        )}
                        {shop.bio && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{shop.bio}</p>}
                        {shop.created_at && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Applied {new Date(shop.created_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <Button size="sm" onClick={() => handleApprove(shop)} disabled={approvingId === shop.id || rejectingId === shop.id} className="bg-green-600 hover:bg-green-700">
                        {approvingId === shop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Approve</>}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(shop)} disabled={approvingId === shop.id || rejectingId === shop.id}>
                        {rejectingId === shop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4 mr-1" /> Reject</>}
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link to={`/shop/${shop.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" /> View
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All shops */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              All shops ({allShops.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {shopsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : allShops.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No shops yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 font-medium">Name</th>
                      <th className="text-left py-3 font-medium">Slug</th>
                      <th className="text-left py-3 font-medium">Owner</th>
                      <th className="text-left py-3 font-medium">Status</th>
                      <th className="text-left py-3 font-medium">Featured</th>
                      <th className="text-right py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allShops.map((shop) => (
                      <tr key={shop.id} className="border-b border-border/50">
                        <td className="py-3">{shop.name}</td>
                        <td className="py-3 text-muted-foreground">/{shop.slug}</td>
                        <td className="py-3 text-muted-foreground">
                          {ownerByShopId[shop.id]
                            ? [ownerByShopId[shop.id].full_name, ownerByShopId[shop.id].username && `@${ownerByShopId[shop.id].username}`].filter(Boolean).join(' ') || '—'
                            : '—'}
                        </td>
                        <td className="py-3">
                          <span className={shop.is_verified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>
                            {shop.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3">
                          {shop.is_verified && (
                            <Button
                              size="sm"
                              variant={(shop as Shop & { is_featured?: boolean }).is_featured ? 'default' : 'outline'}
                              onClick={() => handleToggleFeatured(shop)}
                              disabled={togglingFeaturedId === shop.id}
                              className="gap-1"
                            >
                              {togglingFeaturedId === shop.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className={`h-3.5 w-3.5 ${(shop as Shop & { is_featured?: boolean }).is_featured ? 'fill-current' : ''}`} />}
                              {(shop as Shop & { is_featured?: boolean }).is_featured ? 'Featured' : 'Feature'}
                            </Button>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link to={`/shop/${shop.slug}`} target="_blank" rel="noopener noreferrer">View</Link>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteShop(shop)}
                              disabled={deletingShopId === shop.id}
                            >
                              {deletingShopId === shop.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4 mr-1" /> Delete</>}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending Products */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Products ({allProducts.filter((p) => (p as Product & { is_trending?: boolean }).is_trending).length} selected)
            </CardTitle>
            <p className="text-sm text-muted-foreground">Toggle which products appear in the Trending section on the home page.</p>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : allProducts.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No products yet.</p>
            ) : (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background">
                    <tr className="border-b border-border">
                      <th className="text-left py-3 font-medium">Product</th>
                      <th className="text-left py-3 font-medium">Shop</th>
                      <th className="text-left py-3 font-medium">Price</th>
                      <th className="text-right py-3 font-medium">Trending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allProducts.map((product) => (
                      <tr key={product.id} className="border-b border-border/50">
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {product.product_images?.[0]?.image_url ? (
                              <img src={product.product_images[0].image_url} alt="" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-secondary shrink-0" />
                            )}
                            <span className="font-medium truncate max-w-[180px]">{product.name}</span>
                          </div>
                        </td>
                        <td className="py-3 text-muted-foreground">{product.shops?.name ?? '—'}</td>
                        <td className="py-3">${product.price.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          <Button
                            size="sm"
                            variant={(product as Product & { is_trending?: boolean }).is_trending ? 'default' : 'outline'}
                            onClick={() => handleToggleTrending(product)}
                            disabled={togglingTrendingId === product.id}
                            className="gap-1"
                          >
                            {togglingTrendingId === product.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <TrendingUp className="h-3.5 w-3.5" />}
                            {(product as Product & { is_trending?: boolean }).is_trending ? 'Trending' : 'Add'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order tracking */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Order tracking ({allOrders.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Update order status and tracking info. Changes apply to the order for the customer and seller.
            </p>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : allOrders.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background border-b border-border">
                    <tr>
                      <th className="text-left py-3 font-medium">Order</th>
                      <th className="text-left py-3 font-medium">Date</th>
                      <th className="text-left py-3 font-medium">Shop</th>
                      <th className="text-left py-3 font-medium">Customer</th>
                      <th className="text-right py-3 font-medium">Total</th>
                      <th className="text-left py-3 font-medium">Status</th>
                      <th className="text-left py-3 font-medium">Tracking</th>
                      <th className="text-right py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((order) => {
                      const draft = getOrderDraft(order);
                      const shopName = order.shops?.name ?? '—';
                      const customerName = order.customer_name || order.customer_email || `#${order.user_id.slice(0, 8)}`;
                      return (
                        <tr key={order.id} className="border-b border-border/50">
                          <td className="py-2 font-mono text-xs">
                            {order.order_number ?? order.id.slice(0, 8)}
                          </td>
                          <td className="py-2 text-muted-foreground whitespace-nowrap">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                          </td>
                          <td className="py-2">{shopName}</td>
                          <td className="py-2 max-w-[120px] truncate" title={customerName}>{customerName}</td>
                          <td className="py-2 text-right font-medium">${Number(order.total).toFixed(2)}</td>
                          <td className="py-2">
                            <select
                              value={draft.status}
                              onChange={(e) => setOrderDraft(order.id, 'status', e.target.value)}
                              className="h-8 rounded-md border border-input bg-background px-2 text-xs w-full max-w-[100px]"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td className="py-2">
                            <div className="flex flex-col gap-1 max-w-[180px]">
                              <input
                                type="text"
                                placeholder="Carrier"
                                value={draft.tracking_carrier}
                                onChange={(e) => setOrderDraft(order.id, 'tracking_carrier', e.target.value)}
                                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                              />
                              <input
                                type="text"
                                placeholder="Tracking number"
                                value={draft.tracking_number}
                                onChange={(e) => setOrderDraft(order.id, 'tracking_number', e.target.value)}
                                className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                              />
                            </div>
                          </td>
                          <td className="py-2 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateOrderTracking(order)}
                              disabled={updatingOrderId === order.id}
                            >
                              {updatingOrderId === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Update'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({users.length})
            </CardTitle>
            <p className="text-sm text-muted-foreground">Make users admins or remove accounts.</p>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-muted-foreground text-center py-12">No users yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 font-medium">Name</th>
                      <th className="text-left py-3 font-medium">Username</th>
                      <th className="text-left py-3 font-medium">Role</th>
                      <th className="text-left py-3 font-medium">Joined</th>
                      <th className="text-right py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((p) => {
                      const isSeller = allShops.some((s) => s.owner_id === p.id);
                      const displayRole = p.role === 'admin' ? 'Admin' : isSeller ? 'Seller' : 'Customer';
                      return (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-3">{p.full_name || '—'}</td>
                        <td className="py-3 text-muted-foreground">@{p.username ?? '—'}</td>
                        <td className="py-3">
                          {displayRole === 'Admin' && (
                            <span className="inline-flex items-center gap-1 text-primary font-medium">
                              <Shield className="h-4 w-4" /> Admin
                            </span>
                          )}
                          {displayRole === 'Seller' && (
                            <span className="inline-flex items-center gap-1 text-muted-foreground">
                              <Store className="h-4 w-4" /> Seller
                            </span>
                          )}
                          {displayRole === 'Customer' && (
                            <span className="text-muted-foreground">Customer</span>
                          )}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-3 text-right">
                          <div className="flex justify-end gap-2 flex-wrap">
                            {p.id !== user.id && (
                              <>
                                {p.role === 'admin' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSetAdmin(p, false)}
                                    disabled={updatingRoleId === p.id}
                                  >
                                    {updatingRoleId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Remove admin'}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleSetAdmin(p, true)}
                                    disabled={updatingRoleId === p.id}
                                  >
                                    {updatingRoleId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Shield className="h-4 w-4 mr-1" /> Make admin</>}
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteUser(p)}
                                  disabled={deletingUserId === p.id}
                                >
                                  {deletingUserId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Trash2 className="h-4 w-4 mr-1" /> Delete user</>}
                                </Button>
                              </>
                            )}
                            {p.id === user.id && <span className="text-muted-foreground text-xs">(you)</span>}
                          </div>
                        </td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboardPage;

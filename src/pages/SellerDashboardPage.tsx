import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import {
  Package,
  Plus,
  Star,
  MessageSquare,
  Loader2,
  Store,
  Settings,
  ShoppingCart,
  Phone,
  Mail,
} from 'lucide-react';

type Shop = Tables<'shops'>;
type Product = Tables<'products'>;
type Review = Tables<'reviews'> & { products?: { name: string } | null };
type OrderRow = Tables<'orders'> & {
  order_items?: (Tables<'order_items'> & { products?: { name: string } | null })[];
};

type CustomerProfile = { id: string; full_name: string | null; username: string };

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const SellerDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [shop, setShop] = useState<Shop | null>(null);
  const [shopLoading, setShopLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPrice, setAddPrice] = useState('');
  const [addDescription, setAddDescription] = useState('');
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [customerByUserId, setCustomerByUserId] = useState<Record<string, CustomerProfile>>({});
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [savingContact, setSavingContact] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  const handleMarkDelivered = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    await supabase.from('orders').update({ status: 'delivered' }).eq('id', orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o))
    );
    setUpdatingOrderId(null);
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop) return;
    setSavingContact(true);
    const { error } = await supabase
      .from('shops')
      .update({
        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
      } as Record<string, unknown>)
      .eq('id', shop.id);
    setSavingContact(false);
    if (error) {
      toast({ title: 'Could not save contact info', description: error.message, variant: 'destructive' });
      return;
    }
    setShop((prev) => prev ? { ...prev, contact_email: contactEmail.trim() || null, contact_phone: contactPhone.trim() || null } as Shop : null);
    setIsEditingContact(false);
    toast({ title: 'Contact info saved', description: 'Call and email buttons will now show on your shop page.' });
  };

  useEffect(() => {
    if (!user) {
      setShopLoading(false);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('shops')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      setShop(data ?? null);
      setShopLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!shop) return;
    const row = shop as Shop & { contact_email?: string | null; contact_phone?: string | null };
    setContactEmail(row.contact_email ?? '');
    setContactPhone(row.contact_phone ?? '');
    setIsEditingContact(false);
  }, [shop]);

  useEffect(() => {
    if (!shop) return;
    setProductsLoading(true);
    supabase
      .from('products')
      .select('*')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setProducts(data ?? []);
        setProductsLoading(false);
      });
  }, [shop]);

  useEffect(() => {
    if (!shop) return;
    setReviewsLoading(true);
    supabase
      .from('products')
      .select('id')
      .eq('shop_id', shop.id)
      .then(({ data: prods }) => {
        const ids = (prods ?? []).map((p) => p.id);
        if (ids.length === 0) {
          setReviews([]);
          setReviewsLoading(false);
          return;
        }
        supabase
          .from('reviews')
          .select('*, products(name)')
          .in('product_id', ids)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            setReviews((data ?? []) as Review[]);
            setReviewsLoading(false);
          });
      });
  }, [shop]);

  useEffect(() => {
    if (!shop) return;
    setOrdersLoading(true);
    supabase
      .from('orders')
      .select('*, order_items(*, products(name))')
      .eq('shop_id', shop.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as OrderRow[];
        setOrders(list);
        setOrdersLoading(false);
        const userIds = [...new Set(list.map((o) => o.user_id).filter(Boolean))];
        if (userIds.length === 0) {
          setCustomerByUserId({});
          return;
        }
        supabase
          .from('profiles')
          .select('id, full_name, username')
          .in('id', userIds)
          .then(({ data: profiles }) => {
            const map: Record<string, CustomerProfile> = {};
            (profiles ?? []).forEach((p: { id: string; full_name: string | null; username: string }) => {
              map[p.id] = { id: p.id, full_name: p.full_name ?? null, username: p.username ?? '—' };
            });
            setCustomerByUserId(map);
          });
      });
  }, [shop]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shop || !user) return;
    setAddError(null);
    const name = addName.trim();
    const price = parseFloat(addPrice);
    if (!name || isNaN(price) || price < 0) {
      setAddError('Name and a valid price are required.');
      return;
    }
    if (!addImageFile) {
      setAddError('Please add a product image.');
      return;
    }
    setAdding(true);
    try {
      const slug = slugFromName(name) || 'product-' + Date.now();
      const { data: product, error: insertErr } = await supabase
        .from('products')
        .insert({
          shop_id: shop.id,
          name,
          slug,
          price,
          description: addDescription.trim() || null,
          in_stock: true,
          stock_count: null,
          rating: null,
          review_count: null,
          like_count: null,
        })
        .select('id')
        .single();
      if (insertErr) {
        setAddError(insertErr.message);
        setAdding(false);
        return;
      }
      const ext = addImageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `products/${shop.id}/${product.id}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('shop-assets')
        .upload(path, addImageFile, { cacheControl: '3600', upsert: false });
      if (uploadErr) {
        setAddError('Product created but image upload failed: ' + uploadErr.message);
        setAdding(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('shop-assets').getPublicUrl(path);
      await supabase.from('product_images').insert({
        product_id: product.id,
        image_url: urlData.publicUrl,
      });
      const { data: updated } = await supabase
        .from('products')
        .select('*')
        .eq('shop_id', shop.id)
        .order('created_at', { ascending: false });
      setProducts(updated ?? []);
      setAddOpen(false);
      setAddName('');
      setAddPrice('');
      setAddDescription('');
      setAddImageFile(null);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Something went wrong.');
    }
    setAdding(false);
  };

  const handleReply = async (reviewId: string) => {
    const text = replyDraft[reviewId]?.trim();
    if (!text) return;
    setReplyingId(reviewId);
    const { data, error } = await supabase
      .from('reviews')
      .update({ owner_reply: text, owner_replied_at: new Date().toISOString() })
      .eq('id', reviewId)
      .select('id')
      .single();
    setReplyingId(null);
    setEditingReplyId(null);
    if (error) {
      toast({
        title: 'Could not save reply',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    if (!data) {
      toast({
        title: 'Could not save reply',
        description: 'You may not have permission to reply to this review.',
        variant: 'destructive',
      });
      return;
    }
    setReplyDraft((prev) => ({ ...prev, [reviewId]: '' }));
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, owner_reply: text, owner_replied_at: new Date().toISOString() }
          : r
      )
    );
    toast({ title: 'Reply saved', description: 'Your reply has been published.' });
  };

  const startEditReply = (r: Review) => {
    setEditingReplyId(r.id);
    setReplyDraft((prev) => ({ ...prev, [r.id]: r.owner_reply ?? '' }));
  };

  if (authLoading || shopLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-12 flex justify-center items-center">
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

  if (!shop) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container py-8 sm:py-12 px-4 sm:px-6 text-center">
          <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">No shop yet</h1>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Open a shop to start selling and managing products and reviews.
          </p>
          <Button asChild>
            <Link to="/open-shop">Open a shop</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container py-8 sm:py-12 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-3xl font-bold">{shop.name}</h1>
            <p className="text-muted-foreground mt-1">Manage your products and reply to reviews.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to={`/shop/${shop.slug}`}>
                <Store className="h-4 w-4 mr-1" />
                View shop
              </Link>
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="h-4 w-4" />
              <Mail className="h-4 w-4" />
              Shop contact (Call & Email on your shop page)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These appear as call and email buttons on your public shop page. Add them so customers can reach you.
            </p>
          </CardHeader>
          <CardContent>
            {(() => {
              const row = shop as Shop & { contact_email?: string | null; contact_phone?: string | null };
              const hasSavedContact = (row.contact_email?.trim() || row.contact_phone?.trim()) ?? false;
              const showReadOnly = hasSavedContact && !isEditingContact;

              if (showReadOnly) {
                return (
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                    <div className="flex-1 space-y-2">
                      <Label>Email</Label>
                      <p className="text-sm font-medium text-foreground py-2">{contactEmail || '—'}</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Phone</Label>
                      <p className="text-sm font-medium text-foreground py-2">{contactPhone || '—'}</p>
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" onClick={() => setIsEditingContact(true)}>
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              }

              return (
                <form onSubmit={handleSaveContact} className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="contact_email">Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      placeholder="shop@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="contact_phone">Phone</Label>
                    <Input
                      id="contact_phone"
                      type="tel"
                      placeholder="+263 77 123 4567"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <Button type="submit" disabled={savingContact}>
                      {savingContact ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                    {hasSavedContact && (
                      <Button type="button" variant="ghost" onClick={() => setIsEditingContact(false)}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              );
            })()}
          </CardContent>
        </Card>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Your products</CardTitle>
                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Add product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add product</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      {addError && (
                        <p className="text-sm text-destructive">{addError}</p>
                      )}
                      <div>
                        <Label htmlFor="name">Product name *</Label>
                        <Input
                          id="name"
                          value={addName}
                          onChange={(e) => setAddName(e.target.value)}
                          placeholder="e.g. Blue Running Shoes"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={addPrice}
                          onChange={(e) => setAddPrice(e.target.value)}
                          placeholder="0.00"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={addDescription}
                          onChange={(e) => setAddDescription(e.target.value)}
                          placeholder="Describe your product..."
                          rows={3}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label>Product image *</Label>
                        <div className="mt-1 flex items-center gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setAddImageFile(e.target.files?.[0] ?? null)}
                          />
                          {addImageFile && (
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {addImageFile.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAddOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={adding}>
                          {adding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Add product'
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : products.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No products yet. Add your first product to start selling.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {products.map((p) => (
                      <li
                        key={p.id}
                        className="flex items-center justify-between rounded-lg border border-border p-3"
                      >
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ${Number(p.price).toFixed(2)}
                            {p.description && ` · ${p.description.slice(0, 50)}${p.description.length > 50 ? '…' : ''}`}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer">
                            View
                          </Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Orders</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Orders from customers for your store.
                </p>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : orders.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No orders yet. Orders will appear here when customers buy your products.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {orders.map((order) => {
                      const customer = order.user_id ? customerByUserId[order.user_id] : null;
                      const isPending = (order.status ?? 'pending') === 'pending';
                      return (
                        <li
                          key={order.id}
                          className="rounded-lg border border-border p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-mono text-muted-foreground">
                              {order.order_number ?? `#${order.id.slice(0, 8)}`}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {order.created_at
                                ? new Date(order.created_at).toLocaleString()
                                : '—'}
                            </span>
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 text-xs font-medium',
                                order.status === 'delivered'
                                  ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                  : order.status === 'cancelled'
                                    ? 'bg-destructive/20 text-destructive'
                                    : 'bg-primary/20 text-primary'
                              )}
                            >
                              {order.status ?? 'pending'}
                            </span>
                          </div>
                          {/* Customer & shipping details (from checkout form) */}
                          <div className="rounded-md bg-muted/50 p-3 text-sm space-y-2">
                            <p className="font-medium text-muted-foreground">Customer & shipping</p>
                            {(order.customer_name ?? order.customer_email) ? (
                              <>
                                <p className="text-foreground font-medium">
                                  {order.customer_name || customer?.full_name || (customer ? `@${customer.username}` : null) || '—'}
                                  {customer && !order.customer_name && (
                                    <span className="text-muted-foreground font-normal"> (@{customer.username})</span>
                                  )}
                                </p>
                                {order.customer_email && (
                                  <p className="text-foreground">
                                    <a href={`mailto:${order.customer_email}`} className="text-primary hover:underline">
                                      {order.customer_email}
                                    </a>
                                  </p>
                                )}
                                {order.customer_phone && (
                                  <p className="text-foreground">
                                    <a href={`tel:${order.customer_phone}`} className="text-primary hover:underline">
                                      {order.customer_phone}
                                    </a>
                                  </p>
                                )}
                                {(order.shipping_address || order.shipping_city) && (
                                  <p className="text-muted-foreground">
                                    {[order.shipping_address, [order.shipping_city, order.shipping_state, order.shipping_zip_code].filter(Boolean).join(', '), order.shipping_country].filter(Boolean).join(', ')}
                                  </p>
                                )}
                                {order.shipping_method && (
                                  <p className="text-muted-foreground capitalize">
                                    Shipping: {order.shipping_method.replace(/-/g, ' ')}
                                  </p>
                                )}
                              </>
                            ) : customer ? (
                              <p className="text-foreground">
                                {customer.full_name || 'No name'}{' '}
                                <span className="text-muted-foreground">(@{customer.username})</span>
                              </p>
                            ) : (
                              <p className="text-muted-foreground">No contact details</p>
                            )}
                          </div>
                          <p className="font-semibold">${Number(order.total).toFixed(2)} total</p>
                          {order.order_items && order.order_items.length > 0 && (
                            <ul className="space-y-1 text-sm text-muted-foreground border-t border-border pt-2">
                              {order.order_items.map((oi) => (
                                <li key={oi.id} className="flex justify-between">
                                  <span>
                                    {oi.products?.name ?? 'Product'} × {oi.quantity}
                                  </span>
                                  <span>${Number(oi.price * oi.quantity).toFixed(2)}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          {isPending && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full sm:w-auto"
                              disabled={updatingOrderId === order.id}
                              onClick={() => handleMarkDelivered(order.id)}
                            >
                              {updatingOrderId === order.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Mark as delivered'
                              )}
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer reviews</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Reply to reviews for your products.
                </p>
              </CardHeader>
              <CardContent>
                {reviewsLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12">
                    No reviews yet. Reviews will appear here when customers leave them on your products.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {reviews.map((r) => (
                      <li
                        key={r.id}
                        className="rounded-lg border border-border p-4 space-y-2"
                      >
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">
                            {r.products?.name ?? 'Product'}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            {r.rating ?? '—'}
                          </span>
                          <span>·</span>
                          <span>
                            {r.created_at
                              ? new Date(r.created_at).toLocaleDateString()
                              : ''}
                          </span>
                        </div>
                        <p className="text-foreground">{r.comment || 'No comment'}</p>
                        {r.owner_reply && editingReplyId !== r.id ? (
                          <div className="rounded-md bg-muted/50 p-3 text-sm">
                            <p className="font-medium text-muted-foreground mb-1">Your reply</p>
                            <p>{r.owner_reply}</p>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="mt-2 h-8 text-xs"
                              onClick={() => startEditReply(r)}
                            >
                              Edit reply
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label htmlFor={`reply-${r.id}`} className="sr-only">
                                Reply
                              </Label>
                              <Textarea
                                id={`reply-${r.id}`}
                                placeholder="Write a reply..."
                                value={replyDraft[r.id] ?? ''}
                                onChange={(e) =>
                                  setReplyDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                                }
                                rows={2}
                                className="resize-none"
                              />
                            </div>
                            <div className="flex gap-2">
                              {editingReplyId === r.id && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingReplyId(null);
                                    setReplyDraft((prev) => ({ ...prev, [r.id]: '' }));
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleReply(r.id)}
                                disabled={!replyDraft[r.id]?.trim() || replyingId === r.id}
                              >
                                {replyingId === r.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : r.owner_reply ? (
                                  'Update reply'
                                ) : (
                                  'Reply'
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default SellerDashboardPage;

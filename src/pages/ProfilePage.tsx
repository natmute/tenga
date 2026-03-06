import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Package,
  Heart,
  UserPlus,
  Store,
  Shield,
  Loader2,
  LogOut,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type ProfileRow = {
  id: string;
  user_id: string | null;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  role: string | null;
};

const ProfilePage = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [hasShop, setHasShop] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .or(`id.eq.${user.id},user_id.eq.${user.id}`)
        .maybeSingle();

      const row = profileData as ProfileRow | null;
      setProfile(row ?? null);
      if (row) {
        setEditName(row.full_name ?? '');
        setEditPhone((row as { phone?: string | null }).phone ?? '');
        setIsAdmin(row.role === 'admin');
      } else {
        setEditName(user.user_metadata?.full_name ?? '');
        setEditPhone('');
      }

      const { data: shopData } = await supabase
        .from('shops')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();
      setHasShop(!!shopData);
      setLoading(false);
    })();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const fullName = editName.trim() || null;
    const phone = editPhone.trim() || null;

    if (profile?.id) {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone } as Record<string, unknown>)
        .eq('id', profile.id);
      setSaving(false);
      if (error) {
        toast({ title: 'Could not update profile', description: error.message, variant: 'destructive' });
        return;
      }
      setProfile((prev) => (prev ? { ...prev, full_name: fullName, phone } : null));
    } else {
      const { error } = await supabase.from('profiles').insert({
        user_id: user.id,
        full_name: fullName,
        phone: phone || null,
        username: user.email?.replace(/@.*/, '') ?? `user_${user.id.slice(0, 8)}`,
      } as Record<string, unknown>);
      setSaving(false);
      if (error) {
        toast({ title: 'Could not save profile', description: error.message, variant: 'destructive' });
        return;
      }
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
      setProfile((data as ProfileRow) ?? null);
    }
    setEditing(false);
    toast({ title: 'Profile updated' });
  };

  const handleCancelEdit = () => {
    setEditName(profile?.full_name ?? '');
    setEditPhone(profile?.phone ?? '');
    setEditing(false);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/auth', { replace: true });
    return null;
  }

  const displayName = profile?.full_name?.trim() || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(/\s+/)
    .map((s) => s[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <CartDrawer />
      <main className="container max-w-2xl mx-auto py-6 sm:py-8 px-4 sm:px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6"
        >
          My Profile
        </motion.h1>

        {(profile?.role === 'admin' || isAdmin) && (
          <Button asChild className="w-full sm:w-auto mb-4 sm:mb-6 min-h-[44px]" size="lg">
            <Link to="/admin" className="inline-flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Go to Admin dashboard
            </Link>
          </Button>
        )}

        <Card className="mb-4 sm:mb-6 overflow-hidden">
          <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex justify-center sm:justify-start flex-shrink-0">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl sm:rounded-2xl">
                  <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                  <AvatarFallback className="rounded-xl sm:rounded-2xl text-xl sm:text-2xl bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1 min-w-0 space-y-3 sm:space-y-4">
                {!editing ? (
                  <>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Full name</p>
                      <p className="font-medium text-base sm:text-lg break-words">{displayName || '—'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-sm sm:text-base break-all">{user.email ?? '—'}</p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-base sm:text-lg break-words">{profile?.phone?.trim() || '—'}</p>
                    </div>
                    {profile?.username && (
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm text-muted-foreground">Username</p>
                        <p className="font-medium break-words">@{profile.username}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(profile?.role === 'admin' || isAdmin) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 sm:px-3 py-1 text-xs font-medium text-primary">
                          <Shield className="h-3.5 w-3.5 flex-shrink-0" />
                          Admin
                        </span>
                      )}
                      {hasShop && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 sm:px-3 py-1 text-xs font-medium text-secondary-foreground">
                          <Store className="h-3.5 w-3.5 flex-shrink-0" />
                          Seller
                        </span>
                      )}
                      {!hasShop && profile?.role !== 'admin' && (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 sm:px-3 py-1 text-xs font-medium text-muted-foreground">
                          Customer
                        </span>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 min-h-[44px] px-4 touch-manipulation"
                      onClick={() => setEditing(true)}
                    >
                      <Pencil className="h-4 w-4 mr-2 flex-shrink-0" />
                      Edit profile
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="min-w-0">
                      <Label htmlFor="profile-name" className="text-sm">Full name</Label>
                      <Input
                        id="profile-name"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Your name"
                        className="mt-1.5 min-h-[44px] text-base sm:text-sm"
                      />
                    </div>
                    <div className="min-w-0">
                      <Label className="text-sm text-muted-foreground">Email</Label>
                      <p className="mt-1.5 font-medium text-foreground text-sm sm:text-base break-all">{user.email ?? '—'}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Email cannot be changed here.</p>
                    </div>
                    <div className="min-w-0">
                      <Label htmlFor="profile-phone" className="text-sm">Phone number</Label>
                      <Input
                        id="profile-phone"
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        placeholder="Your phone number"
                        className="mt-1.5 min-h-[44px] text-base sm:text-sm"
                      />
                    </div>
                    <div className="flex flex-col xs:flex-row gap-2 pt-1">
                      <Button
                        size="sm"
                        className="min-h-[44px] flex-1 touch-manipulation"
                        onClick={handleSaveProfile}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-1.5" />}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="min-h-[44px] flex-1 touch-manipulation"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4 mr-1.5" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <UserIcon className="h-4 w-4 flex-shrink-0" />
              Quick links
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pt-0 pb-4 sm:pb-6 space-y-0.5">
            <Link
              to="/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-3.5 min-h-[48px] text-foreground hover:bg-secondary active:bg-secondary transition-colors touch-manipulation"
            >
              <Package className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-base">Order history</span>
            </Link>
            <Link
              to="/wishlist"
              className="flex items-center gap-3 rounded-lg px-3 py-3.5 min-h-[48px] text-foreground hover:bg-secondary active:bg-secondary transition-colors touch-manipulation"
            >
              <Heart className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-base">Wishlist</span>
            </Link>
            <Link
              to="/following"
              className="flex items-center gap-3 rounded-lg px-3 py-3.5 min-h-[48px] text-foreground hover:bg-secondary active:bg-secondary transition-colors touch-manipulation"
            >
              <UserPlus className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-base">Following</span>
            </Link>
            {hasShop ? (
              <Link
                to="/seller-dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-3.5 min-h-[48px] text-foreground hover:bg-secondary active:bg-secondary transition-colors touch-manipulation"
              >
                <Store className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-base">Seller dashboard</span>
              </Link>
            ) : (
              <Link
                to="/open-shop"
                className="flex items-center gap-3 rounded-lg px-3 py-3.5 min-h-[48px] text-foreground hover:bg-secondary active:bg-secondary transition-colors touch-manipulation"
              >
                <Store className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-base">Open a shop</span>
              </Link>
            )}
            {(profile?.role === 'admin' || isAdmin) && (
              <Link
                to="/admin"
                className="flex items-center gap-3 rounded-lg px-3 py-3.5 min-h-[48px] text-foreground hover:bg-secondary active:bg-secondary transition-colors touch-manipulation"
              >
                <Shield className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="text-base">Admin</span>
              </Link>
            )}
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3.5 min-h-[48px] text-left text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:bg-destructive/15 transition-colors touch-manipulation"
              onClick={() => signOut().then(() => navigate('/'))}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className="text-base">Sign out</span>
            </button>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;

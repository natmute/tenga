import { useState, useEffect, useRef } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string | null;
};

type SenderProfile = { full_name: string | null; username: string | null; avatar_url: string | null };

type ShopMessagePanelProps = {
  shop: { id: string; name: string };
  ownerId?: string | null;
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function getInitials(name: string | null, username: string | null): string {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  if (username?.trim()) return username.slice(0, 2).toUpperCase();
  return '?';
}

export function ShopMessagePanel({ shop, ownerId, userId, open, onOpenChange }: ShopMessagePanelProps) {
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [senderProfiles, setSenderProfiles] = useState<Record<string, SenderProfile>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!open || !userId) {
      setConversationId(null);
      setMessages([]);
      setDraft('');
      setSenderProfiles({});
      return;
    }
    setLoading(true);
    (async () => {
      const { data: conv } = await supabase
        .from('shop_conversations')
        .select('id')
        .eq('shop_id', shop.id)
        .eq('customer_id', userId)
        .maybeSingle();
      if (conv) {
        setConversationId(conv.id);
        const { data: msgs } = await supabase
          .from('shop_messages')
          .select('id, conversation_id, sender_id, content, created_at')
          .eq('conversation_id', conv.id)
          .order('created_at', { ascending: true });
        setMessages((msgs ?? []) as Message[]);

        const ids = [userId];
        if (ownerId) ids.push(ownerId);
        const profiles: Record<string, SenderProfile> = {};
        for (const id of ids) {
          const byId = await supabase.from('profiles').select('full_name, username, avatar_url').eq('id', id).maybeSingle();
          if (byId.data) {
            profiles[id] = { full_name: byId.data.full_name, username: byId.data.username, avatar_url: byId.data.avatar_url };
          } else {
            const byUserId = await supabase.from('profiles').select('full_name, username, avatar_url').eq('user_id', id).maybeSingle();
            if (byUserId.data) profiles[id] = { full_name: byUserId.data.full_name, username: byUserId.data.username, avatar_url: byUserId.data.avatar_url };
          }
        }
        setSenderProfiles(profiles);
      } else {
        setConversationId(null);
        setMessages([]);
        if (ownerId || userId) {
          const ids = [userId];
          if (ownerId) ids.push(ownerId);
          const profiles: Record<string, SenderProfile> = {};
          for (const id of ids) {
            const byId = await supabase.from('profiles').select('full_name, username, avatar_url').eq('id', id).maybeSingle();
            if (byId.data) profiles[id] = { full_name: byId.data.full_name, username: byId.data.username, avatar_url: byId.data.avatar_url };
            else {
              const byUserId = await supabase.from('profiles').select('full_name, username, avatar_url').eq('user_id', id).maybeSingle();
              if (byUserId.data) profiles[id] = { full_name: byUserId.data.full_name, username: byUserId.data.username, avatar_url: byUserId.data.avatar_url };
            }
          }
          setSenderProfiles(profiles);
        }
      }
      setLoading(false);
    })();
  }, [open, userId, shop.id, ownerId]);

  useEffect(() => {
    if (messages.length) scrollToBottom();
  }, [messages.length]);

  const sendMessage = async () => {
    const content = draft.trim();
    if (!content || !userId) return;
    setSending(true);
    try {
      let cid = conversationId;
      if (!cid) {
        const { data: inserted, error: insertErr } = await supabase
          .from('shop_conversations')
          .upsert(
            { shop_id: shop.id, customer_id: userId, updated_at: new Date().toISOString() },
            { onConflict: 'shop_id,customer_id' }
          )
          .select('id')
          .single();
        if (insertErr) throw insertErr;
        cid = inserted?.id ?? null;
        setConversationId(cid);
      }
      if (!cid) throw new Error('Could not get conversation');
      const { error } = await supabase.from('shop_messages').insert({
        conversation_id: cid,
        sender_id: userId,
        content,
      });
      if (error) throw error;
      setDraft('');
      const { data: msgs } = await supabase
        .from('shop_messages')
        .select('id, conversation_id, sender_id, content, created_at')
        .eq('conversation_id', cid)
        .order('created_at', { ascending: true });
      setMessages((msgs ?? []) as Message[]);
      scrollToBottom();
    } catch (e) {
      toast({
        title: 'Could not send message',
        description: (e as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b px-4 py-3">
          <SheetTitle className="text-left">Message {shop.name}</SheetTitle>
        </SheetHeader>
        {!userId ? (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-muted-foreground">
            Sign in to message the seller.
          </div>
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.length === 0 && !loading && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No messages yet. Say hello to start the conversation.
                </p>
              )}
              {messages.map((m) => {
                const isMe = m.sender_id === userId;
                const profile = senderProfiles[m.sender_id];
                const displayName = profile?.full_name || profile?.username || (isMe ? 'You' : shop.name);
                return (
                  <div
                    key={m.id}
                    className={cn(
                      'flex gap-2',
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
                      <AvatarFallback className="text-xs">{getInitials(profile?.full_name ?? null, profile?.username ?? null)}</AvatarFallback>
                    </Avatar>
                    <div className={cn('flex flex-col min-w-0 max-w-[85%]', isMe ? 'items-end' : 'items-start')}>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">{displayName}</p>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2 text-sm',
                          isMe
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        )}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                        {m.created_at && (
                          <p
                            className={cn(
                              'text-xs mt-1',
                              isMe ? 'text-primary-foreground/80' : 'text-muted-foreground'
                            )}
                          >
                            {new Date(m.created_at).toLocaleString(undefined, {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={handleSubmit}
              className="border-t p-3 flex gap-2 items-end"
            >
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 min-h-10"
                disabled={sending}
                maxLength={2000}
              />
              <Button type="submit" size="icon" disabled={sending || !draft.trim()}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Simple frontend-only chat service using localStorage
export type Message = {
  id: string;
  senderId: string;
  senderRole: 'job_seeker' | 'recruiter' | string;
  text: string;
  createdAt: string;
};

function conversationKey(a: string, b: string) {
  const pair = [a || 'unknown', b || 'unknown'].sort();
  return `chat:${pair[0]}:${pair[1]}`;
}

export function getConversations(currentUserId: string) {
  const conversations: Array<{ partnerId: string; lastMessage?: Message }> = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) as string;
    if (!key?.startsWith('chat:')) continue;
    const parts = key.split(':');
    if (parts.length < 3) continue;
    const [, idA, idB] = parts;
    if (idA !== currentUserId && idB !== currentUserId) continue;
    const partnerId = idA === currentUserId ? idB : idA;
    try {
      const raw = localStorage.getItem(key);
      const msgs: Message[] = raw ? JSON.parse(raw) : [];
      const lastMessage = msgs.length ? msgs[msgs.length - 1] : undefined;
      conversations.push({ partnerId, lastMessage });
    } catch (e) {
      // ignore invalid JSON
    }
  }

  // sort by last message time desc
  conversations.sort((a, b) => {
    const ta = a.lastMessage ? Date.parse(a.lastMessage.createdAt) : 0;
    const tb = b.lastMessage ? Date.parse(b.lastMessage.createdAt) : 0;
    return tb - ta;
  });

  return conversations;
}

export function getMessages(currentUserId: string, partnerId: string): Message[] {
  const key = conversationKey(currentUserId, partnerId);
  try {
    const raw = localStorage.getItem(key);
    const msgs: Message[] = raw ? JSON.parse(raw) : [];
    return msgs;
  } catch (e) {
    return [];
  }
}

export function sendMessage(
  currentUserId: string,
  partnerId: string,
  senderRole: string,
  text: string,
) {
  const key = conversationKey(currentUserId, partnerId);
  const now = new Date().toISOString();
  const msg: Message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    senderId: currentUserId,
    senderRole,
    text,
    createdAt: now,
  };

  const msgs = getMessages(currentUserId, partnerId);
  msgs.push(msg);
  localStorage.setItem(key, JSON.stringify(msgs));

  // dispatch a storage event for same-tab listeners (some browsers don't trigger storage in same tab)
  try {
    const event = new Event('storage');
    window.dispatchEvent(event);
  } catch (e) {}

  return msg;
}

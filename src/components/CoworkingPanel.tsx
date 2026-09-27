import { useEffect, useState, useRef, useCallback } from 'react';
import { Users, Plus, ArrowLeft, Crown, Radio, Lock, Share2, UserCog, Send, MessageCircle } from 'lucide-react';
import { supabase, type Room, type RoomMember, type RoomMessage, type TimerMode } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { MODE_LABELS, MODE_COLORS } from '@/lib/constants';

export default function CoworkingPanel() {
  const { session, profile } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [passwordRoom, setPasswordRoom] = useState<Room | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [showJoinByCode, setShowJoinByCode] = useState(false);

  const loadRooms = useCallback(async () => {
    const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
    if (data) setRooms(data as Room[]);
  }, []);

  useEffect(() => {
    if (activeRoom) return;
    loadRooms();
  }, [activeRoom, loadRooms]);

  async function createRoom() {
    if (!newName.trim() || !session) return;
    const { data } = await supabase
      .from('rooms')
      .insert({
        name: newName.trim(),
        description: newDesc.trim() || null,
        host_id: session.user.id,
        password_hash: newPassword.trim() || null,
      })
      .select('*')
      .single();
    if (data) {
      setRooms((prev) => [data as Room, ...prev]);
      setNewName('');
      setNewDesc('');
      setNewPassword('');
      setShowCreate(false);
      joinRoom(data as Room);
    }
  }

  async function joinRoom(room: Room, password?: string) {
    if (!session || !profile) return;
    if (room.password_hash && password !== room.password_hash) {
      setPasswordRoom(room);
      return;
    }
    await supabase.from('room_members').upsert({
      room_id: room.id,
      user_id: session.user.id,
      display_name: profile.display_name,
      last_seen: new Date().toISOString(),
      is_host: session.user.id === room.host_id,
    });
    setActiveRoom(room);
    setPasswordRoom(null);
    setJoinPassword('');
  }

  async function joinByCode() {
    if (!joinCode.trim() || !session) return;
    const { data } = await supabase.from('rooms').select('*').eq('invite_code', joinCode.trim().toUpperCase()).maybeSingle();
    if (data) {
      joinRoom(data as Room);
      setJoinCode('');
      setShowJoinByCode(false);
    }
  }

  async function leaveRoom() {
    if (!activeRoom || !session) return;
    await supabase.from('room_members').delete().eq('room_id', activeRoom.id).eq('user_id', session.user.id);
    setActiveRoom(null);
    setMembers([]);
    setMessages([]);
  }

  useEffect(() => {
    if (!activeRoom) return;

    const channel = supabase
      .channel(`room-${activeRoom.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${activeRoom.id}` },
        () => { loadMembers(activeRoom.id); }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${activeRoom.id}` },
        (payload) => { if (payload.new) setActiveRoom(payload.new as Room); }
      )
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_messages', filter: `room_id=eq.${activeRoom.id}` },
        (payload) => {
          if (payload.new) setMessages((prev) => [...prev, payload.new as RoomMessage]);
        }
      )
      .subscribe();

    loadMembers(activeRoom.id);
    loadMessages(activeRoom.id);

    const heartbeat = setInterval(() => {
      if (session) {
        supabase.from('room_members')
          .update({ last_seen: new Date().toISOString() })
          .eq('room_id', activeRoom.id)
          .eq('user_id', session.user.id);
      }
    }, 15000);

    return () => {
      clearInterval(heartbeat);
      supabase.removeChannel(channel);
    };
  }, [activeRoom, session]);

  async function loadMembers(roomId: string) {
    const { data } = await supabase.from('room_members').select('*').eq('room_id', roomId);
    if (data) setMembers(data as RoomMember[]);
  }

  async function loadMessages(roomId: string) {
    const { data } = await supabase.from('room_messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true }).limit(50);
    if (data) setMessages(data as RoomMessage[]);
  }

  async function updateRoomTimer(mode: TimerMode, startedAt: string | null, duration: number) {
    if (!activeRoom || !session || session.user.id !== activeRoom.host_id) return;
    await supabase.from('rooms').update({
      current_mode: mode, started_at: startedAt, duration_seconds: duration,
    }).eq('id', activeRoom.id);
  }

  async function transferHost(targetUserId: string) {
    if (!activeRoom || !session || session.user.id !== activeRoom.host_id) return;
    await supabase.from('rooms').update({ new_host_id: targetUserId }).eq('id', activeRoom.id);
  }

  async function acceptHost() {
    if (!activeRoom || !session || session.user.id !== activeRoom.new_host_id) return;
    await supabase.from('rooms').update({
      host_id: session.user.id,
      new_host_id: null,
    }).eq('id', activeRoom.id);
    await supabase.from('room_members')
      .update({ is_host: true })
      .eq('room_id', activeRoom.id)
      .eq('user_id', session.user.id);
  }

  async function sendMessage(content: string) {
    if (!activeRoom || !session || !profile || !content.trim()) return;
    await supabase.from('room_messages').insert({
      room_id: activeRoom.id,
      user_id: session.user.id,
      display_name: profile.display_name,
      content: content.trim(),
    });
  }

  async function deleteRoom() {
    if (!activeRoom || !session || session.user.id !== activeRoom.host_id) return;
    await supabase.from('rooms').delete().eq('id', activeRoom.id);
    setActiveRoom(null);
    setMembers([]);
    setMessages([]);
  }

  if (passwordRoom) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="mb-4 flex items-center gap-2">
            <Lock size={18} className="text-orange-400" />
            <h3 className="font-semibold text-white">Şifreli Oda</h3>
          </div>
          <p className="mb-4 text-sm text-slate-400">{passwordRoom.name} odası şifre korumalı.</p>
          <input
            type="password"
            value={joinPassword}
            onChange={(e) => setJoinPassword(e.target.value)}
            placeholder="Oda şifresi"
            className="mb-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50"
            onKeyDown={(e) => { if (e.key === 'Enter') joinRoom(passwordRoom, joinPassword); }}
          />
          <div className="flex gap-2">
            <button
              onClick={() => joinRoom(passwordRoom, joinPassword)}
              className="flex-1 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg"
            >
              Katıl
            </button>
            <button
              onClick={() => setPasswordRoom(null)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/10"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (activeRoom) {
    return (
      <RoomView
        room={activeRoom}
        members={members}
        messages={messages}
        isHost={session?.user.id === activeRoom.host_id}
        isPendingHost={session?.user.id === activeRoom.new_host_id}
        currentUserId={session?.user.id || ''}
        onLeave={leaveRoom}
        onUpdateTimer={updateRoomTimer}
        onTransferHost={transferHost}
        onAcceptHost={acceptHost}
        onSendMessage={sendMessage}
        onDeleteRoom={deleteRoom}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={22} className="text-orange-400" />
          <h2 className="text-xl font-semibold text-white">Ortak Çalışma Odaları</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJoinByCode(!showJoinByCode)}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/10"
          >
            <Share2 size={16} /> Kod ile Katıl
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 rounded-xl bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-300 transition hover:bg-orange-500/30"
          >
            <Plus size={16} /> Yeni Oda
          </button>
        </div>
      </div>

      {showJoinByCode && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Davet kodu (6 hane)"
              maxLength={6}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50"
              onKeyDown={(e) => { if (e.key === 'Enter') joinByCode(); }}
            />
            <button
              onClick={joinByCode}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:shadow-lg"
            >
              Katıl
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Oda adı (örn: Sabah Çalışması)"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50"
          />
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Açıklama (opsiyonel)"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Şifre (opsiyonel — boş bırakırsanız herkes katılabilir)"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50"
          />
          <button
            onClick={createRoom}
            className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-2.5 font-semibold text-white transition hover:shadow-lg hover:shadow-orange-500/30"
          >
            Oluştur
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {rooms.map((room) => (
          <button
            key={room.id}
            onClick={() => joinRoom(room)}
            className="group rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-md transition hover:border-orange-400/30 hover:bg-white/10"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-white">{room.name}</h3>
                {room.password_hash && <Lock size={14} className="text-orange-400" />}
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Radio size={14} className="text-emerald-400" /> Aktif
              </span>
            </div>
            {room.description && <p className="mb-3 text-sm text-slate-400">{room.description}</p>}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-400">{MODE_LABELS[room.current_mode]}</span>
              <span>· {Math.round(Number(room.duration_seconds) / 60)} dk</span>
              {room.invite_code && <span className="rounded-full bg-white/5 px-2 py-0.5 text-slate-400">Kod: {room.invite_code}</span>}
            </div>
          </button>
        ))}
        {rooms.length === 0 && (
          <p className="py-12 text-center text-sm text-slate-500">Henüz oda yok. İlk odayı sen oluştur!</p>
        )}
      </div>
    </div>
  );
}

function RoomView({ room, members, messages, isHost, isPendingHost, currentUserId, onLeave, onUpdateTimer, onTransferHost, onAcceptHost, onSendMessage, onDeleteRoom }: {
  room: Room;
  members: RoomMember[];
  messages: RoomMessage[];
  isHost: boolean;
  isPendingHost: boolean;
  currentUserId: string;
  onLeave: () => void;
  onUpdateTimer: (mode: TimerMode, startedAt: string | null, duration: number) => void;
  onTransferHost: (targetUserId: string) => void;
  onAcceptHost: () => void;
  onSendMessage: (content: string) => void;
  onDeleteRoom: () => void;
}) {
  const modes: TimerMode[] = ['work', 'short_break', 'long_break'];
  const [now, setNow] = useState(Date.now());
  const [msgInput, setMsgInput] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const durationSec = Number(room.duration_seconds) || 1500;
  const startedAtMs = room.started_at ? new Date(room.started_at).getTime() : 0;
  const elapsed = startedAtMs > 0 ? Math.floor((now - startedAtMs) / 1000) : 0;
  const remaining = Math.max(0, durationSec - elapsed);
  const m = Math.floor(remaining / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');

  function handleSend() {
    if (!msgInput.trim()) return;
    onSendMessage(msgInput);
    setMsgInput('');
  }

  const shareUrl = `${window.location.origin}/?room=${room.invite_code || room.id}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onLeave} className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
          <ArrowLeft size={16} /> Odalara dön
        </button>
        <div className="flex gap-2">
          {isHost && (
            <button
              onClick={() => setShowShare(!showShare)}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
            >
              <Share2 size={14} /> Paylaş
            </button>
          )}
          {isHost && (
            <button
              onClick={onDeleteRoom}
              className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-500/20"
            >
              Odayı Sil
            </button>
          )}
        </div>
      </div>

      {showShare && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Share2 size={16} className="text-orange-400" /> Odayı Paylaş
          </h3>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-sm text-slate-400">Davet Kodu:</span>
            <span className="font-mono text-lg font-bold text-orange-300">{room.invite_code}</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 outline-none"
            />
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="rounded-xl bg-orange-500/20 px-4 py-2.5 text-sm font-medium text-orange-300 transition hover:bg-orange-500/30"
            >
              Kopyala
            </button>
          </div>
          <p className="text-xs text-slate-500">Bu kodu arkadaşlarınla paylaş. Şifre varsa onu da vermelisin.</p>
        </div>
      )}

      {isPendingHost && (
        <div className="rounded-2xl border border-orange-400/30 bg-orange-500/10 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown size={18} className="text-orange-400" />
              <span className="text-sm text-orange-200">Bu odanın yönetimi sana devredilmek isteniyor.</span>
            </div>
            <button
              onClick={onAcceptHost}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:shadow-lg"
            >
              Kabul Et
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-md text-center">
        <h2 className="mb-1 text-2xl font-bold text-white">{room.name}</h2>
        {room.description && <p className="mb-6 text-sm text-slate-400">{room.description}</p>}

        <div className="mx-auto mb-6 flex h-48 w-48 items-center justify-center rounded-full border-4 border-white/10" style={{ borderColor: MODE_COLORS[room.current_mode] + '40' }}>
          <div>
            <p className="text-sm font-medium uppercase tracking-widest" style={{ color: MODE_COLORS[room.current_mode] }}>{MODE_LABELS[room.current_mode]}</p>
            <p className="text-4xl font-bold tabular-nums text-white">{m}:{s}</p>
          </div>
        </div>

        {isHost && (
          <>
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
              {modes.map((md) => (
                <button
                  key={md}
                  onClick={() => onUpdateTimer(md, new Date().toISOString(), md === 'work' ? 1500 : md === 'short_break' ? 300 : 900)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                    room.current_mode === md ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {MODE_LABELS[md]}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowTransfer(!showTransfer)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-slate-300 transition hover:bg-white/10"
              >
                <UserCog size={14} /> Yönetimi Devret
              </button>
            </div>
          </>
        )}
        {!isHost && !isPendingHost && <p className="text-xs text-slate-500">Sadece oda sahibi sayacı kontrol edebilir</p>}
      </div>

      {showTransfer && isHost && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
            <UserCog size={16} className="text-orange-400" /> Yönetimi Devret
          </h3>
          <div className="space-y-2">
            {members.filter((mem) => mem.user_id !== currentUserId).map((mem) => (
              <button
                key={mem.id}
                onClick={() => { onTransferHost(mem.user_id); setShowTransfer(false); }}
                className="flex w-full items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-4 py-2.5 transition hover:border-orange-400/30 hover:bg-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-sm font-bold text-white">
                  {mem.display_name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-left text-sm text-slate-200">{mem.display_name}</span>
                <Crown size={14} className="text-slate-500" />
              </button>
            ))}
            {members.filter((mem) => mem.user_id !== currentUserId).length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">Odada devredilecek başka kullanıcı yok.</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <Users size={16} className="text-orange-400" /> Odadakiler ({members.length})
          </h3>
          <div className="space-y-2">
            {members.map((mem) => (
              <div key={mem.id} className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-sm font-bold text-white">
                  {mem.display_name.charAt(0).toUpperCase()}
                </div>
                <span className="flex-1 text-sm text-slate-200">{mem.display_name}</span>
                {mem.user_id === room.host_id && <Crown size={14} className="text-amber-400" />}
                {mem.user_id === room.new_host_id && <span className="text-xs text-orange-300">Devrediliyor</span>}
              </div>
            ))}
            {members.length === 0 && <p className="py-4 text-center text-sm text-slate-500">Kimse yok</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md flex flex-col" style={{ maxHeight: '400px' }}>
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
            <MessageCircle size={16} className="text-orange-400" /> Sohbet
          </h3>
          <div className="flex-1 space-y-2 overflow-y-auto pr-1" style={{ minHeight: '200px' }}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.user_id === currentUserId ? 'items-end' : 'items-start'}`}>
                <span className="mb-0.5 text-xs text-slate-500">{msg.display_name}</span>
                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                  msg.user_id === currentUserId
                    ? 'bg-orange-500/20 text-orange-100'
                    : 'bg-white/5 text-slate-200'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {messages.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Henüz mesaj yok. İlk mesajı sen at!</p>}
            <div ref={msgEndRef} />
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={msgInput}
              onChange={(e) => setMsgInput(e.target.value)}
              placeholder="Mesaj yaz..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50"
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            />
            <button
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300 transition hover:bg-orange-500/30"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

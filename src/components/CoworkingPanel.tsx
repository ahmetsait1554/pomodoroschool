import { useEffect, useState } from 'react';
import { Users, Plus, ArrowLeft, Crown, Radio } from 'lucide-react';
import { supabase, type Room, type RoomMember, type TimerMode } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { MODE_LABELS, MODE_COLORS } from '@/lib/constants';

export default function CoworkingPanel() {
  const { session, profile } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    if (activeRoom) return;
    loadRooms();
  }, [activeRoom]);

  async function loadRooms() {
    const { data } = await supabase.from('rooms').select('*').order('created_at', { ascending: false });
    if (data) setRooms(data as Room[]);
  }

  async function createRoom() {
    if (!newName.trim() || !session) return;
    const { data } = await supabase
      .from('rooms')
      .insert({ name: newName.trim(), description: newDesc.trim() || null, host_id: session.user.id })
      .select('*')
      .single();
    if (data) {
      setRooms((prev) => [data as Room, ...prev]);
      setNewName('');
      setNewDesc('');
      setShowCreate(false);
      joinRoom(data as Room);
    }
  }

  async function joinRoom(room: Room) {
    if (!session || !profile) return;
    await supabase.from('room_members').upsert({
      room_id: room.id,
      user_id: session.user.id,
      display_name: profile.display_name,
      last_seen: new Date().toISOString(),
    });
    setActiveRoom(room);
  }

  async function leaveRoom() {
    if (!activeRoom || !session) return;
    await supabase.from('room_members').delete().eq('room_id', activeRoom.id).eq('user_id', session.user.id);
    setActiveRoom(null);
    setMembers([]);
  }

  useEffect(() => {
    if (!activeRoom) return;

    const channel = supabase
      .channel(`room-${activeRoom.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_members', filter: `room_id=eq.${activeRoom.id}` },
        () => { loadMembers(activeRoom.id); }
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${activeRoom.id}` },
        (payload) => {
          if (payload.new) setActiveRoom(payload.new as Room);
        }
      )
      .subscribe();

    loadMembers(activeRoom.id);

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

  async function updateRoomTimer(mode: TimerMode, startedAt: string | null, duration: number) {
    if (!activeRoom || !session || session.user.id !== activeRoom.host_id) return;
    await supabase.from('rooms').update({
      current_mode: mode, started_at: startedAt, duration_seconds: duration,
    }).eq('id', activeRoom.id);
  }

  if (activeRoom) {
    return (
      <RoomView
        room={activeRoom}
        members={members}
        isHost={session?.user.id === activeRoom.host_id}
        onLeave={leaveRoom}
        onUpdateTimer={updateRoomTimer}
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
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 rounded-xl bg-orange-500/20 px-4 py-2 text-sm font-medium text-orange-300 transition hover:bg-orange-500/30"
        >
          <Plus size={16} /> Yeni Oda
        </button>
      </div>

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
              <h3 className="font-semibold text-white">{room.name}</h3>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                <Radio size={14} className="text-emerald-400" /> Aktif
              </span>
            </div>
            {room.description && <p className="mb-3 text-sm text-slate-400">{room.description}</p>}
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-orange-400">{MODE_LABELS[room.current_mode]}</span>
              <span>· {Math.round(Number(room.duration_seconds) / 60)} dk</span>
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

function RoomView({ room, members, isHost, onLeave, onUpdateTimer }: {
  room: Room; members: RoomMember[]; isHost: boolean; onLeave: () => void;
  onUpdateTimer: (mode: TimerMode, startedAt: string | null, duration: number) => void;
}) {
  const modes: TimerMode[] = ['work', 'short_break', 'long_break'];
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const durationSec = Number(room.duration_seconds) || 1500;
  const startedAtMs = room.started_at ? new Date(room.started_at).getTime() : 0;
  const elapsed = startedAtMs > 0 ? Math.floor((now - startedAtMs) / 1000) : 0;
  const remaining = Math.max(0, durationSec - elapsed);
  const m = Math.floor(remaining / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');

  return (
    <div className="space-y-6">
      <button onClick={onLeave} className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white">
        <ArrowLeft size={16} /> Odalara dön
      </button>

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
        )}
        {!isHost && <p className="text-xs text-slate-500">Sadece oda sahibi sayacı kontrol edebilir</p>}
      </div>

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
            </div>
          ))}
          {members.length === 0 && <p className="py-4 text-center text-sm text-slate-500">Kimse yok</p>}
        </div>
      </div>
    </div>
  );
}

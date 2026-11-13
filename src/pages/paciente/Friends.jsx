import React, { useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import toast from 'react-hot-toast';
import { loadCurrentPatient } from '@/lib/currentPatient';
import { refreshBadges } from '@/hooks/usePatientBadges';
import PeopleList from '@/components/paciente/PeopleList';
import RequestsList from '@/components/paciente/RequestsList';
import FriendsList from '@/components/paciente/FriendsList';
import ChatPanel from '@/components/paciente/ChatPanel';
import PageHeader from '@/components/ds/PageHeader';
import Tabs from '@/components/ds/Tabs';
import LoadingState from '@/components/ds/LoadingState';

export default function Friends() {
  const [me, setMe] = useState(null);
  const [patients, setPatients] = useState([]);
  const [plans, setPlans] = useState([]);
  const [friendships, setFriendships] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState('companeros');
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const meRef = useRef(null);

  useEffect(() => { load(); }, []);

  // Mensajes nuevos en vivo mientras la sección está abierta.
  useEffect(() => {
    const unsubscribe = base44.entities.FriendMessage.subscribe(() => { reloadMessages(); });
    return unsubscribe;
  }, []);

  async function fetchMessages(patientId) {
    const [sent, received] = await Promise.all([
      base44.entities.FriendMessage.filter({ sender_patient_id: patientId }, 'created_date', 300),
      base44.entities.FriendMessage.filter({ recipient_patient_id: patientId }, 'created_date', 300),
    ]);
    return [...sent, ...received].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  }

  async function reloadMessages() {
    const patientId = meRef.current?.id;
    if (!patientId) return;
    setMessages(await fetchMessages(patientId));
  }

  async function load() {
    try {
      const patient = await loadCurrentPatient();
      if (!patient) { setLoading(false); return; }
      meRef.current = patient;
      setMe(patient);

      const [allPatients, allPlans, sentRequests, receivedRequests] = await Promise.all([
        base44.entities.Patient.list('full_name', 200),
        base44.entities.RehabPlan.list('-created_date', 200),
        base44.entities.Friendship.filter({ requester_patient_id: patient.id }, '-created_date', 200),
        base44.entities.Friendship.filter({ addressee_patient_id: patient.id }, '-created_date', 200),
      ]);

      setPatients(allPatients.filter((item) => item.id !== patient.id));
      setPlans(allPlans);
      setFriendships([...sentRequests, ...receivedRequests]);

      const loadedMessages = await fetchMessages(patient.id);
      setMessages(loadedMessages);

      // Al abrir la sección, los mensajes recibidos quedan leídos.
      const hasUnread = loadedMessages.some((message) => message.recipient_patient_id === patient.id && !message.read);
      if (hasUnread) {
        await base44.entities.FriendMessage.updateMany(
          { recipient_patient_id: patient.id, read: false },
          { $set: { read: true } }
        );
        refreshBadges();
      }
    } catch (e) {
      toast.error('No se pudo cargar la sección Amigos');
    } finally {
      setLoading(false);
    }
  }

  async function connect(person) {
    try {
      const created = await base44.entities.Friendship.create({
        requester_patient_id: me.id,
        addressee_patient_id: person.id,
        status: 'pendiente',
      });
      setFriendships((prev) => [...prev, created]);
      refreshBadges();
      toast.success(`Solicitud enviada a ${person.full_name}`);
    } catch (e) {
      toast.error('No se pudo enviar la solicitud');
    }
  }

  async function respond(friendship, status) {
    try {
      await base44.entities.Friendship.update(friendship.id, { status });
      setFriendships((prev) => prev.map((item) => (item.id === friendship.id ? { ...item, status } : item)));
      refreshBadges();
      if (status === 'aceptada') {
        toast.success('¡Ya son amigos!');
        setTab('amigos');
      }
    } catch (e) {
      toast.error('No se pudo responder la solicitud');
    }
  }

  async function send(text) {
    if (!openEntry) return;
    setSending(true);
    try {
      const created = await base44.entities.FriendMessage.create({
        friendship_id: openEntry.friendship.id,
        sender_patient_id: me.id,
        recipient_patient_id: openEntry.patient.id,
        content: text,
        read: false,
      });
      setMessages((prev) => [...prev, created]);
    } catch (e) {
      toast.error('No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  }

  if (loading) return <LoadingState label="Cargando la sección Amigos…" />;
  if (!me) return <div className="text-sm text-muted-foreground">No tenés un paciente vinculado.</div>;

  const patientById = Object.fromEntries(patients.map((person) => [person.id, person]));
  const plansByPatient = {};
  plans.forEach((plan) => { if (!plansByPatient[plan.patient_id]) plansByPatient[plan.patient_id] = plan; });

  const otherId = (friendship) => (
    friendship.requester_patient_id === me.id ? friendship.addressee_patient_id : friendship.requester_patient_id
  );

  const accepted = friendships.filter((item) => item.status === 'aceptada');
  const incoming = friendships.filter((item) => item.status === 'pendiente' && item.addressee_patient_id === me.id);
  const outgoing = friendships.filter((item) => item.status === 'pendiente' && item.requester_patient_id === me.id);
  const friendIds = new Set(accepted.map(otherId));
  const pendingIds = new Set([...incoming, ...outgoing].map(otherId));
  const friendList = accepted
    .map((friendship) => ({ friendship, patient: patientById[otherId(friendship)] }))
    .filter((entry) => entry.patient);

  const openEntry = friendList.find((entry) => entry.friendship.id === openId) || null;
  const chatMessages = openEntry
    ? messages.filter((message) => message.friendship_id === openEntry.friendship.id)
    : [];

  const tabs = [
    { key: 'companeros', label: 'Compañeros' },
    { key: 'solicitudes', label: 'Solicitudes', count: incoming.length },
    { key: 'amigos', label: 'Amigos', count: friendList.length },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        back={{ to: '/paciente', label: 'Volver' }}
        eyebrow="Área Paciente"
        title="Amigos"
        subtitle="Conectá con otras personas que también están en rehabilitación."
      />

      <Tabs
        tabs={tabs}
        value={tab}
        onChange={(key) => { setTab(key); setOpenId(null); }}
      />

      {tab === 'companeros' && (
        <PeopleList
          people={patients}
          plansByPatient={plansByPatient}
          friendIds={friendIds}
          pendingIds={pendingIds}
          onConnect={connect}
        />
      )}

      {tab === 'solicitudes' && (
        <RequestsList
          incoming={incoming}
          outgoing={outgoing}
          patientById={patientById}
          onRespond={respond}
        />
      )}

      {tab === 'amigos' && (
        openEntry ? (
          <ChatPanel
            friend={openEntry.patient}
            messages={chatMessages}
            meId={me.id}
            onSend={send}
            onBack={() => setOpenId(null)}
            sending={sending}
          />
        ) : (
          <FriendsList friends={friendList} onOpen={setOpenId} />
        )
      )}
    </div>
  );
}
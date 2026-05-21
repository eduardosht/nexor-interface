import { useEffect, useMemo, useState } from 'react';
import { Mail, MessageCircle } from 'lucide-react';
import * as S from './styles';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SkeletonBlock, SkeletonCard, SkeletonLine } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchOrders,
  getAuthToken,
  scheduleInitialConsultation,
  type DemoOrderSummary,
  type DemoPracticeLocationSelection,
} from '../../../features/demo/biteplanerFlow';
import {
  getConsultationCepLocation,
  getConsultationLocation,
  listConsultationLocationsByCep,
} from '../../../features/demo/consultationLocations';
import { OrderStepHeader } from '../components/OrderStepHeader';

const markerIcon = divIcon({
  className: 'consultation-map-pin',
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: #171717;
      border: 2px solid #fafafa;
      box-shadow: 0 6px 16px rgba(23, 23, 23, 0.18);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
  popupAnchor: [0, -16],
});

const activeMarkerIcon = divIcon({
  className: 'consultation-map-pin consultation-map-pin-active',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: #f59e0b;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.2), 0 14px 30px rgba(23, 23, 23, 0.26);
    ">
      <div style="
        position: absolute;
        inset: 7px;
        border-radius: 999px;
        background: #171717;
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -26],
});

const cepMarkerIcon = divIcon({
  className: 'consultation-map-pin consultation-map-pin-home',
  html: `
    <div style="
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: #ffffff;
      border: 2px solid #171717;
      box-shadow: 0 12px 28px rgba(23, 23, 23, 0.22);
      color: #171717;
    ">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m3 11 9-8 9 8"></path>
        <path d="M5 10v10h14V10"></path>
        <path d="M9 20v-6h6v6"></path>
      </svg>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

const DENTIST_PARTNER_PATH = '/parceiros#dentistas';

type ConsultaInicialProps = {
  embedded?: boolean;
  initialOrder?: DemoOrderSummary | null;
  onOrderChange?: (order: DemoOrderSummary) => void;
};

function getDentistPartnerUrl() {
  if (typeof window === 'undefined') {
    return DENTIST_PARTNER_PATH;
  }

  return `${window.location.origin}${DENTIST_PARTNER_PATH}`;
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function getDefaultDentistReferralMessage(dentistPartnerUrl: string) {
  return [
    'Olá! Estou usando o Biteplaner, uma solução da Nexor para protetor bucal personalizado para atletas.',
    'A Nexor licencia dentistas para avaliação, acompanhamento e atendimento do processo.',
    `Caso tenha interesse, veja como funciona para dentistas em: ${dentistPartnerUrl}`,
  ].join('\n\n');
}

export function ConsultaInicial({ embedded = false, initialOrder = null, onOrderChange }: ConsultaInicialProps) {
  const { session } = useAuth();
  const token = getAuthToken(session);
  const dentistPartnerUrl = getDentistPartnerUrl();
  const [cep, setCep] = useState('04567-000');
  const [order, setOrder] = useState<DemoOrderSummary | null>(initialOrder);
  const [dentistReferralMessage, setDentistReferralMessage] = useState(() =>
    getDefaultDentistReferralMessage(dentistPartnerUrl)
  );
  const [visibleLocations, setVisibleLocations] = useState<DemoPracticeLocationSelection[]>(
    () => listConsultationLocationsByCep('04567-000')
  );
  const [activeLocation, setActiveLocation] = useState<DemoPracticeLocationSelection | null>(
    () => listConsultationLocationsByCep('04567-000')[0] ?? null
  );
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState('');
  const [schedulingConsultation, setSchedulingConsultation] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState('');
  const [showScheduleConfirmation, setShowScheduleConfirmation] = useState(false);

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
      setLoading(false);

      if (initialOrder.practice_location?.id) {
        const selectedLocation = getConsultationLocation(initialOrder.practice_location.id);
        if (selectedLocation) {
          setActiveLocation(selectedLocation);
        }
      }

      return;
    }

    if (!token) {
      return;
    }

    let active = true;

    async function loadOrder() {
      try {
        const response = await fetchOrders('user', token);
        const nextOrder =
          response.orders.find((item) => item.status === 'awaiting_scheduling') ??
          response.orders.find((item) => item.stage === 'awaiting_initial_consultation') ??
          response.orders[0] ??
          null;

        if (!active) {
          return;
        }

        setOrder(nextOrder);

        if (nextOrder?.practice_location?.id) {
          const selectedLocation = getConsultationLocation(nextOrder.practice_location.id);
          if (selectedLocation) {
            setActiveLocation(selectedLocation);
          }
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar a etapa de consulta inicial da demo.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [initialOrder, token]);

  const dentistReferralSubject = 'Convite para conhecer o licenciamento Biteplaner para dentistas';
  const dentistReferralEmailHref = `mailto:?subject=${encodeURIComponent(dentistReferralSubject)}&body=${encodeURIComponent(dentistReferralMessage)}`;
  const dentistReferralWhatsappHref = `https://wa.me/?text=${encodeURIComponent(dentistReferralMessage)}`;

  const mapCenter = useMemo<[number, number]>(() => {
    if (activeLocation) {
      return [activeLocation.coordinates.lat, activeLocation.coordinates.lng];
    }

    const fallback = visibleLocations[0];
    return fallback ? [fallback.coordinates.lat, fallback.coordinates.lng] : [-23.5923, -46.6843];
  }, [activeLocation, visibleLocations]);
  const cepLocation = useMemo(
    () => getConsultationCepLocation(cep, visibleLocations),
    [cep, visibleLocations]
  );

  function handleSearch() {
    const nextLocations = listConsultationLocationsByCep(cep);
    setVisibleLocations(nextLocations);
    setActiveLocation(nextLocations[0] ?? null);
  }

  async function handleScheduleConsultation() {
    if (!token || !order?.id || !activeLocation) {
      return;
    }

    setShowScheduleConfirmation(false);
    setSchedulingConsultation(true);
    setScheduleNotice('');
    setError('');

    try {
      const response = await scheduleInitialConsultation(order.id, activeLocation.id, token);
      setOrder(response.order);
      onOrderChange?.(response.order);
      setScheduleNotice('Consulta informada com sucesso. Agora estámos aguardando o dentista aceitar a ordem via sistema.');
    } catch {
      setError('Não foi possível vincular a consulta agendada agora.');
    } finally {
      setSchedulingConsultation(false);
    }
  }

  return (
    <S.Page>
      {!embedded ? (
        <OrderStepHeader
          title="Consulta inicial"
          description="Escolha um consultório licenciado para visualizar a clínica, o dentista responsável e o contexto da primeira consulta."
          currentStep="consultation"
          order={order}
          orderHelpText="Este pedido já passou pela triagem e agora precisa da escolha do consultório licenciado para a consulta inicial."
        />
      ) : null}

      {loading ? (
        <S.LoadingStack aria-label="Carregando etapa de consulta inicial">
          <S.SearchBar>
            <SkeletonLine width="320px" height="44px" />
            <SkeletonLine width="130px" height="44px" />
          </S.SearchBar>
          <S.Layout>
            <S.MapCard>
              <SkeletonLine width="38%" />
              <SkeletonLine width="72%" />
              <SkeletonBlock height="460px" />
              <S.SkeletonGridList>
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
              </S.SkeletonGridList>
            </S.MapCard>
            <SkeletonCard lines={6} blockHeight="52px" />
          </S.Layout>
        </S.LoadingStack>
      ) : (
        <>
          {error ? <S.Banner role="alert">{error}</S.Banner> : null}
          <S.SearchBar>
            <S.CepField
              value={cep}
              onChange={(event) => setCep(formatCep(event.target.value))}
              aria-label="CEP"
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
            />
            <S.SearchButton type="button" onClick={handleSearch}>
              Buscar clínicas
            </S.SearchButton>
          </S.SearchBar>

          <S.Layout>
            <S.MapCard>
              <S.SectionTitle>Clínicas proximas ao CEP</S.SectionTitle>
              <S.Description>
                Os pins do mapa representam consultórios mockados para a demo. Clique em um pin para ver os detalhes.
              </S.Description>
              <S.MapViewport>
                <MapContainer center={mapCenter} zoom={14} scrollWheelZoom={false}>
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {visibleLocations.map((location) => {
                    const selected = activeLocation?.id === location.id;

                    return (
                      <Marker
                        key={location.id}
                        position={[location.coordinates.lat, location.coordinates.lng]}
                        icon={selected ? activeMarkerIcon : markerIcon}
                        zIndexOffset={selected ? 1000 : 0}
                        eventHandlers={{
                          click: () => {
                            setActiveLocation(location);
                          },
                        }}
                      >
                        <Popup>{location.name}</Popup>
                      </Marker>
                    );
                  })}
                  {cepLocation ? (
                    <Marker
                      position={[cepLocation.lat, cepLocation.lng]}
                      icon={cepMarkerIcon}
                      zIndexOffset={1500}
                    >
                      <Popup>{cepLocation.label}</Popup>
                    </Marker>
                  ) : null}
                </MapContainer>
              </S.MapViewport>
              <S.ClinicList>
                {visibleLocations.map((location) => (
                  <S.ClinicButton
                    key={location.id}
                    type="button"
                    $active={activeLocation?.id === location.id}
                    onClick={() => setActiveLocation(location)}
                  >
                    <S.ClinicName>{location.name}</S.ClinicName>
                    <S.ClinicMeta>{location.address}</S.ClinicMeta>
                    <S.ClinicMeta>{location.distanceKm.toFixed(1)} km do CEP informado</S.ClinicMeta>
                  </S.ClinicButton>
                ))}
              </S.ClinicList>
            </S.MapCard>

            <S.SideCard>
              <S.SectionTitle>Informações da clínica</S.SectionTitle>
              {activeLocation ? (
                <>
                  <S.GuidanceCard>
                    Use os dados abaixo para entrar em contato com o consultório fora da plataforma. Quando a consulta
                    estiver agendada, confirme nesta tela para vincular esta ordem ao dentista licenciado.
                  </S.GuidanceCard>
                  <S.DetailList>
                    <S.DetailTerm>Clínica</S.DetailTerm>
                    <S.DetailValue>{activeLocation.name}</S.DetailValue>

                    <S.DetailTerm>Dentista</S.DetailTerm>
                    <S.DetailValue>{activeLocation.dentistName}</S.DetailValue>

                    <S.DetailTerm>Endereço</S.DetailTerm>
                    <S.DetailValue>{activeLocation.address}</S.DetailValue>

                    <S.DetailTerm>CEP</S.DetailTerm>
                    <S.DetailValue>{activeLocation.cep}</S.DetailValue>

                    <S.DetailTerm>Telefone</S.DetailTerm>
                    <S.DetailValue>{activeLocation.phone}</S.DetailValue>

                    <S.DetailTerm>Distancia</S.DetailTerm>
                    <S.DetailValue>{activeLocation.distanceKm.toFixed(1)} km</S.DetailValue>
                  </S.DetailList>
                  <S.GuidanceCard>
                    Confirme quando a consulta estiver agendada. A consulta so será considerada realizada depois do
                    match de confirmação entre paciente e dentista.
                  </S.GuidanceCard>
                  <S.SearchButton
                    type="button"
                    onClick={() => setShowScheduleConfirmation(true)}
                    disabled={schedulingConsultation || order?.status !== 'awaiting_scheduling'}
                  >
                    {order?.status === 'awaiting_scheduling'
                      ? schedulingConsultation
                        ? 'Vinculando...'
                        : 'Consulta agendada'
                      : order?.status === 'awaiting_dentist_acceptance'
                        ? 'Aguardando aceite'
                        : 'Consulta vinculada'}
                  </S.SearchButton>
                  {scheduleNotice ? <S.PositiveFeedback role="status">{scheduleNotice}</S.PositiveFeedback> : null}
                </>
              ) : (
                <S.Description>Selecione um pin ou uma clínica da lista para ver os detalhes.</S.Description>
              )}
            </S.SideCard>
          </S.Layout>

          <S.ReferralCard aria-labelledby="dentist-referral-title">
            <S.ReferralContent>
              <S.SectionTitle id="dentist-referral-title">Indique seu dentista de preferência</S.SectionTitle>
              <S.Description>
                Caso deseje, você pode enviar uma mensagem pronta ao seu dentista para apresentar o processo de
                licenciamento Biteplaner.
              </S.Description>
              <S.MessageTextarea
                aria-label="Mensagem para o dentista"
                value={dentistReferralMessage}
                onChange={(event) => setDentistReferralMessage(event.target.value)}
              />
              <S.ReferralActions>
                <S.ActionHref href={dentistReferralWhatsappHref} target="_blank" rel="noreferrer">
                  <MessageCircle size={16} aria-hidden data-testid="referral-whatsapp-icon" />
                  Enviar por WhatsApp
                </S.ActionHref>
                <S.ActionHref href={dentistReferralEmailHref}>
                  <Mail size={16} aria-hidden data-testid="referral-email-icon" />
                  Enviar por e-mail
                </S.ActionHref>
              </S.ReferralActions>
              <S.ReferralNotice>
                Essa indicação pode iniciar o contato com o dentista, mas para prosseguir com a ordem atual você
                precisa selecionar uma clínica ja licenciada. O processo de licenciamento pode demorar.
              </S.ReferralNotice>
            </S.ReferralContent>
          </S.ReferralCard>
        </>
      )}

      {showScheduleConfirmation && activeLocation ? (
        <S.ModalOverlay role="presentation">
          <S.ConfirmationDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-confirmation-title"
            aria-describedby="schedule-confirmation-description"
          >
            <S.SectionTitle id="schedule-confirmation-title">Confirmar consulta agendada</S.SectionTitle>
            <S.Description id="schedule-confirmation-description">
              Você ja entrou em contato com o dentista para combinar a data da consulta e confirmar os valores do
              atendimento?
            </S.Description>
            <S.GuidanceCard>
              Dentista: {activeLocation.dentistName}
              <br />
              Clínica: {activeLocation.name}
            </S.GuidanceCard>
            <S.ModalActions>
              <S.SecondaryButton type="button" onClick={() => setShowScheduleConfirmation(false)}>
                Cancelar
              </S.SecondaryButton>
              <S.SearchButton
                type="button"
                onClick={() => void handleScheduleConsultation()}
                disabled={schedulingConsultation}
              >
                {schedulingConsultation ? 'Confirmando...' : 'Sim, ja combinei'}
              </S.SearchButton>
            </S.ModalActions>
          </S.ConfirmationDialog>
        </S.ModalOverlay>
      ) : null}
    </S.Page>
  );
}

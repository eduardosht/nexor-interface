import { useEffect, useMemo, useState } from 'react';
import * as S from './styles';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { divIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchOrders,
  getAuthToken,
  scheduleInitialConsultation,
  type DemoOrderSummary,
  type DemoPracticeLocationSelection,
} from '../../../features/demo/biteplanerFlow';
import {
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

const DENTIST_PARTNER_PATH = '/parceiros#dentistas';

function getDentistPartnerUrl() {
  if (typeof window === 'undefined') {
    return DENTIST_PARTNER_PATH;
  }

  return `${window.location.origin}${DENTIST_PARTNER_PATH}`;
}

export function ConsultaInicial() {
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [cep, setCep] = useState('04567-000');
  const [order, setOrder] = useState<DemoOrderSummary | null>(null);
  const [visibleLocations, setVisibleLocations] = useState<DemoPracticeLocationSelection[]>(
    () => listConsultationLocationsByCep('04567-000')
  );
  const [activeLocation, setActiveLocation] = useState<DemoPracticeLocationSelection | null>(
    () => listConsultationLocationsByCep('04567-000')[0] ?? null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schedulingConsultation, setSchedulingConsultation] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState('');
  const [showScheduleConfirmation, setShowScheduleConfirmation] = useState(false);

  useEffect(() => {
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
  }, [token]);

  const dentistPartnerUrl = getDentistPartnerUrl();
  const dentistReferralMessage = [
    'Olá! Estou usando o Biteplaner, uma solução da Nexor para protetor bucal personalizado para atletas.',
    'A Nexor licencia dentistas para avaliação, acompanhamento e atendimento do processo.',
    `Caso tenha interesse, veja como funciona para dentistas em: ${dentistPartnerUrl}`,
  ].join('\n\n');
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
      setScheduleNotice('Consulta informada com sucesso. Agora estámos aguardando o dentista aceitar a ordem via sistema.');
    } catch {
      setError('Não foi possível vincular a consulta agendada agora.');
    } finally {
      setSchedulingConsultation(false);
    }
  }

  return (
    <S.Page>
      <OrderStepHeader
        title="Consulta inicial"
        description="Escolha um consultório licenciado para visualizar a clínica, o dentista responsável e o contexto da primeira consulta."
        currentStep="consultation"
        order={order}
        orderHelpText="Este pedido já passou pela triagem e agora precisa da escolha do consultório licenciado para a consulta inicial."
      />

      {loading ? <S.Banner>Carregando etapa de consulta inicial...</S.Banner> : null}
      {error ? <S.Banner role="alert">{error}</S.Banner> : null}
      {!loading ? (
        <>
          <S.SearchBar>
            <S.CepField
              value={cep}
              onChange={(event) => setCep(event.target.value)}
              aria-label="CEP"
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
                  {visibleLocations.map((location) => (
                    <Marker
                      key={location.id}
                      position={[location.coordinates.lat, location.coordinates.lng]}
                      icon={markerIcon}
                      eventHandlers={{
                        click: () => {
                          setActiveLocation(location);
                        },
                      }}
                    >
                      <Popup>{location.name}</Popup>
                    </Marker>
                  ))}
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
              <S.MessagePreview>{dentistReferralMessage}</S.MessagePreview>
              <S.ReferralNotice>
                Essa indicação pode iniciar o contato com o dentista, mas para prosseguir com a ordem atual você
                precisa selecionar uma clínica ja licenciada. O processo de licenciamento pode demorar.
              </S.ReferralNotice>
            </S.ReferralContent>
            <S.ReferralActions>
              <S.ActionHref href={dentistReferralWhatsappHref} target="_blank" rel="noreferrer">
                Enviar por WhatsApp
              </S.ActionHref>
              <S.ActionHref href={dentistReferralEmailHref}>Enviar por e-mail</S.ActionHref>
            </S.ReferralActions>
          </S.ReferralCard>
        </>
      ) : null}

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

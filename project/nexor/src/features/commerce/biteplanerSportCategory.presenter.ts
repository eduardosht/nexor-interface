const BITEPLANER_SPORT_CATEGORY_LABELS: Record<string, string> = {
  combat_sports: 'Esportes de combate',
  team_sports: 'Esportes coletivos',
  racket_sports: 'Esportes de raquete',
  running_athletics: 'Corrida e atletismo',
  strength_training: 'Força e musculação',
  cycling: 'Ciclismo',
  water_sports: 'Esportes aquáticos',
  other_sports: 'Outros esportes',
};

export function formatBiteplanerSportCategory(value: string | null | undefined) {
  if (!value) return '';

  return BITEPLANER_SPORT_CATEGORY_LABELS[value] ?? value;
}

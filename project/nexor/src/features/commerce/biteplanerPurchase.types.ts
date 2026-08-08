export type BiteplanerSportCategory =
  | 'combat_sports'
  | 'team_sports'
  | 'racket_sports'
  | 'running_athletics'
  | 'strength_training'
  | 'cycling'
  | 'water_sports'
  | 'other_sports';

export type BiteplanerBiologicalSex = 'female' | 'male' | 'intersex' | 'not_informed';

export interface CreateBiteplanerDraftInput {
  color: string;
  quantity: number;
  sportCategory: BiteplanerSportCategory;
  athleteAge: number;
  biologicalSex: BiteplanerBiologicalSex;
}

export interface CreateBiteplanerDraftResponse {
  orderId: string;
  itemId: string;
}

export interface StartBiteplanerCheckoutInput {
  draftOrderId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface StartBiteplanerCheckoutResponse {
  orderId: string;
  checkoutId: string;
  checkoutUrl: string;
}

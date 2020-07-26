export type RentOffer = {
  id: number;
  offer_id: string;
  source: string;
  title: string;
  image_urls: Array<string>;
  description: string;
  price: number;
  size: number;
  latitude?: number;
  longitude?: number;
};

export type AnnotatedRentOffer = RentOffer & {
  reaction_value: string;
};

export type Reaction = {
  rent_id: string;
  reaction: "block" | "maybe" | "nice";
};

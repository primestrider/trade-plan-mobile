/**
 * Resource shapes returned by DummyJSON, the public API these examples read
 * from.
 *
 * @see https://dummyjson.com/docs
 */

export type DummyProductReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type DummyProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
  reviews?: DummyProductReview[];
};

/** The envelope every paginated product endpoint answers with. */
export type DummyProductListResponse = {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
};

export type DummyLoginRequest = {
  username: string;
  password: string;
  expiresInMins?: number;
};

export type DummyLoginResponse = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
};

/** What DummyJSON answers when a refresh token is exchanged. */
export type DummyRefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

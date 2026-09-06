export interface VideoConfig {
  src: string;
  startOffset: number;
  endOffset: number;
  titleCardText: string;
  showIntroCard: boolean;
}

export const SELLER_VIDEO: VideoConfig = {
  src: "/videos/Seller-video.mp4",
  startOffset: 10.58,
  endOffset: 71.2,
  titleCardText: "SELLER PROCESS",
  showIntroCard: true,
};

export const BUYER_VIDEO: VideoConfig = {
  src: "/videos/Buyer-investor-video.mp4",
  startOffset: 8.32,
  endOffset: 67.66,
  titleCardText: "BUYER PROCESS",
  showIntroCard: true,
};

export const DATA_MANAGEMENT_VIDEO: VideoConfig = {
  src: "/videos/Handling-data.mp4",
  startOffset: 0,
  endOffset: 60.7,
  titleCardText: "HOW YOUR DATA IS MANAGED",
  showIntroCard: false,
};

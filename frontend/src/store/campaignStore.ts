import { create } from "zustand";

interface Campaign {
  id: string;
  name: string;
  message: string;
  status: "draft" | "sending" | "sent";
  contactCount: number;
  createdAt: string;
  deliveryRate?: number;
}

interface CampaignState {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  setCampaigns: (campaigns: Campaign[]) => void;
  selectCampaign: (campaign: Campaign) => void;
  addCampaign: (campaign: Campaign) => void;
}

export const useCampaignStore = create<CampaignState>((set) => ({
  campaigns: [],
  selectedCampaign: null,
  setCampaigns: (campaigns) => set({ campaigns }),
  selectCampaign: (campaign) => set({ selectedCampaign: campaign }),
  addCampaign: (campaign) => 
    set((state) => ({ campaigns: [campaign, ...state.campaigns] })),
}));

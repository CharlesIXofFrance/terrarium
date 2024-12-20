import { api } from './api';

interface Community {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo?: string;
  banner?: string;
  settings: {
    jobBoard: {
      enabled: boolean;
      customFields: Record<string, any>[];
    };
    branding: {
      primaryColor: string;
      secondaryColor: string;
      fontFamily: string;
    };
  };
}

interface CreateCommunityData {
  name: string;
  description: string;
  logo?: File;
  banner?: File;
}

interface UpdateCommunityData {
  name?: string;
  description?: string;
  logo?: File;
  banner?: File;
  settings?: Partial<Community['settings']>;
}

export const communityService = {
  async getCommunity(slug: string): Promise<Community> {
    const response = await api.get(`/communities/${slug}`);
    return response.data;
  },

  async createCommunity(data: CreateCommunityData): Promise<Community> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });

    const response = await api.post('/communities', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateCommunity(
    slug: string,
    data: UpdateCommunityData
  ): Promise<Community> {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'settings') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      }
    });

    const response = await api.patch(`/communities/${slug}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteCommunity(slug: string): Promise<void> {
    await api.delete(`/communities/${slug}`);
  },

  async getMembers(slug: string) {
    const response = await api.get(`/communities/${slug}/members`);
    return response.data;
  },

  async inviteMember(slug: string, email: string) {
    const response = await api.post(`/communities/${slug}/members/invite`, {
      email,
    });
    return response.data;
  },

  async removeMember(slug: string, memberId: string) {
    await api.delete(`/communities/${slug}/members/${memberId}`);
  },
};

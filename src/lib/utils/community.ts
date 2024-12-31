import { api } from './api';
import { slugify } from 'slugify';
import * as path from 'path';

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
    login_customization?: {
      logoUrl?: string;
      colorScheme?: {
        primary: string;
        secondary: string;
        background: string;
      };
      customText?: {
        headline: string;
        subHeadline: string;
      };
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
    // 1. Upload logo to temp directory if provided
    let tempLogoPath: string | undefined;
    if (data.logo) {
      const formData = new FormData();
      formData.append('file', data.logo);
      const uploadResponse = await api.post('/storage/upload/temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      tempLogoPath = uploadResponse.data.path;
    }

    // 2. Create community with basic info
    const communityData = {
      name: data.name,
      description: data.description,
      slug: slugify(data.name),
    };
    const createResponse = await api.post('/communities', communityData);
    const community = createResponse.data;

    // 3. If logo was uploaded, move it to community directory and update community
    if (tempLogoPath) {
      const finalLogoPath = `${community.slug}/logo${path.extname(tempLogoPath)}`;
      await api.post('/storage/move', {
        source: tempLogoPath,
        destination: finalLogoPath,
      });

      // 4. Update community with final logo URL
      const updateResponse = await api.patch(`/communities/${community.slug}`, {
        logo: finalLogoPath,
      });
      return updateResponse.data;
    }

    return community;
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

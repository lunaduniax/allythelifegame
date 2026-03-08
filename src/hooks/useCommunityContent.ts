import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CommunityContentItem {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  type: string;
  url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  featured: boolean;
  user_id: string;
  created_at: string;
}

export interface AIRecommendation {
  title: string;
  author: string;
  description: string;
  type: string;
  url?: string;
  duration: string;
}

export const useCommunityContent = () => {
  const { user } = useAuth();

  const contentQuery = useQuery({
    queryKey: ['community-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_content')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CommunityContentItem[];
    },
    enabled: !!user,
  });

  return contentQuery;
};

export const useAIRecommendations = (category: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ai-recommendations', category],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('community-ai-suggest', {
        body: { category },
      });
      if (error) throw error;
      return (data?.recommendations ?? []) as AIRecommendation[];
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
  });
};

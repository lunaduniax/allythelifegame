import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoriteIds = [], isLoading } = useQuery({
    queryKey: ['community-favorites', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('community_favorites')
        .select('content_id')
        .eq('user_id', user.id);
      if (error) throw error;
      return data.map((f) => f.content_id);
    },
    enabled: !!user,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (contentId: string) => {
      if (!user) throw new Error('Not authenticated');
      const isFav = favoriteIds.includes(contentId);
      if (isFav) {
        const { error } = await supabase
          .from('community_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('content_id', contentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_favorites')
          .insert({ user_id: user.id, content_id: contentId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-favorites'] });
    },
  });

  return { favoriteIds, isLoading, toggleFavorite: toggleFavorite.mutate, isFavorite: (id: string) => favoriteIds.includes(id) };
};

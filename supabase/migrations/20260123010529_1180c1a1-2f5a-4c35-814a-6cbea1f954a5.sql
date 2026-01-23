-- Clean up any orphaned notifications first
DELETE FROM public.notifications
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Add foreign key constraint with CASCADE delete
ALTER TABLE public.notifications
ADD CONSTRAINT notifications_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;
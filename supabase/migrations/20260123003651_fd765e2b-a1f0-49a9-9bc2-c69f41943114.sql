-- Add username and phone_number columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN username text,
ADD COLUMN phone_number text;
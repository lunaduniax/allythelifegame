-- Add reminder_frequency column to projects table
ALTER TABLE public.projects 
ADD COLUMN reminder_frequency text DEFAULT '3 veces por semana';
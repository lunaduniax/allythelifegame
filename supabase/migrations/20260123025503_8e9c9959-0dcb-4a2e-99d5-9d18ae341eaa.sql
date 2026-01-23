-- Drop and recreate the handle_new_user function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  validated_name TEXT;
BEGIN
  -- Validate and sanitize the name field (max 100 chars, trim whitespace)
  validated_name := NULLIF(TRIM(LEFT(COALESCE(NEW.raw_user_meta_data->>'name', ''), 100)), '');
  
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (NEW.id, NEW.email, validated_name);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the signup
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
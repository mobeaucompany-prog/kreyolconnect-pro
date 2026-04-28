-- Create demo pro owner for catalog seeding
DO $$
DECLARE
  v_owner_id uuid := '00000000-0000-0000-0000-000000000001';
BEGIN
  -- Insert demo user in auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_owner_id) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, created_at, updated_at,
      raw_app_meta_data, raw_user_meta_data, is_super_admin, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_owner_id,
      'authenticated', 'authenticated',
      'demo-catalog@kreyolkwest.local',
      crypt('demo-password-not-usable-' || gen_random_uuid()::text, gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Catalogue Démo KreyolKwest","account_type":"pro"}'::jsonb,
      false, '', '', '', ''
    );
  END IF;

  -- Ensure profile + pro role exist (handle_new_user trigger should do this, but be safe)
  INSERT INTO public.profiles (id, full_name, account_type)
  VALUES (v_owner_id, 'Catalogue Démo KreyolKwest', 'pro')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_owner_id, 'pro')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
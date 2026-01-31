-- Update Standard Plan (Basic Plus) image limit from 10 to 15
-- This migration updates the max_images for the Standard plan

-- First, let's check if subscription_plans table exists and update it
DO $$
BEGIN
  -- Update the Standard/Basic Plus plan to allow 15 images instead of 10
  UPDATE subscription_plans
  SET max_images = 15
  WHERE LOWER(name) LIKE '%plus%' OR LOWER(name) LIKE '%standard%';
  
  RAISE NOTICE 'Updated Standard plan image limit to 15';
END $$;

-- Update or create the check_image_upload_limit function to use the correct limit
CREATE OR REPLACE FUNCTION public.check_image_upload_limit(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_count integer;
  v_max_allowed integer;
  v_plan_name text;
  v_can_upload boolean;
  v_remaining integer;
BEGIN
  -- Get current image count
  SELECT COUNT(*)
  INTO v_current_count
  FROM menu_images
  WHERE restaurant_id = p_user_id;

  -- Get user's subscription plan and max images allowed (FIXED: use user_subscriptions table)
  SELECT 
    COALESCE(sp.max_images, 5),
    COALESCE(sp.name, 'Basic')
  INTO v_max_allowed, v_plan_name
  FROM profiles p
  LEFT JOIN user_subscriptions us ON us.user_id = p.id AND us.status = 'active'
  LEFT JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE p.id = p_user_id;

  -- If no plan found, default to Basic (5 images)
  IF v_max_allowed IS NULL THEN
    v_max_allowed := 5;
    v_plan_name := 'Basic';
  END IF;

  -- Calculate remaining uploads
  v_remaining := GREATEST(0, v_max_allowed - v_current_count);
  v_can_upload := v_current_count < v_max_allowed;

  -- Return JSON response
  RETURN json_build_object(
    'can_upload', v_can_upload,
    'current_count', v_current_count,
    'max_allowed', v_max_allowed,
    'plan_name', v_plan_name,
    'remaining', v_remaining
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.check_image_upload_limit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_image_upload_limit(uuid) TO anon;

COMMENT ON FUNCTION public.check_image_upload_limit IS 'Check if user can upload more menu images based on their subscription plan. Uses user_subscriptions table.';

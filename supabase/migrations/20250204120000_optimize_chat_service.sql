-- Migration: Optimize Chat Service
-- Description: Adds RPCs for efficient conversation fetching, unread counts, and business chat management.

-- 1. Function to get unified profile (helper)
CREATE OR REPLACE FUNCTION public.get_unified_profile(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile jsonb;
BEGIN
    SELECT jsonb_build_object(
        'id', id,
        'first_name', first_name,
        'last_name', last_name,
        'avatar_url', avatar_url,
        'role', role
    ) INTO v_profile
    FROM public.profiles
    WHERE id = p_user_id;

    RETURN v_profile;
END;
$$;

-- 2. Function to get unified profiles batch
CREATE OR REPLACE FUNCTION public.get_unified_profiles_batch(p_user_ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profiles jsonb;
BEGIN
    SELECT jsonb_object_agg(
        id,
        jsonb_build_object(
            'id', id,
            'first_name', first_name,
            'last_name', last_name,
            'avatar_url', avatar_url,
            'role', role
        )
    ) INTO v_profiles
    FROM public.profiles
    WHERE id = ANY(p_user_ids);

    RETURN v_profiles;
END;
$$;

-- 3. Function to get conversations for a user with last message and unread count
CREATE OR REPLACE FUNCTION public.get_conversations_for_user(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    title text,
    type text,
    created_at timestamptz,
    updated_at timestamptz,
    last_message_at timestamptz,
    unread_count bigint,
    participants jsonb,
    last_message jsonb,
    origin_type text,
    origin_id text,
    business_context jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH user_conversations AS (
        SELECT c.id, c.title, c.conversation_type, c.created_at, c.last_activity, c.origin_type, c.origin_id
        FROM public.conversations c
        JOIN public.participants p ON p.conversation_id = c.id
        WHERE p.user_id = p_user_id
    ),
    last_messages AS (
        SELECT DISTINCT ON (m.conversation_id)
            m.conversation_id,
            m.id,
            m.content,
            m.created_at,
            m.sender_id,
            m.message_type,
            m.status,
            m.attachment_url
        FROM public.messages m
        WHERE m.conversation_id IN (SELECT uc.id FROM user_conversations uc)
        ORDER BY m.conversation_id, m.created_at DESC
    ),
    unread_counts AS (
        SELECT
            m.conversation_id,
            COUNT(*) as count
        FROM public.messages m
        JOIN public.participants p ON p.conversation_id = m.conversation_id
        WHERE p.user_id = p_user_id
        AND m.created_at > p.last_read
        GROUP BY m.conversation_id
    ),
    conv_participants AS (
        SELECT
            p.conversation_id,
            jsonb_agg(
                jsonb_build_object(
                    'user_id', p.user_id,
                    'role', p.role,
                    'joined_at', p.created_at,
                    'last_read', p.last_read
                )
            ) as participants_list
        FROM public.participants p
        WHERE p.conversation_id IN (SELECT uc.id FROM user_conversations uc)
        GROUP BY p.conversation_id
    ),
    business_info AS (
        -- Try to fetch business info if origin_type is 'business' or similar
        -- Assuming origin_id links to business_profiles.id
        SELECT
            bp.id,
            jsonb_build_object(
                'business_name', bp.business_name,
                'logo_url', bp.logo_url
            ) as info
        FROM public.business_profiles bp
        WHERE bp.id IN (SELECT uc.origin_id::uuid FROM user_conversations uc WHERE uc.origin_type = 'business' AND uc.origin_id IS NOT NULL)
    )
    SELECT
        uc.id,
        uc.title,
        uc.conversation_type as type,
        uc.created_at,
        uc.last_activity as updated_at,
        uc.last_activity as last_message_at,
        COALESCE(un.count, 0) as unread_count,
        cp.participants_list as participants,
        CASE WHEN lm.id IS NOT NULL THEN
            jsonb_build_object(
                'id', lm.id,
                'content', lm.content,
                'created_at', lm.created_at,
                'sender_id', lm.sender_id,
                'message_type', lm.message_type,
                'status', lm.status,
                'attachment_url', lm.attachment_url
            )
        ELSE NULL END as last_message,
        uc.origin_type,
        uc.origin_id,
        bi.info as business_context
    FROM user_conversations uc
    LEFT JOIN last_messages lm ON lm.conversation_id = uc.id
    LEFT JOIN unread_counts un ON un.conversation_id = uc.id
    LEFT JOIN conv_participants cp ON cp.conversation_id = uc.id
    LEFT JOIN business_info bi ON bi.id::text = uc.origin_id AND uc.origin_type = 'business'
    ORDER BY uc.last_activity DESC;
END;
$$;

-- 4. Function to get or create business conversation
CREATE OR REPLACE FUNCTION public.get_or_create_business_conversation(p_business_id uuid, p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conversation_id uuid;
BEGIN
    -- Check if conversation already exists between this user and this business context
    -- Assuming 'business' type conversations are unique per user-business pair
    SELECT c.id INTO v_conversation_id
    FROM public.conversations c
    JOIN public.participants p ON p.conversation_id = c.id
    WHERE c.origin_type = 'business'
    AND c.origin_id = p_business_id::text
    AND p.user_id = p_user_id
    LIMIT 1;

    IF v_conversation_id IS NOT NULL THEN
        RETURN v_conversation_id;
    END IF;

    -- Create new conversation
    INSERT INTO public.conversations (title, conversation_type, origin_type, origin_id, last_activity)
    VALUES (
        (SELECT business_name FROM public.business_profiles WHERE id = p_business_id),
        'business',
        'business',
        p_business_id::text,
        NOW()
    )
    RETURNING id INTO v_conversation_id;

    -- Add User
    INSERT INTO public.participants (conversation_id, user_id, role, last_read)
    VALUES (v_conversation_id, p_user_id, 'user', NOW());

    -- Add Business Owner (Find owner of business profile)
    INSERT INTO public.participants (conversation_id, user_id, role, last_read)
    SELECT v_conversation_id, user_id, 'business_owner', NOW()
    FROM public.business_profiles
    WHERE id = p_business_id;

    RETURN v_conversation_id;
END;
$$;

-- 5. Function to mark messages as read
CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id uuid, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE public.participants
    SET last_read = NOW()
    WHERE conversation_id = p_conversation_id
    AND user_id = p_user_id;
END;
$$;

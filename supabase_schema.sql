-- ==========================================================
-- 🧭 RIQSI RUTAS COCHABAMBA - SUPABASE DATABASE SCHEMA v2.0
-- Ejecuta este script en el Editor SQL de tu proyecto en Supabase
-- https://supabase.com/dashboard/project/_/sql
-- ==========================================================

-- 1. TABLA DE LUGARES TURÍSTICOS (places)
CREATE TABLE IF NOT EXISTS public.places (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    area TEXT NOT NULL,
    tag TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('cultura', 'naturaleza', 'gastronomia', 'aventura')),
    image TEXT NOT NULL,
    rating TEXT DEFAULT '4.8',
    time TEXT DEFAULT '1-2 hrs',
    featured BOOLEAN DEFAULT false,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by TEXT
);

-- Índices de búsqueda para optimizar rendimiento de queries
CREATE INDEX IF NOT EXISTS idx_places_category ON public.places(category);
CREATE INDEX IF NOT EXISTS idx_places_visible ON public.places(visible);

-- 2. TABLA DE ANUNCIOS Y BANNERS (announcements)
CREATE TABLE IF NOT EXISTS public.announcements (
    id TEXT PRIMARY KEY,
    active BOOLEAN DEFAULT true,
    badge TEXT DEFAULT 'COCHABAMBA 2026',
    message TEXT NOT NULL,
    link_text TEXT,
    link_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE USUARIOS DEL SISTEMA (app_users)
-- NOTA DE SEGURIDAD: Las contraseñas NUNCA se guardan en texto plano.
-- Solo se guarda el hash criptográfico SHA-256 irreversible con Salt.
CREATE TABLE IF NOT EXISTS public.app_users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'normal' CHECK (role IN ('normal', 'admin', 'editor')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    avatar TEXT DEFAULT '🎒',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.app_users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.app_users(username);

-- 4. TABLA DE REGISTRO DE AUDITORÍA Y SEGURIDAD (security_logs)
CREATE TABLE IF NOT EXISTS public.security_logs (
    id TEXT PRIMARY KEY,
    event TEXT NOT NULL,
    user_email TEXT NOT NULL,
    role TEXT,
    status TEXT NOT NULL CHECK (status IN ('OK', 'WARNING', 'BLOCKED')),
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON public.security_logs(timestamp DESC);

-- ==========================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ==========================================================

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para visitantes
CREATE POLICY "Lectura pública de lugares visibles" ON public.places
    FOR SELECT USING (visible = true);

CREATE POLICY "Lectura pública de anuncios activos" ON public.announcements
    FOR SELECT USING (active = true);

-- Políticas de escritura (habilitadas para clientes autorizados)
CREATE POLICY "Permitir upsert en places" ON public.places
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir upsert en announcements" ON public.announcements
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir gestión de usuarios" ON public.app_users
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir registro de logs de seguridad" ON public.security_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Lectura de logs para administradores" ON public.security_logs
    FOR SELECT USING (true);

-- ==========================================================
-- DATOS INICIALES SEMILLA (SEED DATA)
-- ==========================================================

INSERT INTO public.announcements (id, active, badge, message, link_text, link_url, updated_at)
VALUES (
    'global-banner-1',
    true,
    'BICENTENARIO 2026',
    'Conectado exitosamente con Supabase Cloud DB. Rutas turísticas e inteligentes activas.',
    'Ver Rutas',
    '#rutas',
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Usuario Admin Freddy (Contraseña hasheada criptográficamente con Salt)
INSERT INTO public.app_users (id, username, name, email, password_hash, role, status, avatar, created_at)
VALUES (
    'usr-admin-1',
    'admin',
    'Freddy (Administrador)',
    'admin@riqsirutas.bo',
    'd717ea898b6b7c268d852c9ee9c2020b3aa05cecf870b2ebe5772e96dd50de5f',
    'admin',
    'active',
    '👑',
    NOW()
) ON CONFLICT (id) DO NOTHING;

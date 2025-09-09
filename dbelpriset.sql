-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  email text,
  avatar_url text,
  full_name text,
  id uuid NOT NULL,
  theme text,
  lang text,
  role text NOT NULL DEFAULT 'user'::text,
  area text NOT NULL DEFAULT 'SE4'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.tasks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL,
  duration integer,
  icon text,
  time timestamp with time zone,
  userId uuid,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  notify boolean DEFAULT false,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_userId_fkey FOREIGN KEY (userId) REFERENCES public.profiles(id)
);
CREATE TABLE public.themes (
  _name text NOT NULL,
  _primary text NOT NULL,
  _secondary text NOT NULL,
  _background text NOT NULL,
  _card text NOT NULL,
  _text text NOT NULL,
  _mutedtext text NOT NULL,
  _positive text NOT NULL,
  _negative text NOT NULL,
  _border text NOT NULL,
  id integer NOT NULL DEFAULT nextval('themes_id_seq'::regclass),
  CONSTRAINT themes_pkey PRIMARY KEY (id)
);
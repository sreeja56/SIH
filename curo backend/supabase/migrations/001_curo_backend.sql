create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  phone text not null unique,
  pin_hash text,
  name text not null,
  age integer not null check (age between 0 and 130),
  gender text not null check (gender in ('male','female','other')),
  language text not null default 'en' check (language in ('en','te','hi')),
  village text,
  district text,
  blood_group text,
  emergency_contact text,
  is_otp_verified boolean default false,
  otp_verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.permissions (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  location_allowed boolean,
  notifications_allowed boolean,
  camera_allowed boolean,
  microphone_allowed boolean,
  updated_at timestamptz not null default now()
);

create table if not exists public.doctors (
  id text primary key,
  name text not null,
  name_te text,
  name_hi text,
  qualification text not null,
  specialization text not null,
  specialization_te text,
  specialization_hi text,
  hospital_name text not null,
  hospital_type text not null,
  address text not null,
  village text,
  district text,
  distance_km numeric(8,2) default 0,
  rating numeric(3,2) default 0,
  reviews_count integer default 0,
  contact_number text,
  fee numeric(10,2) default 0,
  available_days jsonb not null default '[]'::jsonb,
  photo_url text,
  map_coordinates jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.doctor_slots (
  id uuid primary key default gen_random_uuid(),
  doctor_id text not null references public.doctors(id) on delete cascade,
  slot_time text not null,
  available boolean not null default true,
  total_slots integer not null default 0 check (total_slots >= 0),
  available_slots integer not null default 0 check (available_slots >= 0),
  unique(doctor_id, slot_time)
);

create table if not exists public.appointments (
  id text primary key,
  unique_id text not null unique,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id text not null references public.doctors(id),
  doctor_name text not null,
  hospital_name text not null,
  hospital_address text not null,
  patient_name text not null,
  patient_age integer not null,
  patient_gender text not null,
  patient_phone text not null,
  appointment_date date not null,
  time_slot text not null,
  symptoms_brief text,
  status text not null default 'confirmed' check (status in ('confirmed','completed','cancelled')),
  token_number integer not null,
  alarm_set boolean default true,
  alarm_minutes_before integer default 30,
  created_at timestamptz not null default now()
);

create table if not exists public.medical_documents (
  id text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null,
  doctor_name text,
  hospital_name text,
  record_date date not null,
  uploaded_at text not null,
  original_size_bytes bigint not null default 0,
  compressed_size_bytes bigint not null default 0,
  compression_ratio_percent numeric(6,2) not null default 0,
  data_url text,
  source text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.feedback (
  id text primary key,
  profile_id uuid references public.profiles(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  category text not null,
  comment text not null,
  user_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  sender text not null check (sender in ('user','assistant','system')),
  text text not null,
  language text not null check (language in ('en','te','hi')),
  timestamp timestamptz not null,
  is_triage_question boolean default false
);

create table if not exists public.triage_results (
  id text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  result jsonb not null,
  created_at timestamptz not null default now()
);

-- The Express server uses the Supabase service-role key. Keep these tables locked
-- from the public client; later, if the frontend moves to Supabase Auth, add
-- auth.uid()-based policies instead of exposing service-role credentials.
alter table public.profiles enable row level security;
alter table public.permissions enable row level security;
alter table public.doctors enable row level security;
alter table public.doctor_slots enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_documents enable row level security;
alter table public.feedback enable row level security;
alter table public.chat_messages enable row level security;
alter table public.triage_results enable row level security;

create or replace function public.upsert_profile(
  p_username text,
  p_phone text,
  p_pin text,
  p_name text,
  p_age integer,
  p_gender text,
  p_language text,
  p_village text,
  p_district text,
  p_blood_group text,
  p_emergency_contact text,
  p_is_otp_verified boolean,
  p_otp_verified_at timestamptz,
  p_created_at timestamptz,
  p_updated_at timestamptz
) returns public.profiles
language plpgsql security definer set search_path = public
as $$
declare r public.profiles;
begin
  insert into public.profiles(username, phone, pin_hash, name, age, gender, language, village, district, blood_group, emergency_contact, is_otp_verified, otp_verified_at, created_at, updated_at)
  values (lower(trim(p_username)), regexp_replace(p_phone, '\\D', '', 'g'), case when p_pin is null then null else crypt(p_pin, gen_salt('bf', 10)) end, p_name, p_age, p_gender, p_language, p_village, p_district, p_blood_group, p_emergency_contact, coalesce(p_is_otp_verified,false), p_otp_verified_at, coalesce(p_created_at, now()), coalesce(p_updated_at, now()))
  on conflict (username) do update set
    phone = excluded.phone,
    pin_hash = case when p_pin is null then public.profiles.pin_hash else crypt(p_pin, gen_salt('bf', 10)) end,
    name = excluded.name, age = excluded.age, gender = excluded.gender, language = excluded.language,
    village = excluded.village, district = excluded.district, blood_group = excluded.blood_group,
    emergency_contact = excluded.emergency_contact, is_otp_verified = excluded.is_otp_verified,
    otp_verified_at = excluded.otp_verified_at, updated_at = now()
  returning * into r;
  return r;
end; $$;

create or replace function public.verify_pin(p_identifier text, p_pin text)
returns public.profiles
language sql security definer set search_path = public
as $$
  select * from public.profiles
  where (lower(username) = lower(trim(p_identifier))
     or phone = regexp_replace(p_identifier, '\\D', '', 'g'))
    and pin_hash is not null
    and pin_hash = crypt(p_pin, pin_hash)
  limit 1;
$$;

create or replace function public.book_appointment(
  p_id text, p_unique_id text, p_profile_id uuid, p_doctor_id text,
  p_doctor_name text, p_hospital_name text, p_hospital_address text,
  p_patient_name text, p_patient_age integer, p_patient_gender text,
  p_patient_phone text, p_date date, p_time_slot text, p_symptoms_brief text,
  p_token_number integer, p_alarm_set boolean, p_alarm_minutes_before integer
) returns public.appointments
language plpgsql security definer set search_path = public
as $$
declare a public.appointments;
begin
  update public.doctor_slots
    set available_slots = available_slots - 1,
        available = case when available_slots - 1 <= 0 then false else available end
  where doctor_id = p_doctor_id and slot_time = p_time_slot and available = true and available_slots > 0;
  if not found then raise exception 'NO_SLOTS_AVAILABLE'; end if;

  insert into public.appointments(id, unique_id, profile_id, doctor_id, doctor_name, hospital_name, hospital_address, patient_name, patient_age, patient_gender, patient_phone, appointment_date, time_slot, symptoms_brief, token_number, alarm_set, alarm_minutes_before)
  values (p_id, p_unique_id, p_profile_id, p_doctor_id, p_doctor_name, p_hospital_name, p_hospital_address, p_patient_name, p_patient_age, p_patient_gender, p_patient_phone, p_date, p_time_slot, p_symptoms_brief, p_token_number, coalesce(p_alarm_set,true), coalesce(p_alarm_minutes_before,30))
  returning * into a;
  return a;
exception when others then
  update public.doctor_slots set available_slots = available_slots + 1, available = true
  where doctor_id = p_doctor_id and slot_time = p_time_slot;
  raise;
end; $$;

create index if not exists appointments_profile_idx on public.appointments(profile_id, created_at desc);
create index if not exists documents_profile_idx on public.medical_documents(profile_id, created_at desc);
create index if not exists chat_profile_idx on public.chat_messages(profile_id, timestamp);
create index if not exists triage_profile_idx on public.triage_results(profile_id, created_at desc);

create or replace function public.cancel_appointment(p_id text)
returns void
language plpgsql security definer set search_path = public
as $$
declare a public.appointments;
begin
  select * into a from public.appointments where id = p_id for update;
  if not found or a.status = 'cancelled' then return; end if;
  update public.appointments set status = 'cancelled' where id = p_id;
  update public.doctor_slots set available_slots = least(total_slots, available_slots + 1), available = true
    where doctor_id = a.doctor_id and slot_time = a.time_slot;
end; $$;
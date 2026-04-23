drop extension if exists "pg_net";


  create table "public"."ai_messages" (
    "id" uuid not null default gen_random_uuid(),
    "role" text not null,
    "content" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."ai_messages" enable row level security;


  create table "public"."announcements" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "content" text not null,
    "priority" text,
    "author" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."announcements" enable row level security;


  create table "public"."audit_logs" (
    "id" uuid not null default gen_random_uuid(),
    "table_name" text not null,
    "record_id" uuid,
    "action" text not null,
    "old_data" jsonb,
    "new_data" jsonb,
    "changed_by" uuid default auth.uid(),
    "changed_at" timestamp with time zone default now()
      );


alter table "public"."audit_logs" enable row level security;


  create table "public"."automation_scripts" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text,
    "code" text not null,
    "language" text default 'python'::text,
    "instructions" text,
    "is_custom" boolean default false,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now())
      );


alter table "public"."automation_scripts" enable row level security;


  create table "public"."candidates" (
    "id" uuid not null default gen_random_uuid(),
    "job_id" uuid,
    "name" text not null,
    "email" text,
    "phone" text,
    "position" text,
    "status" text default 'Inscrito'::text,
    "rating" integer default 0,
    "notes" text,
    "applied_at" timestamp with time zone default now(),
    "resume_url" text
      );


alter table "public"."candidates" enable row level security;


  create table "public"."employee_documents" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid,
    "name" text not null,
    "url" text not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."employee_documents" enable row level security;


  create table "public"."employees" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "email" text,
    "role" text,
    "department" text,
    "status" text default 'Ativo'::text,
    "admission_date" date,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "password" text,
    "phone" text,
    "contract_type" text default 'CLT'::text,
    "birth_date" date,
    "salary" numeric default 0,
    "manager" text,
    "work_schedule" text default '09:00 - 18:00'::text,
    "unit" text,
    "base_salary" numeric default 0,
    "fixed_discounts" numeric default 0,
    "has_insalubrity" boolean default false,
    "has_night_shift" boolean default false,
    "contracted_hours" numeric default 220,
    "pis_pasep" text,
    "pix_key" text,
    "vacation_due_date" date,
    "vacation_limit_date" date,
    "family_salary_amount" numeric default 0,
    "insalubrity_amount" numeric default 0,
    "night_shift_amount" numeric default 0,
    "overtime_amount" numeric default 0,
    "vacation_amount" numeric default 0,
    "vacation_third_amount" numeric default 0,
    "variable_discounts" jsonb default '[]'::jsonb,
    "variable_additions" jsonb default '[]'::jsonb,
    "avatar_url" text,
    "inss_value" numeric default 0,
    "termination_date" date
      );


alter table "public"."employees" enable row level security;


  create table "public"."evaluation_tokens" (
    "id" uuid not null default gen_random_uuid(),
    "token" text not null,
    "employee_id" uuid not null,
    "reviewer_id" uuid not null,
    "employee_name" text not null,
    "reviewer_name" text not null,
    "status" text default 'pending'::text,
    "expires_at" timestamp with time zone not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."evaluation_tokens" enable row level security;


  create table "public"."jobs" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "department" text,
    "location" text,
    "type" text,
    "status" text default 'Aberta'::text,
    "description" text,
    "requirements" text[],
    "created_at" timestamp with time zone default now()
      );


alter table "public"."jobs" enable row level security;


  create table "public"."payroll_configurations" (
    "id" uuid not null default gen_random_uuid(),
    "key" text not null,
    "value" jsonb not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."payroll_configurations" enable row level security;


  create table "public"."payslip_acknowledgments" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid not null,
    "reference_date" date not null,
    "signed_at" timestamp with time zone default now(),
    "ip_address" text,
    "user_agent" text,
    "signature_image" text
      );


alter table "public"."payslip_acknowledgments" enable row level security;


  create table "public"."performance_reviews" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid,
    "reviewer_id" uuid,
    "period" text,
    "overall_score" numeric,
    "goals" jsonb,
    "competencies" jsonb,
    "feedback" text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."performance_reviews" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "full_name" text,
    "avatar_url" text,
    "email" text,
    "updated_at" timestamp with time zone default now(),
    "display_role" text
      );


alter table "public"."profiles" enable row level security;


  create table "public"."push_subscriptions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "subscription_details" jsonb not null,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."push_subscriptions" enable row level security;


  create table "public"."settings" (
    "id" uuid not null default gen_random_uuid(),
    "company_name" text,
    "cnpj" text,
    "email" text,
    "phone" text,
    "website" text,
    "address" text,
    "city" text,
    "state" text,
    "zip_code" text,
    "theme" text default 'light'::text,
    "notifications_enabled" boolean default true,
    "created_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "updated_at" timestamp with time zone not null default timezone('utc'::text, now()),
    "developer_name" text default 'Marcos Guilherme'::text,
    "avatar_url" text
      );


alter table "public"."settings" enable row level security;


  create table "public"."suggestions" (
    "id" uuid not null default gen_random_uuid(),
    "customer_name" text,
    "contact_info" text,
    "content" text not null,
    "status" text default 'Nova'::text,
    "created_at" timestamp with time zone default now()
      );


alter table "public"."suggestions" enable row level security;


  create table "public"."tickets" (
    "id" uuid not null default gen_random_uuid(),
    "ticket_num" text not null,
    "employee_name" text not null,
    "title" text not null,
    "description" text not null,
    "status" text not null default 'open'::text,
    "priority" text not null default 'medium'::text,
    "hr_notes" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."tickets" enable row level security;


  create table "public"."time_entries" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid,
    "timestamp" timestamp with time zone default now(),
    "type" text,
    "latitude" numeric,
    "longitude" numeric,
    "notes" text
      );


alter table "public"."time_entries" enable row level security;


  create table "public"."time_off_requests" (
    "id" uuid not null default gen_random_uuid(),
    "employee_id" uuid,
    "type" text not null,
    "start_date" date not null,
    "end_date" date not null,
    "status" text default 'pending'::text,
    "reason" text,
    "created_at" timestamp with time zone default now(),
    "attachment_url" text
      );


alter table "public"."time_off_requests" enable row level security;

CREATE UNIQUE INDEX ai_messages_pkey ON public.ai_messages USING btree (id);

CREATE UNIQUE INDEX announcements_pkey ON public.announcements USING btree (id);

CREATE UNIQUE INDEX audit_logs_pkey ON public.audit_logs USING btree (id);

CREATE UNIQUE INDEX automation_scripts_pkey ON public.automation_scripts USING btree (id);

CREATE UNIQUE INDEX candidates_pkey ON public.candidates USING btree (id);

CREATE UNIQUE INDEX employee_documents_pkey ON public.employee_documents USING btree (id);

CREATE UNIQUE INDEX employees_pkey ON public.employees USING btree (id);

CREATE UNIQUE INDEX evaluation_tokens_pkey ON public.evaluation_tokens USING btree (id);

CREATE UNIQUE INDEX evaluation_tokens_token_key ON public.evaluation_tokens USING btree (token);

CREATE INDEX idx_employees_email ON public.employees USING btree (email);

CREATE INDEX idx_time_entries_employee_date ON public.time_entries USING btree (employee_id, "timestamp");

CREATE UNIQUE INDEX jobs_pkey ON public.jobs USING btree (id);

CREATE UNIQUE INDEX payroll_configurations_key_key ON public.payroll_configurations USING btree (key);

CREATE UNIQUE INDEX payroll_configurations_pkey ON public.payroll_configurations USING btree (id);

CREATE UNIQUE INDEX payslip_acknowledgments_employee_id_reference_date_key ON public.payslip_acknowledgments USING btree (employee_id, reference_date);

CREATE UNIQUE INDEX payslip_acknowledgments_pkey ON public.payslip_acknowledgments USING btree (id);

CREATE UNIQUE INDEX performance_reviews_pkey ON public.performance_reviews USING btree (id);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX push_subscriptions_endpoint_unique ON public.push_subscriptions USING btree (((subscription_details ->> 'endpoint'::text)));

CREATE UNIQUE INDEX push_subscriptions_pkey ON public.push_subscriptions USING btree (id);

CREATE UNIQUE INDEX settings_pkey ON public.settings USING btree (id);

CREATE UNIQUE INDEX suggestions_pkey ON public.suggestions USING btree (id);

CREATE UNIQUE INDEX tickets_pkey ON public.tickets USING btree (id);

CREATE UNIQUE INDEX time_entries_pkey ON public.time_entries USING btree (id);

CREATE UNIQUE INDEX time_off_requests_pkey ON public.time_off_requests USING btree (id);

alter table "public"."ai_messages" add constraint "ai_messages_pkey" PRIMARY KEY using index "ai_messages_pkey";

alter table "public"."announcements" add constraint "announcements_pkey" PRIMARY KEY using index "announcements_pkey";

alter table "public"."audit_logs" add constraint "audit_logs_pkey" PRIMARY KEY using index "audit_logs_pkey";

alter table "public"."automation_scripts" add constraint "automation_scripts_pkey" PRIMARY KEY using index "automation_scripts_pkey";

alter table "public"."candidates" add constraint "candidates_pkey" PRIMARY KEY using index "candidates_pkey";

alter table "public"."employee_documents" add constraint "employee_documents_pkey" PRIMARY KEY using index "employee_documents_pkey";

alter table "public"."employees" add constraint "employees_pkey" PRIMARY KEY using index "employees_pkey";

alter table "public"."evaluation_tokens" add constraint "evaluation_tokens_pkey" PRIMARY KEY using index "evaluation_tokens_pkey";

alter table "public"."jobs" add constraint "jobs_pkey" PRIMARY KEY using index "jobs_pkey";

alter table "public"."payroll_configurations" add constraint "payroll_configurations_pkey" PRIMARY KEY using index "payroll_configurations_pkey";

alter table "public"."payslip_acknowledgments" add constraint "payslip_acknowledgments_pkey" PRIMARY KEY using index "payslip_acknowledgments_pkey";

alter table "public"."performance_reviews" add constraint "performance_reviews_pkey" PRIMARY KEY using index "performance_reviews_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."push_subscriptions" add constraint "push_subscriptions_pkey" PRIMARY KEY using index "push_subscriptions_pkey";

alter table "public"."settings" add constraint "settings_pkey" PRIMARY KEY using index "settings_pkey";

alter table "public"."suggestions" add constraint "suggestions_pkey" PRIMARY KEY using index "suggestions_pkey";

alter table "public"."tickets" add constraint "tickets_pkey" PRIMARY KEY using index "tickets_pkey";

alter table "public"."time_entries" add constraint "time_entries_pkey" PRIMARY KEY using index "time_entries_pkey";

alter table "public"."time_off_requests" add constraint "time_off_requests_pkey" PRIMARY KEY using index "time_off_requests_pkey";

alter table "public"."ai_messages" add constraint "ai_messages_role_check" CHECK ((role = ANY (ARRAY['user'::text, 'assistant'::text]))) not valid;

alter table "public"."ai_messages" validate constraint "ai_messages_role_check";

alter table "public"."announcements" add constraint "announcements_priority_check" CHECK ((priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text]))) not valid;

alter table "public"."announcements" validate constraint "announcements_priority_check";

alter table "public"."candidates" add constraint "candidates_job_id_fkey" FOREIGN KEY (job_id) REFERENCES public.jobs(id) not valid;

alter table "public"."candidates" validate constraint "candidates_job_id_fkey";

alter table "public"."employee_documents" add constraint "employee_documents_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE not valid;

alter table "public"."employee_documents" validate constraint "employee_documents_employee_id_fkey";

alter table "public"."evaluation_tokens" add constraint "evaluation_tokens_status_check" CHECK ((status = ANY (ARRAY['pending'::text, 'completed'::text, 'expired'::text]))) not valid;

alter table "public"."evaluation_tokens" validate constraint "evaluation_tokens_status_check";

alter table "public"."evaluation_tokens" add constraint "evaluation_tokens_token_key" UNIQUE using index "evaluation_tokens_token_key";

alter table "public"."payroll_configurations" add constraint "payroll_configurations_key_key" UNIQUE using index "payroll_configurations_key_key";

alter table "public"."payslip_acknowledgments" add constraint "payslip_acknowledgments_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES public.employees(id) not valid;

alter table "public"."payslip_acknowledgments" validate constraint "payslip_acknowledgments_employee_id_fkey";

alter table "public"."payslip_acknowledgments" add constraint "payslip_acknowledgments_employee_id_reference_date_key" UNIQUE using index "payslip_acknowledgments_employee_id_reference_date_key";

alter table "public"."performance_reviews" add constraint "performance_reviews_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE not valid;

alter table "public"."performance_reviews" validate constraint "performance_reviews_employee_id_fkey";

alter table "public"."performance_reviews" add constraint "performance_reviews_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES public.employees(id) ON DELETE CASCADE not valid;

alter table "public"."performance_reviews" validate constraint "performance_reviews_reviewer_id_fkey";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."push_subscriptions" add constraint "push_subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."push_subscriptions" validate constraint "push_subscriptions_user_id_fkey";

alter table "public"."time_entries" add constraint "time_entries_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE not valid;

alter table "public"."time_entries" validate constraint "time_entries_employee_id_fkey";

alter table "public"."time_entries" add constraint "time_entries_type_check" CHECK ((type = ANY (ARRAY['in'::text, 'out'::text, 'lunch_start'::text, 'lunch_end'::text]))) not valid;

alter table "public"."time_entries" validate constraint "time_entries_type_check";

alter table "public"."time_off_requests" add constraint "time_off_requests_employee_id_fkey" FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE not valid;

alter table "public"."time_off_requests" validate constraint "time_off_requests_employee_id_fkey";

set check_function_bodies = off;

create or replace view "public"."employees_public" as  SELECT id,
    name,
    email,
    role,
    department,
    unit,
    status,
    admission_date,
    phone,
    contract_type,
    birth_date,
    manager,
    work_schedule,
    pis_pasep,
    avatar_url,
    pix_key,
    vacation_due_date,
    vacation_limit_date,
    contracted_hours,
    has_insalubrity,
    has_night_shift,
    created_at
   FROM public.employees;


CREATE OR REPLACE FUNCTION public.get_employee_by_pin(pin_input text)
 RETURNS SETOF public.employees
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY SELECT * FROM employees WHERE password = pin_input;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_audit_log()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  clean_old jsonb;
  clean_new jsonb;
BEGIN
  -- Remove campos sensíveis (password) do JSON antes de salvar
  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    clean_old = row_to_json(OLD)::jsonb - 'password';
  END IF;
  
  IF TG_OP IN ('UPDATE', 'INSERT') THEN
    clean_new = row_to_json(NEW)::jsonb - 'password';
  END IF;

  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', clean_old);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_data, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', clean_old, clean_new);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, new_data)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', clean_new);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'),
    new.email,
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_self_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  -- Se o ID do registro a ser deletado (OLD.id) for igual ao ID do usuário logado (auth.uid())
  IF OLD.id = auth.uid() THEN
    RAISE EXCEPTION 'Ação bloqueada: Você não pode excluir sua própria conta para evitar lockout.';
  END IF;
  RETURN OLD;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.submit_public_evaluation(token_input text, overall_score numeric, feedback_text text, competencies_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  token_record record;
BEGIN
  -- Valida o token novamente no servidor
  SELECT * INTO token_record FROM evaluation_tokens 
  WHERE token = token_input AND status = 'pending' AND expires_at > now();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Token inválido ou expirado.';
  END IF;

  -- Insere a avaliação na tabela oficial
  INSERT INTO performance_reviews (
    employee_id, 
    reviewer_id, 
    period, 
    overall_score, 
    feedback, 
    competencies,
    goals,
    created_at
  )
  VALUES (
    token_record.employee_id,
    token_record.reviewer_id,
    to_char(now(), 'MM/YYYY'),
    overall_score,
    feedback_text,
    competencies_data,
    '[]'::jsonb,
    now()
  );

  -- Marca o token como utilizado para não ser usado novamente
  UPDATE evaluation_tokens SET status = 'completed' WHERE id = token_record.id;
END;
$function$
;

grant delete on table "public"."ai_messages" to "anon";

grant insert on table "public"."ai_messages" to "anon";

grant references on table "public"."ai_messages" to "anon";

grant select on table "public"."ai_messages" to "anon";

grant trigger on table "public"."ai_messages" to "anon";

grant truncate on table "public"."ai_messages" to "anon";

grant update on table "public"."ai_messages" to "anon";

grant delete on table "public"."ai_messages" to "authenticated";

grant insert on table "public"."ai_messages" to "authenticated";

grant references on table "public"."ai_messages" to "authenticated";

grant select on table "public"."ai_messages" to "authenticated";

grant trigger on table "public"."ai_messages" to "authenticated";

grant truncate on table "public"."ai_messages" to "authenticated";

grant update on table "public"."ai_messages" to "authenticated";

grant delete on table "public"."ai_messages" to "service_role";

grant insert on table "public"."ai_messages" to "service_role";

grant references on table "public"."ai_messages" to "service_role";

grant select on table "public"."ai_messages" to "service_role";

grant trigger on table "public"."ai_messages" to "service_role";

grant truncate on table "public"."ai_messages" to "service_role";

grant update on table "public"."ai_messages" to "service_role";

grant delete on table "public"."announcements" to "anon";

grant insert on table "public"."announcements" to "anon";

grant references on table "public"."announcements" to "anon";

grant select on table "public"."announcements" to "anon";

grant trigger on table "public"."announcements" to "anon";

grant truncate on table "public"."announcements" to "anon";

grant update on table "public"."announcements" to "anon";

grant delete on table "public"."announcements" to "authenticated";

grant insert on table "public"."announcements" to "authenticated";

grant references on table "public"."announcements" to "authenticated";

grant select on table "public"."announcements" to "authenticated";

grant trigger on table "public"."announcements" to "authenticated";

grant truncate on table "public"."announcements" to "authenticated";

grant update on table "public"."announcements" to "authenticated";

grant delete on table "public"."announcements" to "service_role";

grant insert on table "public"."announcements" to "service_role";

grant references on table "public"."announcements" to "service_role";

grant select on table "public"."announcements" to "service_role";

grant trigger on table "public"."announcements" to "service_role";

grant truncate on table "public"."announcements" to "service_role";

grant update on table "public"."announcements" to "service_role";

grant delete on table "public"."audit_logs" to "anon";

grant insert on table "public"."audit_logs" to "anon";

grant references on table "public"."audit_logs" to "anon";

grant select on table "public"."audit_logs" to "anon";

grant trigger on table "public"."audit_logs" to "anon";

grant truncate on table "public"."audit_logs" to "anon";

grant update on table "public"."audit_logs" to "anon";

grant delete on table "public"."audit_logs" to "authenticated";

grant insert on table "public"."audit_logs" to "authenticated";

grant references on table "public"."audit_logs" to "authenticated";

grant select on table "public"."audit_logs" to "authenticated";

grant trigger on table "public"."audit_logs" to "authenticated";

grant truncate on table "public"."audit_logs" to "authenticated";

grant update on table "public"."audit_logs" to "authenticated";

grant delete on table "public"."audit_logs" to "service_role";

grant insert on table "public"."audit_logs" to "service_role";

grant references on table "public"."audit_logs" to "service_role";

grant select on table "public"."audit_logs" to "service_role";

grant trigger on table "public"."audit_logs" to "service_role";

grant truncate on table "public"."audit_logs" to "service_role";

grant update on table "public"."audit_logs" to "service_role";

grant delete on table "public"."automation_scripts" to "anon";

grant insert on table "public"."automation_scripts" to "anon";

grant references on table "public"."automation_scripts" to "anon";

grant select on table "public"."automation_scripts" to "anon";

grant trigger on table "public"."automation_scripts" to "anon";

grant truncate on table "public"."automation_scripts" to "anon";

grant update on table "public"."automation_scripts" to "anon";

grant delete on table "public"."automation_scripts" to "authenticated";

grant insert on table "public"."automation_scripts" to "authenticated";

grant references on table "public"."automation_scripts" to "authenticated";

grant select on table "public"."automation_scripts" to "authenticated";

grant trigger on table "public"."automation_scripts" to "authenticated";

grant truncate on table "public"."automation_scripts" to "authenticated";

grant update on table "public"."automation_scripts" to "authenticated";

grant delete on table "public"."automation_scripts" to "service_role";

grant insert on table "public"."automation_scripts" to "service_role";

grant references on table "public"."automation_scripts" to "service_role";

grant select on table "public"."automation_scripts" to "service_role";

grant trigger on table "public"."automation_scripts" to "service_role";

grant truncate on table "public"."automation_scripts" to "service_role";

grant update on table "public"."automation_scripts" to "service_role";

grant delete on table "public"."candidates" to "anon";

grant insert on table "public"."candidates" to "anon";

grant references on table "public"."candidates" to "anon";

grant select on table "public"."candidates" to "anon";

grant trigger on table "public"."candidates" to "anon";

grant truncate on table "public"."candidates" to "anon";

grant update on table "public"."candidates" to "anon";

grant delete on table "public"."candidates" to "authenticated";

grant insert on table "public"."candidates" to "authenticated";

grant references on table "public"."candidates" to "authenticated";

grant select on table "public"."candidates" to "authenticated";

grant trigger on table "public"."candidates" to "authenticated";

grant truncate on table "public"."candidates" to "authenticated";

grant update on table "public"."candidates" to "authenticated";

grant delete on table "public"."candidates" to "service_role";

grant insert on table "public"."candidates" to "service_role";

grant references on table "public"."candidates" to "service_role";

grant select on table "public"."candidates" to "service_role";

grant trigger on table "public"."candidates" to "service_role";

grant truncate on table "public"."candidates" to "service_role";

grant update on table "public"."candidates" to "service_role";

grant delete on table "public"."employee_documents" to "anon";

grant insert on table "public"."employee_documents" to "anon";

grant references on table "public"."employee_documents" to "anon";

grant select on table "public"."employee_documents" to "anon";

grant trigger on table "public"."employee_documents" to "anon";

grant truncate on table "public"."employee_documents" to "anon";

grant update on table "public"."employee_documents" to "anon";

grant delete on table "public"."employee_documents" to "authenticated";

grant insert on table "public"."employee_documents" to "authenticated";

grant references on table "public"."employee_documents" to "authenticated";

grant select on table "public"."employee_documents" to "authenticated";

grant trigger on table "public"."employee_documents" to "authenticated";

grant truncate on table "public"."employee_documents" to "authenticated";

grant update on table "public"."employee_documents" to "authenticated";

grant delete on table "public"."employee_documents" to "service_role";

grant insert on table "public"."employee_documents" to "service_role";

grant references on table "public"."employee_documents" to "service_role";

grant select on table "public"."employee_documents" to "service_role";

grant trigger on table "public"."employee_documents" to "service_role";

grant truncate on table "public"."employee_documents" to "service_role";

grant update on table "public"."employee_documents" to "service_role";

grant delete on table "public"."employees" to "anon";

grant insert on table "public"."employees" to "anon";

grant references on table "public"."employees" to "anon";

grant select on table "public"."employees" to "anon";

grant trigger on table "public"."employees" to "anon";

grant truncate on table "public"."employees" to "anon";

grant update on table "public"."employees" to "anon";

grant delete on table "public"."employees" to "authenticated";

grant insert on table "public"."employees" to "authenticated";

grant references on table "public"."employees" to "authenticated";

grant select on table "public"."employees" to "authenticated";

grant trigger on table "public"."employees" to "authenticated";

grant truncate on table "public"."employees" to "authenticated";

grant update on table "public"."employees" to "authenticated";

grant delete on table "public"."employees" to "service_role";

grant insert on table "public"."employees" to "service_role";

grant references on table "public"."employees" to "service_role";

grant select on table "public"."employees" to "service_role";

grant trigger on table "public"."employees" to "service_role";

grant truncate on table "public"."employees" to "service_role";

grant update on table "public"."employees" to "service_role";

grant delete on table "public"."evaluation_tokens" to "anon";

grant insert on table "public"."evaluation_tokens" to "anon";

grant references on table "public"."evaluation_tokens" to "anon";

grant select on table "public"."evaluation_tokens" to "anon";

grant trigger on table "public"."evaluation_tokens" to "anon";

grant truncate on table "public"."evaluation_tokens" to "anon";

grant update on table "public"."evaluation_tokens" to "anon";

grant delete on table "public"."evaluation_tokens" to "authenticated";

grant insert on table "public"."evaluation_tokens" to "authenticated";

grant references on table "public"."evaluation_tokens" to "authenticated";

grant select on table "public"."evaluation_tokens" to "authenticated";

grant trigger on table "public"."evaluation_tokens" to "authenticated";

grant truncate on table "public"."evaluation_tokens" to "authenticated";

grant update on table "public"."evaluation_tokens" to "authenticated";

grant delete on table "public"."evaluation_tokens" to "service_role";

grant insert on table "public"."evaluation_tokens" to "service_role";

grant references on table "public"."evaluation_tokens" to "service_role";

grant select on table "public"."evaluation_tokens" to "service_role";

grant trigger on table "public"."evaluation_tokens" to "service_role";

grant truncate on table "public"."evaluation_tokens" to "service_role";

grant update on table "public"."evaluation_tokens" to "service_role";

grant delete on table "public"."jobs" to "anon";

grant insert on table "public"."jobs" to "anon";

grant references on table "public"."jobs" to "anon";

grant select on table "public"."jobs" to "anon";

grant trigger on table "public"."jobs" to "anon";

grant truncate on table "public"."jobs" to "anon";

grant update on table "public"."jobs" to "anon";

grant delete on table "public"."jobs" to "authenticated";

grant insert on table "public"."jobs" to "authenticated";

grant references on table "public"."jobs" to "authenticated";

grant select on table "public"."jobs" to "authenticated";

grant trigger on table "public"."jobs" to "authenticated";

grant truncate on table "public"."jobs" to "authenticated";

grant update on table "public"."jobs" to "authenticated";

grant delete on table "public"."jobs" to "service_role";

grant insert on table "public"."jobs" to "service_role";

grant references on table "public"."jobs" to "service_role";

grant select on table "public"."jobs" to "service_role";

grant trigger on table "public"."jobs" to "service_role";

grant truncate on table "public"."jobs" to "service_role";

grant update on table "public"."jobs" to "service_role";

grant delete on table "public"."payroll_configurations" to "anon";

grant insert on table "public"."payroll_configurations" to "anon";

grant references on table "public"."payroll_configurations" to "anon";

grant select on table "public"."payroll_configurations" to "anon";

grant trigger on table "public"."payroll_configurations" to "anon";

grant truncate on table "public"."payroll_configurations" to "anon";

grant update on table "public"."payroll_configurations" to "anon";

grant delete on table "public"."payroll_configurations" to "authenticated";

grant insert on table "public"."payroll_configurations" to "authenticated";

grant references on table "public"."payroll_configurations" to "authenticated";

grant select on table "public"."payroll_configurations" to "authenticated";

grant trigger on table "public"."payroll_configurations" to "authenticated";

grant truncate on table "public"."payroll_configurations" to "authenticated";

grant update on table "public"."payroll_configurations" to "authenticated";

grant delete on table "public"."payroll_configurations" to "service_role";

grant insert on table "public"."payroll_configurations" to "service_role";

grant references on table "public"."payroll_configurations" to "service_role";

grant select on table "public"."payroll_configurations" to "service_role";

grant trigger on table "public"."payroll_configurations" to "service_role";

grant truncate on table "public"."payroll_configurations" to "service_role";

grant update on table "public"."payroll_configurations" to "service_role";

grant delete on table "public"."payslip_acknowledgments" to "anon";

grant insert on table "public"."payslip_acknowledgments" to "anon";

grant references on table "public"."payslip_acknowledgments" to "anon";

grant select on table "public"."payslip_acknowledgments" to "anon";

grant trigger on table "public"."payslip_acknowledgments" to "anon";

grant truncate on table "public"."payslip_acknowledgments" to "anon";

grant update on table "public"."payslip_acknowledgments" to "anon";

grant delete on table "public"."payslip_acknowledgments" to "authenticated";

grant insert on table "public"."payslip_acknowledgments" to "authenticated";

grant references on table "public"."payslip_acknowledgments" to "authenticated";

grant select on table "public"."payslip_acknowledgments" to "authenticated";

grant trigger on table "public"."payslip_acknowledgments" to "authenticated";

grant truncate on table "public"."payslip_acknowledgments" to "authenticated";

grant update on table "public"."payslip_acknowledgments" to "authenticated";

grant delete on table "public"."payslip_acknowledgments" to "service_role";

grant insert on table "public"."payslip_acknowledgments" to "service_role";

grant references on table "public"."payslip_acknowledgments" to "service_role";

grant select on table "public"."payslip_acknowledgments" to "service_role";

grant trigger on table "public"."payslip_acknowledgments" to "service_role";

grant truncate on table "public"."payslip_acknowledgments" to "service_role";

grant update on table "public"."payslip_acknowledgments" to "service_role";

grant delete on table "public"."performance_reviews" to "anon";

grant insert on table "public"."performance_reviews" to "anon";

grant references on table "public"."performance_reviews" to "anon";

grant select on table "public"."performance_reviews" to "anon";

grant trigger on table "public"."performance_reviews" to "anon";

grant truncate on table "public"."performance_reviews" to "anon";

grant update on table "public"."performance_reviews" to "anon";

grant delete on table "public"."performance_reviews" to "authenticated";

grant insert on table "public"."performance_reviews" to "authenticated";

grant references on table "public"."performance_reviews" to "authenticated";

grant select on table "public"."performance_reviews" to "authenticated";

grant trigger on table "public"."performance_reviews" to "authenticated";

grant truncate on table "public"."performance_reviews" to "authenticated";

grant update on table "public"."performance_reviews" to "authenticated";

grant delete on table "public"."performance_reviews" to "service_role";

grant insert on table "public"."performance_reviews" to "service_role";

grant references on table "public"."performance_reviews" to "service_role";

grant select on table "public"."performance_reviews" to "service_role";

grant trigger on table "public"."performance_reviews" to "service_role";

grant truncate on table "public"."performance_reviews" to "service_role";

grant update on table "public"."performance_reviews" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."push_subscriptions" to "anon";

grant insert on table "public"."push_subscriptions" to "anon";

grant references on table "public"."push_subscriptions" to "anon";

grant select on table "public"."push_subscriptions" to "anon";

grant trigger on table "public"."push_subscriptions" to "anon";

grant truncate on table "public"."push_subscriptions" to "anon";

grant update on table "public"."push_subscriptions" to "anon";

grant delete on table "public"."push_subscriptions" to "authenticated";

grant insert on table "public"."push_subscriptions" to "authenticated";

grant references on table "public"."push_subscriptions" to "authenticated";

grant select on table "public"."push_subscriptions" to "authenticated";

grant trigger on table "public"."push_subscriptions" to "authenticated";

grant truncate on table "public"."push_subscriptions" to "authenticated";

grant update on table "public"."push_subscriptions" to "authenticated";

grant delete on table "public"."push_subscriptions" to "service_role";

grant insert on table "public"."push_subscriptions" to "service_role";

grant references on table "public"."push_subscriptions" to "service_role";

grant select on table "public"."push_subscriptions" to "service_role";

grant trigger on table "public"."push_subscriptions" to "service_role";

grant truncate on table "public"."push_subscriptions" to "service_role";

grant update on table "public"."push_subscriptions" to "service_role";

grant delete on table "public"."settings" to "anon";

grant insert on table "public"."settings" to "anon";

grant references on table "public"."settings" to "anon";

grant select on table "public"."settings" to "anon";

grant trigger on table "public"."settings" to "anon";

grant truncate on table "public"."settings" to "anon";

grant update on table "public"."settings" to "anon";

grant delete on table "public"."settings" to "authenticated";

grant insert on table "public"."settings" to "authenticated";

grant references on table "public"."settings" to "authenticated";

grant select on table "public"."settings" to "authenticated";

grant trigger on table "public"."settings" to "authenticated";

grant truncate on table "public"."settings" to "authenticated";

grant update on table "public"."settings" to "authenticated";

grant delete on table "public"."settings" to "service_role";

grant insert on table "public"."settings" to "service_role";

grant references on table "public"."settings" to "service_role";

grant select on table "public"."settings" to "service_role";

grant trigger on table "public"."settings" to "service_role";

grant truncate on table "public"."settings" to "service_role";

grant update on table "public"."settings" to "service_role";

grant delete on table "public"."suggestions" to "anon";

grant insert on table "public"."suggestions" to "anon";

grant references on table "public"."suggestions" to "anon";

grant select on table "public"."suggestions" to "anon";

grant trigger on table "public"."suggestions" to "anon";

grant truncate on table "public"."suggestions" to "anon";

grant update on table "public"."suggestions" to "anon";

grant delete on table "public"."suggestions" to "authenticated";

grant insert on table "public"."suggestions" to "authenticated";

grant references on table "public"."suggestions" to "authenticated";

grant select on table "public"."suggestions" to "authenticated";

grant trigger on table "public"."suggestions" to "authenticated";

grant truncate on table "public"."suggestions" to "authenticated";

grant update on table "public"."suggestions" to "authenticated";

grant delete on table "public"."suggestions" to "service_role";

grant insert on table "public"."suggestions" to "service_role";

grant references on table "public"."suggestions" to "service_role";

grant select on table "public"."suggestions" to "service_role";

grant trigger on table "public"."suggestions" to "service_role";

grant truncate on table "public"."suggestions" to "service_role";

grant update on table "public"."suggestions" to "service_role";

grant delete on table "public"."tickets" to "anon";

grant insert on table "public"."tickets" to "anon";

grant references on table "public"."tickets" to "anon";

grant select on table "public"."tickets" to "anon";

grant trigger on table "public"."tickets" to "anon";

grant truncate on table "public"."tickets" to "anon";

grant update on table "public"."tickets" to "anon";

grant delete on table "public"."tickets" to "authenticated";

grant insert on table "public"."tickets" to "authenticated";

grant references on table "public"."tickets" to "authenticated";

grant select on table "public"."tickets" to "authenticated";

grant trigger on table "public"."tickets" to "authenticated";

grant truncate on table "public"."tickets" to "authenticated";

grant update on table "public"."tickets" to "authenticated";

grant delete on table "public"."tickets" to "service_role";

grant insert on table "public"."tickets" to "service_role";

grant references on table "public"."tickets" to "service_role";

grant select on table "public"."tickets" to "service_role";

grant trigger on table "public"."tickets" to "service_role";

grant truncate on table "public"."tickets" to "service_role";

grant update on table "public"."tickets" to "service_role";

grant delete on table "public"."time_entries" to "anon";

grant insert on table "public"."time_entries" to "anon";

grant references on table "public"."time_entries" to "anon";

grant select on table "public"."time_entries" to "anon";

grant trigger on table "public"."time_entries" to "anon";

grant truncate on table "public"."time_entries" to "anon";

grant update on table "public"."time_entries" to "anon";

grant delete on table "public"."time_entries" to "authenticated";

grant insert on table "public"."time_entries" to "authenticated";

grant references on table "public"."time_entries" to "authenticated";

grant select on table "public"."time_entries" to "authenticated";

grant trigger on table "public"."time_entries" to "authenticated";

grant truncate on table "public"."time_entries" to "authenticated";

grant update on table "public"."time_entries" to "authenticated";

grant delete on table "public"."time_entries" to "service_role";

grant insert on table "public"."time_entries" to "service_role";

grant references on table "public"."time_entries" to "service_role";

grant select on table "public"."time_entries" to "service_role";

grant trigger on table "public"."time_entries" to "service_role";

grant truncate on table "public"."time_entries" to "service_role";

grant update on table "public"."time_entries" to "service_role";

grant delete on table "public"."time_off_requests" to "anon";

grant insert on table "public"."time_off_requests" to "anon";

grant references on table "public"."time_off_requests" to "anon";

grant select on table "public"."time_off_requests" to "anon";

grant trigger on table "public"."time_off_requests" to "anon";

grant truncate on table "public"."time_off_requests" to "anon";

grant update on table "public"."time_off_requests" to "anon";

grant delete on table "public"."time_off_requests" to "authenticated";

grant insert on table "public"."time_off_requests" to "authenticated";

grant references on table "public"."time_off_requests" to "authenticated";

grant select on table "public"."time_off_requests" to "authenticated";

grant trigger on table "public"."time_off_requests" to "authenticated";

grant truncate on table "public"."time_off_requests" to "authenticated";

grant update on table "public"."time_off_requests" to "authenticated";

grant delete on table "public"."time_off_requests" to "service_role";

grant insert on table "public"."time_off_requests" to "service_role";

grant references on table "public"."time_off_requests" to "service_role";

grant select on table "public"."time_off_requests" to "service_role";

grant trigger on table "public"."time_off_requests" to "service_role";

grant truncate on table "public"."time_off_requests" to "service_role";

grant update on table "public"."time_off_requests" to "service_role";


  create policy "Acesso Total Autenticado"
  on "public"."ai_messages"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso total ai_messages"
  on "public"."ai_messages"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."announcements"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso total announcements"
  on "public"."announcements"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."audit_logs"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Apenas autenticados podem ver logs"
  on "public"."audit_logs"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Acesso Total Autenticado"
  on "public"."automation_scripts"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso total automation_scripts"
  on "public"."automation_scripts"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."candidates"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso total candidates"
  on "public"."candidates"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."employee_documents"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso Restrito a Logados"
  on "public"."employees"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso público para validação de token"
  on "public"."evaluation_tokens"
  as permissive
  for select
  to anon
using (((status = 'pending'::text) AND (expires_at > now())));



  create policy "Admins podem criar tokens"
  on "public"."evaluation_tokens"
  as permissive
  for insert
  to authenticated
with check (true);



  create policy "Admins podem ver tokens"
  on "public"."evaluation_tokens"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Acesso Total Autenticado"
  on "public"."jobs"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso total jobs"
  on "public"."jobs"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."payroll_configurations"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."payslip_acknowledgments"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso Total Terminal Ponto"
  on "public"."payslip_acknowledgments"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."performance_reviews"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso total performance_reviews"
  on "public"."performance_reviews"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Users can insert own profile"
  on "public"."profiles"
  as permissive
  for insert
  to public
with check ((auth.uid() = id));



  create policy "Users can update own profile"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id));



  create policy "Users can view own profile"
  on "public"."profiles"
  as permissive
  for select
  to public
using ((auth.uid() = id));



  create policy "Acesso Total Autenticado"
  on "public"."push_subscriptions"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."settings"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso total settings"
  on "public"."settings"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."suggestions"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Allow auth read suggestions"
  on "public"."suggestions"
  as permissive
  for select
  to authenticated
using (true);



  create policy "Allow auth update suggestions"
  on "public"."suggestions"
  as permissive
  for update
  to authenticated
using (true);



  create policy "Allow public insert suggestions"
  on "public"."suggestions"
  as permissive
  for insert
  to public
with check (true);



  create policy "Authenticated Update Access"
  on "public"."tickets"
  as permissive
  for update
  to public
using ((auth.role() = 'authenticated'::text));



  create policy "Public Insert Access"
  on "public"."tickets"
  as permissive
  for insert
  to public
with check (true);



  create policy "Public Read Access"
  on "public"."tickets"
  as permissive
  for select
  to public
using (true);



  create policy "Acesso Total Autenticado"
  on "public"."time_entries"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso total time_entries"
  on "public"."time_entries"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Acesso Total Autenticado"
  on "public"."time_off_requests"
  as permissive
  for all
  to authenticated
using (true)
with check (true);



  create policy "Acesso total time_off_requests"
  on "public"."time_off_requests"
  as permissive
  for all
  to public
using (true)
with check (true);


CREATE TRIGGER audit_employees_changes AFTER INSERT OR DELETE OR UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER check_self_deletion BEFORE DELETE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.prevent_self_deletion();

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Auth Full Access Documents"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using ((bucket_id = 'documents'::text))
with check ((bucket_id = 'documents'::text));



  create policy "Auth Full Access TimeOff"
  on "storage"."objects"
  as permissive
  for all
  to authenticated
using ((bucket_id = 'time-off-attachments'::text))
with check ((bucket_id = 'time-off-attachments'::text));



  create policy "Auth Read Resumes"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using ((bucket_id = 'resumes'::text));



  create policy "Auth Update Avatars"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using ((bucket_id = 'avatars'::text));



  create policy "Auth Upload Avatars"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check ((bucket_id = 'avatars'::text));



  create policy "Liberar Geral Documents"
  on "storage"."objects"
  as permissive
  for all
  to public
using ((bucket_id = 'documents'::text))
with check ((bucket_id = 'documents'::text));



  create policy "Permitir Acesso Terminal flreew_0"
  on "storage"."objects"
  as permissive
  for select
  to anon
using ((bucket_id = 'documents'::text));



  create policy "Permitir Acesso Terminal flreew_1"
  on "storage"."objects"
  as permissive
  for insert
  to anon
with check ((bucket_id = 'documents'::text));



  create policy "Permitir Acesso Terminal flreew_2"
  on "storage"."objects"
  as permissive
  for update
  to anon
using ((bucket_id = 'documents'::text));



  create policy "Public Read Avatars"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'avatars'::text));



  create policy "Public Upload Resumes"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check ((bucket_id = 'resumes'::text));




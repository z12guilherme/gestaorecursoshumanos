


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."employees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "role" "text",
    "department" "text",
    "status" "text" DEFAULT 'Ativo'::"text",
    "admission_date" "date",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "password" "text",
    "phone" "text",
    "contract_type" "text" DEFAULT 'CLT'::"text",
    "birth_date" "date",
    "salary" numeric DEFAULT 0,
    "manager" "text",
    "work_schedule" "text" DEFAULT '09:00 - 18:00'::"text",
    "unit" "text",
    "base_salary" numeric DEFAULT 0,
    "fixed_discounts" numeric DEFAULT 0,
    "has_insalubrity" boolean DEFAULT false,
    "has_night_shift" boolean DEFAULT false,
    "contracted_hours" numeric DEFAULT 220,
    "pis_pasep" "text",
    "pix_key" "text",
    "vacation_due_date" "date",
    "vacation_limit_date" "date",
    "family_salary_amount" numeric DEFAULT 0,
    "insalubrity_amount" numeric DEFAULT 0,
    "night_shift_amount" numeric DEFAULT 0,
    "overtime_amount" numeric DEFAULT 0,
    "vacation_amount" numeric DEFAULT 0,
    "vacation_third_amount" numeric DEFAULT 0,
    "variable_discounts" "jsonb" DEFAULT '[]'::"jsonb",
    "variable_additions" "jsonb" DEFAULT '[]'::"jsonb",
    "avatar_url" "text",
    "inss_value" numeric DEFAULT 0
);


ALTER TABLE "public"."employees" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_employee_by_pin"("pin_input" "text") RETURNS SETOF "public"."employees"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY SELECT * FROM employees WHERE password = pin_input;
END;
$$;


ALTER FUNCTION "public"."get_employee_by_pin"("pin_input" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_audit_log"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_audit_log"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_self_deletion"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Se o ID do registro a ser deletado (OLD.id) for igual ao ID do usuário logado (auth.uid())
  IF OLD.id = auth.uid() THEN
    RAISE EXCEPTION 'Ação bloqueada: Você não pode excluir sua própria conta para evitar lockout.';
  END IF;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."prevent_self_deletion"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."submit_public_evaluation"("token_input" "text", "overall_score" numeric, "feedback_text" "text", "competencies_data" "jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."submit_public_evaluation"("token_input" "text", "overall_score" numeric, "feedback_text" "text", "competencies_data" "jsonb") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text"])))
);


ALTER TABLE "public"."ai_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "priority" "text",
    "author" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "announcements_priority_check" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "table_name" "text" NOT NULL,
    "record_id" "uuid",
    "action" "text" NOT NULL,
    "old_data" "jsonb",
    "new_data" "jsonb",
    "changed_by" "uuid" DEFAULT "auth"."uid"(),
    "changed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."automation_scripts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "code" "text" NOT NULL,
    "language" "text" DEFAULT 'python'::"text",
    "instructions" "text",
    "is_custom" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."automation_scripts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "job_id" "uuid",
    "name" "text" NOT NULL,
    "email" "text",
    "phone" "text",
    "position" "text",
    "status" "text" DEFAULT 'Inscrito'::"text",
    "rating" integer DEFAULT 0,
    "notes" "text",
    "applied_at" timestamp with time zone DEFAULT "now"(),
    "resume_url" "text"
);


ALTER TABLE "public"."candidates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid",
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."employee_documents" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."employees_public" AS
 SELECT "id",
    "name",
    "email",
    "role",
    "department",
    "unit",
    "status",
    "admission_date",
    "phone",
    "contract_type",
    "birth_date",
    "manager",
    "work_schedule",
    "pis_pasep",
    "avatar_url",
    "pix_key",
    "vacation_due_date",
    "vacation_limit_date",
    "contracted_hours",
    "has_insalubrity",
    "has_night_shift",
    "created_at"
   FROM "public"."employees";


ALTER VIEW "public"."employees_public" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."evaluation_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "token" "text" NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "employee_name" "text" NOT NULL,
    "reviewer_name" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "evaluation_tokens_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'expired'::"text"])))
);


ALTER TABLE "public"."evaluation_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "department" "text",
    "location" "text",
    "type" "text",
    "status" "text" DEFAULT 'Aberta'::"text",
    "description" "text",
    "requirements" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payroll_configurations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payroll_configurations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payslip_acknowledgments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid" NOT NULL,
    "reference_date" "date" NOT NULL,
    "signed_at" timestamp with time zone DEFAULT "now"(),
    "ip_address" "text",
    "user_agent" "text",
    "signature_image" "text"
);


ALTER TABLE "public"."payslip_acknowledgments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."performance_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid",
    "reviewer_id" "uuid",
    "period" "text",
    "overall_score" numeric,
    "goals" "jsonb",
    "competencies" "jsonb",
    "feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."performance_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "avatar_url" "text",
    "email" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "display_role" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."push_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subscription_details" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."push_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_name" "text",
    "cnpj" "text",
    "email" "text",
    "phone" "text",
    "website" "text",
    "address" "text",
    "city" "text",
    "state" "text",
    "zip_code" "text",
    "theme" "text" DEFAULT 'light'::"text",
    "notifications_enabled" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "developer_name" "text" DEFAULT 'Marcos Guilherme'::"text",
    "avatar_url" "text"
);


ALTER TABLE "public"."settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."suggestions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_name" "text",
    "contact_info" "text",
    "content" "text" NOT NULL,
    "status" "text" DEFAULT 'Nova'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."suggestions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_num" "text" NOT NULL,
    "employee_name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "hr_notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "type" "text",
    "latitude" numeric,
    "longitude" numeric,
    "notes" "text",
    CONSTRAINT "time_entries_type_check" CHECK (("type" = ANY (ARRAY['in'::"text", 'out'::"text", 'lunch_start'::"text", 'lunch_end'::"text"])))
);


ALTER TABLE "public"."time_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_off_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employee_id" "uuid",
    "type" "text" NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "attachment_url" "text"
);


ALTER TABLE "public"."time_off_requests" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_messages"
    ADD CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."automation_scripts"
    ADD CONSTRAINT "automation_scripts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_documents"
    ADD CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employees"
    ADD CONSTRAINT "employees_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluation_tokens"
    ADD CONSTRAINT "evaluation_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."evaluation_tokens"
    ADD CONSTRAINT "evaluation_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."jobs"
    ADD CONSTRAINT "jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payroll_configurations"
    ADD CONSTRAINT "payroll_configurations_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."payroll_configurations"
    ADD CONSTRAINT "payroll_configurations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payslip_acknowledgments"
    ADD CONSTRAINT "payslip_acknowledgments_employee_id_reference_date_key" UNIQUE ("employee_id", "reference_date");



ALTER TABLE ONLY "public"."payslip_acknowledgments"
    ADD CONSTRAINT "payslip_acknowledgments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."performance_reviews"
    ADD CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."settings"
    ADD CONSTRAINT "settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."suggestions"
    ADD CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_employees_email" ON "public"."employees" USING "btree" ("email");



CREATE INDEX "idx_time_entries_employee_date" ON "public"."time_entries" USING "btree" ("employee_id", "timestamp");



CREATE UNIQUE INDEX "push_subscriptions_endpoint_unique" ON "public"."push_subscriptions" USING "btree" ((("subscription_details" ->> 'endpoint'::"text")));



CREATE OR REPLACE TRIGGER "audit_employees_changes" AFTER INSERT OR DELETE OR UPDATE ON "public"."employees" FOR EACH ROW EXECUTE FUNCTION "public"."handle_audit_log"();



CREATE OR REPLACE TRIGGER "check_self_deletion" BEFORE DELETE ON "public"."employees" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_self_deletion"();



ALTER TABLE ONLY "public"."candidates"
    ADD CONSTRAINT "candidates_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id");



ALTER TABLE ONLY "public"."employee_documents"
    ADD CONSTRAINT "employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."payslip_acknowledgments"
    ADD CONSTRAINT "payslip_acknowledgments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id");



ALTER TABLE ONLY "public"."performance_reviews"
    ADD CONSTRAINT "performance_reviews_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."performance_reviews"
    ADD CONSTRAINT "performance_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."push_subscriptions"
    ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_off_requests"
    ADD CONSTRAINT "time_off_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE CASCADE;



CREATE POLICY "Acesso Restrito a Logados" ON "public"."employees" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."ai_messages" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."announcements" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."audit_logs" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."automation_scripts" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."candidates" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."employee_documents" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."jobs" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."payroll_configurations" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."payslip_acknowledgments" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."performance_reviews" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."push_subscriptions" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."settings" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."suggestions" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."time_entries" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Autenticado" ON "public"."time_off_requests" TO "authenticated" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso Total Terminal Ponto" ON "public"."payslip_acknowledgments" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso público para validação de token" ON "public"."evaluation_tokens" FOR SELECT TO "anon" USING ((("status" = 'pending'::"text") AND ("expires_at" > "now"())));



CREATE POLICY "Acesso total ai_messages" ON "public"."ai_messages" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso total announcements" ON "public"."announcements" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso total automation_scripts" ON "public"."automation_scripts" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso total candidates" ON "public"."candidates" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso total jobs" ON "public"."jobs" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso total performance_reviews" ON "public"."performance_reviews" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso total settings" ON "public"."settings" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso total time_entries" ON "public"."time_entries" USING (true) WITH CHECK (true);



CREATE POLICY "Acesso total time_off_requests" ON "public"."time_off_requests" USING (true) WITH CHECK (true);



CREATE POLICY "Admins podem criar tokens" ON "public"."evaluation_tokens" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Admins podem ver tokens" ON "public"."evaluation_tokens" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow auth read suggestions" ON "public"."suggestions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow auth update suggestions" ON "public"."suggestions" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Allow public insert suggestions" ON "public"."suggestions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Apenas autenticados podem ver logs" ON "public"."audit_logs" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated Update Access" ON "public"."tickets" FOR UPDATE USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Public Insert Access" ON "public"."tickets" FOR INSERT WITH CHECK (true);



CREATE POLICY "Public Read Access" ON "public"."tickets" FOR SELECT USING (true);



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



ALTER TABLE "public"."ai_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."automation_scripts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employees" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."evaluation_tokens" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payroll_configurations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payslip_acknowledgments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."performance_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."push_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."suggestions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_off_requests" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON TABLE "public"."employees" TO "anon";
GRANT ALL ON TABLE "public"."employees" TO "authenticated";
GRANT ALL ON TABLE "public"."employees" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_employee_by_pin"("pin_input" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_employee_by_pin"("pin_input" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_employee_by_pin"("pin_input" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_audit_log"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_audit_log"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_audit_log"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_self_deletion"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_self_deletion"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_self_deletion"() TO "service_role";



GRANT ALL ON FUNCTION "public"."submit_public_evaluation"("token_input" "text", "overall_score" numeric, "feedback_text" "text", "competencies_data" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."submit_public_evaluation"("token_input" "text", "overall_score" numeric, "feedback_text" "text", "competencies_data" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."submit_public_evaluation"("token_input" "text", "overall_score" numeric, "feedback_text" "text", "competencies_data" "jsonb") TO "service_role";


















GRANT ALL ON TABLE "public"."ai_messages" TO "anon";
GRANT ALL ON TABLE "public"."ai_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_messages" TO "service_role";



GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."automation_scripts" TO "anon";
GRANT ALL ON TABLE "public"."automation_scripts" TO "authenticated";
GRANT ALL ON TABLE "public"."automation_scripts" TO "service_role";



GRANT ALL ON TABLE "public"."candidates" TO "anon";
GRANT ALL ON TABLE "public"."candidates" TO "authenticated";
GRANT ALL ON TABLE "public"."candidates" TO "service_role";



GRANT ALL ON TABLE "public"."employee_documents" TO "anon";
GRANT ALL ON TABLE "public"."employee_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_documents" TO "service_role";



GRANT ALL ON TABLE "public"."employees_public" TO "anon";
GRANT ALL ON TABLE "public"."employees_public" TO "authenticated";
GRANT ALL ON TABLE "public"."employees_public" TO "service_role";



GRANT ALL ON TABLE "public"."evaluation_tokens" TO "anon";
GRANT ALL ON TABLE "public"."evaluation_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."evaluation_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."jobs" TO "anon";
GRANT ALL ON TABLE "public"."jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."jobs" TO "service_role";



GRANT ALL ON TABLE "public"."payroll_configurations" TO "anon";
GRANT ALL ON TABLE "public"."payroll_configurations" TO "authenticated";
GRANT ALL ON TABLE "public"."payroll_configurations" TO "service_role";



GRANT ALL ON TABLE "public"."payslip_acknowledgments" TO "anon";
GRANT ALL ON TABLE "public"."payslip_acknowledgments" TO "authenticated";
GRANT ALL ON TABLE "public"."payslip_acknowledgments" TO "service_role";



GRANT ALL ON TABLE "public"."performance_reviews" TO "anon";
GRANT ALL ON TABLE "public"."performance_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."performance_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."push_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."push_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."settings" TO "anon";
GRANT ALL ON TABLE "public"."settings" TO "authenticated";
GRANT ALL ON TABLE "public"."settings" TO "service_role";



GRANT ALL ON TABLE "public"."suggestions" TO "anon";
GRANT ALL ON TABLE "public"."suggestions" TO "authenticated";
GRANT ALL ON TABLE "public"."suggestions" TO "service_role";



GRANT ALL ON TABLE "public"."tickets" TO "anon";
GRANT ALL ON TABLE "public"."tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."tickets" TO "service_role";



GRANT ALL ON TABLE "public"."time_entries" TO "anon";
GRANT ALL ON TABLE "public"."time_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."time_entries" TO "service_role";



GRANT ALL ON TABLE "public"."time_off_requests" TO "anon";
GRANT ALL ON TABLE "public"."time_off_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."time_off_requests" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";
































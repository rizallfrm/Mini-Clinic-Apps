--
-- PostgreSQL database dump
--

-- Dumped from database version 10.23
-- Dumped by pg_dump version 16.9

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: enum_medical_records_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_medical_records_status AS ENUM (
    'DRAFT',
    'COMPLETED'
);


ALTER TYPE public.enum_medical_records_status OWNER TO postgres;

--
-- Name: enum_patients_gender; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_patients_gender AS ENUM (
    'MALE',
    'FEMALE'
);


ALTER TYPE public.enum_patients_gender OWNER TO postgres;

--
-- Name: enum_payment_details_item_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payment_details_item_type AS ENUM (
    'CONSULTATION',
    'MEDICINE',
    'OTHER'
);


ALTER TYPE public.enum_payment_details_item_type OWNER TO postgres;

--
-- Name: enum_payments_payment_method; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payments_payment_method AS ENUM (
    'CASH',
    'CARD',
    'INSURANCE',
    'BPJS'
);


ALTER TYPE public.enum_payments_payment_method OWNER TO postgres;

--
-- Name: enum_payments_payment_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_payments_payment_status AS ENUM (
    'PENDING',
    'PAID',
    'CANCELLED'
);


ALTER TYPE public.enum_payments_payment_status OWNER TO postgres;

--
-- Name: enum_queues_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_queues_status AS ENUM (
    'WAITING',
    'CALLED',
    'IN_PROGRESS',
    'COMPLETED',
    'SKIPPED'
);


ALTER TYPE public.enum_queues_status OWNER TO postgres;

--
-- Name: enum_registrations_payment_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_registrations_payment_type AS ENUM (
    'CASH',
    'INSURANCE',
    'BPJS',
    'OTHER'
);


ALTER TYPE public.enum_registrations_payment_type OWNER TO postgres;

--
-- Name: enum_registrations_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_registrations_status AS ENUM (
    'WAITING',
    'CHECKED_IN',
    'EXAMINATION',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.enum_registrations_status OWNER TO postgres;

--
-- Name: enum_users_role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.enum_users_role AS ENUM (
    'ADMIN',
    'DOCTOR',
    'REGISTRATION_OFFICER'
);


ALTER TYPE public.enum_users_role OWNER TO postgres;

SET default_tablespace = '';

--
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."SequelizeMeta" (
    name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO postgres;

--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    policlinic_id bigint NOT NULL,
    doctor_code character varying(30) NOT NULL,
    name character varying(150) NOT NULL,
    specialization character varying(150),
    phone character varying(20),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.doctors_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.doctors_id_seq OWNER TO postgres;

--
-- Name: doctors_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.doctors_id_seq OWNED BY public.doctors.id;


--
-- Name: medical_actions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_actions (
    id bigint NOT NULL,
    medical_record_id bigint NOT NULL,
    action_name character varying(150) NOT NULL,
    description text,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.medical_actions OWNER TO postgres;

--
-- Name: medical_actions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_actions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_actions_id_seq OWNER TO postgres;

--
-- Name: medical_actions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_actions_id_seq OWNED BY public.medical_actions.id;


--
-- Name: medical_records; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_records (
    id bigint NOT NULL,
    registration_id bigint NOT NULL,
    patient_id bigint NOT NULL,
    doctor_id bigint NOT NULL,
    subjective text NOT NULL,
    blood_pressure character varying(20),
    body_temperature numeric(5,2),
    weight numeric(5,2),
    height numeric(5,2),
    assessment text NOT NULL,
    plan text NOT NULL,
    examination_date timestamp with time zone NOT NULL,
    status public.enum_medical_records_status DEFAULT 'DRAFT'::public.enum_medical_records_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    objective text,
    pulse integer,
    notes text
);


ALTER TABLE public.medical_records OWNER TO postgres;

--
-- Name: COLUMN medical_records.subjective; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.subjective IS 'S - Keluhan subjektif dari pasien';


--
-- Name: COLUMN medical_records.blood_pressure; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.blood_pressure IS 'Tekanan darah, contoh: 120/80';


--
-- Name: COLUMN medical_records.body_temperature; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.body_temperature IS 'Suhu tubuh dalam Celsius';


--
-- Name: COLUMN medical_records.weight; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.weight IS 'Berat badan dalam kg';


--
-- Name: COLUMN medical_records.height; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.height IS 'Tinggi badan dalam cm';


--
-- Name: COLUMN medical_records.assessment; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.assessment IS 'A - Diagnosa dokter';


--
-- Name: COLUMN medical_records.plan; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.medical_records.plan IS 'P - Rencana pengobatan';


--
-- Name: medical_records_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medical_records_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medical_records_id_seq OWNER TO postgres;

--
-- Name: medical_records_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medical_records_id_seq OWNED BY public.medical_records.id;


--
-- Name: medicines; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medicines (
    id bigint NOT NULL,
    medicine_code character varying(30) NOT NULL,
    name character varying(150) NOT NULL,
    unit character varying(50) NOT NULL,
    stock integer DEFAULT 0 NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.medicines OWNER TO postgres;

--
-- Name: medicines_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.medicines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.medicines_id_seq OWNER TO postgres;

--
-- Name: medicines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.medicines_id_seq OWNED BY public.medicines.id;


--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id bigint NOT NULL,
    medical_record_number character varying(20) NOT NULL,
    nik character varying(16) NOT NULL,
    name character varying(150) NOT NULL,
    gender public.enum_patients_gender NOT NULL,
    birth_date date NOT NULL,
    phone character varying(20) NOT NULL,
    address text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.patients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.patients_id_seq OWNER TO postgres;

--
-- Name: patients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.patients_id_seq OWNED BY public.patients.id;


--
-- Name: payment_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_details (
    id bigint NOT NULL,
    payment_id bigint NOT NULL,
    item_type public.enum_payment_details_item_type NOT NULL,
    item_name character varying(255) NOT NULL,
    quantity integer DEFAULT 1,
    unit_price numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.payment_details OWNER TO postgres;

--
-- Name: payment_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_details_id_seq OWNER TO postgres;

--
-- Name: payment_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_details_id_seq OWNED BY public.payment_details.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    registration_id bigint NOT NULL,
    patient_id bigint NOT NULL,
    payment_number character varying(30) NOT NULL,
    consultation_fee numeric(12,2) DEFAULT 50000,
    medicine_fee numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) NOT NULL,
    payment_method public.enum_payments_payment_method DEFAULT 'CASH'::public.enum_payments_payment_method,
    payment_status public.enum_payments_payment_status DEFAULT 'PENDING'::public.enum_payments_payment_status,
    paid_at timestamp with time zone,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: policlinics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.policlinics (
    id bigint NOT NULL,
    code character varying(30) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.policlinics OWNER TO postgres;

--
-- Name: policlinics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.policlinics_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.policlinics_id_seq OWNER TO postgres;

--
-- Name: policlinics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.policlinics_id_seq OWNED BY public.policlinics.id;


--
-- Name: prescription_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescription_details (
    id bigint NOT NULL,
    prescription_id bigint NOT NULL,
    medicine_id bigint NOT NULL,
    dosage character varying(100) NOT NULL,
    frequency character varying(100) NOT NULL,
    duration character varying(100),
    quantity integer NOT NULL,
    instructions text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.prescription_details OWNER TO postgres;

--
-- Name: COLUMN prescription_details.dosage; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescription_details.dosage IS 'Contoh: 500mg, 1 tablet';


--
-- Name: COLUMN prescription_details.frequency; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescription_details.frequency IS 'Contoh: 3x sehari, 2x sehari';


--
-- Name: COLUMN prescription_details.duration; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescription_details.duration IS 'Contoh: 5 hari, 1 minggu';


--
-- Name: COLUMN prescription_details.quantity; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescription_details.quantity IS 'Jumlah obat yang diberikan';


--
-- Name: COLUMN prescription_details.instructions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.prescription_details.instructions IS 'Contoh: Diminum setelah makan';


--
-- Name: prescription_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescription_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescription_details_id_seq OWNER TO postgres;

--
-- Name: prescription_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescription_details_id_seq OWNED BY public.prescription_details.id;


--
-- Name: prescriptions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prescriptions (
    id bigint NOT NULL,
    medical_record_id bigint NOT NULL,
    patient_id bigint NOT NULL,
    doctor_id bigint NOT NULL,
    prescription_number character varying(30) NOT NULL,
    notes text,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.prescriptions OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prescriptions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prescriptions_id_seq OWNER TO postgres;

--
-- Name: prescriptions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prescriptions_id_seq OWNED BY public.prescriptions.id;


--
-- Name: queues; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queues (
    id bigint NOT NULL,
    registration_id bigint NOT NULL,
    queue_number character varying(10) NOT NULL,
    queue_date date NOT NULL,
    sequence_number integer NOT NULL,
    status public.enum_queues_status DEFAULT 'WAITING'::public.enum_queues_status NOT NULL,
    called_at timestamp with time zone,
    completed_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.queues OWNER TO postgres;

--
-- Name: queues_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.queues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.queues_id_seq OWNER TO postgres;

--
-- Name: queues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.queues_id_seq OWNED BY public.queues.id;


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.registrations (
    id bigint NOT NULL,
    registration_number character varying(30) NOT NULL,
    patient_id bigint NOT NULL,
    doctor_id bigint NOT NULL,
    policlinic_id bigint NOT NULL,
    created_by bigint NOT NULL,
    visit_date date NOT NULL,
    payment_type public.enum_registrations_payment_type NOT NULL,
    initial_complaint text NOT NULL,
    status public.enum_registrations_status DEFAULT 'WAITING'::public.enum_registrations_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.registrations OWNER TO postgres;

--
-- Name: registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.registrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.registrations_id_seq OWNER TO postgres;

--
-- Name: registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.registrations_id_seq OWNED BY public.registrations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(100) NOT NULL,
    email character varying(150) NOT NULL,
    password character varying(255) NOT NULL,
    role public.enum_users_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: doctors id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors ALTER COLUMN id SET DEFAULT nextval('public.doctors_id_seq'::regclass);


--
-- Name: medical_actions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_actions ALTER COLUMN id SET DEFAULT nextval('public.medical_actions_id_seq'::regclass);


--
-- Name: medical_records id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records ALTER COLUMN id SET DEFAULT nextval('public.medical_records_id_seq'::regclass);


--
-- Name: medicines id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines ALTER COLUMN id SET DEFAULT nextval('public.medicines_id_seq'::regclass);


--
-- Name: patients id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients ALTER COLUMN id SET DEFAULT nextval('public.patients_id_seq'::regclass);


--
-- Name: payment_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_details ALTER COLUMN id SET DEFAULT nextval('public.payment_details_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: policlinics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policlinics ALTER COLUMN id SET DEFAULT nextval('public.policlinics_id_seq'::regclass);


--
-- Name: prescription_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_details ALTER COLUMN id SET DEFAULT nextval('public.prescription_details_id_seq'::regclass);


--
-- Name: prescriptions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions ALTER COLUMN id SET DEFAULT nextval('public.prescriptions_id_seq'::regclass);


--
-- Name: queues id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queues ALTER COLUMN id SET DEFAULT nextval('public.queues_id_seq'::regclass);


--
-- Name: registrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations ALTER COLUMN id SET DEFAULT nextval('public.registrations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."SequelizeMeta" (name) FROM stdin;
20240101000001-create-users.js
20240101000002-create-policlinics.js
20240101000003-create-patients.js
20240101000004-create-doctors.js
20240101000005-create-medicines.js
20240101000006-create-registrations.js
20240101000007-create-queues.js
20240101000008-create-medical-records.js
20240101000009-create-medical-actions.js
20240101000010-create-prescriptions.js
20240101000011-create-prescription-details.js
20260731140435-add-price-to-medicines.js
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (id, user_id, policlinic_id, doctor_code, name, specialization, phone, is_active, created_at, updated_at) FROM stdin;
1	2	1	DR-001	Dr. Ahmad Fauzi, Sp.U	Dokter Umum	08111234567	t	2026-07-30 18:46:02.81+07	2026-07-30 18:46:02.81+07
2	3	2	DR-002	Dr. Sari Dewi, drg	Dokter Gigi	08222345678	t	2026-07-30 18:46:02.81+07	2026-07-30 18:46:02.81+07
3	5	3	DR-003	dr. Amanda Putri, Sp.M	Dokter Spesialis Mata	08231234212	t	2026-08-01 18:09:09.435+07	2026-08-02 00:10:18.252+07
4	6	5	DR-004	dr. Budi Santoso, SP.A	Dokter Spesialis Anak	0823128763546	t	2026-08-02 21:35:29.798+07	2026-08-02 21:35:29.798+07
5	7	6	DR-005	drg. Maya Rosita, Sp.KG	Dokter Gigi	0823123456731	t	2026-08-02 21:53:52.048+07	2026-08-02 21:59:17.53+07
\.


--
-- Data for Name: medical_actions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_actions (id, medical_record_id, action_name, description, notes, created_at, updated_at) FROM stdin;
1	1	Pemeriksaan Fisik Umum	Pemeriksaan tanda vital: tekanan darah, suhu tubuh, berat badan, dan tinggi badan.	Suhu badan 38.9°C, tekanan darah 110/70 mmHg.	2026-07-28 20:16:02.927+07	2026-07-28 20:16:02.927+07
2	1	Pemberian Injeksi Antipiretik	Injeksi metamizole 1 ampul sebagai antipiretik cepat.	Pasien tidak mengalami reaksi alergi.	2026-07-28 20:16:02.927+07	2026-07-28 20:16:02.927+07
3	2	Pemeriksaan Gigi dan Mulut	Pemeriksaan visual dan perkusi pada gigi 36. Rontgen periapikal gigi 36.	Terdapat karies profunda pada gigi 36 dengan perkusi positif.	2026-07-29 20:16:02.927+07	2026-07-29 20:16:02.927+07
4	2	Pembersihan Karang Gigi (Scaling)	Scaling supragingiva pada seluruh regio gigi.	Pasien diedukasi mengenai cara menyikat gigi yang benar.	2026-07-29 20:16:02.927+07	2026-07-29 20:16:02.927+07
\.


--
-- Data for Name: medical_records; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_records (id, registration_id, patient_id, doctor_id, subjective, blood_pressure, body_temperature, weight, height, assessment, plan, examination_date, status, created_at, updated_at, objective, pulse, notes) FROM stdin;
1	1	1	1	Pasien datang dengan keluhan demam tinggi (38.9°C), batuk berdahak, dan pilek sejak 3 hari lalu. Pasien merasa lemas dan kurang nafsu makan.	110/70	38.90	65.00	170.00	ISPA (Infeksi Saluran Pernafasan Atas) / Influenza	Pemberian antipiretik, antibiotik, dan obat batuk. Istirahat yang cukup. Kontrol kembali jika tidak membaik dalam 3 hari.	2026-07-28 20:16:02.911+07	COMPLETED	2026-07-28 20:16:02.911+07	2026-07-28 20:16:02.911+07	\N	\N	\N
2	2	2	2	Pasien mengeluhkan sakit gigi geraham bawah kiri yang berdenyut sejak kemarin. Nyeri bertambah saat mengunyah.	120/80	36.80	55.00	160.00	Pulpitis Irreversibel Gigi 36	Rencana perawatan saluran akar (PSA). Pemberian antibiotik dan analgesik. Kontrol 3 hari kemudian.	2026-07-29 20:16:02.911+07	COMPLETED	2026-07-29 20:16:02.911+07	2026-07-29 20:16:02.911+07	\N	\N	\N
5	13	6	2	tesssssssss	\N	\N	\N	\N	tesssssssssss	tessssssssssss	2026-07-31 19:38:28.345+07	COMPLETED	2026-07-31 19:38:28.346+07	2026-07-31 20:44:08.747+07	\N	\N	\N
3	6	1	1	Pasien mengeluhkan gigi geraham kanan bawah terasa ngilu sejak 3 hari.	120/80 mmHg	36.70	\N	\N	Karies gigi molar kanan bawah dengan dugaan pulpitis	Anjurkan menyikat gigi 2 kali sehari	2026-07-31 19:24:58.786+07	COMPLETED	2026-07-31 19:24:58.788+07	2026-07-31 22:22:19.714+07	\N	\N	\N
4	7	1	1	tesssssssss	\N	\N	\N	\N	tessssssssssssssssssssssssssssssssssssssss	tesssssss	2026-07-31 19:32:06.389+07	COMPLETED	2026-07-31 19:32:06.39+07	2026-07-31 22:22:24.088+07	\N	\N	\N
6	14	7	3	Pasien mengeluhkan mata kiri merah disertai rasa perih, berair, dan sensasi mengganjal sejak dua hari terakhir. Keluhan bertambah saat berada di luar ruangan yang berdebu. Tidak ada riwayat trauma pada mata maupun penggunaan lensa kontak.	118/78 mmHg	36.70	65.00	170.00	Konjungtivitis ringan pada mata kiri (dugaan infeksi virus atau iritasi).	Memberikan edukasi menjaga kebersihan tangan dan menghindari mengucek mata. Meresepkan tetes mata sesuai indikasi, menganjurkan istirahat yang cukup, serta kontrol kembali dalam 3–5 hari atau lebih cepat apabila keluhan memburuk.	2026-08-01 19:54:15.531+07	COMPLETED	2026-08-01 19:54:15.532+07	2026-08-01 20:39:35.885+07	\N	\N	\N
7	15	2	2	tesssssssss	120/80 mmHg	35.00	65.00	170.00	tessssssssssss	tessssssssssss	2026-08-01 23:40:58.448+07	COMPLETED	2026-08-01 23:40:58.449+07	2026-08-01 23:45:44.702+07	tessssssss	75	hindari makanan pedas
8	16	11	1	Badan nya terasa menggigil	120	35.00	78.00	165.00	tessssssss	tessssssssssssss	2026-08-02 00:06:52.769+07	COMPLETED	2026-08-02 00:06:52.769+07	2026-08-02 00:07:39.155+07	tessssss	70	\N
9	18	13	5	Pasien mengeluhkan nyeri berdenyut pada gigi geraham kanan bawah (gigi 46). Sakit menetap terutama malam hari, menyebar hingga rahang.	120/80 mmHg	36.00	75.00	175.00	Pulpitis Irreversibel Akut Gigi 46	Pembersihan kavitas, penambalan sementara (devitalisasi pulpa), edukasi kebersihan mulut, dan terapi analgetik pasca tindakan.	2026-08-02 22:04:18.256+07	COMPLETED	2026-08-02 22:04:18.256+07	2026-08-02 22:08:50.557+07	Keadaan Umum: Baik, Compos Mentis. Intra Oral: Karies profunda pada gigi 46 (+), tes perkusi (+), tes termal dingin (+).	80	
\.


--
-- Data for Name: medicines; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medicines (id, medicine_code, name, unit, stock, description, is_active, created_at, updated_at, price) FROM stdin;
3	MED-003	Antasida Doen	Tablet	200	Obat maag dan gangguan lambung	t	2026-07-30 18:46:02.835+07	2026-07-30 18:46:02.835+07	0.00
4	MED-004	Cetirizine 10mg	Tablet	150	Antihistamin untuk alergi	t	2026-07-30 18:46:02.835+07	2026-07-30 18:46:02.835+07	0.00
5	MED-005	Ibuprofen 400mg	Tablet	250	Pereda nyeri dan antiinflamasi	t	2026-07-30 18:46:02.835+07	2026-07-30 18:46:02.835+07	0.00
6	MED-006	OBH Combi Batuk Berdahak	Botol	100	Obat batuk berdahak	t	2026-07-30 18:46:02.835+07	2026-07-30 18:46:02.835+07	0.00
7	MED-007	Vitamin C 500mg	Tablet	400	Suplemen vitamin C untuk daya tahan tubuh	t	2026-07-30 18:46:02.835+07	2026-07-30 18:46:02.835+07	0.00
8	MED-008	Metronidazole 500mg	Tablet	120	Antibiotik untuk infeksi gigi dan mulut	t	2026-07-30 18:46:02.835+07	2026-07-30 18:46:02.835+07	0.00
9	MED-010	Cendo Lyteers	Botol	49	Tetes mata sebagai pelumas untuk membantu meredakan mata kering dan iritasi ringan.	t	2026-08-01 18:23:30.543+07	2026-08-01 20:39:31.058+07	35000.00
1	MED-001	Paracetamol 500mg	Tablet	477	Obat penurun panas dan pereda nyeri	t	2026-07-30 18:46:02.835+07	2026-08-02 00:07:27.326+07	0.00
10	OBT-001	Paracetamol Syrup 120mg/5ml	Botol	50		t	2026-08-02 21:36:49.147+07	2026-08-02 21:36:49.147+07	15000.00
11	OBT-002	Amoxicillin Syrup 125mg/5ml	Botol	40		t	2026-08-02 21:37:42.474+07	2026-08-02 21:37:42.474+07	25000.00
12	OBT-005	Cataflam 50mg	Tablet	40		t	2026-08-02 21:56:13.754+07	2026-08-02 22:07:15.396+07	8000.00
2	MED-002	Amoxicillin 500mg	Kapsul	270	Antibiotik untuk infeksi bakteri	t	2026-07-30 18:46:02.835+07	2026-08-02 22:07:15.403+07	5000.00
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, medical_record_number, nik, name, gender, birth_date, phone, address, created_at, updated_at) FROM stdin;
1	RM-20240101-001	3273010101900001	Andi Pratama	MALE	1990-01-01	08123456781	Jl. Merdeka No. 10, Bandung	2026-07-30 18:46:02.827+07	2026-07-30 18:46:02.827+07
2	RM-20240101-002	3273010202920002	Siti Nurhaliza	FEMALE	1992-02-02	08123456782	Jl. Pahlawan No. 5, Bandung	2026-07-30 18:46:02.827+07	2026-07-30 18:46:02.827+07
3	RM-20240101-003	3273010303880003	Rizky Ramadhan	MALE	1988-03-03	08123456783	Jl. Sudirman No. 20, Bandung	2026-07-30 18:46:02.827+07	2026-07-30 18:46:02.827+07
4	RM-20240101-004	3273010404950004	Dewi Kusuma	FEMALE	1995-04-04	08123456784	Jl. Diponegoro No. 15, Bandung	2026-07-30 18:46:02.827+07	2026-07-30 18:46:02.827+07
5	RM-20240101-005	3273010505850005	Hendra Gunawan	MALE	1985-05-05	08123456785	Jl. Gatot Subroto No. 8, Bandung	2026-07-30 18:46:02.827+07	2026-07-30 18:46:02.827+07
6	RM-20260731-001	1234567890123456	Sutinem	FEMALE	2008-01-31	082213245672	Jl. Merpati no3	2026-07-31 19:01:35.185+07	2026-07-31 19:01:35.185+07
7	RM-20260801-001	2312456233123789	Andi Pratama	MALE	2001-01-01	082312376534	Jl. Melati No. 25, Jakarta Selatan	2026-08-01 19:33:05.706+07	2026-08-01 19:33:05.706+07
8	RM-20260801-002	2134523321234445	Sarinem	FEMALE	2001-07-19	089234123427	Jl. Anggrek no.1	2026-08-01 23:56:49.452+07	2026-08-01 23:56:49.452+07
9	RM-20260801-003	2317865423190765	Budi Sentosa	MALE	2009-06-23	08241234576	Jl.Mandiri no 5	2026-08-01 23:57:30.746+07	2026-08-01 23:57:30.746+07
10	RM-20260801-004	2347563215467897	Jojon Markijon	MALE	2006-06-25	08231283465	Jl. Merpati Indah no 55	2026-08-01 23:58:13.744+07	2026-08-01 23:58:13.744+07
11	RM-20260801-005	6452344657820493	Marsinah	FEMALE	1996-10-22	082315467382	Jl. Makam Pahlawan no.1	2026-08-01 23:59:01.085+07	2026-08-01 23:59:01.085+07
12	RM-20260802-001	3171012304200005	Andi Setia Budi	MALE	2015-02-02	082321235674	Jl. Melati No.45, Jakarta	2026-08-02 21:39:14.712+07	2026-08-02 21:39:14.712+07
13	RM-20260802-002	3175021208880003	Bapak Hendra	MALE	1997-12-31	082313478273	Jl. Makam Pahlawan, Jakarta	2026-08-02 21:57:42.754+07	2026-08-02 21:57:42.754+07
\.


--
-- Data for Name: payment_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_details (id, payment_id, item_type, item_name, quantity, unit_price, subtotal, created_at, updated_at) FROM stdin;
1	1	CONSULTATION	Biaya Konsultasi Dokter (Dr. Sari Dewi, drg)	1	50000.00	50000.00	2026-07-31 20:47:00.437+07	2026-07-31 20:47:00.437+07
2	2	CONSULTATION	Biaya Konsultasi Dokter (Dr. Ahmad Fauzi, Sp.U)	1	50000.00	50000.00	2026-07-31 21:01:01.887+07	2026-07-31 21:01:01.887+07
3	2	MEDICINE	Paracetamol 500mg (3x1 tab)	5	0.00	0.00	2026-07-31 21:01:01.891+07	2026-07-31 21:01:01.891+07
4	3	CONSULTATION	Biaya Konsultasi Dokter (Dr. Ahmad Fauzi, Sp.U)	1	50000.00	50000.00	2026-07-31 21:11:48.959+07	2026-07-31 21:11:48.959+07
5	3	MEDICINE	Paracetamol 500mg (3x1 tablet)	10	0.00	0.00	2026-07-31 21:11:48.964+07	2026-07-31 21:11:48.964+07
6	4	CONSULTATION	Biaya Konsultasi Dokter (dr. Amanda Putri, Sp.M)	1	50000.00	50000.00	2026-08-01 23:38:13.589+07	2026-08-01 23:38:13.589+07
7	4	MEDICINE	Cendo Lyteers (1)	1	35000.00	35000.00	2026-08-01 23:38:13.592+07	2026-08-01 23:38:13.592+07
8	5	CONSULTATION	Biaya Konsultasi Dokter (Dr. Sari Dewi, drg)	1	50000.00	50000.00	2026-08-01 23:52:15.987+07	2026-08-01 23:52:15.987+07
9	5	MEDICINE	Paracetamol 500mg (3x1)	5	0.00	0.00	2026-08-01 23:52:15.99+07	2026-08-01 23:52:15.99+07
10	6	CONSULTATION	Biaya Konsultasi Dokter (Dr. Ahmad Fauzi, Sp.U)	1	50000.00	50000.00	2026-08-02 00:10:48.894+07	2026-08-02 00:10:48.894+07
11	6	MEDICINE	Paracetamol 500mg (3x1)	3	0.00	0.00	2026-08-02 00:10:48.896+07	2026-08-02 00:10:48.896+07
12	7	CONSULTATION	Biaya Konsultasi Dokter (drg. Maya Rosita, Sp.KG)	1	50000.00	50000.00	2026-08-02 22:10:02.733+07	2026-08-02 22:10:02.733+07
13	7	MEDICINE	Amoxicillin 500mg (1 Kaplet)	15	5000.00	75000.00	2026-08-02 22:10:02.738+07	2026-08-02 22:10:02.738+07
14	7	MEDICINE	Cataflam 50mg (1)	10	8000.00	80000.00	2026-08-02 22:10:02.74+07	2026-08-02 22:10:02.74+07
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, registration_id, patient_id, payment_number, consultation_fee, medicine_fee, total_amount, payment_method, payment_status, paid_at, notes, created_at, updated_at) FROM stdin;
1	13	6	INV-20260731-001	50000.00	0.00	50000.00	BPJS	PAID	2026-07-31 20:47:00.426+07	\N	2026-07-31 20:47:00.428+07	2026-07-31 20:47:00.428+07
2	6	1	INV-20260731-002	50000.00	0.00	50000.00	BPJS	PAID	2026-07-31 21:01:01.877+07	\N	2026-07-31 21:01:01.878+07	2026-07-31 21:01:01.878+07
3	7	1	INV-20260731-003	50000.00	0.00	50000.00	CASH	PAID	2026-07-31 21:11:48.95+07	\N	2026-07-31 21:11:48.951+07	2026-07-31 21:11:48.951+07
4	14	7	INV-20260801-004	50000.00	35000.00	85000.00	CASH	PAID	2026-08-01 23:38:13.582+07	\N	2026-08-01 23:38:13.582+07	2026-08-01 23:38:13.582+07
5	15	2	INV-20260801-005	50000.00	0.00	50000.00	CASH	PAID	2026-08-01 23:52:15.979+07	\N	2026-08-01 23:52:15.98+07	2026-08-01 23:52:15.98+07
6	16	11	INV-20260801-006	50000.00	0.00	50000.00	CASH	PAID	2026-08-02 00:10:48.891+07	\N	2026-08-02 00:10:48.891+07	2026-08-02 00:10:48.891+07
7	18	13	INV-20260802-007	50000.00	155000.00	205000.00	CASH	PAID	2026-08-02 22:10:02.723+07	\N	2026-08-02 22:10:02.725+07	2026-08-02 22:10:02.725+07
\.


--
-- Data for Name: policlinics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.policlinics (id, code, name, description, is_active, created_at, updated_at) FROM stdin;
1	POL-UMUM	Poli Umum	Pelayanan kesehatan umum untuk semua jenis penyakit	t	2026-07-30 18:46:02.803+07	2026-07-30 18:46:02.803+07
2	POL-GIGI	Poli Gigi	Pelayanan kesehatan gigi dan mulut	t	2026-07-30 18:46:02.803+07	2026-07-30 18:46:02.803+07
3	MATA	Poli Mata	Pelayanan untuk kesehatan mata	t	2026-08-01 17:35:42.268+07	2026-08-01 17:35:57.824+07
5	ANK	Poliklink Anak	Layanan kesehatan dan spesialis anak	t	2026-08-02 21:34:14.355+07	2026-08-02 21:34:14.355+07
6	GGI	Poliklinik Gigi	Layanan dan perawatan gigi	t	2026-08-02 21:53:07.575+07	2026-08-02 21:53:07.575+07
\.


--
-- Data for Name: prescription_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescription_details (id, prescription_id, medicine_id, dosage, frequency, duration, quantity, instructions, created_at, updated_at) FROM stdin;
1	1	1	500mg	3x sehari	3 hari	9	Diminum setelah makan jika demam di atas 38°C	2026-07-28 20:16:02.944+07	2026-07-28 20:16:02.944+07
2	1	2	500mg	3x sehari	5 hari	15	Diminum setelah makan. Habiskan meskipun sudah merasa sembuh.	2026-07-28 20:16:02.944+07	2026-07-28 20:16:02.944+07
3	1	7	500mg	1x sehari	7 hari	7	Diminum setelah makan pagi	2026-07-28 20:16:02.944+07	2026-07-28 20:16:02.944+07
4	2	8	500mg	3x sehari	5 hari	15	Diminum setelah makan. Jangan dikonsumsi bersamaan dengan alkohol.	2026-07-29 20:16:02.944+07	2026-07-29 20:16:02.944+07
5	2	1	500mg	3x sehari jika nyeri	3 hari	9	Diminum jika nyeri. Jangan melebihi 4 tablet per hari.	2026-07-29 20:16:02.944+07	2026-07-29 20:16:02.944+07
6	3	1	3x1 tablet	Sesudah makan	\N	10	\N	2026-07-31 19:49:28.259+07	2026-07-31 19:49:28.259+07
7	4	1	3x1 tab	Setelah Makan	\N	5	\N	2026-07-31 19:49:46.148+07	2026-07-31 19:49:46.148+07
8	5	9	1	Setelah makan	\N	1	\N	2026-08-01 20:39:31.05+07	2026-08-01 20:39:31.05+07
9	6	1	3x1	Setelah makan	\N	5	\N	2026-08-01 23:45:41.289+07	2026-08-01 23:45:41.289+07
10	7	1	3x1	Setelah makan	\N	3	\N	2026-08-02 00:07:27.323+07	2026-08-02 00:07:27.323+07
11	8	12	1	2x Sehari setelah makan 	\N	10	\N	2026-08-02 22:07:15.379+07	2026-08-02 22:07:15.379+07
12	8	2	1 Kaplet	3x Sehari setelah makan	\N	15	\N	2026-08-02 22:07:15.4+07	2026-08-02 22:07:15.4+07
\.


--
-- Data for Name: prescriptions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prescriptions (id, medical_record_id, patient_id, doctor_id, prescription_number, notes, created_at, updated_at) FROM stdin;
1	1	1	1	PRE-20240101-001	Minum obat sesuai aturan. Habiskan antibiotik meskipun sudah merasa sembuh.	2026-07-28 20:16:02.933+07	2026-07-28 20:16:02.933+07
2	2	2	2	PRE-20240101-002	Hindari makanan keras dan panas. Kumur air garam hangat 3x sehari.	2026-07-29 20:16:02.933+07	2026-07-29 20:16:02.933+07
3	4	1	1	PRE-20260731-001	\N	2026-07-31 19:49:28.23+07	2026-07-31 19:49:28.23+07
4	3	1	1	PRE-20260731-002	\N	2026-07-31 19:49:46.117+07	2026-07-31 19:49:46.117+07
5	6	7	3	PRE-20260801-001	\N	2026-08-01 20:39:31.034+07	2026-08-01 20:39:31.034+07
6	7	2	2	PRE-20260801-002	\N	2026-08-01 23:45:41.26+07	2026-08-01 23:45:41.26+07
7	8	11	1	PRE-20260802-001	\N	2026-08-02 00:07:27.308+07	2026-08-02 00:07:27.308+07
8	9	13	5	PRE-20260802-002	\N	2026-08-02 22:07:15.362+07	2026-08-02 22:07:15.362+07
\.


--
-- Data for Name: queues; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.queues (id, registration_id, queue_number, queue_date, sequence_number, status, called_at, completed_at, created_at, updated_at) FROM stdin;
1	1	A001	2026-07-28	1	COMPLETED	2026-07-28 19:46:02.897+07	2026-07-28 20:46:02.897+07	2026-07-28 18:46:02.897+07	2026-07-28 18:46:02.897+07
2	2	B001	2026-07-29	1	COMPLETED	2026-07-29 19:46:02.897+07	2026-07-29 20:46:02.897+07	2026-07-29 18:46:02.897+07	2026-07-29 18:46:02.897+07
3	3	A001	2026-07-30	1	IN_PROGRESS	2026-07-30 18:16:02.897+07	\N	2026-07-30 18:46:02.855+07	2026-07-30 18:46:02.855+07
4	4	A002	2026-07-30	2	CALLED	2026-07-30 18:31:02.897+07	\N	2026-07-30 18:46:02.855+07	2026-07-30 18:46:02.855+07
5	5	A003	2026-07-30	3	CALLED	2026-07-31 01:22:36.282+07	\N	2026-07-30 18:46:02.855+07	2026-07-31 01:22:36.282+07
13	13	B001	2026-07-31	3	COMPLETED	\N	2026-07-31 20:44:08.773+07	2026-07-31 19:20:00.484+07	2026-07-31 20:44:08.773+07
6	6	A001	2026-07-31	1	COMPLETED	2026-07-31 19:15:18.455+07	2026-07-31 22:22:19.855+07	2026-07-31 19:09:36.341+07	2026-07-31 22:22:19.856+07
7	7	A002	2026-07-31	2	COMPLETED	\N	2026-07-31 22:22:24.096+07	2026-07-31 19:11:14.465+07	2026-07-31 22:22:24.097+07
14	14	C001	2026-08-01	1	COMPLETED	2026-08-01 19:34:46.814+07	2026-08-01 20:39:35.891+07	2026-08-01 19:33:47.847+07	2026-08-01 20:39:35.891+07
15	15	B001	2026-08-01	2	COMPLETED	2026-08-01 23:39:22.727+07	2026-08-01 23:45:44.712+07	2026-08-01 23:39:13.815+07	2026-08-01 23:45:44.712+07
16	16	A001	2026-08-01	3	COMPLETED	2026-08-02 00:05:02.368+07	2026-08-02 00:07:39.17+07	2026-08-02 00:04:48.549+07	2026-08-02 00:07:39.17+07
17	17	E001	2026-08-02	1	CALLED	2026-08-02 21:41:43.325+07	\N	2026-08-02 21:41:21.972+07	2026-08-02 21:41:43.326+07
18	18	F001	2026-08-02	2	COMPLETED	2026-08-02 22:00:36.511+07	2026-08-02 22:08:50.568+07	2026-08-02 22:00:23.264+07	2026-08-02 22:08:50.568+07
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.registrations (id, registration_number, patient_id, doctor_id, policlinic_id, created_by, visit_date, payment_type, initial_complaint, status, created_at, updated_at) FROM stdin;
1	REG-20240101-001	1	1	1	4	2026-07-28	BPJS	Pasien mengeluhkan demam tinggi, batuk, dan pilek sejak 3 hari lalu.	COMPLETED	2026-07-28 18:46:02.868+07	2026-07-28 18:46:02.868+07
2	REG-20240101-002	2	2	2	4	2026-07-29	CASH	Pasien mengeluhkan sakit gigi geraham kiri bawah sejak kemarin.	COMPLETED	2026-07-29 18:46:02.868+07	2026-07-29 18:46:02.868+07
3	REG-20240101-003	3	1	1	4	2026-07-30	INSURANCE	Pasien mengeluhkan mual, muntah, dan sakit perut sejak pagi hari.	EXAMINATION	2026-07-30 18:46:02.855+07	2026-07-30 18:46:02.855+07
4	REG-20240101-004	4	1	1	4	2026-07-30	BPJS	Pasien mengeluhkan pusing, lemas, dan kurang nafsu makan.	CHECKED_IN	2026-07-30 18:46:02.855+07	2026-07-30 18:46:02.855+07
5	REG-20240101-005	5	1	1	4	2026-07-30	CASH	Pasien mengeluhkan nyeri sendi lutut kiri dan kanan.	CHECKED_IN	2026-07-30 18:46:02.855+07	2026-07-31 01:22:36.278+07
13	REG-20260731-003	6	2	2	1	2026-07-31	BPJS	gigi terasa sakit	COMPLETED	2026-07-31 19:20:00.467+07	2026-07-31 20:44:08.759+07
6	REG-20260731-001	1	1	1	1	2026-07-31	BPJS	Gigi nya terasa ngilu	COMPLETED	2026-07-31 19:09:36.31+07	2026-07-31 20:48:42.424+07
7	REG-20260731-002	1	1	1	1	2026-07-31	CASH	Tes pendaftaran kedua	COMPLETED	2026-07-31 19:11:14.445+07	2026-07-31 20:48:43.286+07
14	REG-20260801-001	7	3	3	1	2026-08-01	CASH	Mata sakit	COMPLETED	2026-08-01 19:33:47.827+07	2026-08-01 20:39:35.887+07
15	REG-20260801-002	2	2	2	1	2026-08-01	CASH	gigi saya sering merasakan sakit	COMPLETED	2026-08-01 23:39:13.805+07	2026-08-01 23:45:44.705+07
16	REG-20260801-003	11	1	1	4	2026-08-01	CASH	Badan terasa menggigil	COMPLETED	2026-08-02 00:04:48.535+07	2026-08-02 00:07:39.157+07
17	REG-20260802-001	12	4	5	4	2026-08-02	CASH	Demam tinggi sejak 2 hari terahir	CHECKED_IN	2026-08-02 21:41:21.95+07	2026-08-02 21:41:43.322+07
18	REG-20260802-002	13	5	6	4	2026-08-02	CASH	Gigi belakang kanan bawah sakit berdenyut tajam sejak 3 hari, bertambah ngilu saat minum air dingin.	COMPLETED	2026-08-02 22:00:23.239+07	2026-08-02 22:08:50.559+07
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, password, role, is_active, created_at, updated_at) FROM stdin;
5	dr. Amanda Putri, Sp.M	amanda@gmail.com	$2a$12$7lsfxThQ03PxIOYAmFn.XOus8DQZlKwN0xnuSKk/C2z5GCZZ.OaH2	DOCTOR	t	2026-08-01 18:09:09.402+07	2026-08-02 00:10:18.256+07
1	Administrator	admin@gmail.com	$2a$12$ZtKCgPyNJJUii6rznMabL.Ect.miusnQ9GZymoigLHy2Prst4L2tW	ADMIN	t	2026-07-30 18:46:01.562+07	2026-08-02 21:05:56.744+07
2	Dr. Ahmad Fauzi, Sp.U	doctor@gmail.com	$2a$12$x6AQpFG9Tbv0h7xEDlprDOfSjxOJczUewpN1xoTEJs/rQQA24BApe	DOCTOR	t	2026-07-30 18:46:01.562+07	2026-08-02 21:05:57.269+07
4	Budi Santoso	staff@gmail.com	$2a$12$svImfWzSuGK1lrfb6IfZzeisudJ6qRVYwp3o2mxVIOKJdnAofkeOm	REGISTRATION_OFFICER	t	2026-07-30 18:46:01.562+07	2026-08-02 21:05:57.279+07
3	Dr. Sari Dewi, drg	doctor2@gmail.com	$2a$12$6oJDCctUuo.rIeKB/h4qA.KtN7gYpO2hBfK8WtI0IECkfu7AzpNM.	DOCTOR	t	2026-07-30 18:46:01.562+07	2026-08-02 21:05:57.286+07
6	dr. Budi Santoso, SP.A	docoranak@gmail.com	$2a$12$ZDhyHt6fMrU3Quk8lmualOJoU/1u5MZBnYBpi96PZ2JaD32/Vjj0.	DOCTOR	t	2026-08-02 21:35:29.736+07	2026-08-02 21:35:29.736+07
7	drg. Maya Rosita, Sp.KG	doctorgigi@gmail.com	$2a$12$YmPC5IgPgyDxtRQMDvMtxuhba/iq6PIf4zSVPBKb8a/.M8jV2qQaK	DOCTOR	t	2026-08-02 21:53:52.006+07	2026-08-02 21:53:52.006+07
\.


--
-- Name: doctors_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.doctors_id_seq', 5, true);


--
-- Name: medical_actions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_actions_id_seq', 4, true);


--
-- Name: medical_records_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medical_records_id_seq', 9, true);


--
-- Name: medicines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.medicines_id_seq', 12, true);


--
-- Name: patients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.patients_id_seq', 13, true);


--
-- Name: payment_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_details_id_seq', 14, true);


--
-- Name: payments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payments_id_seq', 7, true);


--
-- Name: policlinics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.policlinics_id_seq', 6, true);


--
-- Name: prescription_details_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescription_details_id_seq', 12, true);


--
-- Name: prescriptions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prescriptions_id_seq', 8, true);


--
-- Name: queues_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.queues_id_seq', 18, true);


--
-- Name: registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.registrations_id_seq', 18, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 7, true);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: doctors doctors_doctor_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_doctor_code_key UNIQUE (doctor_code);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_key UNIQUE (user_id);


--
-- Name: medical_actions medical_actions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_actions
    ADD CONSTRAINT medical_actions_pkey PRIMARY KEY (id);


--
-- Name: medical_records medical_records_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_pkey PRIMARY KEY (id);


--
-- Name: medical_records medical_records_registration_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_registration_id_key UNIQUE (registration_id);


--
-- Name: medicines medicines_medicine_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_medicine_code_key UNIQUE (medicine_code);


--
-- Name: medicines medicines_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medicines
    ADD CONSTRAINT medicines_pkey PRIMARY KEY (id);


--
-- Name: patients patients_medical_record_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_medical_record_number_key UNIQUE (medical_record_number);


--
-- Name: patients patients_nik_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_nik_key UNIQUE (nik);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: payment_details payment_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_details
    ADD CONSTRAINT payment_details_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: policlinics policlinics_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policlinics
    ADD CONSTRAINT policlinics_code_key UNIQUE (code);


--
-- Name: policlinics policlinics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.policlinics
    ADD CONSTRAINT policlinics_pkey PRIMARY KEY (id);


--
-- Name: prescription_details prescription_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_details
    ADD CONSTRAINT prescription_details_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_medical_record_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_medical_record_id_key UNIQUE (medical_record_id);


--
-- Name: prescriptions prescriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_pkey PRIMARY KEY (id);


--
-- Name: prescriptions prescriptions_prescription_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_prescription_number_key UNIQUE (prescription_number);


--
-- Name: queues queues_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queues
    ADD CONSTRAINT queues_pkey PRIMARY KEY (id);


--
-- Name: queues queues_registration_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queues
    ADD CONSTRAINT queues_registration_id_key UNIQUE (registration_id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_registration_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_registration_number_key UNIQUE (registration_number);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: doctors_code_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX doctors_code_unique ON public.doctors USING btree (doctor_code);


--
-- Name: doctors_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX doctors_is_active_idx ON public.doctors USING btree (is_active);


--
-- Name: doctors_policlinic_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX doctors_policlinic_id_idx ON public.doctors USING btree (policlinic_id);


--
-- Name: doctors_user_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX doctors_user_id_unique ON public.doctors USING btree (user_id);


--
-- Name: medical_actions_record_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_actions_record_id_idx ON public.medical_actions USING btree (medical_record_id);


--
-- Name: medical_records_doctor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_records_doctor_id_idx ON public.medical_records USING btree (doctor_id);


--
-- Name: medical_records_examination_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_records_examination_date_idx ON public.medical_records USING btree (examination_date);


--
-- Name: medical_records_patient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_records_patient_id_idx ON public.medical_records USING btree (patient_id);


--
-- Name: medical_records_registration_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX medical_records_registration_id_unique ON public.medical_records USING btree (registration_id);


--
-- Name: medical_records_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_records_status_idx ON public.medical_records USING btree (status);


--
-- Name: medicines_code_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX medicines_code_unique ON public.medicines USING btree (medicine_code);


--
-- Name: medicines_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medicines_is_active_idx ON public.medicines USING btree (is_active);


--
-- Name: medicines_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medicines_name_idx ON public.medicines USING btree (name);


--
-- Name: patients_mrn_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX patients_mrn_unique ON public.patients USING btree (medical_record_number);


--
-- Name: patients_name_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX patients_name_idx ON public.patients USING btree (name);


--
-- Name: patients_nik_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX patients_nik_unique ON public.patients USING btree (nik);


--
-- Name: patients_phone_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX patients_phone_idx ON public.patients USING btree (phone);


--
-- Name: policlinics_code_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX policlinics_code_unique ON public.policlinics USING btree (code);


--
-- Name: policlinics_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX policlinics_is_active_idx ON public.policlinics USING btree (is_active);


--
-- Name: prescription_details_medicine_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prescription_details_medicine_id_idx ON public.prescription_details USING btree (medicine_id);


--
-- Name: prescription_details_prescription_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prescription_details_prescription_id_idx ON public.prescription_details USING btree (prescription_id);


--
-- Name: prescriptions_doctor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prescriptions_doctor_id_idx ON public.prescriptions USING btree (doctor_id);


--
-- Name: prescriptions_medical_record_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX prescriptions_medical_record_id_unique ON public.prescriptions USING btree (medical_record_id);


--
-- Name: prescriptions_number_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX prescriptions_number_unique ON public.prescriptions USING btree (prescription_number);


--
-- Name: prescriptions_patient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX prescriptions_patient_id_idx ON public.prescriptions USING btree (patient_id);


--
-- Name: queues_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queues_date_idx ON public.queues USING btree (queue_date);


--
-- Name: queues_date_number_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX queues_date_number_unique ON public.queues USING btree (queue_date, queue_number);


--
-- Name: queues_registration_id_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX queues_registration_id_unique ON public.queues USING btree (registration_id);


--
-- Name: queues_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX queues_status_idx ON public.queues USING btree (status);


--
-- Name: registrations_created_by_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_created_by_idx ON public.registrations USING btree (created_by);


--
-- Name: registrations_doctor_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_doctor_id_idx ON public.registrations USING btree (doctor_id);


--
-- Name: registrations_number_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX registrations_number_unique ON public.registrations USING btree (registration_number);


--
-- Name: registrations_patient_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_patient_id_idx ON public.registrations USING btree (patient_id);


--
-- Name: registrations_policlinic_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_policlinic_id_idx ON public.registrations USING btree (policlinic_id);


--
-- Name: registrations_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_status_idx ON public.registrations USING btree (status);


--
-- Name: registrations_visit_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX registrations_visit_date_idx ON public.registrations USING btree (visit_date);


--
-- Name: users_email_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX users_email_unique ON public.users USING btree (email);


--
-- Name: users_is_active_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_is_active_idx ON public.users USING btree (is_active);


--
-- Name: users_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX users_role_idx ON public.users USING btree (role);


--
-- Name: doctors doctors_policlinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_policlinic_id_fkey FOREIGN KEY (policlinic_id) REFERENCES public.policlinics(id) ON UPDATE CASCADE;


--
-- Name: doctors doctors_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: medical_actions medical_actions_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_actions
    ADD CONSTRAINT medical_actions_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.medical_records(id) ON UPDATE CASCADE;


--
-- Name: medical_records medical_records_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: medical_records medical_records_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON UPDATE CASCADE;


--
-- Name: medical_records medical_records_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_records
    ADD CONSTRAINT medical_records_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON UPDATE CASCADE;


--
-- Name: payment_details payment_details_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_details
    ADD CONSTRAINT payment_details_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON UPDATE CASCADE;


--
-- Name: payments payments_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON UPDATE CASCADE;


--
-- Name: prescription_details prescription_details_medicine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_details
    ADD CONSTRAINT prescription_details_medicine_id_fkey FOREIGN KEY (medicine_id) REFERENCES public.medicines(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prescription_details prescription_details_prescription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescription_details
    ADD CONSTRAINT prescription_details_prescription_id_fkey FOREIGN KEY (prescription_id) REFERENCES public.prescriptions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_medical_record_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_medical_record_id_fkey FOREIGN KEY (medical_record_id) REFERENCES public.medical_records(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: prescriptions prescriptions_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prescriptions
    ADD CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: queues queues_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queues
    ADD CONSTRAINT queues_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registrations(id) ON UPDATE CASCADE;


--
-- Name: registrations registrations_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON UPDATE CASCADE;


--
-- Name: registrations registrations_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registrations registrations_patient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.patients(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: registrations registrations_policlinic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_policlinic_id_fkey FOREIGN KEY (policlinic_id) REFERENCES public.policlinics(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--


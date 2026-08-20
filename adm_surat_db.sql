--
-- PostgreSQL database dump
--

-- Dumped from database version 16.1
-- Dumped by pg_dump version 16.1

-- Started on 2026-08-20 20:58:45

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 221 (class 1259 OID 29955)
-- Name: cache; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 29963)
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration bigint NOT NULL
);


ALTER TABLE public.cache_locks OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 29989)
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection character varying(255) NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.failed_jobs OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 29988)
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.failed_jobs_id_seq OWNER TO postgres;

--
-- TOC entry 5021 (class 0 OID 0)
-- Dependencies: 226
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- TOC entry 225 (class 1259 OID 29981)
-- Name: job_batches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


ALTER TABLE public.job_batches OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 29972)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 29971)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- TOC entry 5022 (class 0 OID 0)
-- Dependencies: 223
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 231 (class 1259 OID 30014)
-- Name: letter_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.letter_categories (
    id bigint NOT NULL,
    nama_kategori character varying(255) NOT NULL,
    deskripsi text,
    file_template_path character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    ttd_digital boolean DEFAULT false NOT NULL,
    deleted_at timestamp(0) without time zone,
    file_template_permohonan_path character varying(255),
    file_template_pengantar_path character varying(255),
    grup_kategori character varying(255) DEFAULT 'Akademik'::character varying NOT NULL
);


ALTER TABLE public.letter_categories OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 30013)
-- Name: letter_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.letter_categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.letter_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5023 (class 0 OID 0)
-- Dependencies: 230
-- Name: letter_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.letter_categories_id_seq OWNED BY public.letter_categories.id;


--
-- TOC entry 241 (class 1259 OID 30087)
-- Name: letter_request_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.letter_request_requirements (
    id bigint NOT NULL,
    request_id bigint NOT NULL,
    requirement_id bigint NOT NULL,
    file_path character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.letter_request_requirements OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 30086)
-- Name: letter_request_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.letter_request_requirements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.letter_request_requirements_id_seq OWNER TO postgres;

--
-- TOC entry 5024 (class 0 OID 0)
-- Dependencies: 240
-- Name: letter_request_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.letter_request_requirements_id_seq OWNED BY public.letter_request_requirements.id;


--
-- TOC entry 239 (class 1259 OID 30068)
-- Name: letter_request_values; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.letter_request_values (
    id bigint NOT NULL,
    request_id bigint NOT NULL,
    variable_id bigint NOT NULL,
    nilai_isian text NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.letter_request_values OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 30067)
-- Name: letter_request_values_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.letter_request_values_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.letter_request_values_id_seq OWNER TO postgres;

--
-- TOC entry 5025 (class 0 OID 0)
-- Dependencies: 238
-- Name: letter_request_values_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.letter_request_values_id_seq OWNED BY public.letter_request_values.id;


--
-- TOC entry 237 (class 1259 OID 30047)
-- Name: letter_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.letter_requests (
    id bigint NOT NULL,
    mahasiswa_id bigint NOT NULL,
    category_id bigint NOT NULL,
    status character varying(255) DEFAULT 'diajukan'::character varying NOT NULL,
    tanggal_pengajuan date NOT NULL,
    file_hasil_path character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    file_ttd_digital_path character varying(255),
    alasan_penolakan text,
    file_permohonan_path character varying(255),
    nomor_surat character varying(50),
    CONSTRAINT letter_requests_status_check CHECK (((status)::text = ANY ((ARRAY['diajukan'::character varying, 'diterima'::character varying, 'diproses'::character varying, 'ditolak'::character varying, 'selesai'::character varying])::text[])))
);


ALTER TABLE public.letter_requests OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 30046)
-- Name: letter_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.letter_requests_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.letter_requests_id_seq OWNER TO postgres;

--
-- TOC entry 5026 (class 0 OID 0)
-- Dependencies: 236
-- Name: letter_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.letter_requests_id_seq OWNED BY public.letter_requests.id;


--
-- TOC entry 233 (class 1259 OID 30023)
-- Name: letter_requirements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.letter_requirements (
    id bigint NOT NULL,
    category_id bigint NOT NULL,
    nama_syarat character varying(255) NOT NULL,
    tipe_file character varying(50) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.letter_requirements OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 30022)
-- Name: letter_requirements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.letter_requirements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.letter_requirements_id_seq OWNER TO postgres;

--
-- TOC entry 5027 (class 0 OID 0)
-- Dependencies: 232
-- Name: letter_requirements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.letter_requirements_id_seq OWNED BY public.letter_requirements.id;


--
-- TOC entry 235 (class 1259 OID 30035)
-- Name: letter_variables; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.letter_variables (
    id bigint NOT NULL,
    category_id bigint NOT NULL,
    nama_variabel character varying(100) NOT NULL,
    tipe_input_html character varying(50) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.letter_variables OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 30034)
-- Name: letter_variables_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.letter_variables_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.letter_variables_id_seq OWNER TO postgres;

--
-- TOC entry 5028 (class 0 OID 0)
-- Dependencies: 234
-- Name: letter_variables_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.letter_variables_id_seq OWNED BY public.letter_variables.id;


--
-- TOC entry 229 (class 1259 OID 30002)
-- Name: mahasiswas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mahasiswas (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    nim character varying(50) NOT NULL,
    nama character varying(255) NOT NULL,
    prodi character varying(100) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    angkatan character varying(10),
    jenis_kelamin character varying(255),
    jenis_mahasiswa character varying(255) DEFAULT 'Reguler'::character varying NOT NULL,
    tempat_lahir character varying(100),
    tanggal_lahir date,
    alamat text,
    email character varying(100),
    no_hp character varying(20),
    dosen_wali character varying(100),
    status_mahasiswa character varying(255) DEFAULT 'Aktif'::character varying NOT NULL,
    CONSTRAINT mahasiswas_jenis_kelamin_check CHECK (((jenis_kelamin)::text = ANY ((ARRAY['L'::character varying, 'P'::character varying])::text[]))),
    CONSTRAINT mahasiswas_jenis_mahasiswa_check CHECK (((jenis_mahasiswa)::text = ANY ((ARRAY['Reguler'::character varying, 'Kelas Karyawan'::character varying, 'Ekstensi'::character varying])::text[]))),
    CONSTRAINT mahasiswas_status_mahasiswa_check CHECK (((status_mahasiswa)::text = ANY ((ARRAY['Aktif'::character varying, 'Cuti'::character varying, 'Lulus'::character varying, 'Keluar'::character varying])::text[])))
);


ALTER TABLE public.mahasiswas OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 30001)
-- Name: mahasiswas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mahasiswas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mahasiswas_id_seq OWNER TO postgres;

--
-- TOC entry 5029 (class 0 OID 0)
-- Dependencies: 228
-- Name: mahasiswas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mahasiswas_id_seq OWNED BY public.mahasiswas.id;


--
-- TOC entry 216 (class 1259 OID 29920)
-- Name: migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


ALTER TABLE public.migrations OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 29919)
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO postgres;

--
-- TOC entry 5030 (class 0 OID 0)
-- Dependencies: 215
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- TOC entry 219 (class 1259 OID 29939)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    username character varying(255) NOT NULL,
    token character varying(255) NOT NULL,
    created_at timestamp(0) without time zone
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 30104)
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


ALTER TABLE public.personal_access_tokens OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 30103)
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.personal_access_tokens_id_seq OWNER TO postgres;

--
-- TOC entry 5031 (class 0 OID 0)
-- Dependencies: 242
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- TOC entry 220 (class 1259 OID 29946)
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 29927)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'mahasiswa'::character varying NOT NULL,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    name character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'mahasiswa'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 29926)
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
-- TOC entry 5032 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4767 (class 2604 OID 29992)
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- TOC entry 4766 (class 2604 OID 29975)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4772 (class 2604 OID 30017)
-- Name: letter_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_categories ALTER COLUMN id SET DEFAULT nextval('public.letter_categories_id_seq'::regclass);


--
-- TOC entry 4780 (class 2604 OID 30090)
-- Name: letter_request_requirements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_request_requirements ALTER COLUMN id SET DEFAULT nextval('public.letter_request_requirements_id_seq'::regclass);


--
-- TOC entry 4779 (class 2604 OID 30071)
-- Name: letter_request_values id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_request_values ALTER COLUMN id SET DEFAULT nextval('public.letter_request_values_id_seq'::regclass);


--
-- TOC entry 4777 (class 2604 OID 30050)
-- Name: letter_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_requests ALTER COLUMN id SET DEFAULT nextval('public.letter_requests_id_seq'::regclass);


--
-- TOC entry 4775 (class 2604 OID 30026)
-- Name: letter_requirements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_requirements ALTER COLUMN id SET DEFAULT nextval('public.letter_requirements_id_seq'::regclass);


--
-- TOC entry 4776 (class 2604 OID 30038)
-- Name: letter_variables id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_variables ALTER COLUMN id SET DEFAULT nextval('public.letter_variables_id_seq'::regclass);


--
-- TOC entry 4769 (class 2604 OID 30005)
-- Name: mahasiswas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mahasiswas ALTER COLUMN id SET DEFAULT nextval('public.mahasiswas_id_seq'::regclass);


--
-- TOC entry 4763 (class 2604 OID 29923)
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- TOC entry 4781 (class 2604 OID 30107)
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- TOC entry 4764 (class 2604 OID 29930)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4993 (class 0 OID 29955)
-- Dependencies: 221
-- Data for Name: cache; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache (key, value, expiration) FROM stdin;
\.


--
-- TOC entry 4994 (class 0 OID 29963)
-- Dependencies: 222
-- Data for Name: cache_locks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cache_locks (key, owner, expiration) FROM stdin;
\.


--
-- TOC entry 4999 (class 0 OID 29989)
-- Dependencies: 227
-- Data for Name: failed_jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.failed_jobs (id, uuid, connection, queue, payload, exception, failed_at) FROM stdin;
\.


--
-- TOC entry 4997 (class 0 OID 29981)
-- Dependencies: 225
-- Data for Name: job_batches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_batches (id, name, total_jobs, pending_jobs, failed_jobs, failed_job_ids, options, cancelled_at, created_at, finished_at) FROM stdin;
\.


--
-- TOC entry 4996 (class 0 OID 29972)
-- Dependencies: 224
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, queue, payload, attempts, reserved_at, available_at, created_at) FROM stdin;
\.


--
-- TOC entry 5003 (class 0 OID 30014)
-- Dependencies: 231
-- Data for Name: letter_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.letter_categories (id, nama_kategori, deskripsi, file_template_path, created_at, updated_at, ttd_digital, deleted_at, file_template_permohonan_path, file_template_pengantar_path, grup_kategori) FROM stdin;
9	Surat Pengantar Magang Mitra Kampus	Surat pengantar resmi dari program studi untuk mahasiswa yang mengikuti program magang yang difasilitasi oleh mitra kerja sama kampus.	templates/1786803966_permohonan_Surat_Permohonan_Magang_Mitra_Kampus.docx	2026-08-15 14:26:06	2026-08-15 15:35:49	t	\N	templates/1786808149_permohonan_Surat_Permohonan_Magang_Mitra_Kampus.docx	templates/1786808149_pengantar_Surat_Pengantar_Magang_Mitra_Kampus.docx	Akademik
3	Surat Pengantar KP	Surat pengantar resmi dari kampus untuk memohon izin pelaksanaan program Kerja Praktik (KP) atau Magang di instansi/perusahaan tujuan mahasiswa.	templates/1786341188_Surat_Pengantar_KP.docx	2026-08-10 03:31:55	2026-08-15 15:36:11	t	\N	templates/1786808171_permohonan_Surat_Permohonan_KP.docx	templates/1786808171_pengantar_Surat_Pengantar_KP.docx	Akademik
6	Surat Keterangan Mahasiswa Aktif	Surat resmi yang dikeluarkan oleh program studi untuk menerangkan status aktif akademik mahasiswa.	templates/1786519206_Surat_Keterangan_Mahasiswa.docx	2026-08-12 07:20:06	2026-08-15 15:36:36	f	\N	templates/1786808196_permohonan_Surat_Permohonan_Keterangan_Mahasiswa_Aktif.docx	templates/1786808196_pengantar_Surat_Keterangan_Mahasiswa_Aktif.docx	Akademik
1	Surat Pengantar Penelitian Tugas Akhir	Surat resmi pengantar dari fakultas untuk kegiatan pengumpulan data penelitian / tugas akhir.	templates/1786341255_Surat_Pengantar_Penelitian.docx	2026-08-08 03:29:11	2026-08-15 15:36:56	t	\N	templates/1786808216_permohonan_Surat_Permohonan_Penelitian_Tugas_Akhir.docx	templates/1786808216_pengantar_Surat_Pengantar_Penelitian_Tugas_Akhir.docx	Akademik
8	Surat Pengantar Magang Mandiri	Surat pengantar resmi dari program studi untuk mahasiswa yang akan melaksanakan kegiatan magang secara mandiri di suatu instansi atau perusahaan luar.	templates/1786803831_permohonan_Surat_Permohonan_Magang_Mandiri.docx	2026-08-15 14:23:51	2026-08-15 15:37:17	t	\N	templates/1786808237_permohonan_Surat_Permohonan_Magang_Mandiri.docx	templates/1786808237_pengantar_Surat_Pengantar_Magang_Mandiri.docx	Akademik
7	Surat Keterangan Tidak Menerima Beasiswa	Surat keterangan resmi yang menyatakan bahwa mahasiswa tidak sedang menerima beasiswa dari pihak kampus atau instansi lain, digunakan sebagai syarat pengajuan beasiswa baru.	templates/1786803603_permohonan_Surat_Permohonan_Keterangan_Tidak_Menerima_Besiswa.docx	2026-08-15 14:20:03	2026-08-15 15:37:43	t	\N	templates/1786808263_permohonan_Surat_Permohonan_Keterangan_Tidak_Menerima_Besiswa.docx	templates/1786808263_pengantar_Surat_Keterangan_Tidak_Menerima_Beasiswa.docx	Kemahasiswaan
\.


--
-- TOC entry 5013 (class 0 OID 30087)
-- Dependencies: 241
-- Data for Name: letter_request_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.letter_request_requirements (id, request_id, requirement_id, file_path, created_at, updated_at) FROM stdin;
52	26	78	requirements_uploads/1786808833_req_78_ChatGPT Image Aug 10, 2026, 10_10_46 AM.png	2026-08-15 15:47:13	2026-08-15 15:47:13
53	26	79	requirements_uploads/1786808833_req_79_alur cp2.pdf	2026-08-15 15:47:13	2026-08-15 15:47:13
54	27	68	requirements_uploads/1787227487_req_68_Code_Generated_Image.png	2026-08-20 12:04:47	2026-08-20 12:04:47
55	27	69	requirements_uploads/1787227487_req_69_Transkrip_Nilai_Dummy.pdf	2026-08-20 12:04:47	2026-08-20 12:04:47
56	27	70	requirements_uploads/1787227487_req_70_CV_Dummy.pdf	2026-08-20 12:04:47	2026-08-20 12:04:47
\.


--
-- TOC entry 5011 (class 0 OID 30068)
-- Dependencies: 239
-- Data for Name: letter_request_values; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.letter_request_values (id, request_id, variable_id, nilai_isian, created_at, updated_at) FROM stdin;
80	26	111	5	2026-08-15 15:47:13	2026-08-15 15:47:13
81	26	112	Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi RI	2026-08-15 15:47:13	2026-08-15 15:47:13
82	26	113	Beasiswa Unggulan Masyarakat Berprestasi Tahun 2026	2026-08-15 15:47:13	2026-08-15 15:47:13
83	27	93	PT Teknologi Maju Bersama	2026-08-20 12:04:47	2026-08-20 12:04:47
84	27	94	Jl. Soekarno Hatta No. 123, Lt. 2, Bandung, Jawa Barat	2026-08-20 12:04:47	2026-08-20 12:04:47
85	27	95	Software Engineering / Backend Developer	2026-08-20 12:04:47	2026-08-20 12:04:47
86	27	96	2026-09-01	2026-08-20 12:04:47	2026-08-20 12:04:47
87	27	97	2026-09-30	2026-08-20 12:04:47	2026-08-20 12:04:47
\.


--
-- TOC entry 5009 (class 0 OID 30047)
-- Dependencies: 237
-- Data for Name: letter_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.letter_requests (id, mahasiswa_id, category_id, status, tanggal_pengajuan, file_hasil_path, created_at, updated_at, file_ttd_digital_path, alasan_penolakan, file_permohonan_path, nomor_surat) FROM stdin;
2	1	1	selesai	2026-08-08	generated_letters/1786160635_surat_2_Kartu Hasil Studi - 1224008 - Berlina Shobirah.pdf	2026-08-08 03:39:17	2026-08-08 03:43:55	\N	\N	\N	\N
1	1	1	ditolak	2026-08-08	\N	2026-08-08 03:29:11	2026-08-08 03:58:20	\N	\N	\N	\N
4	1	1	selesai	2026-08-08	generated_letters/surat_4_1786167082.docx	2026-08-08 05:30:44	2026-08-08 05:31:22	signatures/1786167044_ttd_1.jpeg	\N	\N	\N
5	1	1	selesai	2026-08-08	generated_letters/surat_5_1786167439.docx	2026-08-08 05:37:04	2026-08-08 05:37:19	signatures/1786167424_ttd_1.jpeg	\N	\N	\N
6	1	1	selesai	2026-08-08	generated_letters/surat_6_1786167809.docx	2026-08-08 05:38:43	2026-08-08 05:43:29	signatures/1786167523_ttd_1.jpeg	\N	\N	\N
7	1	1	selesai	2026-08-08	generated_letters/surat_7_1786168325.docx	2026-08-08 05:49:00	2026-08-08 05:52:05	signatures/1786168140_ttd_1.jpeg	\N	\N	\N
18	1	3	ditolak	2026-08-10	\N	2026-08-10 04:37:43	2026-08-14 04:47:25	\N	coba email	generated_letters/permohonan_18_1786682845.docx	\N
21	1	1	selesai	2026-08-12	generated_letters/surat_21_1786679246.docx	2026-08-12 07:21:55	2026-08-14 04:47:34	signatures/1786519315_ttd_1.jpeg	ahjhzajhha	generated_letters/permohonan_21_1786682854.docx	\N
20	1	3	selesai	2026-08-12	generated_letters/surat_20_1786518976.docx	2026-08-12 07:15:37	2026-08-14 05:39:42	\N	\N	generated_letters/permohonan_20_1786685982.docx	\N
8	1	1	selesai	2026-08-08	generated_letters/surat_8_1786169274.docx	2026-08-08 05:57:29	2026-08-08 06:07:54	signatures/1786168649_ttd_1.jpeg	\N	\N	\N
9	1	1	selesai	2026-08-08	generated_letters/surat_9_1786169641.docx	2026-08-08 06:13:41	2026-08-08 06:14:01	signatures/1786169621_ttd_1.jpeg	\N	\N	\N
3	1	1	ditolak	2026-08-08	\N	2026-08-08 05:04:58	2026-08-08 06:32:55	\N	ga da dokumen yang di kirim	\N	\N
10	1	1	ditolak	2026-08-08	\N	2026-08-08 06:46:14	2026-08-08 06:46:44	signatures/1786171574_ttd_1.jpeg	judul tidak sesuai	\N	\N
11	1	1	ditolak	2026-08-08	\N	2026-08-08 06:47:41	2026-08-08 06:50:06	signatures/1786171574_ttd_1.jpeg	judul masih ga jelas	\N	\N
13	1	3	selesai	2026-08-10	generated_letters/surat_13_1786332810.docx	2026-08-10 03:33:03	2026-08-10 03:33:30	\N	\N	\N	\N
14	1	3	ditolak	2026-08-10	generated_letters/surat_14_1786333216.docx	2026-08-10 03:39:59	2026-08-10 03:45:58	\N	Nomor HP belum ada	\N	\N
15	1	3	selesai	2026-08-10	generated_letters/surat_15_1786333589.docx	2026-08-10 03:46:12	2026-08-10 03:46:29	\N	\N	\N	\N
16	1	3	ditolak	2026-08-10	generated_letters/surat_16_1786333698.docx	2026-08-10 03:47:55	2026-08-10 03:51:08	\N	no HP kosong	\N	\N
24	1	3	selesai	2026-08-14	generated_letters/pengantar_24_1786809041.docx	2026-08-14 05:52:28	2026-08-15 15:50:41	signatures/1786686747_ttd_1.jpeg	\N	generated_letters/permohonan_24_1786799815.docx	0014/STMIK-BDG/PRODI/E/VIII/2026
17	1	3	ditolak	2026-08-10	generated_letters/surat_17_1786334267.docx	2026-08-10 03:51:20	2026-08-10 04:31:04	\N	mencoba	\N	\N
25	1	7	selesai	2026-08-15	generated_letters/pengantar_25_1786805819.docx	2026-08-15 14:35:39	2026-08-15 15:45:59	signatures/1786804539_ttd_1.jpeg	\N	generated_letters/permohonan_25_1786808759.docx	0001/STMIK-BDG/WK-3/E/VIII/2026
26	1	7	selesai	2026-08-15	generated_letters/pengantar_26_1786809011.docx	2026-08-15 15:47:13	2026-08-20 12:29:34	signatures/1786808833_ttd_1.jpeg	\N	generated_letters/permohonan_26_1787228974.docx	0013/STMIK-BDG/WK-3/E/VIII/2026
27	1	9	ditolak	2026-08-20	\N	2026-08-20 12:04:47	2026-08-20 12:39:47	signatures/1787227487_ttd_1.jpeg	Update Transkrip Nilai	generated_letters/permohonan_27_1787227488.docx	\N
\.


--
-- TOC entry 5005 (class 0 OID 30023)
-- Dependencies: 233
-- Data for Name: letter_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.letter_requirements (id, category_id, nama_syarat, tipe_file, created_at, updated_at) FROM stdin;
68	9	Scan/Foto KTM	JPG/PNG	2026-08-15 15:35:49	2026-08-15 15:35:49
69	9	Transkrip Nilai Terakhir	PDF	2026-08-15 15:35:49	2026-08-15 15:35:49
70	9	Curriculum Vitae (CV)	PDF	2026-08-15 15:35:49	2026-08-15 15:35:49
71	3	Transkrip Nilai Terakhir	PDF	2026-08-15 15:36:11	2026-08-15 15:36:11
72	3	Scan/Foto KTM	JPG/PNG	2026-08-15 15:36:11	2026-08-15 15:36:11
73	6	Scan/Foto KTM	PDF	2026-08-15 15:36:36	2026-08-15 15:36:36
74	1	Scan KTM (Kartu Tanda Mahasiswa)	JPG/PNG	2026-08-15 15:36:56	2026-08-15 15:36:56
75	1	Transkrip Nilai Terakhir	PDF	2026-08-15 15:36:56	2026-08-15 15:36:56
76	8	Scan/Foto KTM	JPG/PNG	2026-08-15 15:37:17	2026-08-15 15:37:17
77	8	Transkrip Nilai Terakhir	PDF	2026-08-15 15:37:17	2026-08-15 15:37:17
78	7	Scan/Foto KTM	JPG/PNG	2026-08-15 15:37:43	2026-08-15 15:37:43
79	7	Transkrip Nilai Terakhir	PDF	2026-08-15 15:37:43	2026-08-15 15:37:43
\.


--
-- TOC entry 5007 (class 0 OID 30035)
-- Dependencies: 235
-- Data for Name: letter_variables; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.letter_variables (id, category_id, nama_variabel, tipe_input_html, created_at, updated_at) FROM stdin;
93	9	Instansi_Tujuan	text	2026-08-15 15:35:49	2026-08-15 15:35:49
94	9	Alamat_Instansi	text	2026-08-15 15:35:49	2026-08-15 15:35:49
95	9	Program_Magang	text	2026-08-15 15:35:49	2026-08-15 15:35:49
96	9	Tanggal_Mulai	date	2026-08-15 15:35:49	2026-08-15 15:35:49
97	9	Tanggal_Selesai	date	2026-08-15 15:35:49	2026-08-15 15:35:49
98	3	Instansi_Tujuan	text	2026-08-15 15:36:12	2026-08-15 15:36:12
99	3	Alamat_Instansi	text	2026-08-15 15:36:12	2026-08-15 15:36:12
100	3	Tanggal_Mulai	date	2026-08-15 15:36:12	2026-08-15 15:36:12
101	3	Tanggal_Selesai	date	2026-08-15 15:36:12	2026-08-15 15:36:12
102	6	Keperluan	text	2026-08-15 15:36:36	2026-08-15 15:36:36
103	1	Judul_Penelitian	text	2026-08-15 15:36:56	2026-08-15 15:36:56
104	1	Instansi	text	2026-08-15 15:36:56	2026-08-15 15:36:56
105	1	Dosen_Pembimbing	text	2026-08-15 15:36:56	2026-08-15 15:36:56
106	8	Instansi_Tujuan	text	2026-08-15 15:37:17	2026-08-15 15:37:17
107	8	Alamat_Instansi	text	2026-08-15 15:37:17	2026-08-15 15:37:17
108	8	Divisi_Magang	text	2026-08-15 15:37:17	2026-08-15 15:37:17
109	8	Tanggal_Mulai	date	2026-08-15 15:37:17	2026-08-15 15:37:17
110	8	Tanggal_Selesai	date	2026-08-15 15:37:17	2026-08-15 15:37:17
111	7	Semester	text	2026-08-15 15:37:43	2026-08-15 15:37:43
112	7	Penyelenggara_Beasiswa	text	2026-08-15 15:37:43	2026-08-15 15:37:43
113	7	Program_Beasiswa	text	2026-08-15 15:37:43	2026-08-15 15:37:43
\.


--
-- TOC entry 5001 (class 0 OID 30002)
-- Dependencies: 229
-- Data for Name: mahasiswas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mahasiswas (id, user_id, nim, nama, prodi, created_at, updated_at, angkatan, jenis_kelamin, jenis_mahasiswa, tempat_lahir, tanggal_lahir, alamat, email, no_hp, dosen_wali, status_mahasiswa) FROM stdin;
1	2	220101001	Budi Santoso	Teknik Informatika	2026-08-08 03:29:11	2026-08-10 03:45:34	2022	L	Reguler	Cimahi	2004-05-01	Jl Budi	berlinashbrh@gmail.com	083122662986	Mina Ismu Rahayu	Aktif
2	3	1224008	Berlina Shobirah	Teknik Informatika	2026-08-08 04:07:55	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
3	4	1224014	Muhammad Irfan Abdul Aziz Ramdani	Teknik Informatika	2026-08-08 04:07:55	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
4	5	1223017	Ryan Garnida	Teknik Informatika	2026-08-08 04:07:56	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
5	6	1223009	Audry Nabila Anastasya	Teknik Informatika	2026-08-08 04:07:56	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
6	7	1223001	Aditia Muhamad Rehan	Sistem Informasi	2026-08-08 04:07:56	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
7	8	1223008	Azzahra Maharani Dewi Fortuna	Sistem Informasi	2026-08-08 04:07:57	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
8	9	1223007	Elan Nurhaliza	Teknik Informatika	2026-08-08 04:07:57	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
9	10	1223003	Balqis Zahara Anugrah	Teknik Informatika	2026-08-08 04:07:57	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
10	11	1224012	Reza Arya Bima	Sistem Informasi	2026-08-08 04:07:58	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
11	12	1224022	Chepi Syahbudien Basil	Sistem Informasi	2026-08-08 04:07:58	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
12	13	1224021	Nur Alifah Anggraeni	Sistem Informasi	2026-08-08 04:07:59	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
13	14	1224024	Muhammad Fathulhaq Alfiqi	Sistem Informasi	2026-08-08 04:07:59	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
14	15	1224005	Arya Kusuma Dinata	Teknik Informatika	2026-08-08 04:07:59	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
15	16	1224009	Aura Ghafira Vierzly Athariq	Teknik Informatika	2026-08-08 04:08:00	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
16	17	3224018	Lutfiana Faisal Patah	Teknik Informatika	2026-08-08 04:08:00	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
17	18	3224015	Melanie Priatna	Teknik Informatika	2026-08-08 04:08:00	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
18	19	3224001	Nadjlah Cahya Nerik Fadilah	Sistem Informasi	2026-08-08 04:08:01	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
19	20	3224012	Ariya Narendra Ardi Alfirdaus	Sistem Informasi	2026-08-08 04:08:01	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
20	21	1224604	Haikal Fadhilah Ibrahim	Teknik Informatika	2026-08-08 04:08:01	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
21	22	1223013	Gilang Permana	Teknik Informatika	2026-08-08 04:08:02	2026-08-10 04:46:17	2024	\N	Reguler	\N	\N	\N	berlinashbrh@gmail.com	\N	\N	Aktif
28	29	1223081	Tiara Andini	Sistem Informasi	2026-08-12 08:03:09	2026-08-12 08:03:09	2023	P	Reguler	\N	\N	Jl. Antapani No. 21	tiara.andini@student.stmik-bandung.ac.id	085127486538	Eva Diah Novitasari, S.Kom	Aktif
29	30	1223082	Bintang Putra	Teknik Informatika	2026-08-12 08:03:09	2026-08-12 08:03:09	2023	L	Reguler	\N	\N	Jl. Dago No. 65	bintang.putra@student.stmik-bandung.ac.id	089422666082	Mina Ismu Rahayu, M.T	Aktif
30	31	1223083	Amanda Maharani	Teknik Informatika	2026-08-12 08:03:10	2026-08-12 08:03:10	2023	P	Reguler	\N	\N	Jl. Cikutra No. 90	amanda.maharani@student.stmik-bandung.ac.id	088385432999	Eva Diah Novitasari, S.Kom	Aktif
31	32	1223084	Kevin Sanjaya	Teknik Informatika	2026-08-12 08:03:10	2026-08-12 08:03:10	2023	L	Reguler	\N	\N	Jl. Pahlawan No. 52	kevin.sanjaya@student.stmik-bandung.ac.id	089538088369	Eva Diah Novitasari, S.Kom	Aktif
32	33	1223085	Rina Wulandari	Sistem Informasi	2026-08-12 08:03:11	2026-08-12 08:03:11	2023	P	Reguler	\N	\N	Jl. Suci No. 62	rina.wulandari@student.stmik-bandung.ac.id	084356638373	Eva Diah Novitasari, S.Kom	Aktif
33	34	3224091	Fajar Siddiq	Sistem Informasi	2026-08-12 08:03:11	2026-08-12 08:03:11	2024	L	Reguler	\N	\N	Jl. Cikutra No. 6	fajar.siddiq@student.stmik-bandung.ac.id	087284438134	Eva Diah Novitasari, S.Kom	Aktif
34	35	3224092	Maya Sari	Sistem Informasi	2026-08-12 08:03:11	2026-08-12 08:03:11	2024	P	Reguler	\N	\N	Jl. Pahlawan No. 43	maya.sari@student.stmik-bandung.ac.id	084816940097	Tantra, S.Kom	Aktif
35	36	3224093	Dwi Cahyono	Teknik Informatika	2026-08-12 08:03:12	2026-08-12 08:03:12	2024	L	Reguler	\N	\N	Jl. Antapani No. 81	dwi.cahyono@student.stmik-bandung.ac.id	085861891191	Eva Diah Novitasari, S.Kom	Aktif
36	37	3224094	Indah Permatasari	Teknik Informatika	2026-08-12 08:03:12	2026-08-12 08:03:12	2024	P	Reguler	\N	\N	Jl. Pahlawan No. 26	indah.permatasari@student.stmik-bandung.ac.id	081296131310	Eva Diah Novitasari, S.Kom	Aktif
37	38	3224095	Gilang Ramadhan	Teknik Informatika	2026-08-12 08:03:12	2026-08-12 08:03:12	2024	L	Reguler	\N	\N	Jl. Pahlawan No. 94	gilang.ramadhan@student.stmik-bandung.ac.id	086407981050	Eva Diah Novitasari, S.Kom	Aktif
38	39	1224050	Aditya Wirawan	Teknik Informatika	2026-08-20 13:16:13	2026-08-20 13:16:13	2024	L	Reguler	\N	\N	\N	aditya.w@example.com	081122334455	\N	Aktif
24	25	1224052	Kevin Sanjaya	Teknik Informatika	2026-08-12 08:03:07	2026-08-20 13:16:14	2024	L	Kelas Karyawan	\N	\N	Jl. Pahlawan No. 1	kevin.s@example.com	081122334457	Mina Ismu Rahayu, M.T	Aktif
25	26	1224053	Rina Amelia	Sistem Informasi	2026-08-12 08:03:08	2026-08-20 13:16:15	2024	P	Kelas Karyawan	\N	\N	Jl. Antapani No. 87	rina.a@example.com	081122334458	Mina Ismu Rahayu, M.T	Aktif
26	27	1224054	Gilang Ramadhan	Teknik Komputer	2026-08-12 08:03:08	2026-08-20 13:16:15	2024	L	Reguler	\N	\N	Jl. Dago No. 60	gilang.r@example.com	081122334459	Mina Ismu Rahayu, M.T	Aktif
27	28	1224055	Nadia Salsabila	Teknik Informatika	2026-08-12 08:03:09	2026-08-20 13:16:16	2024	P	Reguler	\N	\N	Jl. Pahlawan No. 75	nadia.s@example.com	081122334460	Eva Diah Novitasari, S.Kom	Aktif
39	40	1224056	Farhan Maulana	Sistem Informasi	2026-08-20 13:16:16	2026-08-20 13:16:16	2024	L	Reguler	\N	\N	\N	farhan.m@example.com	081122334461	\N	Aktif
23	24	1224051	Aditya Wirawan	Sistem Informasi	2026-08-12 08:03:07	2026-08-20 13:46:04	2024	P	Reguler	\N	\N	Jl. Suci No. 76	dinda.ayu@example.com	081122334456	Eva Diah Novitasari, S.Kom	Aktif
\.


--
-- TOC entry 4988 (class 0 OID 29920)
-- Dependencies: 216
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	2026_01_01_000001_create_mahasiswas_table	1
5	2026_01_01_000002_create_letter_categories_table	1
6	2026_01_01_000003_create_letter_requirements_table	1
7	2026_01_01_000004_create_letter_variables_table	1
8	2026_01_01_000005_create_letter_requests_table	1
9	2026_01_01_000006_create_letter_request_values_table	1
10	2026_01_01_000007_create_letter_request_requirements_table	1
11	2026_08_06_150553_create_personal_access_tokens_table	1
14	2026_08_08_000001_add_ttd_digital_to_letter_categories_table	2
15	2026_08_08_000002_add_file_ttd_digital_path_to_letter_requests_table	2
16	2026_08_08_000003_add_alasan_penolakan_to_letter_requests_table	3
17	2026_08_09_000001_add_profile_fields_to_mahasiswas_and_users_table	4
18	2026_08_09_171111_backfill_angkatan_2024_for_existing_students	4
19	2026_08_10_033807_add_new_column_to_mahasiswas_table	4
20	2026_08_14_000001_add_soft_deletes_to_letter_categories_table	5
21	2026_08_14_000002_add_grup_kategori_to_letter_categories_table	6
22	2026_08_14_000002_add_permohonan_and_pengantar_templates	7
23	2026_08_14_000003_add_grup_kategori_to_letter_categories_table	8
24	2026_08_14_000001_add_nomor_surat_to_letter_requests_table	9
\.


--
-- TOC entry 4991 (class 0 OID 29939)
-- Dependencies: 219
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (username, token, created_at) FROM stdin;
\.


--
-- TOC entry 5015 (class 0 OID 30104)
-- Dependencies: 243
-- Data for Name: personal_access_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.personal_access_tokens (id, tokenable_type, tokenable_id, name, token, abilities, last_used_at, expires_at, created_at, updated_at) FROM stdin;
26	App\\Models\\User	1	auth_token	e5a78fe88c05012a41bc6ca6be258229e1c6928f3298c995e02f2c92db5a231c	["*"]	2026-08-20 13:57:53	\N	2026-08-20 12:51:49	2026-08-20 13:57:53
17	App\\Models\\User	2	auth_token	1431f7992fced5085d9aaa3216de55812c03c1acd4b89f051318a5281c9ed97e	["*"]	2026-08-15 13:39:52	\N	2026-08-15 13:09:15	2026-08-15 13:39:52
18	App\\Models\\User	2	auth_token	744aaf0a0547997881e99fd2753c437c5be3819a75a11afa15aba2866dbfd0ae	["*"]	2026-08-15 16:01:31	\N	2026-08-15 14:00:45	2026-08-15 16:01:31
15	App\\Models\\User	2	auth_token	68b69d4f929ef7d7d0a5db497c968ef1186312da4071e047892138194f95ac45	["*"]	2026-08-12 09:12:17	\N	2026-08-12 07:13:49	2026-08-12 09:12:17
16	App\\Models\\User	2	auth_token	3ff0530501c82d16fcdc0a263cf0be23555097e3e899a77e9408a60b9ec8cc8f	["*"]	2026-08-14 06:08:01	\N	2026-08-14 03:59:15	2026-08-14 06:08:01
19	App\\Models\\User	2	auth_token	18d070de57e2c1dc934788d6f91f6a134dd950cd128a43adc252256f45659bd7	["*"]	2026-08-18 15:04:58	\N	2026-08-18 12:56:56	2026-08-18 15:04:58
10	App\\Models\\User	2	auth_token	53ced29baff9bcff4ac21aea52f40432bc8a6944dfe5600e2a5978c656c067b1	["*"]	2026-08-09 07:20:11	\N	2026-08-09 07:05:44	2026-08-09 07:20:11
7	App\\Models\\User	2	auth_token	9615895f9939f155ef3e97cf2030faeaf0ed6c5bbfd12d854feb93a4ce095208	["*"]	2026-08-08 06:50:44	\N	2026-08-08 06:40:41	2026-08-08 06:50:44
13	App\\Models\\User	2	auth_token	6cc8fdd9184325f2b87a9b0e57c6f1c256870099ed2dc2fb6c1306c20103740f	["*"]	2026-08-10 06:08:07	\N	2026-08-10 02:46:59	2026-08-10 06:08:07
\.


--
-- TOC entry 4992 (class 0 OID 29946)
-- Dependencies: 220
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessions (id, user_id, ip_address, user_agent, payload, last_activity) FROM stdin;
\.


--
-- TOC entry 4990 (class 0 OID 29927)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, remember_token, created_at, updated_at, name) FROM stdin;
1	admin	$2y$12$081HXPaixrF.a2JFiJ4EJu84aamFa6cHDznY/RrJ8/O9dEUAjTU2G	admin	\N	2026-08-08 03:29:10	2026-08-08 03:29:10	\N
2	stmik220101001	$2y$12$lLoTX45QDBNJ6mgEvfCKCucXZOhygzv.2IBMhzZsPAheu.dT02tU.	mahasiswa	\N	2026-08-08 03:29:11	2026-08-09 07:02:30	\N
3	stmik1224008	$2y$12$xE7v39ecpR7bMzPBSjIJ..ST8nZ2EezCSRlXAKTBdq7wnVHOrMtnu	mahasiswa	\N	2026-08-08 04:07:55	2026-08-09 07:02:30	\N
4	stmik1224014	$2y$12$Y9jQlsJEG5dVOY4ohkfbQeSYp7F/nErnubyM4b2SZdsExPgVPBXhy	mahasiswa	\N	2026-08-08 04:07:55	2026-08-09 07:02:31	\N
5	stmik1223017	$2y$12$atlL430dV4hY9kEPexWbrOUVGJscm26snX9nUblxNd2mfniHkEqpS	mahasiswa	\N	2026-08-08 04:07:56	2026-08-09 07:02:31	\N
6	stmik1223009	$2y$12$xoq.cmBuBsAmcikpaoC1YOUlCVFl3m5rwGl9.cY5rXom0z2nhEhZm	mahasiswa	\N	2026-08-08 04:07:56	2026-08-09 07:02:32	\N
7	stmik1223001	$2y$12$icm4Br7tXdKKpl3OgOYYN.mqkJPjMqYvwgbAOZFbIASiBzLDNTfZC	mahasiswa	\N	2026-08-08 04:07:56	2026-08-09 07:02:32	\N
8	stmik1223008	$2y$12$qP6U1irAVANsPb6U1DnOzes5gVnnUnof6HN3X5oHamhRn9kx55sYe	mahasiswa	\N	2026-08-08 04:07:57	2026-08-09 07:02:33	\N
9	stmik1223007	$2y$12$C2abPip8.lyHjpIKr6a4Ke3SsNCzg3.0Z5DaZIrsrfSm3rhRPrCQ6	mahasiswa	\N	2026-08-08 04:07:57	2026-08-09 07:02:33	\N
10	stmik1223003	$2y$12$aeGLvDPN41xzCWpgfIdzEOz/jEJ5EskM/dkQtPRMkXCJQRHbKt75W	mahasiswa	\N	2026-08-08 04:07:57	2026-08-09 07:02:34	\N
11	stmik1224012	$2y$12$Cl0ZRzr6m6DS2T8hYa3Fj.WEX1I/hOUoX0tdwn99L4iZOOeL4WBxm	mahasiswa	\N	2026-08-08 04:07:58	2026-08-09 07:02:35	\N
12	stmik1224022	$2y$12$NcGt5qtVQ95pIq4kY69dBuqAEV6ZaXyfglBAalDoPsIMaTvfHn5MS	mahasiswa	\N	2026-08-08 04:07:58	2026-08-09 07:02:36	\N
13	stmik1224021	$2y$12$pbQ9YoPgpsCpXat60qoB5OX7cY3gC8WaMoU.loG6ZrRoBTUForQPS	mahasiswa	\N	2026-08-08 04:07:59	2026-08-09 07:02:36	\N
14	stmik1224024	$2y$12$/r29SkC1vSJL3M9VGuH6duhOcqet40JoQwFPNROv/PlEu4Yl.6uFC	mahasiswa	\N	2026-08-08 04:07:59	2026-08-09 07:02:37	\N
15	stmik1224005	$2y$12$hFFlujFOvI1Exoy5StHMy.4dMVZ4fToZOrjKqOCKPecx8gbArGRkK	mahasiswa	\N	2026-08-08 04:07:59	2026-08-09 07:02:38	\N
16	stmik1224009	$2y$12$Rf3BZw1yAU7h5X55R36qAOqtzflSJkEzwObdBROUGVSTzbq8yx25S	mahasiswa	\N	2026-08-08 04:08:00	2026-08-09 07:02:39	\N
17	stmik3224018	$2y$12$TMeTooX.ujMxubaqRG2qxOhVwCb3IG//QqbbXzTyNM5ZOEgAfoleK	mahasiswa	\N	2026-08-08 04:08:00	2026-08-09 07:02:40	\N
18	stmik3224015	$2y$12$fdU7FUOAxNHXxWzVCkqBVulgfFbLOL2p5t7heWVjzspYlTpW7YbqG	mahasiswa	\N	2026-08-08 04:08:00	2026-08-09 07:02:41	\N
19	stmik3224001	$2y$12$cE80N0tMgA6k2IwKbSJBN.lA58pxGmkvJcxU2GeqrIZ8NU/98/n5W	mahasiswa	\N	2026-08-08 04:08:01	2026-08-09 07:02:43	\N
20	stmik3224012	$2y$12$pqWFJIclLYfcBHWaY3V8z.EmA5hkxpZJq9hH92y39hf1DHcxFeR/W	mahasiswa	\N	2026-08-08 04:08:01	2026-08-09 07:02:43	\N
21	stmik1224604	$2y$12$FMla6fBRCLp1fact9i.g2uTlMjdJ08nWcC607W5W5NIYPGLQvpkD6	mahasiswa	\N	2026-08-08 04:08:01	2026-08-09 07:02:45	\N
22	stmik1223013	$2y$12$IRFeJdNLJiLNE9Ek8wO86u//LwMo6MNrXdv7ZxsR64bzA0RZUZhjS	mahasiswa	\N	2026-08-08 04:08:02	2026-08-09 07:02:45	\N
29	stmik1223081	$2y$12$kAjX7ECNPXnevLnVCMhU4OTH1CulyNu3rrStWbTa2bgdNdoxIhA/6	mahasiswa	\N	2026-08-12 08:03:09	2026-08-12 08:03:09	\N
30	stmik1223082	$2y$12$GE.MlNZBK1ZjLDBUDopi0.agCBtYPK9my1fFec3XC1FAeRN3BN5na	mahasiswa	\N	2026-08-12 08:03:09	2026-08-12 08:03:09	\N
31	stmik1223083	$2y$12$dYBk/WvRDShM6LWDCBWeGeCStpPTkGcPjQ0GLGDUKyEDI5/w2Gztm	mahasiswa	\N	2026-08-12 08:03:10	2026-08-12 08:03:10	\N
32	stmik1223084	$2y$12$i6rGs406YuWfkFSgVXc53O9g32z2GTNsE1Z/ZglenZUdP4G7ztiM.	mahasiswa	\N	2026-08-12 08:03:10	2026-08-12 08:03:10	\N
33	stmik1223085	$2y$12$Iam/dieaJyJoGXqdXDbst.5VQITyaq1ca84/bVisUTSsUBtMNCZ9m	mahasiswa	\N	2026-08-12 08:03:11	2026-08-12 08:03:11	\N
34	stmik3224091	$2y$12$N6oQA.x.NGBlppb4Wj4kXuZXDmRl8qXqMwDiTMRy8nW27v7WdDMnO	mahasiswa	\N	2026-08-12 08:03:11	2026-08-12 08:03:11	\N
35	stmik3224092	$2y$12$VrcFZGPwYcBPaecZVJfboOt6GlVEwuX5mwFxdIMu7kQwInohEgWfe	mahasiswa	\N	2026-08-12 08:03:11	2026-08-12 08:03:11	\N
36	stmik3224093	$2y$12$sBljzPFBWHcBA/Q/o9KGF.x.RnTZT7htC4MHKS1n65BENL23mtB.a	mahasiswa	\N	2026-08-12 08:03:12	2026-08-12 08:03:12	\N
37	stmik3224094	$2y$12$asVZAWdEj9P8LQrpEXL6f.7KK0R4an0mSBNQ7Bh0CJU1xBBnotodq	mahasiswa	\N	2026-08-12 08:03:12	2026-08-12 08:03:12	\N
38	stmik3224095	$2y$12$k6apVDx2EFTtwAJwzbaIeedsXrPHvj5Y3tMZyeUDXfGTMehRTxVQO	mahasiswa	\N	2026-08-12 08:03:12	2026-08-12 08:03:12	\N
39	stmik1224050	$2y$12$VMpukZLzCltyj6mAo4IEGuGTM464UNj9LmK4NJlOxUkGUVpv6a6aS	mahasiswa	\N	2026-08-20 13:16:13	2026-08-20 13:32:50	\N
24	stmik1224051	$2y$12$eO0.rnu7Un.v59ioz2rsZ.gT1IV1gj23VTkEZ4AIQJG/9VfSJekLu	mahasiswa	\N	2026-08-12 08:03:07	2026-08-20 13:32:51	\N
25	stmik1224052	$2y$12$MQHGB3PE0Sv17mntOEUX1uBIo8bKYDuBzv1vCcR9KZ5DS1jFxNnlC	mahasiswa	\N	2026-08-12 08:03:07	2026-08-20 13:32:52	\N
26	stmik1224053	$2y$12$YUnKBJXRBoP0K1aaMfAER.DT1mMXdvhGYiyvCV3ldj/Bjm52uhh7.	mahasiswa	\N	2026-08-12 08:03:08	2026-08-20 13:32:52	\N
27	stmik1224054	$2y$12$IogSjPV9qHlD51t6zShoxe9BYZwB7PIl.4a.Z8.twPgNJDX9uHPsO	mahasiswa	\N	2026-08-12 08:03:08	2026-08-20 13:32:53	\N
28	stmik1224055	$2y$12$AGSoUdRWj9ouI/KhYKIuLOSIra.4TFElMTtLX0wFEujYxhK6bn5VO	mahasiswa	\N	2026-08-12 08:03:09	2026-08-20 13:32:53	\N
40	stmik1224056	$2y$12$w172xf58iC6kr5H3JyK7h.kYIDvfcHXDNqCPA7p8B06JS2I68HeXO	mahasiswa	\N	2026-08-20 13:16:16	2026-08-20 13:32:54	\N
\.


--
-- TOC entry 5033 (class 0 OID 0)
-- Dependencies: 226
-- Name: failed_jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.failed_jobs_id_seq', 1, false);


--
-- TOC entry 5034 (class 0 OID 0)
-- Dependencies: 223
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 1, false);


--
-- TOC entry 5035 (class 0 OID 0)
-- Dependencies: 230
-- Name: letter_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.letter_categories_id_seq', 9, true);


--
-- TOC entry 5036 (class 0 OID 0)
-- Dependencies: 240
-- Name: letter_request_requirements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.letter_request_requirements_id_seq', 56, true);


--
-- TOC entry 5037 (class 0 OID 0)
-- Dependencies: 238
-- Name: letter_request_values_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.letter_request_values_id_seq', 87, true);


--
-- TOC entry 5038 (class 0 OID 0)
-- Dependencies: 236
-- Name: letter_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.letter_requests_id_seq', 27, true);


--
-- TOC entry 5039 (class 0 OID 0)
-- Dependencies: 232
-- Name: letter_requirements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.letter_requirements_id_seq', 79, true);


--
-- TOC entry 5040 (class 0 OID 0)
-- Dependencies: 234
-- Name: letter_variables_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.letter_variables_id_seq', 113, true);


--
-- TOC entry 5041 (class 0 OID 0)
-- Dependencies: 228
-- Name: mahasiswas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mahasiswas_id_seq', 39, true);


--
-- TOC entry 5042 (class 0 OID 0)
-- Dependencies: 215
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.migrations_id_seq', 24, true);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 242
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.personal_access_tokens_id_seq', 26, true);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 40, true);


--
-- TOC entry 4804 (class 2606 OID 29969)
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- TOC entry 4801 (class 2606 OID 29961)
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- TOC entry 4812 (class 2606 OID 29997)
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4814 (class 2606 OID 30000)
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- TOC entry 4809 (class 2606 OID 29987)
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- TOC entry 4806 (class 2606 OID 29979)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4818 (class 2606 OID 30021)
-- Name: letter_categories letter_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_categories
    ADD CONSTRAINT letter_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4828 (class 2606 OID 30092)
-- Name: letter_request_requirements letter_request_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_request_requirements
    ADD CONSTRAINT letter_request_requirements_pkey PRIMARY KEY (id);


--
-- TOC entry 4826 (class 2606 OID 30075)
-- Name: letter_request_values letter_request_values_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_request_values
    ADD CONSTRAINT letter_request_values_pkey PRIMARY KEY (id);


--
-- TOC entry 4824 (class 2606 OID 30056)
-- Name: letter_requests letter_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_requests
    ADD CONSTRAINT letter_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 4820 (class 2606 OID 30028)
-- Name: letter_requirements letter_requirements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_requirements
    ADD CONSTRAINT letter_requirements_pkey PRIMARY KEY (id);


--
-- TOC entry 4822 (class 2606 OID 30040)
-- Name: letter_variables letter_variables_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_variables
    ADD CONSTRAINT letter_variables_pkey PRIMARY KEY (id);


--
-- TOC entry 4816 (class 2606 OID 30007)
-- Name: mahasiswas mahasiswas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mahasiswas
    ADD CONSTRAINT mahasiswas_pkey PRIMARY KEY (id);


--
-- TOC entry 4788 (class 2606 OID 29925)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4794 (class 2606 OID 29945)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (username);


--
-- TOC entry 4831 (class 2606 OID 30111)
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 30114)
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4797 (class 2606 OID 29952)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4790 (class 2606 OID 29936)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4792 (class 2606 OID 29938)
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- TOC entry 4799 (class 1259 OID 29962)
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- TOC entry 4802 (class 1259 OID 29970)
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- TOC entry 4810 (class 1259 OID 29998)
-- Name: failed_jobs_connection_queue_failed_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX failed_jobs_connection_queue_failed_at_index ON public.failed_jobs USING btree (connection, queue, failed_at);


--
-- TOC entry 4807 (class 1259 OID 29980)
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- TOC entry 4829 (class 1259 OID 30115)
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- TOC entry 4834 (class 1259 OID 30112)
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- TOC entry 4795 (class 1259 OID 29954)
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- TOC entry 4798 (class 1259 OID 29953)
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- TOC entry 4842 (class 2606 OID 30093)
-- Name: letter_request_requirements letter_request_requirements_request_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_request_requirements
    ADD CONSTRAINT letter_request_requirements_request_id_foreign FOREIGN KEY (request_id) REFERENCES public.letter_requests(id) ON DELETE CASCADE;


--
-- TOC entry 4843 (class 2606 OID 30098)
-- Name: letter_request_requirements letter_request_requirements_requirement_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_request_requirements
    ADD CONSTRAINT letter_request_requirements_requirement_id_foreign FOREIGN KEY (requirement_id) REFERENCES public.letter_requirements(id) ON DELETE CASCADE;


--
-- TOC entry 4840 (class 2606 OID 30076)
-- Name: letter_request_values letter_request_values_request_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_request_values
    ADD CONSTRAINT letter_request_values_request_id_foreign FOREIGN KEY (request_id) REFERENCES public.letter_requests(id) ON DELETE CASCADE;


--
-- TOC entry 4841 (class 2606 OID 30081)
-- Name: letter_request_values letter_request_values_variable_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_request_values
    ADD CONSTRAINT letter_request_values_variable_id_foreign FOREIGN KEY (variable_id) REFERENCES public.letter_variables(id) ON DELETE CASCADE;


--
-- TOC entry 4838 (class 2606 OID 30062)
-- Name: letter_requests letter_requests_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_requests
    ADD CONSTRAINT letter_requests_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.letter_categories(id) ON DELETE CASCADE;


--
-- TOC entry 4839 (class 2606 OID 30057)
-- Name: letter_requests letter_requests_mahasiswa_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_requests
    ADD CONSTRAINT letter_requests_mahasiswa_id_foreign FOREIGN KEY (mahasiswa_id) REFERENCES public.mahasiswas(id) ON DELETE CASCADE;


--
-- TOC entry 4836 (class 2606 OID 30029)
-- Name: letter_requirements letter_requirements_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_requirements
    ADD CONSTRAINT letter_requirements_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.letter_categories(id) ON DELETE CASCADE;


--
-- TOC entry 4837 (class 2606 OID 30041)
-- Name: letter_variables letter_variables_category_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.letter_variables
    ADD CONSTRAINT letter_variables_category_id_foreign FOREIGN KEY (category_id) REFERENCES public.letter_categories(id) ON DELETE CASCADE;


--
-- TOC entry 4835 (class 2606 OID 30008)
-- Name: mahasiswas mahasiswas_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mahasiswas
    ADD CONSTRAINT mahasiswas_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2026-08-20 20:58:46

--
-- PostgreSQL database dump complete
--


-- ============================================================
--  Comparatore casse malati CH — schema dati
--  Fonte: UFSP/BAG "Krankenversicherungsprämien" (opendata.swiss)
--  Licenza: open use, obbligo di citare la fonte (terms_by)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------
-- 1. Assicuratori
-- ------------------------------------------------------------
create table if not exists insurers (
  bag_number      integer primary key,          -- numero UFSP dell'assicuratore
  name            text not null,                -- nome come da file UFSP
  display_name    text,                         -- nome pulito per il sito
  group_name      text,                         -- gruppo (es. CSS, Helsana, Groupe Mutuel)
  website         text,
  created_at      timestamptz not null default now()
);

comment on column insurers.group_name is
  'Molte "casse diverse" appartengono allo stesso gruppo. Va mostrato all''utente.';

-- ------------------------------------------------------------
-- 2. Comuni -> cantone + regione di premio
--    Fonte: Einzugsgebiete.csv
-- ------------------------------------------------------------
create table if not exists municipalities (
  bfs_number      integer primary key,
  name            text not null,
  canton          char(2) not null,
  region_code     text not null,               -- PR-REG CH1 / CH2 / CH3
  year            integer not null
);

-- Un CAP può coprire più comuni e viceversa: tabella ponte.
create table if not exists postal_codes (
  plz             integer not null,
  bfs_number      integer not null references municipalities(bfs_number),
  primary key (plz, bfs_number)
);

create index if not exists idx_postal_codes_plz on postal_codes(plz);

-- ------------------------------------------------------------
-- 3. Premi
--    Chiave naturale: anno + cantone + regione + assicuratore +
--    tariffa + classe d'età + franchigia + infortunio
-- ------------------------------------------------------------
create table if not exists premiums (
  id                bigserial primary key,
  year              integer not null,
  canton            char(2) not null,
  region_code       text    not null,
  bag_number        integer not null references insurers(bag_number),
  tariff_code       text    not null,           -- TAR-BASE, TAR-HAM, TAR-HMO, TAR-DIV...
  tariff_label      text,                       -- nome commerciale del modello
  age_class         text    not null,           -- AKL-KIN / AKL-JUG / AKL-ERW
  age_subgroup      text,                       -- sottogruppo (bambini 0-18 ecc.)
  franchise         integer not null,           -- 0,100..600 bambini | 300..2500 adulti
  accident_included boolean not null,           -- MIT = true, OHN = false
  premium_chf       numeric(8,2) not null,      -- premio mensile
  created_at        timestamptz not null default now()
);

create unique index if not exists uq_premium_natural_key
  on premiums (year, canton, region_code, bag_number, tariff_code,
               age_class, coalesce(age_subgroup,''), franchise, accident_included);

-- Indice per la query principale del sito
create index if not exists idx_premium_lookup
  on premiums (year, canton, region_code, age_class, franchise, accident_included);

-- ------------------------------------------------------------
-- 4. Il differenziatore: comportamento storico degli assicuratori
--    "Quali casse attirano con premi bassi e poi alzano?"
-- ------------------------------------------------------------
create or replace view insurer_year_reference as
select
  year, canton, region_code, age_class, franchise, accident_included,
  bag_number,
  min(premium_chf) as premium_chf
from premiums
where tariff_code = 'TAR-BASE'          -- modello standard, confronto pulito
group by 1,2,3,4,5,6,7;

-- Rango dell'assicuratore nel suo mercato locale, anno per anno.
create or replace view insurer_rank_history as
select
  r.*,
  rank() over (
    partition by year, canton, region_code, age_class, franchise, accident_included
    order by premium_chf
  ) as price_rank,
  count(*) over (
    partition by year, canton, region_code, age_class, franchise, accident_included
  ) as competitors
from insurer_year_reference r;

-- Variazione annua % per assicuratore/regione: la base del "loyalty tax score".
create or replace view insurer_yearly_change as
select
  curr.bag_number,
  curr.canton,
  curr.region_code,
  curr.age_class,
  curr.franchise,
  curr.year,
  prev.premium_chf                                    as premium_prev,
  curr.premium_chf                                    as premium_curr,
  round(((curr.premium_chf - prev.premium_chf)
         / nullif(prev.premium_chf,0)) * 100, 2)      as change_pct,
  curr.price_rank                                     as rank_curr,
  prev.price_rank                                     as rank_prev,
  curr.price_rank - prev.price_rank                   as rank_drift
from insurer_rank_history curr
join insurer_rank_history prev
  on  prev.bag_number        = curr.bag_number
  and prev.canton            = curr.canton
  and prev.region_code       = curr.region_code
  and prev.age_class         = curr.age_class
  and prev.franchise         = curr.franchise
  and prev.accident_included = curr.accident_included
  and prev.year              = curr.year - 1;

-- ------------------------------------------------------------
-- 5. Trasparenza: ogni raccomandazione mostrata viene registrata,
--    inclusa quella "resta dove sei" (che non genera provvigione).
--    Serve per pubblicare le statistiche reali sul sito.
-- ------------------------------------------------------------
create table if not exists recommendations_log (
  id                uuid primary key default uuid_generate_v4(),
  created_at        timestamptz not null default now(),
  canton            char(2),
  region_code       text,
  age_class         text,
  verdict           text not null,      -- 'stay' | 'switch_insurer' | 'adjust_franchise' | 'adjust_model'
  annual_saving_chf numeric(8,2),
  commission_chf    numeric(8,2) default 0   -- 0 quando il verdetto è 'stay'
);

comment on table recommendations_log is
  'Nessun dato personale. Serve a pubblicare "in X%% dei casi abbiamo detto di restare".';

-- ------------------------------------------------------------
-- 6. RLS: i dati sui premi sono pubblici, il log è solo in scrittura
-- ------------------------------------------------------------
alter table premiums              enable row level security;
alter table insurers              enable row level security;
alter table municipalities        enable row level security;
alter table postal_codes          enable row level security;
alter table recommendations_log   enable row level security;

create policy "public read premiums"       on premiums            for select using (true);
create policy "public read insurers"       on insurers            for select using (true);
create policy "public read municipalities" on municipalities      for select using (true);
create policy "public read postal_codes"   on postal_codes        for select using (true);
create policy "anon insert log"            on recommendations_log for insert with check (true);

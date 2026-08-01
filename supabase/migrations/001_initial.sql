-- Personal expense tracker (single-user, no auth)

create type payment_mode as enum (
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Wallet'
);

create type expense_type as enum ('NEED', 'WANT', 'SAVING');

create table expenses (
  id uuid primary key default gen_random_uuid(),
  amount numeric(12, 2) not null check (amount > 0),
  description text not null,
  payment_mode payment_mode not null,
  category text not null,
  expense_type expense_type not null,
  transaction_date date not null default current_date,
  merchant text,
  notes text,
  tags text[] default '{}',
  is_recurring boolean not null default false,
  receipt_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index expenses_transaction_date_idx on expenses (transaction_date desc);
create index expenses_category_idx on expenses (category);
create index expenses_expense_type_idx on expenses (expense_type);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger expenses_updated_at
  before update on expenses
  for each row execute function set_updated_at();

-- Single-user: allow anon access (keep anon key private)
alter table expenses enable row level security;

create policy "Allow public read" on expenses
  for select using (true);

create policy "Allow public insert" on expenses
  for insert with check (true);

create policy "Allow public update" on expenses
  for update using (true);

create policy "Allow public delete" on expenses
  for delete using (true);

-- Optional: monthly budgets (phase 2)
create table monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  month text not null,
  category text not null,
  limit_amount numeric(12, 2) not null check (limit_amount > 0),
  created_at timestamptz not null default now(),
  unique (month, category)
);

alter table monthly_budgets enable row level security;

create policy "Allow public read budgets" on monthly_budgets
  for select using (true);

create policy "Allow public write budgets" on monthly_budgets
  for all using (true);

-- Storage bucket for receipts (create in dashboard, then run policies below)
-- insert into storage.buckets (id, name, public) values ('receipts', 'receipts', true);

-- create policy "Public receipt uploads" on storage.objects
--   for all using (bucket_id = 'receipts');

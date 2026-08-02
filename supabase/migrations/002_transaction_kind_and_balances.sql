-- Transaction kinds (income, transfer) and monthly opening balances

create type transaction_kind as enum ('expense', 'income', 'transfer');

alter table expenses
  add column if not exists transaction_kind transaction_kind not null default 'expense';

create table if not exists monthly_opening_balances (
  month text primary key,
  opening_balance numeric(12, 2) not null default 0 check (opening_balance >= 0),
  updated_at timestamptz not null default now()
);

create or replace function set_opening_balance_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists monthly_opening_balances_updated_at on monthly_opening_balances;

create trigger monthly_opening_balances_updated_at
  before update on monthly_opening_balances
  for each row execute function set_opening_balance_updated_at();

alter table monthly_opening_balances enable row level security;

create policy "Allow public read opening balances" on monthly_opening_balances
  for select using (true);

create policy "Allow public write opening balances" on monthly_opening_balances
  for all using (true);

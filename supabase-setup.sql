-- Supabase 대시보드 > SQL Editor 에 붙여넣고 Run 하세요.

create table if not exists public.inquiries (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 1 and 50),
  phone       text not null check (char_length(phone) between 1 and 20),
  room        text not null check (room in ('솔잎방', '바람채', '숲속별채')),
  guests      int  not null check (guests between 1 and 8),
  check_in    date not null,
  check_out   date not null check (check_out > check_in),
  message     text check (char_length(message) <= 500)
);

-- RLS: 방문자는 문의 "추가"만 가능, 조회/수정/삭제 불가
alter table public.inquiries enable row level security;

drop policy if exists "anyone can submit inquiry" on public.inquiries;
create policy "anyone can submit inquiry"
  on public.inquiries
  for insert
  to anon, authenticated
  with check (true);

-- 접수된 문의는 Supabase 대시보드 > Table Editor > inquiries 에서 확인하세요.

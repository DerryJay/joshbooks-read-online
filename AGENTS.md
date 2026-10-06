<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Book catalogue lives in the `books`/`categories` tables (public read); fetch via `src/lib/catalogue.ts` query options and `useCatalogue()` — no static book data in the frontend, so the catalogue can be edited without deploys.
- Book ids are stable text slugs so saved favourites/bookmarks/progress keep working across reseeds.
- Covers, book files and avatars live in private Storage buckets resolved to signed URLs (public buckets are blocked on this workspace).
- Personal data writes take the owner from the session (`src/lib/user-data.ts`), never from caller input; RLS enforces ownership.
- Demo catalogue seed is kept in `supabase/seed.sql` (idempotent ON CONFLICT DO NOTHING).
- Admin authorization lives in `user_roles` + `has_role()`; RLS, storage policies and admin-only SECURITY DEFINER stat functions enforce it. The `/admin` route check is UX only.
- Admin account enable/disable goes through `src/lib/admin.functions.ts` (server-verified role, service role used only there).
- Catalogue changes are audited by database triggers into `audit_log`, not by client code.

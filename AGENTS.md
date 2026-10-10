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
- Mode data lives in `src/data/modes.ts` (provider layer); UI components never hardcode dataset values — so real providers can replace sample series without UI rewrites.
- Leaflet is imported dynamically inside MapView and rendered only after hydration — Leaflet touches `window` and breaks SSR.
- Video URL is configured in `src/config/site.ts` — single place for the team to paste their link.

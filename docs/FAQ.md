FAQ — Common questions answered simply

Q: Dev server not showing changes?
A: Check the terminal for errors. If there are no errors, try reloading the page. If still not working, delete `.urja_cache/` and restart.

Q: Build fails saying entry not found
A: Ensure `urja.config.json` has the correct `entry` path or put your app entry in `src/main.tsx`.

Q: How do I disable caching?
A: Delete the `.urja_cache` folder before building. We'll add a CLI flag to disable cache soon.

# Memory Domain: Database

## Schema & Formats
- **Projects Schema (`content/projects/generated/`)**: Flat JSON records containing title, domain, description, metrics, gallery, role, teamSize, and narrative segments (problem, mySolution, challenges, lessonsLearned).
- **Logbook Schema**: Contains markdown files loaded from `content/logbook/` containing dates, categories, and tags.
- **Music Track Library**: Centralized arrays of track mappings, artist listings, and stream paths inside `lib/spotifyTracks.ts`.

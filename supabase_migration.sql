-- Migration to update the photography spread title from 'Sunsets' to 'Celestial'
-- and sync the editorial diary entry to reflect moon and celestial captures.

UPDATE photo_spreads 
SET 
  title = 'Celestial', 
  diary_entry = 'Celestial observations. Worshipping the sky as it bleeds gradients of deep blue into warm orange, before transitioning into the absolute quiet of the cosmic night.',
  updated_at = NOW()
WHERE slug = 'sunsets';

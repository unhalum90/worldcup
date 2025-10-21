-- 05_votes_triggers.sql
-- Idempotent migration: create functions and triggers to update thread/post scores

-- Function to adjust scores on insert/update/delete of votes
CREATE OR REPLACE FUNCTION public.handle_vote_change()
RETURNS trigger AS $$
DECLARE
  tgt_type text := NEW.target_type;
  tgt_id uuid := COALESCE(NEW.target_id, OLD.target_id);
  new_val smallint := COALESCE(NEW.value, 0);
  old_val smallint := COALESCE(OLD.value, 0);
  delta integer := 0;
BEGIN
  IF TG_OP = 'INSERT' THEN
    delta := new_val;
  ELSIF TG_OP = 'DELETE' THEN
    delta := - old_val;
  ELSIF TG_OP = 'UPDATE' THEN
    delta := (new_val - old_val);
  END IF;

  IF tgt_type = 'thread' THEN
    UPDATE threads SET score = COALESCE(score,0) + delta WHERE id = tgt_id;
  ELSIF tgt_type = 'post' THEN
    UPDATE posts SET score = COALESCE(score,0) + delta WHERE id = tgt_id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on votes table (guard with IF NOT EXISTS pattern)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_vote_change') THEN
    -- function already created above with CREATE OR REPLACE; nothing else to do
    NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'votes_after_change_trigger'
  ) THEN
    CREATE TRIGGER votes_after_change_trigger
      AFTER INSERT OR UPDATE OR DELETE ON votes
      FOR EACH ROW EXECUTE FUNCTION public.handle_vote_change();
  END IF;
END$$;

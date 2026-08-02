ALTER TABLE schedule_events ADD COLUMN recurrence_group_id UUID;
ALTER TABLE schedule_events ADD COLUMN external_event_id VARCHAR(255);
ALTER TABLE schedule_events ADD COLUMN reminder_sent_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_schedule_recurrence_group ON schedule_events (recurrence_group_id);
CREATE INDEX idx_schedule_reminder ON schedule_events (status, date, reminder_sent_at);

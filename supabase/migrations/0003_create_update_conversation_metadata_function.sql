-- Function to update conversation metadata when messages are added
CREATE OR REPLACE FUNCTION update_conversation_metadata(conversation_id INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE insight_conversations 
  SET 
    last_message_at = NOW(),
    message_count = (
      SELECT COUNT(*) 
      FROM chat_messages 
      WHERE chat_messages.conversation_id = update_conversation_metadata.conversation_id
    )
  WHERE id = conversation_id;
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION update_conversation_metadata(INTEGER) TO authenticated;
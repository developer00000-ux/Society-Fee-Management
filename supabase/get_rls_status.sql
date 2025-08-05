-- Function to get RLS status of a table
CREATE OR REPLACE FUNCTION get_rls_status(table_name text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'table_name', table_name,
    'rls_enabled', relrowsecurity,
    'policies', (
      SELECT json_agg(json_build_object(
        'policy_name', policyname,
        'action', CASE 
          WHEN cmd = 'r' THEN 'SELECT'
          WHEN cmd = 'a' THEN 'INSERT'
          WHEN cmd = 'w' THEN 'UPDATE'
          WHEN cmd = 'd' THEN 'DELETE'
          ELSE 'ALL'
        END,
        'using_expression', pg_get_expr(qual, polrelid),
        'with_check_expression', pg_get_expr(with_check, polrelid)
      ))
      FROM pg_policy 
      WHERE polrelid = (SELECT oid FROM pg_class WHERE relname = table_name)
    )
  ) INTO result
  FROM pg_class 
  WHERE relname = table_name;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql; 
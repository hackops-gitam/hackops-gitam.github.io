import { useParams, useNavigate } from 'react-router-dom';

export function TaskDetails() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();

  // Redirect to Members Portal with taskId as a query param
  navigate(`/members-portal?tab=details&taskId=${taskId}`, { replace: true });
  return null; // Page won't render as it redirects
}
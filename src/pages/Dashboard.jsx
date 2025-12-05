import { useAuth } from '../hooks/useSupabase'
import { Home } from './Home'

export function Dashboard() {
  const { data: user } = useAuth()
  
  // Dashboard is just the Home page for authenticated users
  return <Home />
}

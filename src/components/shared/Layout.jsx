import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import OnboardingTour from '../onboarding/OnboardingTour'

export default function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-navy-900 transition-colors duration-300">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div key={location.pathname} className="page-enter">
          <Outlet />
        </div>
      </main>
      <OnboardingTour />
    </div>
  )
}

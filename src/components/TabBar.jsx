import { useNavigate, useLocation } from 'react-router-dom'

function TabBar({ sessionFinished = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const current = location.pathname

  const tabs = [
    { path: '/setup',       label: 'Setup',   icon: '👤', locked: false },
    { path: '/game',        label: 'Matches', icon: '🏸', locked: false },
    { path: '/leaderboard', label: 'Ranking', icon: '🏆', locked: !sessionFinished },
  ]

  function handleTab(tab) {
    if (tab.locked) return // tidak bisa ke leaderboard kalau belum selesai
    navigate(tab.path)
  }

  return (
    <div className="flex border-b border-green-700">
      {tabs.map(tab => {
        const isActive = current === tab.path
        const isLocked = tab.locked

        return (
          <button
            key={tab.path}
            onClick={() => handleTab(tab)}
            className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 transition-all ${
              isActive
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : isLocked
                ? 'text-green-800 cursor-not-allowed'
                : 'text-green-400'
            }`}
          >
            <span className="text-base">
              {isLocked ? '🔒' : tab.icon}
            </span>
            <span className="text-xs font-bold">{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default TabBar
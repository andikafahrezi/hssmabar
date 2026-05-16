import { DoorOpenIcon, RacquetIcon, RankingIcon } from '@phosphor-icons/react'
import { useLocation, useNavigate } from 'react-router-dom'

function TabBar({ sessionFinished = false }) {
  const navigate = useNavigate()
  const location = useLocation()
  const current = location.pathname

  const tabs = [
    { path: '/setup', label: 'Setup', locked: false, icon: <DoorOpenIcon size={16} weight="fill" /> },
    { path: '/game', label: 'Matches', locked: false, icon: <RacquetIcon size={16} weight="regular" /> },
    {
      path: '/leaderboard',
      label: 'Ranking',
      locked: !sessionFinished,
      icon: <RankingIcon size={16} weight="regular" />,
    },
  ]

  function handleTab(tab) {
    if (tab.locked) return
    navigate(tab.path)
  }

  return (
    <div className="rounded-[24px] border-[2px] border-[#1f4b26] bg-[#3f9f37] p-[5px] shadow-[2px_2px_0_#1f4b26]">
      <div className="grid grid-cols-3 gap-1">
        {tabs.map((tab) => {
          const isActive = current === tab.path

          return (
            <button
              key={tab.path}
              type="button"
              onClick={() => handleTab(tab)}
              className={`flex min-h-[34px] items-center justify-center gap-2 rounded-[18px] px-2 text-[0.82rem] font-semibold transition ${
                isActive
                  ? 'bg-[#1f4b26] text-white'
                  : tab.locked
                    ? 'text-[#d0e9cb]/70'
                    : 'text-white'
              }`}
            >
              <span className="flex items-center justify-center">
                {tab.locked
                  ? <RankingIcon size={16} weight="regular" />
                  : tab.icon}
              </span>
              <span className="font-display text-[1rem] leading-none">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default TabBar

import { PlusCircle, SignIn } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logo from '../assets/logohssmabar-vertical.svg'
import useSessionStore from '../store/sessionStore'

function Home() {
  const navigate = useNavigate()
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const { resetAll } = useSessionStore()

  return (
    <div className="app-screen flex min-h-screen flex-col justify-between px-6 py-10">
      <div className="pt-8">
        <div className="mx-auto mb-10 flex max-w-[240px] flex-col items-center text-center">
          <img src={logo} alt="HSS Mabar" className="mb-5 h-auto w-[190px]" />
          <p className="mt-3 text-[0.88rem] leading-6 text-[#6d7c6d]">
            Ora Usah Ca Ci Cu Langsung Aja di Gaskan !!!.
          </p>
        </div>

        <div className="flex flex-col gap-3 ">
          <button
            type="button"
            onClick={() => {
              resetAll()
              navigate('/setup')
            }}
            className="app-primary-button flex items-center justify-center gap-2 "
          >
            <PlusCircle size={20} weight="fill" />
            <span>Buat Sesi Baru</span>
          </button>

          {!showJoin ? (
            <button
              type="button"
              onClick={() => setShowJoin(true)}
              className="flex min-h-16 items-center justify-center gap-2 rounded-[18px] border-2 border-[#1f4b26] bg-white px-4 font-display text-[1.1rem] uppercase leading-none text-[#1f4b26] shadow-[2px_2px_0_rgba(31,75,38,0.92)] transition active:translate-y-px"
            >
              <SignIn size={18} weight="bold" />
              Gabung Sesi
            </button>
          ) : (
            <div className="app-soft-card p-3">
              <label htmlFor="join-code" className="app-field-label !mb-2">Kode Sesi</label>
              <input
                id="join-code"
                type="text"
                value={joinCode}
                onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                placeholder="Masukkan kode sesi"
                maxLength={6}
                className="app-input mb-3 text-center text-[1.1rem] font-semibold tracking-[0.35em]"
              />
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Gabung dengan kode: ${joinCode}`)}
                  className="rounded-[14px] border-[1.5px] border-[#7da800] bg-[#c6ff10] px-3 py-3 font-semibold text-[#1f2d13]"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setShowJoin(false)}
                  className="rounded-[14px] border-[1.5px] border-[#9ad092] bg-white px-3 py-3 font-semibold text-[#1f4b26]"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="pb-3 text-center text-[0.76rem] leading-6 text-[#7d8a7d]">
        <div>Tanpa login der, langsung aje buat format main.</div>
        <div className="mt-2">app by andfrz · v1.0.0</div>
      </div>
    </div>
  )
}

export default Home

import {
  DownloadSimple,
  ShareNetwork,
  Image as ImageIcon,
  Check,
  X,
  Palette,
  Sliders,
  Info,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import logoPrimary from '../assets/logohssmabar.svg'
import firstPlaceMedal from '../assets/icons/1st-place-medal.svg'
import secondPlaceMedal from '../assets/icons/2nd-place-medal.svg'
import thirdPlaceMedal from '../assets/icons/3rd-place-medal.svg'
import Header from '../components/Header'
import useSessionStore from '../store/sessionStore'
import { calculateStandings } from '../utils/calculateStandings'

function getFormatLabel(format) {
  switch (format) {
    case 'americano': return 'Americano'
    case 'singles': return 'Singles'
    case 'mixed': return 'Mixed Doubles'
    case 'fixed': return 'Fixed Doubles'
    default: return 'Format Mabar'
  }
}

// Helper memuat gambar asinkronus ke kanvas
const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = src
    img.onload = () => resolve(img)
    img.onerror = (err) => reject(err)
  })
}

// Helper membuat rounded rectangle pada kanvas
function drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke, strokeWidth) {
  ctx.beginPath()
  if (ctx.roundRect) {
    ctx.roundRect(x, y, width, height, radius)
  } else {
    // Fallback path drawing
    if (width < 2 * radius) radius = width / 2
    if (height < 2 * radius) radius = height / 2
    ctx.moveTo(x + radius, y)
    ctx.arcTo(x + width, y, x + width, y + height, radius)
    ctx.arcTo(x + width, y + height, x, y + height, radius)
    ctx.arcTo(x, y + height, x, y, radius)
    ctx.arcTo(x, y, x + width, y, radius)
    ctx.closePath()
  }
  if (fill) {
    ctx.fillStyle = fill
    ctx.fill()
  }
  if (stroke) {
    ctx.strokeStyle = stroke
    ctx.lineWidth = strokeWidth || 1
    ctx.stroke()
  }
}

function Result() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const {
    players,
    matches,
    sessionName,
    format,
    targetScore,
  } = useSessionStore()

  const standings = calculateStandings(players, matches)

  // State kustomisasi template
  const [theme, setTheme] = useState('forest') // forest, lime, carbon
  const [startRank, setStartRank] = useState(1)
  const [totalPlayers, setTotalPlayers] = useState(Math.min(8, standings.length))
  const [bgImage, setBgImage] = useState(null)
  const [bgImageObj, setBgImageObj] = useState(null)
  const [bgImageOpacity, setBgImageOpacity] = useState(0.8)
  const [bgTransparent, setBgTransparent] = useState(true)
  const [assetsLoaded, setAssetsLoaded] = useState(false)
  const [loadedAssets, setLoadedAssets] = useState(null)
  const [toastMessage, setToastMessage] = useState('')

  // Toast handler
  useEffect(() => {
    if (!toastMessage) return undefined
    const timeoutId = window.setTimeout(() => {
      setToastMessage('')
    }, 2400)
    return () => window.clearTimeout(timeoutId)
  }, [toastMessage])

  function showToast(message) {
    setToastMessage(message)
  }

  // Preload aset SVG/Gambar turnamen
  useEffect(() => {
    let active = true
    const loadAll = async () => {
      try {
        const [logoImg, medal1, medal2, medal3] = await Promise.all([
          loadImage(logoPrimary),
          loadImage(firstPlaceMedal).catch(() => null),
          loadImage(secondPlaceMedal).catch(() => null),
          loadImage(thirdPlaceMedal).catch(() => null),
        ])
        if (active) {
          setLoadedAssets({
            logo: logoImg,
            medal1,
            medal2,
            medal3,
          })
          setAssetsLoaded(true)
        }
      } catch (err) {
        console.error('Failed to load assets for canvas', err)
        if (active) {
          setAssetsLoaded(true) // Lanjutkan dengan fallback teks jika aset gagal dimuat
        }
      }
    }
    loadAll()
    return () => {
      active = false
    }
  }, [])

  // Fungsi menggambar kanvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Bersihkan canvas
    ctx.clearRect(0, 0, 1080, 1920)

    // 1. Gambar Background (Gradien/Foto Kustom jika tidak transparan)
    if (bgImage && bgImageObj && !bgTransparent) {
      const canvasWidth = 1080
      const canvasHeight = 1920
      const imgWidth = bgImageObj.width
      const imgHeight = bgImageObj.height

      const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight)
      const x = (canvasWidth - imgWidth * scale) / 2
      const y = (canvasHeight - imgHeight * scale) / 2

      ctx.drawImage(bgImageObj, x, y, imgWidth * scale, imgHeight * scale)

      // Overlay Warna berdasarkan Tema agar teks tetap terbaca
      let overlayColor = `rgba(26, 61, 31, ${bgImageOpacity})` // Forest
      if (theme === 'lime') {
        overlayColor = `rgba(31, 75, 38, ${bgImageOpacity})` // Lime memakai hijau gelap agar terbaca kontras
      } else if (theme === 'carbon') {
        overlayColor = `rgba(12, 14, 12, ${bgImageOpacity})` // Carbon
      }
      ctx.fillStyle = overlayColor
      ctx.fillRect(0, 0, 1080, 1920)
    } else if (!bgTransparent) {
      // Gradien Background
      const grad = ctx.createLinearGradient(0, 0, 0, 1920)
      if (theme === 'forest') {
        grad.addColorStop(0, '#1f4b26')
        grad.addColorStop(1, '#112714')
      } else if (theme === 'lime') {
        grad.addColorStop(0, '#c6ff10')
        grad.addColorStop(1, '#3f9f37')
      } else {
        grad.addColorStop(0, '#1a1d1a')
        grad.addColorStop(1, '#0b0d0b')
      }
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, 1080, 1920)
    }

    // 2. Judul Turnamen / Sesi
    const titleY = 330
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    let titleColor = '#c6ff10'
    let subColor = '#ffffff'
    if (theme === 'lime') {
      titleColor = '#1f4b26'
      subColor = '#1f4b26'
    } else if (theme === 'carbon') {
      titleColor = '#c6ff10'
      subColor = '#a0a5a0'
    }

    ctx.fillStyle = titleColor
    ctx.font = 'bold 50px Oswald'
    ctx.fillText((sessionName || 'KLASEMEN MABAR').toUpperCase(), 540, titleY)

    // Subtitle Format & Target Point
    ctx.fillStyle = subColor
    ctx.font = '700 26px "Plus Jakarta Sans"'
    const formatLabel = getFormatLabel(format).toUpperCase()
    ctx.fillText(`${formatLabel}  •  TARGET ${targetScore} POIN`, 540, titleY + 60)
    // 3. Header Tabel Klasemen
    const tableTop = 470
    const statsColX = {
      record: 610,
      diff: 735,
      main: 850,
      points: 955,
    }
    const tableHeaderColor = theme === 'lime'
      ? 'rgba(31, 75, 38, 0.75)'
      : theme === 'carbon'
        ? subColor
        : 'rgba(255, 255, 255, 0.7)'
    ctx.fillStyle = tableHeaderColor
    ctx.font = 'bold 24px "Plus Jakarta Sans"'

    ctx.textAlign = 'left'
    ctx.fillText('#  PEMAIN', 100, tableTop)

    ctx.textAlign = 'center'
    ctx.fillText('W-D-L', statsColX.record, tableTop)
    ctx.fillText('DIFF', statsColX.diff, tableTop)
    ctx.fillText('MAIN', statsColX.main, tableTop)
    ctx.fillText('POIN', statsColX.points, tableTop)

    // 4. Gambar Baris Tabel Peringkat
    const startIdx = startRank - 1
    const endIdx = Math.min(startIdx + totalPlayers, standings.length)
    const rowsToShow = standings.slice(startIdx, endIdx)

    const rowHeight = 110
    const gap = 20
    const startY = 510

    rowsToShow.forEach((player, idx) => {
      const currentY = startY + idx * (rowHeight + gap)
      const actualRank = startIdx + idx + 1

      // Styling Baris berdasarkan Tema
      let cardBg = '#ffffff'
      let cardStroke = '#1f4b26'
      let cardStrokeWidth = 3
      let nameColor = '#1f4b26'
      let statsColor = '#223126'
      let badgeBg = '#edf4e7'
      let badgeTextColor = '#1f4b26'

      if (theme === 'lime') {
        cardBg = '#1f4b26'
        cardStroke = '#ffffff'
        cardStrokeWidth = 2
        nameColor = '#ffffff'
        statsColor = '#edf4e7'
        badgeBg = '#c6ff10'
        badgeTextColor = '#1f2d13'
      } else if (theme === 'carbon') {
        cardBg = '#1c1f1c'
        cardStroke = '#2d332d'
        cardStrokeWidth = 3
        nameColor = '#ffffff'
        statsColor = '#e0e5e0'
        badgeBg = '#282e28'
        badgeTextColor = '#c6ff10'
      }

      // Gambar Kotak Baris Rounded
      drawRoundedRect(ctx, 80, currentY, 920, rowHeight, 18, cardBg, cardStroke, cardStrokeWidth)

      // Gambar Medali / Nomor Peringkat
      const rankCenterX = 135
      const rankCenterY = currentY + rowHeight / 2

      let medalImg = null
      if (actualRank === 1) medalImg = loadedAssets?.medal1
      else if (actualRank === 2) medalImg = loadedAssets?.medal2
      else if (actualRank === 3) medalImg = loadedAssets?.medal3

      if (medalImg) {
        const medalSize = 65
        ctx.drawImage(medalImg, rankCenterX - medalSize / 2, rankCenterY - medalSize / 2, medalSize, medalSize)
      } else {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.font = 'bold 36px Oswald'
        ctx.fillStyle = nameColor
        ctx.fillText(String(actualRank), rankCenterX, rankCenterY)
      }

      // Nama Pemain & Badge Gender (M/F)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.font = 'bold 32px Oswald'
      ctx.fillStyle = nameColor
      const nameX = 195
      ctx.fillText(player.name, nameX, rankCenterY)

      const nameWidth = ctx.measureText(player.name).width
      const badgeX = nameX + nameWidth + 15
      const badgeW = 45
      const badgeH = 34

      drawRoundedRect(ctx, badgeX, rankCenterY - badgeH / 2, badgeW, badgeH, 8, badgeBg, null, 0)
      ctx.textAlign = 'center'
      ctx.font = 'bold 20px "Plus Jakarta Sans"'
      ctx.fillStyle = badgeTextColor
      ctx.fillText(player.gender === 'female' ? 'F' : 'M', badgeX + badgeW / 2, rankCenterY)

      // Data Statistik Pemain
      ctx.textBaseline = 'middle'
      ctx.textAlign = 'center'

      // Rekor (W-D-L)
      ctx.font = 'bold 28px "Plus Jakarta Sans"'
      ctx.fillStyle = statsColor
      ctx.fillText(`${player.wins}-${player.draws}-${player.losses}`, statsColX.record, rankCenterY)

      // Selisih Poin (Diff)
      const pointDiff = player.pointsScored - player.pointsConceded
      const diffText = `${pointDiff >= 0 ? '+' : ''}${pointDiff}`
      let diffColor = statsColor
      if (theme === 'forest' || theme === 'lime') {
        diffColor = pointDiff > 0 ? '#1b7420' : pointDiff < 0 ? '#b02525' : statsColor
      } else if (theme === 'carbon') {
        diffColor = pointDiff > 0 ? '#38b03e' : pointDiff < 0 ? '#e04141' : statsColor
      }
      ctx.fillStyle = diffColor
      ctx.fillText(diffText, statsColX.diff, rankCenterY)

      // Total Main
      ctx.fillStyle = statsColor
      ctx.fillText(String(player.matchesPlayed), statsColX.main, rankCenterY)

      // Poin yang diperoleh
      ctx.font = 'bold 32px Oswald'
      ctx.fillStyle = nameColor
      ctx.fillText(String(player.pointsScored), statsColX.points, rankCenterY)
    })

    // Gunakan versi logo terang saat footer berada di atas background non-transparan.
    const useLightFooterLogo = !bgTransparent

    // 5. Gambar Footer Branding
    const footerY = 1750
    if (loadedAssets?.logo) {
      const footerLogoW = 350
      const footerLogoH = 350 * (loadedAssets.logo.height / loadedAssets.logo.width)
      ctx.save()
      if (useLightFooterLogo) {
        ctx.filter = 'brightness(0) invert(1)'
      }
      ctx.drawImage(loadedAssets.logo, 540 - footerLogoW / 2, footerY, footerLogoW, footerLogoH)
      ctx.restore()
    }

    ctx.textAlign = 'center'
    ctx.font = 'bold 22px "Plus Jakarta Sans"'
    ctx.fillStyle = useLightFooterLogo ? 'rgba(255, 255, 255, 0.58)' : 'rgba(31, 75, 38, 0.68)'
    ctx.fillText('hssmabar v1.0.0', 540, footerY + 120)
  }, [
    theme,
    startRank,
    totalPlayers,
    bgImage,
    bgImageObj,
    bgImageOpacity,
    bgTransparent,
    standings,
    sessionName,
    format,
    targetScore,
    loadedAssets,
  ])

  // Redraw canvas secara real-time bila ada pengaturan yang berubah
  useEffect(() => {
    if (assetsLoaded) {
      document.fonts.ready.then(() => {
        draw()
      })
    }
  }, [assetsLoaded, draw])

  // Aksi unggah foto latar belakang
  const handleBgUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      const img = new Image()
      img.src = dataUrl
      img.onload = () => {
        setBgImageObj(img)
        setBgImage(dataUrl)
      }
    }
    reader.readAsDataURL(file)
  }

  // Aksi menghapus foto latar belakang kustom
  const handleRemoveBg = () => {
    setBgImage(null)
    setBgImageObj(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Aksi Unduh Gambar
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `hssmabar-${sessionName ? sessionName.replace(/\s+/g, '-') : 'session'}-leaderboard.png`
    link.href = dataUrl
    link.click()
    showToast('Klasemen berhasil disimpan!')
  }

  // Aksi Bagikan Sesi via Web Share API
  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          showToast('Gagal menghasilkan gambar.')
          return
        }

        const file = new File([blob], 'shuttlemabar-leaderboard.png', { type: 'image/png' })

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Klasemen ${sessionName || 'Mabar'}`,
            text: 'Ayo cek klasemen mabar bulutangkis kami!',
          })
        } else {
          // Fallback bila web share tidak didukung (e.g. desktop browser)
          handleDownload()
          showToast('Fitur share tidak didukung, mengunduh file Klasemen...')
        }
      }, 'image/png')
    } catch (err) {
      console.error('Error sharing image', err)
      handleDownload()
    }
  }

  // Validasi data sebelum memuat
  if (players.length === 0) {
    return (
      <div className="app-screen flex min-h-screen items-center justify-center px-5">
        <div className="app-soft-card w-full px-5 py-6 text-center">
          <p className="font-display text-[1.3rem] uppercase text-[#1f4b26]">Belum ada sesi aktif</p>
          <p className="mt-2 text-[0.82rem] text-[#6d7c6d]">Buat sesi dulu sebelum membuka hasil klasemen.</p>
          <button
            type="button"
            onClick={() => navigate('/setup')}
            className="mt-5 rounded-[18px] border-[2px] border-[#1f4b26] bg-[#c6ff10] px-5 py-3 font-display text-[1.2rem] uppercase text-[#1f2d13] shadow-[2px_2px_0_rgba(31,75,38,0.98)] transition active:translate-y-px"
          >
            Buat Sesi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-screen flex flex-col">
      <Header sessionFinished={true} backTo="/leaderboard" showTabs={false} />

      {/* Toast Alert */}
      <div className={`pointer-events-none fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-[358px] -translate-x-1/2 transition-all duration-200 ${
        toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'
      }`}>
        <div className="rounded-[18px] border-[2px] border-[#1f4b26] bg-[#c6ff10] px-4 py-3 text-[#1f2d13] shadow-[3px_3px_0_rgba(31,75,38,0.98)]">
          <div className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1f4b26] text-[#c6ff10]">
              <Info size={14} weight="bold" />
            </span>
            <div className="text-[0.82rem] font-bold">{toastMessage}</div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-5 pb-10">
        <div className="flex flex-col gap-6">
          <section className="text-center">
            <h1 className="app-section-title">Bagikan Template</h1>
            <p className="app-section-subtitle">Sesuaikan desain template dan share</p>
          </section>

          {/* Kolom Preview Kanvas */}
          <section className="flex justify-center">
            <div
              className="relative aspect-[9/16] w-full max-w-[280px] overflow-hidden rounded-[24px] border-[2px] border-[#1f4b26] shadow-[0_0_0_rgba(31,75,38,0.98)]"
              style={
                (bgTransparent && !bgImage)
                  ? {
                      backgroundColor: '#ffffff',
                      backgroundImage: `
                        linear-gradient(45deg, #efefef 25%, transparent 25%, transparent 75%, #efefef 75%, #efefef),
                        linear-gradient(45deg, #efefef 25%, #ffffff 25%, #ffffff 75%, #efefef 75%, #efefef)
                      `,
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 10px 10px',
                    }
                  : {
                      backgroundColor: theme === 'forest' ? '#1f4b26' : theme === 'lime' ? '#c6ff10' : '#1a1d1a',
                    }
              }
            >
              <canvas
                ref={canvasRef}
                width={1080}
                height={1920}
                className="block h-full w-full object-contain"
              />
              {!assetsLoaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                  <p className="font-display text-[1rem] uppercase tracking-wider">Memuat Aset...</p>
                </div>
              )}
            </div>
          </section>

          {/* Kolom Kontrol / Kustomisasi */}
          <div className="flex flex-col gap-5">
            {/* 1. Pemilihan Tema */}
            <section className="rounded-[20px] border-[2px] border-[#1f4b26] bg-white p-4 shadow-[2px_2px_0_#1f4b26]">
              <div className="mb-3 flex items-center gap-2 font-display text-[1rem] uppercase text-[#1f4b26]">
                <Palette size={18} weight="bold" />
                <span>Pilih Tema Template</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'forest', name: 'Forest Green', bg: 'bg-[#1f4b26] text-white' },
                  { id: 'lime', name: 'Vibrant Lime', bg: 'bg-[#c6ff10] text-[#1f2d13]' },
                  { id: 'carbon', name: 'Carbon Glow', bg: 'bg-[#1a1d1a] text-white' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex min-h-12 flex-col items-center justify-center rounded-[12px] border-[2px] border-[#1f4b26] px-1 transition active:translate-y-px ${t.bg} ${
                      theme === t.id ? 'shadow-[2px_2px_0_#1f4b26]' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {theme === t.id && <Check size={12} weight="bold" />}
                      <span className="text-[0.72rem] font-bold leading-none">{t.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 2. Pengaturan Tampilan Data */}
            <section className="rounded-[20px] border-[2px] border-[#1f4b26] bg-white p-4 shadow-[2px_2px_0_#1f4b26]">
              <div className="mb-4 flex items-center gap-2 font-display text-[1rem] uppercase text-[#1f4b26]">
                <Sliders size={18} weight="bold" />
                <span>Peringkat & Pemain</span>
              </div>

              {/* Slider Mulai Dari Ranking */}
              <div className="mb-4">
                <div className="flex justify-between text-[0.8rem] font-bold text-[#1f4b26]">
                  <span>START DARI PERINGKAT:</span>
                  <span className="font-display text-[0.9rem]">{startRank}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={Math.max(1, standings.length - 2)}
                  value={startRank}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value, 10)
                    setStartRank(val)
                    // Sesuaikan total pemain agar index tidak overflow
                    if (val - 1 + totalPlayers > standings.length) {
                      setTotalPlayers(standings.length - val + 1)
                    }
                  }}
                  className="mt-2 w-full accent-[#3f9f37]"
                />
              </div>

              {/* Slider Jumlah Pemain */}
              <div>
                <div className="flex justify-between text-[0.8rem] font-bold text-[#1f4b26]">
                  <span>TOTAL PEMAIN DITAMPILKAN:</span>
                  <span className="font-display text-[0.9rem]">{totalPlayers}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max={Math.min(10, standings.length - startRank + 1)}
                  value={totalPlayers}
                  onChange={(e) => setTotalPlayers(Number.parseInt(e.target.value, 10))}
                  className="mt-2 w-full accent-[#3f9f37]"
                />
              </div>
            </section>

            {/* 3. Latar Belakang */}
            <section className="rounded-[20px] border-[2px] border-[#1f4b26] bg-white p-4 shadow-[2px_2px_0_#1f4b26]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-display text-[1rem] uppercase text-[#1f4b26]">
                  <ImageIcon size={18} weight="bold" />
                  <span>Latar Belakang</span>
                </div>

                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={bgTransparent}
                    onChange={(e) => setBgTransparent(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer relative h-6 w-11 rounded-full bg-[#dbdbdb] after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#3f9f37] peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none" />
                  <span className="ml-2 text-[0.74rem] font-bold text-[#1f4b26] uppercase">Transparan</span>
                </label>
              </div>

              {!bgTransparent ? (
                <div className="mt-3 border-t border-[#edf4e7] pt-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBgUpload}
                    className="hidden"
                  />

                  {!bgImage ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex w-full min-h-12 items-center justify-center gap-2 rounded-[14px] border-[2px] border-dashed border-[#1f4b26] bg-[#edf4e7] px-4 font-semibold text-[#1f4b26] transition hover:bg-[#d0e9cb]/30"
                    >
                      <ImageIcon size={16} weight="bold" />
                      <span className="text-[0.84rem]">Unggah Foto</span>
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between rounded-[14px] border-[2px] border-[#1f4b26] bg-[#edf4e7] p-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={bgImage}
                            alt="Kustom Background"
                            className="h-10 w-10 rounded-[8px] border border-[#1f4b26] object-cover"
                          />
                          <span className="text-[0.76rem] font-bold text-[#1f4b26]">Foto Lapangan Aktif</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveBg}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#b02525] transition hover:bg-red-50"
                          title="Hapus background kustom"
                        >
                          <X size={16} weight="bold" />
                        </button>
                      </div>

                      {/* Slider Opacity Overlay */}
                      <div>
                        <div className="flex justify-between text-[0.72rem] font-bold text-[#1f4b26]">
                          <span>KEGELAPAN FILTER FOTO (OVERLAY):</span>
                          <span>{Math.round(bgImageOpacity * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.3"
                          max="0.95"
                          step="0.05"
                          value={bgImageOpacity}
                          onChange={(e) => setBgImageOpacity(Number.parseFloat(e.target.value))}
                          className="mt-1 w-full accent-[#3f9f37]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-[0.72rem] font-medium leading-5 text-[#6d7c6d]">
                  Latar belakang kanvas transparan aktif. Unduh gambar ini dan tempelkan di atas foto pilihan Anda langsung di dalam story kalo mau upload ke story.
                </p>
              )}
            </section>

            {/* 4. Tombol Aksi */}
            <div className="flex flex-col gap-3 pt-2">
              <button
                type="button"
                onClick={handleShare}
                className="app-primary-button flex items-center justify-center gap-2"
              >
                <ShareNetwork size={20} weight="fill" />
                <span>Bagikan</span>
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="flex min-h-14 items-center justify-center gap-2 rounded-[18px] border-[2px] border-[#1f4b26] bg-white px-4 font-display text-[1.1rem] uppercase leading-none text-[#1f4b26] shadow-[2px_2px_0_rgba(31,75,38,0.92)] transition active:translate-y-px"
              >
                <DownloadSimple size={18} weight="bold" />
                <span>Unduh Gambar</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Result

import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Loader from './components/Loader'
import Home from './pages/Home'
import MemberPage from './pages/MemberPage'
import { subscribeMembers } from './lib/firestore'
import './App.css'

const MIN_LOADER_MS = 1400
const FADE_MS = 600

function App() {
  const [members, setMembers] = useState([])
  const [dataReady, setDataReady] = useState(false)
  const [minTimeElapsed, setMinTimeElapsed] = useState(false)
  const [fading, setFading] = useState(false)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeMembers((list) => {
      setMembers(list)
      setDataReady(true)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), MIN_LOADER_MS)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!dataReady || !minTimeElapsed) return
    setFading(true)
    const t = setTimeout(() => setShowLoader(false), FADE_MS)
    return () => clearTimeout(t)
  }, [dataReady, minTimeElapsed])

  return (
    <BrowserRouter>
      {showLoader && <Loader fading={fading} />}
      <Navbar />
      <main className="page">
        <Routes>
          <Route path="/" element={<Home members={members} />} />
          <Route path="/member/:id" element={<MemberPage members={members} />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App

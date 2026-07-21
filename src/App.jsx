import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import ToneAdvisor from "./ToneAdvisor.jsx";
import CAGEDExplorer from "./pages/CAGEDExplorer.jsx";
import DoubleStopsTriads from "./pages/DoubleStopsTriads.jsx";
import ModeExplorer from "./pages/ModeExplorer.jsx";
import PentaExplorer from "./pages/PentaExplorer.jsx";
import MinorExplorer from "./pages/MinorExplorer.jsx";
import NoteFinder from "./pages/NoteFinder.jsx";
import FirstBeat from "./pages/FirstBeat.jsx";

const NAV_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #080808; color: #f0ebe0; font-family: 'DM Mono', monospace; min-height: 100vh; }
#ds-root { max-width: 640px; margin: 0 auto; }
.ds-site-header { background: #080808; border-bottom: 1px solid #1a1a1a; padding: 1rem 1.5rem 0; position: sticky; top: 0; z-index: 100; }
.ds-logo-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem; }
.ds-logo { font-family: 'Bebas Neue', sans-serif; font-size: 2rem; letter-spacing: 0.06em; line-height: 1; text-decoration: none; }
.ds-logo .am { color: #c8821a; }
.ds-logo .bl { color: #378ADD; }
.ds-tagline { font-size: 9px; letter-spacing: 0.18em; color: #4a4540; text-transform: uppercase; }
.ds-nav-tabs { display: flex; gap: 0; overflow-x: auto; scrollbar-width: none; }
.ds-nav-tabs::-webkit-scrollbar { display: none; }
.ds-nav-tab { font-family: 'DM Mono', monospace; font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase; padding: 8px 10px; color: #4a4540; text-decoration: none; border-bottom: 2px solid transparent; white-space: nowrap; transition: all 0.15s; }
.ds-nav-tab:hover { color: #8a8078; }
.ds-nav-tab.active { color: #c8821a; border-bottom-color: #c8821a; }
.ds-nav-tab.theory-active { color: #378ADD; border-bottom-color: #378ADD; }
.ds-nav-tab.minor-active { color: #e05c5c; border-bottom-color: #e05c5c; }
.ds-nav-tab.drums-active { color: #e05c5c; border-bottom-color: #e05c5c; }
`;

function SiteHeader() {
  return (
    <div className="ds-site-header">
      <div className="ds-logo-row">
        <NavLink to="/" className="ds-logo">
          Dope<span className="am">S</span><span className="bl">on</span><span className="am">ic</span>
        </NavLink>
        <div className="ds-tagline">AI Tone Advisor · Bitwerx Labs</div>
      </div>
      <div className="ds-nav-tabs">
        <NavLink to="/" end className={({isActive}) => `ds-nav-tab${isActive?' active':''}`}>Tone</NavLink>
        <NavLink to="/caged"   className={({isActive}) => `ds-nav-tab${isActive?' theory-active':''}`}>CAGED</NavLink>
        <NavLink to="/theory"  className={({isActive}) => `ds-nav-tab${isActive?' theory-active':''}`}>Stops</NavLink>
        <NavLink to="/modes"   className={({isActive}) => `ds-nav-tab${isActive?' theory-active':''}`}>Modes</NavLink>
        <NavLink to="/penta"   className={({isActive}) => `ds-nav-tab${isActive?' theory-active':''}`}>Penta</NavLink>
        <NavLink to="/minor"   className={({isActive}) => `ds-nav-tab${isActive?' minor-active':''}`}>Minor</NavLink>
        <NavLink to="/notes"   className={({isActive}) => `ds-nav-tab${isActive?' theory-active':''}`}>Notes</NavLink>
        <NavLink to="/drums"   className={({isActive}) => `ds-nav-tab${isActive?' drums-active':''}`}>Drums</NavLink>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <style>{NAV_CSS}</style>
      <div id="ds-root">
        <BrowserRouter>
          <SiteHeader />
          <Routes>
            <Route path="/"       element={<ToneAdvisor />} />
            <Route path="/caged"  element={<CAGEDExplorer />} />
            <Route path="/theory" element={<DoubleStopsTriads />} />
            <Route path="/modes"  element={<ModeExplorer />} />
            <Route path="/penta"  element={<PentaExplorer />} />
            <Route path="/minor"  element={<MinorExplorer />} />
            <Route path="/notes"  element={<NoteFinder />} />
            <Route path="/drums"  element={<FirstBeat />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

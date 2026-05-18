export default function Header() {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__logo">RA</span>
        <div>
          <p className="header__title">ResumeAI</p>
          <p className="header__tagline">Smart ATS Resume Analyzer</p>
        </div>
      </div>
      <nav className="header__nav">
        <a href="#upload">Analyze</a>
        <a href="#features">Features</a>
      </nav>
    </header>
  )
}

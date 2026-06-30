import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import { 
  FileCode, 
  Folder, 
  Settings, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Sliders, 
  BookOpen, 
  Code2, 
  Cpu, 
  Terminal, 
  Gamepad2, 
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { cppFiles, ProjectConfigs, CppFile } from './cppSourceTemplates';
import GameCanvas from './components/GameCanvas';

export default function App() {
  // Gameplay configs state with persistence
  const [configs, setConfigs] = useState<ProjectConfigs>(() => {
    try {
      const saved = localStorage.getItem('space_shooter_studio_configs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      playerSpeed: 400,
      fireRate: 0.25,
      initialLives: 3,
      bossMaxHp: 100,
      enemySpeed: 160,
    };
  });

  // Active viewed file path
  const [selectedFilePath, setSelectedFilePath] = useState("main.cpp");
  // Search state for filtering code files
  const [fileSearch, setFileSearch] = useState("");
  // Copy state feedback
  const [copied, setCopied] = useState(false);
  // Zip downloading state
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  // Active view tab for smaller devices (Simulator vs Code Workspace)
  const [activeTab, setActiveTab] = useState<'sim' | 'code'>('sim');

  // Sync configs to local storage
  useEffect(() => {
    localStorage.setItem('space_shooter_studio_configs', JSON.stringify(configs));
  }, [configs]);

  const handleSliderChange = (key: keyof ProjectConfigs, value: number) => {
    setConfigs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleResetConfigs = () => {
    setConfigs({
      playerSpeed: 400,
      fireRate: 0.25,
      initialLives: 3,
      bossMaxHp: 100,
      enemySpeed: 160,
    });
  };

  // Find active file template
  const activeFile = cppFiles.find(f => f.path === selectedFilePath) || cppFiles[4]; // defaults to main.cpp

  // Generate customized file content
  const activeCodeContent = activeFile.getContent(configs);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeCodeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Build and Download ZIP file containing whole project using JSZip
  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      const zip = new JSZip();

      // 1. Add C++ Source files
      cppFiles.forEach(file => {
        // Generate file content custom to active parameters
        const content = file.getContent(configs);
        zip.file(file.path, content);
      });

      // 2. Add empty directories to preserve asset folders
      zip.folder("assets/images");
      zip.folder("assets/sounds");
      zip.folder("assets/music");
      zip.folder("assets/fonts");

      // 3. Add asset placeholder guidelines as documentation so the user knows exactly what dimensions/types are needed
      const assetReadme = `# Space Shooter Assets Specifications

Place your custom asset files inside these directories with the exact filenames.

## Images (assets/images/)
- player.png: Sleek space fighter ship (approx. 48x48 pixels)
- enemy_basic.png: Standard alien fighter ship (approx. 40x40 pixels)
- enemy_fast.png: High-speed alien scout (approx. 32x32 pixels)
- boss.png: Red mega-boss Mothership (approx. 128x96 pixels)
- bullet.png: Laser/projectile sprite (approx. 8x24 pixels)
- powerup.png: Rotating circular power-up badge (approx. 32x32 pixels)
- explosion.png: Horizontal 6-frame explosion sprite sheet (approx. 192x32 pixels, where each frame is 32x32)
- background.png: High-contrast space starfield texture (e.g., 800x900 or 1024x1024, seamless vertical tiling)

## Audio Sounds (assets/sounds/)
- shoot.wav: Short high-frequency laser firing sound
- explosion.wav: Low-pitched rumble crash
- powerup.wav: Bright retro synthetic chime
- hurt.wav: Quick warning buzz or impact grunt
- coin.wav: High-pitched double beep gold pick up

## Music (assets/music/)
- bgm.ogg: Energetic arcade background synthesizer theme (looped)
- boss_bgm.ogg: Fast-tempo, dramatic boss encounter theme (looped)

## Fonts (assets/fonts/)
- font.ttf: Any legible TTF font (Standard pixel art, retro, or clean sans-serif)`;

      zip.file("assets/ASSETS_README.md", assetReadme);

      // Generate the zip binary content
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "SpaceShooter_SFML_Project.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("ZIP Generation Failed:", err);
      alert("Failed to generate ZIP project. Please copy files manually.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Custom regex based syntax highlighter for C++ code
  const highlightCpp = (code: string, filepath: string) => {
    // If it is a Markdown file, return simple text display
    if (filepath.endsWith(".md")) {
      return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/^(#+ .*)$/gm, '<span class="text-amber-400 font-bold font-display">$1</span>')
        .replace(/(\*\*.*?\*\*)/g, '<span class="text-slate-200 font-bold">$1</span>')
        .replace(/(`.*?`)/g, '<span class="text-cyan-400 font-mono bg-slate-900/60 px-1 rounded">$1</span>');
    }

    // Standard HTML escaping
    let escaped = code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Skip highlight if config/JSON
    if (filepath.endsWith(".json")) {
      return escaped
        .replace(/(".*?"\s*:)/g, '<span class="text-cyan-400 font-semibold">$1</span>')
        .replace(/(:\s*".*?")/g, '<span class="text-emerald-400">$1</span>')
        .replace(/(\b\d+\b)/g, '<span class="text-pink-400">$1</span>');
    }

    // Highlight comments
    escaped = escaped.replace(/(\/\/.*)$/gm, '<span class="text-slate-500 italic">$1</span>');
    escaped = escaped.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-slate-500 italic">$1</span>');

    // Highlight preprocessor directives
    escaped = escaped.replace(/(#include\s+&lt;.*?&gt;|#include\s+".*?"|#pragma\s+\w+|#define\s+\w+|#ifndef\s+\w+|#endif)/g, '<span class="text-rose-400 font-medium">$1</span>');

    // Highlight C++ types
    const types = [
      'int', 'float', 'double', 'bool', 'char', 'void', 'size_t', 'const', 'static', 'virtual', 'override',
      'std::string', 'std::vector', 'std::unique_ptr', 'std::shared_ptr', 'std::make_unique', 'std::remove_if',
      'sf::RenderWindow', 'sf::VideoMode', 'sf::Event', 'sf::Clock', 'sf::Time', 'sf::Sprite', 'sf::Texture',
      'sf::SoundBuffer', 'sf::Sound', 'sf::Music', 'sf::Font', 'sf::Text', 'sf::Vector2f', 'sf::Vector2u',
      'sf::FloatRect', 'sf::RectangleShape', 'sf::CircleShape', 'sf::IntRect', 'sf::Color', 'sf::Uint8',
      'Player', 'Enemy', 'Boss', 'Bullet', 'PowerUp', 'Explosion', 'UI', 'Menu', 'LevelManager', 'SaveSystem', 'Game',
      'EnemyType', 'BossState', 'LevelPhase', 'GameState', 'MenuState', 'FireMode', 'SoundManager', 'ResourceManager', 'CollisionManager'
    ];
    types.forEach(type => {
      const escapedType = type.replace(/::/g, '::');
      const regex = new RegExp(`\\b${escapedType}\\b`, 'g');
      escaped = escaped.replace(regex, `<span class="text-cyan-400">${type}</span>`);
    });

    // Highlight C++ core keywords
    const keywords = [
      'class', 'public', 'private', 'protected', 'struct', 'enum', 'namespace', 'union',
      'switch', 'case', 'break', 'return', 'default', 'if', 'else', 'while', 'for', 'do',
      'try', 'catch', 'throw', 'delete', 'new', 'nullptr', 'true', 'false', 'this', 'explicit', 'friend'
    ];
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      escaped = escaped.replace(regex, `<span class="text-purple-400 font-medium">${kw}</span>`);
    });

    // Highlight strings
    escaped = escaped.replace(/(".*?")/g, '<span class="text-emerald-400">$1</span>');

    // Highlight numbers
    escaped = escaped.replace(/\b(\d+(?:\.\d+)?f?)\b/g, '<span class="text-amber-400">$1</span>');

    return escaped;
  };

  // Organize files into virtual directory structure for file explorer
  const headerFiles = cppFiles.filter(f => f.category === 'header');
  const sourceFiles = cppFiles.filter(f => f.category === 'source');
  const configFiles = cppFiles.filter(f => f.category === 'config');
  const docFiles = cppFiles.filter(f => f.category === 'doc');

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 font-sans flex flex-col antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute top-0 left-0 right-0 h-[400px] bg-gradient-to-b from-cyan-950/10 to-transparent pointer-events-none" />
      <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Primary Studio Header */}
      <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-cyan-500/10">
              <Gamepad2 className="text-slate-950 stroke-[2.5]" size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  SPACESHOOTER C++
                </h1>
                <span className="text-[10px] uppercase tracking-widest bg-cyan-500/10 text-cyan-400 font-bold font-mono px-1.5 py-0.5 rounded border border-cyan-400/20">
                  SFML Studio
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Interactive C++17 modular game generator & browser simulator</p>
            </div>
          </div>

          {/* Top Actions: Export ZIP */}
          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2.5 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 disabled:from-slate-800 disabled:to-slate-800 text-slate-950 font-bold text-sm tracking-wide px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-400/10 hover:shadow-cyan-400/20 active:scale-[0.98] cursor-pointer"
            >
              {isDownloadingZip ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>PACKAGING...</span>
                </>
              ) : (
                <>
                  <Download size={16} className="stroke-[2.5]" />
                  <span>EXPORT COMPLETE C++ PROJECT (.ZIP)</span>
                </>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Responsive Layout Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6">
        
        {/* Mobile Segmented Tab Switcher */}
        <div className="lg:hidden flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('sim')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold tracking-wider rounded-lg transition-all ${
              activeTab === 'sim' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gamepad2 size={15} />
            <span>PLAY SIMULATOR</span>
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold tracking-wider rounded-lg transition-all ${
              activeTab === 'code' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 size={15} />
            <span>C++ CODE WORKSPACE</span>
          </button>
        </div>

        {/* Dual Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT SIDEBAR: Playable simulator and sliders (35% desktop) */}
          <section className={`lg:col-span-5 flex flex-col gap-6 ${activeTab === 'sim' ? 'block' : 'hidden lg:flex'}`}>
            
            {/* Live Playable Game Component */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="font-display font-semibold text-sm tracking-wide text-slate-300 flex items-center gap-2">
                  <Gamepad2 size={16} className="text-cyan-400" />
                  HTML5 SIMULATOR PREVIEW
                </span>
                <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1 bg-amber-400/5 px-2 py-0.5 rounded border border-amber-400/20">
                  <Info size={10} /> Real-Time Sync
                </span>
              </div>
              <GameCanvas configs={configs} />
            </div>

            {/* Parameter Adjustment Panel */}
            <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-850 backdrop-blur-md flex flex-col gap-5">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                <div className="flex items-center gap-2.5">
                  <Sliders className="text-cyan-400" size={18} />
                  <span className="font-display font-bold text-sm tracking-wide text-white uppercase">C++ Parameter Settings</span>
                </div>
                <button
                  onClick={handleResetConfigs}
                  className="text-[10px] text-slate-400 hover:text-cyan-400 font-bold font-mono tracking-wider flex items-center gap-1 px-2 py-1 rounded bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/20 transition-all cursor-pointer"
                >
                  <RefreshCw size={10} />
                  <span>RESET DEFAULT</span>
                </button>
              </div>

              {/* Slider lists */}
              <div className="flex flex-col gap-4">
                
                {/* Player speed */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Player Movement Speed</span>
                    <span className="text-cyan-400 font-mono font-bold">{configs.playerSpeed}f</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="900"
                    step="50"
                    value={configs.playerSpeed}
                    onChange={(e) => handleSliderChange('playerSpeed', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>150 (Heavy)</span>
                    <span>900 (Interceptor)</span>
                  </div>
                </div>

                {/* Fire rate */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Laser Shoot Delay (Cooldown)</span>
                    <span className="text-cyan-400 font-mono font-bold">{configs.fireRate.toFixed(2)}s</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.00"
                    step="0.05"
                    value={configs.fireRate}
                    onChange={(e) => handleSliderChange('fireRate', parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.05s (Gatling)</span>
                    <span>1.00s (Slow Rail)</span>
                  </div>
                </div>

                {/* Starting lives */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Starting Respawns (Lives)</span>
                    <span className="text-cyan-400 font-mono font-bold">{configs.initialLives}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={configs.initialLives}
                    onChange={(e) => handleSliderChange('initialLives', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 (Hardcore)</span>
                    <span>10 (Casual)</span>
                  </div>
                </div>

                {/* Boss Max HP */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Boss Maximum Health (HP)</span>
                    <span className="text-cyan-400 font-mono font-bold">{configs.bossMaxHp} hp</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="20"
                    value={configs.bossMaxHp}
                    onChange={(e) => handleSliderChange('bossMaxHp', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>20 (Scout Boss)</span>
                    <span>500 (Dreadnought)</span>
                  </div>
                </div>

                {/* Enemy speed */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-300 font-medium">Enemy Descent Base Speed</span>
                    <span className="text-cyan-400 font-mono font-bold">{configs.enemySpeed}f</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="400"
                    step="20"
                    value={configs.enemySpeed}
                    onChange={(e) => handleSliderChange('enemySpeed', parseInt(e.target.value, 10))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>60 (Drifting)</span>
                    <span>400 (Assault Swarm)</span>
                  </div>
                </div>

              </div>

              <div className="mt-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 leading-relaxed font-sans">
                💡 <strong className="text-slate-200">Real-Time Injection:</strong> Adjusting these slides recalculates variables inside corresponding C++ classes instantly. Download the ZIP file to run the identical physics on desktop!
              </div>

            </div>

          </section>

          {/* RIGHT SIDEBAR: IDE Code Explorer & Code viewer (65% desktop) */}
          <section className={`lg:col-span-7 flex flex-col gap-6 ${activeTab === 'code' ? 'block' : 'hidden lg:flex'}`}>
            
            {/* Split layout inside Workspace panel */}
            <div className="bg-slate-950/40 border border-slate-850 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col h-[750px]">
              
              {/* Workspace Header Toolbar */}
              <div className="bg-slate-950 px-5 py-3.5 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Code2 className="text-cyan-400" size={18} />
                  <span className="font-display font-bold text-sm tracking-wider text-white uppercase">C++ SOURCE EXPLORER</span>
                </div>

                {/* Code control widgets */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 transition-all cursor-pointer"
                    title="Copy full code content"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">COPIED!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>COPY SOURCE</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Lower Explorer panel splitting: Sidebar (Left) + Code Viewer (Right) */}
              <div className="flex-1 flex flex-col sm:flex-row overflow-hidden">
                
                {/* File explorer panel */}
                <div className="w-full sm:w-56 bg-[#090f1e]/80 border-b sm:border-b-0 sm:border-r border-slate-900 overflow-y-auto p-4 flex flex-col gap-5">
                  
                  {/* File searching block */}
                  <div>
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  {/* Grouped file items */}
                  <div className="flex flex-col gap-4">
                    
                    {/* Headers */}
                    {headerFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">HEADERS (include/)</span>
                        <div className="flex flex-col gap-1">
                          {headerFiles.filter(f => f.path.toLowerCase().includes(fileSearch.toLowerCase())).map(file => (
                            <button
                              key={file.path}
                              onClick={() => setSelectedFilePath(file.path)}
                              className={`flex items-center justify-between text-left text-xs font-mono px-2 py-1.5 rounded-md transition-all cursor-pointer ${
                                selectedFilePath === file.path 
                                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-1.5' 
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileCode size={13} className={selectedFilePath === file.path ? 'text-cyan-400' : 'text-slate-500'} />
                                <span className="truncate">{file.path.replace("include/", "")}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sources */}
                    {sourceFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">SOURCES (src/)</span>
                        <div className="flex flex-col gap-1">
                          {/* main.cpp exception */}
                          <button
                            onClick={() => setSelectedFilePath("main.cpp")}
                            className={`flex items-center justify-between text-left text-xs font-mono px-2 py-1.5 rounded-md transition-all cursor-pointer ${
                              selectedFilePath === "main.cpp" 
                                ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-1.5' 
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <FileCode size={13} className={selectedFilePath === "main.cpp" ? 'text-cyan-400' : 'text-slate-500'} />
                              <span className="truncate">main.cpp</span>
                            </div>
                          </button>

                          {sourceFiles.filter(f => f.path.toLowerCase().includes(fileSearch.toLowerCase())).map(file => (
                            <button
                              key={file.path}
                              onClick={() => setSelectedFilePath(file.path)}
                              className={`flex items-center justify-between text-left text-xs font-mono px-2 py-1.5 rounded-md transition-all cursor-pointer ${
                                selectedFilePath === file.path 
                                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-1.5' 
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <FileCode size={13} className={selectedFilePath === file.path ? 'text-cyan-400' : 'text-slate-500'} />
                                <span className="truncate">{file.path.replace("src/", "")}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Config files */}
                    {configFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">BUILD CONFIGS</span>
                        <div className="flex flex-col gap-1">
                          {configFiles.filter(f => f.path.toLowerCase().includes(fileSearch.toLowerCase())).map(file => (
                            <button
                              key={file.path}
                              onClick={() => setSelectedFilePath(file.path)}
                              className={`flex items-center justify-between text-left text-xs font-mono px-2 py-1.5 rounded-md transition-all cursor-pointer ${
                                selectedFilePath === file.path 
                                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-1.5' 
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <Settings size={13} className={selectedFilePath === file.path ? 'text-cyan-400' : 'text-slate-500'} />
                                <span className="truncate">{file.path}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Docs */}
                    {docFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold font-mono">DOCUMENTATION</span>
                        <div className="flex flex-col gap-1">
                          {docFiles.filter(f => f.path.toLowerCase().includes(fileSearch.toLowerCase())).map(file => (
                            <button
                              key={file.path}
                              onClick={() => setSelectedFilePath(file.path)}
                              className={`flex items-center justify-between text-left text-xs font-mono px-2 py-1.5 rounded-md transition-all cursor-pointer ${
                                selectedFilePath === file.path 
                                  ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 pl-1.5' 
                                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <BookOpen size={13} className={selectedFilePath === file.path ? 'text-cyan-400' : 'text-slate-500'} />
                                <span className="truncate">{file.path}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* High fidelity C++ Code Reader view */}
                <div className="flex-1 flex flex-col bg-[#050912] overflow-hidden">
                  
                  {/* File banner specs */}
                  <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-900 flex justify-between items-center text-xs text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-cyan-400" />
                      <span className="text-slate-200 font-semibold">{selectedFilePath}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {activeFile.description}
                    </span>
                  </div>

                  {/* Main scrolling code body */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 font-mono text-xs md:text-[13px] leading-relaxed select-text flex">
                    
                    {/* Line numbers row */}
                    <div className="text-right text-slate-600 select-none pr-4 border-r border-slate-900/80 mr-4 font-mono text-xs flex flex-col">
                      {activeCodeContent.split('\n').map((_, idx) => (
                        <span key={idx} className="block leading-relaxed h-[1.5em]">{idx + 1}</span>
                      ))}
                    </div>

                    {/* Pre-formatted code */}
                    <pre className="flex-1 overflow-x-auto whitespace-pre block h-full">
                      <code
                        className="block font-mono leading-relaxed text-slate-300"
                        style={{ lineHeight: '1.5em' }}
                        dangerouslySetInnerHTML={{ __html: highlightCpp(activeCodeContent, selectedFilePath) }}
                      />
                    </pre>

                  </div>

                </div>

              </div>

            </div>

            {/* Quick C++ compilation checklist card */}
            <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl backdrop-blur-md flex flex-col gap-4">
              <span className="font-display font-semibold text-sm text-slate-300 flex items-center gap-2">
                <Cpu size={16} className="text-cyan-400" />
                HOW TO RUN THIS SFML C++ PROJECT
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-400 leading-relaxed font-sans">
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-400/10 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-cyan-400/20">1</div>
                  <p>
                    <strong className="text-slate-200">Export Project:</strong> Click the "Export Complete C++ Project" button above to generate and download a customized ZIP.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-400/10 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-cyan-400/20">2</div>
                  <p>
                    <strong className="text-slate-200">SFML Setup:</strong> Download SFML matching your compiler toolchain, and drop/link the library files inside CMake or Visual Studio.
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="w-5 h-5 rounded-full bg-cyan-400/10 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-cyan-400/20">3</div>
                  <p>
                    <strong className="text-slate-200">Build & Play:</strong> Run CMake commands or compile in VS Code with the supplied task configs to build `SpaceShooter.exe`.
                  </p>
                </div>
              </div>
            </div>

          </section>

        </div>

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-slate-900 bg-slate-950/30 py-6 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2026 Space Shooter C++ SFML Studio. Generated with pristine modular OOP design patterns.</p>
        </div>
      </footer>

    </div>
  );
}

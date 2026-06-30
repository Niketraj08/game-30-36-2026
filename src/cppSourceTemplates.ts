export interface ProjectConfigs {
  playerSpeed: number;
  fireRate: number;
  initialLives: number;
  bossMaxHp: number;
  enemySpeed: number;
}

export interface CppFile {
  path: string;
  category: 'header' | 'source' | 'config' | 'doc';
  description: string;
  getContent: (configs: ProjectConfigs) => string;
}

export const cppFiles: CppFile[] = [
  {
    path: "CMakeLists.txt",
    category: "config",
    description: "CMake project build configuration file",
    getContent: () => `cmake_minimum_required(VERSION 3.15)
project(SpaceShooter VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find SFML package (Requires SFML 2.6+)
find_package(SFML 2.6 REQUIRED COMPONENTS graphics window system audio)

# Include directories
include_directories(include)

# Gather source files
file(GLOB_RECURSE SOURCES "src/*.cpp" "main.cpp")

# Create executable
add_executable(SpaceShooter \${SOURCES})

# Link SFML libraries
target_link_libraries(SpaceShooter sfml-graphics sfml-window sfml-system sfml-audio)

# Copy assets to build directory on success
add_custom_command(TARGET SpaceShooter POST_BUILD
    COMMAND \${CMAKE_COMMAND} -E copy_directory
    "\${CMAKE_CURRENT_SOURCE_DIR}/assets"
    "\${CMAKE_CURRENT_BINARY_DIR}/assets"
    COMMENT "Copying assets to execution directory..."
)
`
  },
  {
    path: "README.md",
    category: "doc",
    description: "Comprehensive setup, build, and run instructions",
    getContent: (configs) => `# 2D Space Shooter (SFML C++17)

A modular, OOP-based 2D Space Shooter game written in C++17 using the SFML library (2.6+).

## Current Configuration
This codebase is custom-generated with the following settings:
- **Player Speed**: ${configs.playerSpeed}f
- **Fire Rate Delay**: ${configs.fireRate} seconds
- **Starting Lives**: ${configs.initialLives}
- **Boss Maximum HP**: ${configs.bossMaxHp}
- **Enemy Base Speed**: ${configs.enemySpeed}f

---

## 🛠️ Requirements & Setup

### 1. Download & Install SFML
- **Windows**: Download the matching compiler build of SFML 2.6.x from [SFML Downloads](https://www.sfml-dev.org/download.php).
  - *Tip*: If you use GCC/MinGW, make sure the version (e.g. SEH or SJLJ, 32-bit or 64-bit) matches your compiler exactly.
- **macOS**: Install via Homebrew: \`brew install sfml\`
- **Linux (Debian/Ubuntu)**: Install via apt: \`sudo apt-get install libsfml-dev\`

### 2. Assets Folder Structure
Ensure you place appropriate media assets (PNGs, WAV/OGGs, TTF) into the matching folders:
- \`assets/images/player.png\`, \`assets/images/enemy_basic.png\`, \`assets/images/enemy_fast.png\`, \`assets/images/boss.png\`, \`assets/images/bullet.png\`, \`assets/images/powerup.png\`, \`assets/images/explosion.png\`, \`assets/images/background.png\`
- \`assets/sounds/shoot.wav\`, \`assets/sounds/explosion.wav\`, \`assets/sounds/powerup.wav\`, \`assets/sounds/hurt.wav\`, \`assets/sounds/coin.wav\`
- \`assets/music/bgm.ogg\`, \`assets/music/boss_bgm.ogg\`
- \`assets/fonts/font.ttf\` (Choose a clean pixel or sans-serif font)

---

## 🚀 Building & Running the Project

### Option A: Using CMake (Recommended)
1. Open a terminal in the project root.
2. Create and enter a build directory:
   \`\`\`bash
   mkdir build
   cd build
   \`\`\`
3. Generate build files:
   \`\`\`bash
   cmake ..
   \`\`\`
4. Compile the project:
   - On Windows (MinGW): \`mingw32-make\` or \`cmake --build .\`
   - On Linux/macOS: \`make\` or \`cmake --build .\`
5. Run the executable:
   - Windows: \`.\\SpaceShooter.exe\`
   - macOS/Linux: \`./SpaceShooter\`

### Option B: Visual Studio (Windows)
1. Open Visual Studio. Create a new empty C++ Project.
2. Add all files in \`src/\`, \`include/\`, and \`main.cpp\` into the Solution Explorer.
3. Right-click project -> **Properties**:
   - Set Configuration to **All Configurations** and Platform to **x64** (or x86 depending on SFML download).
   - Under **C/C++ -> General -> Additional Include Directories**, add: \`<Path-to-SFML>/include\` and \`\$(ProjectDir)include\`.
   - Under **Linker -> General -> Additional Library Directories**, add: \`<Path-to-SFML>/lib\`.
   - Under **Linker -> Input -> Additional Dependencies**, add:
     - *Debug*: \`sfml-graphics-d.lib; sfml-window-d.lib; sfml-system-d.lib; sfml-audio-d.lib;\`
     - *Release*: \`sfml-graphics.lib; sfml-window.lib; sfml-system.lib; sfml-audio.lib;\`
4. Copy SFML \`.dll\` files from \`SFML/bin\` and the \`assets\` directory to your output folder (\`x64/Debug\` or \`x64/Release\`).
5. Build and Run (**Ctrl + F5**).

---

## 🎮 Gameplay & Controls
- **Movement**: \`WASD\` or \`Arrow Keys\`
- **Shoot**: \`Spacebar\`
- **Pause**: \`Escape\` or \`P\`
- **Main Menu**: Navigate with keyboard / mouse clicks.
`
  },
  {
    path: ".vscode/tasks.json",
    category: "config",
    description: "VS Code C++ build task using g++ and SFML",
    getContent: () => `{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "shell",
      "label": "Build Space Shooter (GCC/MinGW)",
      "command": "g++",
      "args": [
        "-std=c++17",
        "main.cpp",
        "src/*.cpp",
        "-Iinclude",
        "-o", "SpaceShooter.exe",
        "-lsfml-graphics",
        "-lsfml-window",
        "-lsfml-system",
        "-lsfml-audio"
      ],
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "problemMatcher": ["$gcc"],
      "detail": "Compiles Space Shooter with SFML using standard GCC command."
    }
  ]
}`
  },
  {
    path: ".vscode/launch.json",
    category: "config",
    description: "VS Code debugging configurations",
    getContent: () => `{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Space Shooter",
      "type": "cppdbg",
      "request": "launch",
      "program": "\${workspaceFolder}/build/SpaceShooter.exe",
      "args": [],
      "stopAtEntry": false,
      "cwd": "\${workspaceFolder}",
      "environment": [],
      "externalConsole": false,
      "MIMode": "gdb",
      "setupCommands": [
        {
          "description": "Enable pretty-printing for gdb",
          "text": "-enable-pretty-printing",
          "ignoreFailures": true
        }
      ],
      "preLaunchTask": "Build Space Shooter (GCC/MinGW)"
    }
  ]
}`
  },
  {
    path: "main.cpp",
    category: "source",
    description: "Application entry point",
    getContent: () => `#include "Game.hpp"
#include <iostream>

int main() {
    try {
        Game game;
        game.run();
    }
    catch (const std::exception& e) {
        std::cerr << "CRITICAL ERROR: " << e.what() << std::endl;
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
`
  },
  {
    path: "include/ResourceManager.hpp",
    category: "header",
    description: "Resource Manager header - safe asset caching",
    getContent: () => `#pragma once
#include <SFML/Graphics.hpp>
#include <SFML/Audio.hpp>
#include <unordered_map>
#include <string>
#include <memory>

class ResourceManager {
public:
    static ResourceManager& getInstance();

    // Prevent copying
    ResourceManager(const ResourceManager&) = delete;
    ResourceManager& operator=(const ResourceManager&) = delete;

    sf::Texture& getTexture(const std::string& filename);
    sf::SoundBuffer& getSoundBuffer(const std::string& filename);
    sf::Font& getFont(const std::string& filename);

private:
    ResourceManager() = default;
    ~ResourceManager() = default;

    std::unordered_map<std::string, sf::Texture> m_textures;
    std::unordered_map<std::string, sf::SoundBuffer> m_soundBuffers;
    std::unordered_map<std::string, sf::Font> m_fonts;
};
`
  },
  {
    path: "src/ResourceManager.cpp",
    category: "source",
    description: "Resource Manager source - loads and caches assets",
    getContent: () => `#include "ResourceManager.hpp"
#include <stdexcept>
#include <iostream>

ResourceManager& ResourceManager::getInstance() {
    static ResourceManager instance;
    return instance;
}

sf::Texture& ResourceManager::getTexture(const std::string& filename) {
    auto pairFound = m_textures.find(filename);
    if (pairFound != m_textures.end()) {
        return pairFound->second;
    }

    sf::Texture texture;
    if (!texture.loadFromFile("assets/images/" + filename)) {
        std::cerr << "Warning: Failed to load texture from: assets/images/" << filename << ". Using generic placeholder.\\n";
        // Create an 8x8 generic error color block
        sf::Image img;
        img.create(32, 32, sf::Color::Magenta);
        texture.loadFromImage(img);
    }
    m_textures[filename] = texture;
    return m_textures[filename];
}

sf::SoundBuffer& ResourceManager::getSoundBuffer(const std::string& filename) {
    auto pairFound = m_soundBuffers.find(filename);
    if (pairFound != m_soundBuffers.end()) {
        return pairFound->second;
    }

    sf::SoundBuffer buffer;
    if (!buffer.loadFromFile("assets/sounds/" + filename)) {
        std::cerr << "Warning: Failed to load sound from: assets/sounds/" << filename << "\\n";
    }
    m_soundBuffers[filename] = buffer;
    return m_soundBuffers[filename];
}

sf::Font& ResourceManager::getFont(const std::string& filename) {
    auto pairFound = m_fonts.find(filename);
    if (pairFound != m_fonts.end()) {
        return pairFound->second;
    }

    sf::Font font;
    if (!font.loadFromFile("assets/fonts/" + filename)) {
        std::cerr << "Warning: Failed to load font from: assets/fonts/" << filename << ". Using default system font fallbacks.\\n";
        // SFML standard font fallbacks
    }
    m_fonts[filename] = font;
    return m_fonts[filename];
}
`
  },
  {
    path: "include/SoundManager.hpp",
    category: "header",
    description: "Sound Manager header - manages SFML audio playbacks",
    getContent: () => `#pragma once
#include <SFML/Audio.hpp>
#include <vector>
#include <string>

class SoundManager {
public:
    static SoundManager& getInstance();

    void playSound(const std::string& filename);
    void playMusic(const std::string& filename, bool loop = true);
    void stopMusic();
    void setSoundVolume(float volume);
    void setMusicVolume(float volume);
    float getSoundVolume() const;
    float getMusicVolume() const;

private:
    SoundManager();
    ~SoundManager() = default;

    std::vector<sf::Sound> m_sounds;
    sf::Music m_music;
    float m_soundVolume;
    float m_musicVolume;
};
`
  },
  {
    path: "src/SoundManager.cpp",
    category: "source",
    description: "Sound Manager source - play sounds, cross-fades, and streams background music",
    getContent: () => `#include "SoundManager.hpp"
#include "ResourceManager.hpp"
#include <iostream>

SoundManager& SoundManager::getInstance() {
    static SoundManager instance;
    return instance;
}

SoundManager::SoundManager() 
    : m_soundVolume(50.f)
    , m_musicVolume(35.f) 
{}

void SoundManager::playSound(const std::string& filename) {
    // Clean up finished sounds
    m_sounds.erase(
        std::remove_if(m_sounds.begin(), m_sounds.end(), 
            [](const sf::Sound& sound) {
                return sound.getStatus() == sf::Sound::Stopped;
            }), 
        m_sounds.end()
    );

    sf::Sound sound;
    sound.setBuffer(ResourceManager::getInstance().getSoundBuffer(filename));
    sound.setVolume(m_soundVolume);
    sound.play();
    m_sounds.push_back(sound);
}

void SoundManager::playMusic(const std::string& filename, bool loop) {
    m_music.stop();
    if (!m_music.openFromFile("assets/music/" + filename)) {
        std::cerr << "Error loading music: assets/music/" << filename << std::endl;
        return;
    }
    m_music.setLoop(loop);
    m_music.setVolume(m_musicVolume);
    m_music.play();
}

void SoundManager::stopMusic() {
    m_music.stop();
}

void SoundManager::setSoundVolume(float volume) {
    m_soundVolume = volume;
    for (auto& s : m_sounds) {
        s.setVolume(m_soundVolume);
    }
}

void SoundManager::setMusicVolume(float volume) {
    m_musicVolume = volume;
    m_music.setVolume(m_musicVolume);
}

float getSoundVolume() const { return m_soundVolume; }
float getMusicVolume() const { return m_musicVolume; }
`
  },
  {
    path: "include/Bullet.hpp",
    category: "header",
    description: "Bullet class header - represents projectiles",
    getContent: () => `#pragma once
#include <SFML/Graphics.hpp>

class Bullet {
public:
    Bullet(sf::Vector2f position, sf::Vector2f direction, float speed, bool isPlayerOwned);
    ~Bullet() = default;

    void update(float deltaTime);
    void draw(sf::RenderWindow& window);

    sf::FloatRect getBounds() const;
    bool isPlayerOwned() const;
    bool isExpired() const;
    void destroy();

private:
    sf::Sprite m_sprite;
    sf::Vector2f m_direction;
    float m_speed;
    bool m_isPlayerOwned;
    bool m_isExpired;
};
`
  },
  {
    path: "src/Bullet.cpp",
    category: "source",
    description: "Bullet class source - manages flying bullet logic",
    getContent: () => `#include "Bullet.hpp"
#include "ResourceManager.hpp"

Bullet::Bullet(sf::Vector2f position, sf::Vector2f direction, float speed, bool isPlayerOwned)
    : m_direction(direction)
    , m_speed(speed)
    , m_isPlayerOwned(isPlayerOwned)
    , m_isExpired(false) 
{
    m_sprite.setTexture(ResourceManager::getInstance().getTexture("bullet.png"));
    
    // Scale or recolor bullet depending on owner
    m_sprite.setOrigin(m_sprite.getLocalBounds().width / 2.f, m_sprite.getLocalBounds().height / 2.f);
    m_sprite.setPosition(position);
    
    if (isPlayerOwned) {
        m_sprite.setColor(sf::Color::Cyan);
        m_sprite.setScale(1.0f, 1.0f);
    } else {
        m_sprite.setColor(sf::Color::Red);
        m_sprite.setScale(1.2f, 1.2f);
        m_sprite.setRotation(180.f); // Face downwards
    }
}

void Bullet::update(float deltaTime) {
    m_sprite.move(m_direction * m_speed * deltaTime);

    // Flag as expired if out of bounds (approximate threshold 2000px)
    sf::Vector2f pos = m_sprite.getPosition();
    if (pos.y < -50.f || pos.y > 1050.f || pos.x < -50.f || pos.x > 1050.f) {
        m_isExpired = true;
    }
}

void Bullet::draw(sf::RenderWindow& window) {
    window.draw(m_sprite);
}

sf::FloatRect Bullet::getBounds() const {
    return m_sprite.getGlobalBounds();
}

bool Bullet::isPlayerOwned() const {
    return m_isPlayerOwned;
}

bool Bullet::isExpired() const {
    return m_isExpired;
}

void Bullet::destroy() {
    m_isExpired = true;
}
`
  },
  {
    path: "include/Player.hpp",
    category: "header",
    description: "Player class header - player ship attributes & functions",
    getContent: (configs) => `#pragma once
#include <SFML/Graphics.hpp>
#include <vector>
#include <memory>
#include "Bullet.hpp"

enum class FireMode {
    Normal,
    Rapid,
    Double
};

class Player {
public:
    Player();
    ~Player() = default;

    void update(float deltaTime, sf::Vector2u windowSize, std::vector<std::unique_ptr<Bullet>>& bullets);
    void draw(sf::RenderWindow& window);

    void takeDamage();
    void addLives(int count);
    void reset(sf::Vector2f spawnPosition);
    void activateShield(float duration);
    void setFireMode(FireMode mode, float duration);

    // Getters
    sf::Vector2f getPosition() const;
    sf::FloatRect getBounds() const;
    int getHealth() const;
    int getLives() const;
    bool isShieldActive() const;
    bool isDead() const;

private:
    void handleInput(float deltaTime, sf::Vector2u windowSize);
    void shoot(std::vector<std::unique_ptr<Bullet>>& bullets);

    sf::Sprite m_sprite;
    sf::CircleShape m_shieldVisual;
    
    float m_speed;
    int m_maxHealth;
    int m_health;
    int m_lives;

    float m_shootCooldown;
    float m_shootTimer;

    // Powerup trackers
    bool m_hasShield;
    float m_shieldTimer;
    
    FireMode m_fireMode;
    float m_powerupTimer;

    // Invulnerability frames after getting hit
    float m_invulnTimer;
    bool m_isInvulnerable;
};
`
  },
  {
    path: "src/Player.cpp",
    category: "source",
    description: "Player class source - physics, boundaries, powerups, invuln flashes",
    getContent: (configs) => `#include "Player.hpp"
#include "ResourceManager.hpp"
#include "SoundManager.hpp"
#include <cmath>

Player::Player()
    : m_speed(${configs.playerSpeed}.0f)
    , m_maxHealth(3)
    , m_health(3)
    , m_lives(${configs.initialLives})
    , m_shootCooldown(${configs.fireRate}f)
    , m_shootTimer(0.f)
    , m_hasShield(false)
    , m_shieldTimer(0.f)
    , m_fireMode(FireMode::Normal)
    , m_powerupTimer(0.f)
    , m_invulnTimer(0.f)
    , m_isInvulnerable(false)
{
    m_sprite.setTexture(ResourceManager::getInstance().getTexture("player.png"));
    m_sprite.setOrigin(m_sprite.getLocalBounds().width / 2.f, m_sprite.getLocalBounds().height / 2.f);
    m_sprite.setScale(1.2f, 1.2f);

    // Setup shield ring visual
    m_shieldVisual.setRadius(40.f);
    m_shieldVisual.setFillColor(sf::Color(0, 200, 255, 60));
    m_shieldVisual.setOutlineColor(sf::Color(0, 230, 255, 200));
    m_shieldVisual.setOutlineThickness(3.f);
    m_shieldVisual.setOrigin(40.f, 40.f);
}

void Player::reset(sf::Vector2f spawnPosition) {
    m_sprite.setPosition(spawnPosition);
    m_health = m_maxHealth;
    m_hasShield = false;
    m_fireMode = FireMode::Normal;
    m_isInvulnerable = false;
    m_invulnTimer = 0.f;
}

void Player::update(float deltaTime, sf::Vector2u windowSize, std::vector<std::unique_ptr<Bullet>>& bullets) {
    handleInput(deltaTime, windowSize);

    // Bullet shooting cooldown
    if (m_shootTimer > 0.f) {
        m_shootTimer -= deltaTime;
    }

    // Shield active timer
    if (m_hasShield) {
        m_shieldTimer -= deltaTime;
        m_shieldVisual.setPosition(m_sprite.getPosition());
        if (m_shieldTimer <= 0.f) {
            m_hasShield = false;
        }
    }

    // FireMode power-up timer
    if (m_fireMode != FireMode::Normal) {
        m_powerupTimer -= deltaTime;
        if (m_powerupTimer <= 0.f) {
            m_fireMode = FireMode::Normal;
        }
    }

    // Invulnerability visual flash logic
    if (m_isInvulnerable) {
        m_invulnTimer -= deltaTime;
        if (m_invulnTimer <= 0.f) {
            m_isInvulnerable = false;
            m_sprite.setColor(sf::Color::White);
        } else {
            // Flash red/white
            if (static_cast<int>(m_invulnTimer * 10) % 2 == 0) {
                m_sprite.setColor(sf::Color(255, 255, 255, 100));
            } else {
                m_sprite.setColor(sf::Color(255, 100, 100, 220));
            }
        }
    }

    // Check keyboard fire
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::Space)) {
        shoot(bullets);
    }
}

void Player::handleInput(float deltaTime, sf::Vector2u windowSize) {
    sf::Vector2f movement(0.f, 0.f);

    if (sf::Keyboard::isKeyPressed(sf::Keyboard::W) || sf::Keyboard::isKeyPressed(sf::Keyboard::Up)) {
        movement.y -= 1.f;
    }
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::S) || sf::Keyboard::isKeyPressed(sf::Keyboard::Down)) {
        movement.y += 1.f;
    }
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::A) || sf::Keyboard::isKeyPressed(sf::Keyboard::Left)) {
        movement.x -= 1.f;
    }
    if (sf::Keyboard::isKeyPressed(sf::Keyboard::D) || sf::Keyboard::isKeyPressed(sf::Keyboard::Right)) {
        movement.x += 1.f;
    }

    // Normalize diagonal movement speed
    float length = std::sqrt(movement.x * movement.x + movement.y * movement.y);
    if (length > 0.f) {
        movement /= length;
    }

    m_sprite.move(movement * m_speed * deltaTime);

    // Boundary constraints
    sf::Vector2f pos = m_sprite.getPosition();
    float hw = m_sprite.getGlobalBounds().width / 2.f;
    float hh = m_sprite.getGlobalBounds().height / 2.f;

    if (pos.x < hw) pos.x = hw;
    if (pos.x > windowSize.x - hw) pos.x = windowSize.x - hw;
    if (pos.y < hh) pos.y = hh;
    if (pos.y > windowSize.y - hh) pos.y = windowSize.y - hh;

    m_sprite.setPosition(pos);
}

void Player::shoot(std::vector<std::unique_ptr<Bullet>>& bullets) {
    if (m_shootTimer > 0.f) return;

    float currentCooldown = m_shootCooldown;
    if (m_fireMode == FireMode::Rapid) {
        currentCooldown = m_shootCooldown * 0.4f; // 60% faster fire rate
    }

    SoundManager::getInstance().playSound("shoot.wav");

    if (m_fireMode == FireMode::Double) {
        // Shoot two bullets side-by-side
        bullets.push_back(std::make_unique<Bullet>(m_sprite.getPosition() + sf::Vector2f(-15.f, -10.f), sf::Vector2f(0.f, -1.f), 650.f, true));
        bullets.push_back(std::make_unique<Bullet>(m_sprite.getPosition() + sf::Vector2f(15.f, -10.f), sf::Vector2f(0.f, -1.f), 650.f, true));
    } else {
        // Normal & Rapid single central bullet
        bullets.push_back(std::make_unique<Bullet>(m_sprite.getPosition() + sf::Vector2f(0.f, -20.f), sf::Vector2f(0.f, -1.f), 650.f, true));
    }

    m_shootTimer = currentCooldown;
}

void Player::draw(sf::RenderWindow& window) {
    window.draw(m_sprite);
    if (m_hasShield) {
        window.draw(m_shieldVisual);
    }
}

void Player::takeDamage() {
    if (m_isInvulnerable) return;

    if (m_hasShield) {
        m_hasShield = false;
        m_isInvulnerable = true;
        m_invulnTimer = 1.0f; // Brief invulnerability
        SoundManager::getInstance().playSound("hurt.wav");
        return;
    }

    m_health--;
    SoundManager::getInstance().playSound("hurt.wav");

    if (m_health <= 0) {
        m_lives--;
        if (m_lives > 0) {
            // Respawn with state
            reset(sf::Vector2f(400.f, 800.f));
            m_isInvulnerable = true;
            m_invulnTimer = 2.0f; // 2 seconds safety invulnerability
        }
    } else {
        m_isInvulnerable = true;
        m_invulnTimer = 1.5f; // Flashes
    }
}

void Player::addLives(int count) {
    m_lives += count;
}

void Player::activateShield(float duration) {
    m_hasShield = true;
    m_shieldTimer = duration;
    SoundManager::getInstance().playSound("powerup.wav");
}

void Player::setFireMode(FireMode mode, float duration) {
    m_fireMode = mode;
    m_powerupTimer = duration;
    SoundManager::getInstance().playSound("powerup.wav");
}

sf::Vector2f Player::getPosition() const { return m_sprite.getPosition(); }
sf::FloatRect Player::getBounds() const { return m_sprite.getGlobalBounds(); }
int Player::getHealth() const { return m_health; }
int Player::getLives() const { return m_lives; }
bool Player::isShieldActive() const { return m_hasShield; }
bool Player::isDead() const { return m_lives <= 0; }
`
  },
  {
    path: "include/Enemy.hpp",
    category: "header",
    description: "Enemy class header - basic, fast, zig-zag enemy types",
    getContent: (configs) => `#pragma once
#include <SFML/Graphics.hpp>
#include <vector>
#include <memory>
#include "Bullet.hpp"

enum class EnemyType {
    Basic,
    Fast,
    ZigZag
};

class Enemy {
public:
    Enemy(EnemyType type, sf::Vector2f spawnPosition);
    ~Enemy() = default;

    void update(float deltaTime, std::vector<std::unique_ptr<Bullet>>& bullets, sf::Vector2f playerPos);
    void draw(sf::RenderWindow& window);

    sf::FloatRect getBounds() const;
    bool isOutOfBounds(sf::Vector2u windowSize) const;
    bool isExpired() const;
    void destroy();
    int getScoreValue() const;

private:
    sf::Sprite m_sprite;
    EnemyType m_type;
    float m_speed;
    int m_health;
    int m_scoreValue;
    bool m_isExpired;

    // Shooting parameters
    float m_shootTimer;
    float m_shootInterval;

    // Movement helpers (ZigZag)
    float m_accumulatedTime;
    float m_amplitude;
};
`
  },
  {
    path: "src/Enemy.cpp",
    category: "source",
    description: "Enemy class source - handles AI movement paths and shoot cooldowns",
    getContent: (configs) => `#include "Enemy.hpp"
#include "ResourceManager.hpp"
#include <cmath>

Enemy::Enemy(EnemyType type, sf::Vector2f spawnPosition)
    : m_type(type)
    , m_isExpired(false)
    , m_accumulatedTime(0.f)
    , m_amplitude(150.f)
{
    m_sprite.setPosition(spawnPosition);

    switch (m_type) {
    case EnemyType::Basic:
        m_sprite.setTexture(ResourceManager::getInstance().getTexture("enemy_basic.png"));
        m_speed = ${configs.enemySpeed}.0f;
        m_health = 1;
        m_scoreValue = 100;
        m_shootInterval = 2.5f;
        m_sprite.setColor(sf::Color::Yellow);
        break;

    case EnemyType::Fast:
        m_sprite.setTexture(ResourceManager::getInstance().getTexture("enemy_fast.png"));
        m_speed = ${configs.enemySpeed}.0f * 1.6f;
        m_health = 1;
        m_scoreValue = 150;
        m_shootInterval = 4.0f; // Fires rarely
        m_sprite.setColor(sf::Color(255, 120, 0)); // Orange
        break;

    case EnemyType::ZigZag:
        m_sprite.setTexture(ResourceManager::getInstance().getTexture("enemy_basic.png"));
        m_speed = ${configs.enemySpeed}.0f * 0.9f;
        m_health = 2;
        m_scoreValue = 250;
        m_shootInterval = 1.8f;
        m_sprite.setColor(sf::Color(200, 0, 255)); // Purple
        break;
    }

    m_sprite.setOrigin(m_sprite.getLocalBounds().width / 2.f, m_sprite.getLocalBounds().height / 2.f);
    m_sprite.setScale(1.1f, 1.1f);
    
    // Stagger initial firing times
    m_shootTimer = static_cast<float>(rand() % 100) / 100.f * m_shootInterval;
}

void Enemy::update(float deltaTime, std::vector<std::unique_ptr<Bullet>>& bullets, sf::Vector2f playerPos) {
    m_accumulatedTime += deltaTime;

    sf::Vector2f displacement(0.f, m_speed * deltaTime);

    // Apply specific intelligence behaviors
    if (m_type == EnemyType::ZigZag) {
        displacement.x = std::sin(m_accumulatedTime * 3.f) * m_amplitude * deltaTime;
    } else if (m_type == EnemyType::Fast) {
        // Slight homing towards player's X coordinate
        if (m_sprite.getPosition().x < playerPos.x - 10.f) {
            displacement.x = (m_speed * 0.3f) * deltaTime;
        } else if (m_sprite.getPosition().x > playerPos.x + 10.f) {
            displacement.x = -(m_speed * 0.3f) * deltaTime;
        }
    }

    m_sprite.move(displacement);

    // Firing logic
    m_shootTimer += deltaTime;
    if (m_shootTimer >= m_shootInterval) {
        m_shootTimer = 0.f;
        // Shoot downwards projectile towards player
        bullets.push_back(std::make_unique<Bullet>(
            m_sprite.getPosition() + sf::Vector2f(0.f, 20.f), 
            sf::Vector2f(0.f, 1.f), 
            350.f, 
            false
        ));
    }
}

void Enemy::draw(sf::RenderWindow& window) {
    window.draw(m_sprite);
}

sf::FloatRect Enemy::getBounds() const {
    return m_sprite.getGlobalBounds();
}

bool Enemy::isOutOfBounds(sf::Vector2u windowSize) const {
    return m_sprite.getPosition().y > windowSize.y + 50.f;
}

bool Enemy::isExpired() const {
    return m_isExpired;
}

void Enemy::destroy() {
    m_isExpired = true;
}

int Enemy::getScoreValue() const {
    return m_scoreValue;
}
`
  },
  {
    path: "include/Boss.hpp",
    category: "header",
    description: "Boss battle header - advanced multi-attack pattern engine",
    getContent: (configs) => `#pragma once
#include <SFML/Graphics.hpp>
#include <vector>
#include <memory>
#include "Bullet.hpp"

enum class BossState {
    Entering,
    Active,
    Destroyed
};

class Boss {
public:
    Boss();
    ~Boss() = default;

    void spawn(sf::Vector2f position);
    void update(float deltaTime, std::vector<std::unique_ptr<Bullet>>& bullets, sf::Vector2f playerPos);
    void draw(sf::RenderWindow& window);

    bool takeDamage(int amount); // Returns true if boss was destroyed

    // Getters
    sf::Vector2f getPosition() const;
    sf::FloatRect getBounds() const;
    BossState getState() const;
    int getHealth() const;
    int getMaxHealth() const;

private:
    void executeAttackPatterns(float deltaTime, std::vector<std::unique_ptr<Bullet>>& bullets, sf::Vector2f playerPos);

    sf::Sprite m_sprite;
    BossState m_state;
    
    int m_maxHealth;
    int m_health;
    float m_speed;
    bool m_movingRight;

    // Attack variables
    float m_stateTimer;
    int m_attackPattern; // 0: Wave, 1: Radial, 2: Targeted Spray
    float m_shootTimer;
    float m_shootInterval;
};
`
  },
  {
    path: "src/Boss.cpp",
    category: "source",
    description: "Boss battle source - multi-phase boss behaviors & radial bullet spreads",
    getContent: (configs) => `#include "Boss.hpp"
#include "ResourceManager.hpp"
#include "SoundManager.hpp"
#include <cmath>

Boss::Boss()
    : m_state(BossState::Destroyed)
    , m_maxHealth(${configs.bossMaxHp})
    , m_health(${configs.bossMaxHp})
    , m_speed(150.f)
    , m_movingRight(true)
    , m_stateTimer(0.f)
    , m_attackPattern(0)
    , m_shootTimer(0.f)
    , m_shootInterval(1.2f)
{
    m_sprite.setTexture(ResourceManager::getInstance().getTexture("boss.png"));
    m_sprite.setOrigin(m_sprite.getLocalBounds().width / 2.f, m_sprite.getLocalBounds().height / 2.f);
    m_sprite.setScale(2.2f, 2.2f);
    m_sprite.setColor(sf::Color::Red);
}

void Boss::spawn(sf::Vector2f position) {
    m_sprite.setPosition(position.x, -200.f); // Start off-screen
    m_health = m_maxHealth;
    m_state = BossState::Entering;
    m_stateTimer = 0.f;
    m_attackPattern = 0;
}

void Boss::update(float deltaTime, std::vector<std::unique_ptr<Bullet>>& bullets, sf::Vector2f playerPos) {
    if (m_state == BossState::Destroyed) return;

    if (m_state == BossState::Entering) {
        // Smoothly descend to top playing area (Y=180)
        m_sprite.move(0.f, 120.f * deltaTime);
        if (m_sprite.getPosition().y >= 180.f) {
            m_state = BossState::Active;
            SoundManager::getInstance().playMusic("boss_bgm.ogg", true);
        }
        return;
    }

    // Active boss horizontal hover AI
    sf::Vector2f pos = m_sprite.getPosition();
    if (m_movingRight) {
        pos.x += m_speed * deltaTime;
        if (pos.x > 700.f) {
            m_movingRight = false;
        }
    } else {
        pos.x -= m_speed * deltaTime;
        if (pos.x < 100.f) {
            m_movingRight = true;
        }
    }
    // Hover bobbing effect
    pos.y = 180.f + std::sin(m_stateTimer * 2.f) * 15.f;
    m_sprite.setPosition(pos);

    m_stateTimer += deltaTime;

    // Swap attack patterns every 8 seconds
    if (static_cast<int>(m_stateTimer) % 8 == 0 && m_shootTimer == 0.f) {
        m_attackPattern = (m_attackPattern + 1) % 3;
    }

    executeAttackPatterns(deltaTime, bullets, playerPos);
}

void Boss::executeAttackPatterns(float deltaTime, std::vector<std::unique_ptr<Bullet>>& bullets, sf::Vector2f playerPos) {
    m_shootTimer += deltaTime;

    float activeInterval = m_shootInterval;
    if (m_attackPattern == 1) activeInterval = 2.0f; // Radial has longer cooldown
    else if (m_attackPattern == 2) activeInterval = 0.4f; // Spray is rapid

    if (m_shootTimer >= activeInterval) {
        m_shootTimer = 0.f;

        if (m_attackPattern == 0) {
            // Wave: Multi-bullet straight downward spread
            bullets.push_back(std::make_unique<Bullet>(m_sprite.getPosition() + sf::Vector2f(-60.f, 40.f), sf::Vector2f(0.f, 1.f), 300.f, false));
            bullets.push_back(std::make_unique<Bullet>(m_sprite.getPosition() + sf::Vector2f(0.f, 45.f), sf::Vector2f(0.f, 1.f), 300.f, false));
            bullets.push_back(std::make_unique<Bullet>(m_sprite.getPosition() + sf::Vector2f(60.f, 40.f), sf::Vector2f(0.f, 1.f), 300.f, false));
        } 
        else if (m_attackPattern == 1) {
            // Radial Spread: Shoot 8 bullets in a circle
            for (int i = 0; i < 8; ++i) {
                float angle = i * (3.14159f / 4.f);
                sf::Vector2f dir(std::cos(angle), std::sin(angle));
                bullets.push_back(std::make_unique<Bullet>(m_sprite.getPosition(), dir, 250.f, false));
            }
        } 
        else if (m_attackPattern == 2) {
            // Spray: Direct targeted aiming shot towards player
            sf::Vector2f bossPos = m_sprite.getPosition();
            sf::Vector2f toPlayer = playerPos - bossPos;
            float len = std::sqrt(toPlayer.x * toPlayer.x + toPlayer.y * toPlayer.y);
            if (len > 0.f) {
                toPlayer /= len;
                bullets.push_back(std::make_unique<Bullet>(bossPos + sf::Vector2f(0.f, 40.f), toPlayer, 400.f, false));
            }
        }
    }
}

void Boss::draw(sf::RenderWindow& window) {
    if (m_state != BossState::Destroyed) {
        window.draw(m_sprite);
    }
}

bool Boss::takeDamage(int amount) {
    if (m_state != BossState::Active) return false;

    m_health -= amount;
    if (m_health <= 0) {
        m_health = 0;
        m_state = BossState::Destroyed;
        return true; // Destroyed!
    }
    return false;
}

sf::Vector2f Boss::getPosition() const { return m_sprite.getPosition(); }
sf::FloatRect Boss::getBounds() const { return m_sprite.getGlobalBounds(); }
BossState Boss::getState() const { return m_state; }
int Boss::getHealth() const { return m_health; }
int Boss::getMaxHealth() const { return m_maxHealth; }
`
  },
  {
    path: "include/PowerUp.hpp",
    category: "header",
    description: "Powerup class header - shield, double-fire, rapid-fire, and coin/health collectibles",
    getContent: () => `#pragma once
#include <SFML/Graphics.hpp>

enum class PowerUpType {
    Shield,
    RapidFire,
    DoubleBullet,
    HealthPack,
    Coin
};

class PowerUp {
public:
    PowerUp(PowerUpType type, sf::Vector2f position);
    ~PowerUp() = default;

    void update(float deltaTime);
    void draw(sf::RenderWindow& window);

    sf::FloatRect getBounds() const;
    bool isExpired() const;
    void collect();
    PowerUpType getType() const;

private:
    sf::Sprite m_sprite;
    PowerUpType m_type;
    float m_speed;
    bool m_isExpired;
};
`
  },
  {
    path: "src/PowerUp.cpp",
    category: "source",
    description: "Powerup class source - item physics, floating animations, and color coding",
    getContent: () => `#include "PowerUp.hpp"
#include "ResourceManager.hpp"

PowerUp::PowerUp(PowerUpType type, sf::Vector2f position)
    : m_type(type)
    , m_speed(120.f)
    , m_isExpired(false)
{
    m_sprite.setTexture(ResourceManager::getInstance().getTexture("powerup.png"));
    m_sprite.setOrigin(m_sprite.getLocalBounds().width / 2.f, m_sprite.getLocalBounds().height / 2.f);
    m_sprite.setPosition(position);
    m_sprite.setScale(1.2f, 1.2f);

    // Differentiate types with gorgeous colors
    switch (m_type) {
    case PowerUpType::Shield:
        m_sprite.setColor(sf::Color::Cyan);
        break;
    case PowerUpType::RapidFire:
        m_sprite.setColor(sf::Color::Red);
        break;
    case PowerUpType::DoubleBullet:
        m_sprite.setColor(sf::Color::Yellow);
        break;
    case PowerUpType::HealthPack:
        m_sprite.setColor(sf::Color::Green);
        break;
    case PowerUpType::Coin:
        m_sprite.setColor(sf::Color(255, 215, 0)); // Gold
        m_sprite.setScale(0.9f, 0.9f);
        break;
    }
}

void PowerUp::update(float deltaTime) {
    m_sprite.move(0.f, m_speed * deltaTime);

    // Rotate slowly for aesthetic appeal
    m_sprite.rotate(60.f * deltaTime);

    // Expire if it goes off bottom of screen
    if (m_sprite.getPosition().y > 1050.f) {
        m_isExpired = true;
    }
}

void PowerUp::draw(sf::RenderWindow& window) {
    window.draw(m_sprite);
}

sf::FloatRect PowerUp::getBounds() const {
    return m_sprite.getGlobalBounds();
}

bool PowerUp::isExpired() const {
    return m_isExpired;
}

void PowerUp::collect() {
    m_isExpired = true;
}

PowerUpType PowerUp::getType() const {
    return m_type;
}
`
  },
  {
    path: "include/Explosion.hpp",
    category: "header",
    description: "Explosion class header - visual particle and sprite effects",
    getContent: () => `#pragma once
#include <SFML/Graphics.hpp>

class Explosion {
public:
    Explosion(sf::Vector2f position);
    ~Explosion() = default;

    void update(float deltaTime);
    void draw(sf::RenderWindow& window);

    bool isFinished() const;

private:
    sf::Sprite m_sprite;
    float m_lifeTime;
    float m_maxLifeTime;
    int m_frameCount;
    int m_currentFrame;
    float m_frameTimer;
};
`
  },
  {
    path: "src/Explosion.cpp",
    category: "source",
    description: "Explosion class source - handles animation frame pacing and alpha fading",
    getContent: () => `#include "Explosion.hpp"
#include "ResourceManager.hpp"

Explosion::Explosion(sf::Vector2f position)
    : m_lifeTime(0.f)
    , m_maxLifeTime(0.5f)
    , m_frameCount(6)
    , m_currentFrame(0)
    , m_frameTimer(0.f)
{
    m_sprite.setTexture(ResourceManager::getInstance().getTexture("explosion.png"));
    
    // Assume spritesheet is horizontal with 6 frames
    int frameWidth = m_sprite.getLocalBounds().width / m_frameCount;
    int frameHeight = m_sprite.getLocalBounds().height;
    
    m_sprite.setTextureRect(sf::IntRect(0, 0, frameWidth, frameHeight));
    m_sprite.setOrigin(frameWidth / 2.f, frameHeight / 2.f);
    m_sprite.setPosition(position);
    m_sprite.setScale(1.5f, 1.5f);
}

void Explosion::update(float deltaTime) {
    m_lifeTime += deltaTime;
    m_frameTimer += deltaTime;

    // Swap frames every 0.08s
    if (m_frameTimer >= 0.08s) {
        m_frameTimer = 0.f;
        m_currentFrame++;
        if (m_currentFrame < m_frameCount) {
            int frameWidth = m_sprite.getTexture()->getSize().x / m_frameCount;
            int frameHeight = m_sprite.getTexture()->getSize().y;
            m_sprite.setTextureRect(sf::IntRect(m_currentFrame * frameWidth, 0, frameWidth, frameHeight));
        }
    }

    // Fade out over lifetime
    float ratio = 1.0f - (m_lifeTime / m_maxLifeTime);
    if (ratio < 0.f) ratio = 0.f;
    m_sprite.setColor(sf::Color(255, 255, 255, static_cast<sf::Uint8>(ratio * 255)));
}

void Explosion::draw(sf::RenderWindow& window) {
    if (!isFinished()) {
        window.draw(m_sprite);
    }
}

bool Explosion::isFinished() const {
    return m_lifeTime >= m_maxLifeTime || m_currentFrame >= m_frameCount;
}
`
  },
  {
    path: "include/CollisionManager.hpp",
    category: "header",
    description: "Collision Manager header - handles all game object intersections",
    getContent: () => `#pragma once
#include <vector>
#include <memory>
#include "Player.hpp"
#include "Enemy.hpp"
#include "Bullet.hpp"
#include "PowerUp.hpp"
#include "Explosion.hpp"
#include "Boss.hpp"

class CollisionManager {
public:
    static void handleCollisions(
        Player& player,
        std::vector<std::unique_ptr<Enemy>>& enemies,
        std::vector<std::unique_ptr<Bullet>>& bullets,
        std::vector<std::unique_ptr<PowerUp>>& powerups,
        std::vector<std::unique_ptr<Explosion>>& explosions,
        Boss& boss,
        int& score,
        int& coinsCollected
    );
};
`
  },
  {
    path: "src/CollisionManager.cpp",
    category: "source",
    description: "Collision Manager source - checks bounding boxes and applies logic",
    getContent: () => `#include "CollisionManager.hpp"
#include "SoundManager.hpp"
#include <cstdlib>

void CollisionManager::handleCollisions(
    Player& player,
    std::vector<std::unique_ptr<Enemy>>& enemies,
    std::vector<std::unique_ptr<Bullet>>& bullets,
    std::vector<std::unique_ptr<PowerUp>>& powerups,
    std::vector<std::unique_ptr<Explosion>>& explosions,
    Boss& boss,
    int& score,
    int& coinsCollected
) {
    // 1. Player Bullets vs Enemies
    for (auto& b : bullets) {
        if (!b->isPlayerOwned() || b->isExpired()) continue;

        for (auto& e : enemies) {
            if (e->isExpired()) continue;

            if (b->getBounds().intersects(e->getBounds())) {
                b->destroy();
                e->destroy();
                score += e->getScoreValue();

                // Trigger Explosion
                explosions.push_back(std::make_unique<Explosion>(e->getBounds().left + e->getBounds().width/2.f, e->getBounds().top + e->getBounds().height/2.f));
                SoundManager::getInstance().playSound("explosion.wav");

                // Randomly spawn Power-ups/Coins on kill (30% chance)
                if (rand() % 100 < 30) {
                    PowerUpType type = static_cast<PowerUpType>(rand() % 5);
                    powerups.push_back(std::make_unique<PowerUp>(type, e->getBounds().left + e->getBounds().width/2.f, e->getBounds().top + e->getBounds().height/2.f));
                }
                break;
            }
        }
    }

    // 2. Player Bullets vs Boss
    if (boss.getState() == BossState::Active) {
        for (auto& b : bullets) {
            if (!b->isPlayerOwned() || b->isExpired()) continue;

            if (b->getBounds().intersects(boss.getBounds())) {
                b->destroy();
                bool isDead = boss.takeDamage(1);
                score += 50; // Points for hitting boss

                if (isDead) {
                    score += 5000;
                    explosions.push_back(std::make_unique<Explosion>(boss.getBounds().left + boss.getBounds().width/2.f, boss.getBounds().top + boss.getBounds().height/2.f));
                    SoundManager::getInstance().playSound("explosion.wav");
                }
            }
        }
    }

    // 3. Enemy Bullets vs Player
    for (auto& b : bullets) {
        if (b->isPlayerOwned() || b->isExpired()) continue;

        if (b->getBounds().intersects(player.getBounds())) {
            b->destroy();
            player.takeDamage();
        }
    }

    // 4. Enemies crash directly into Player
    for (auto& e : enemies) {
        if (e->isExpired()) continue;

        if (e->getBounds().intersects(player.getBounds())) {
            e->destroy();
            player.takeDamage();
            explosions.push_back(std::make_unique<Explosion>(e->getBounds().left + e->getBounds().width/2.f, e->getBounds().top + e->getBounds().height/2.f));
            SoundManager::getInstance().playSound("explosion.wav");
        }
    }

    // 5. Player collects items / power-ups
    for (auto& p : powerups) {
        if (p->isExpired()) continue;

        if (p->getBounds().intersects(player.getBounds())) {
            p->collect();
            
            switch (p->getType()) {
            case PowerUpType::Shield:
                player.activateShield(10.f); // 10 second shield
                break;
            case PowerUpType::RapidFire:
                player.setFireMode(FireMode::Rapid, 8.f); // 8 second rapid fire
                break;
            case PowerUpType::DoubleBullet:
                player.setFireMode(FireMode::Double, 8.f); // 8 second double fire
                break;
            case PowerUpType::HealthPack:
                player.reset(player.getPosition()); // Restores health pool
                SoundManager::getInstance().playSound("powerup.wav");
                break;
            case PowerUpType::Coin:
                coinsCollected++;
                score += 50;
                SoundManager::getInstance().playSound("coin.wav");
                break;
            }
        }
    }
}
`
  },
  {
    path: "include/SaveSystem.hpp",
    category: "header",
    description: "Save System header - persists local scores and configuration records",
    getContent: () => `#pragma once
#include <string>

class SaveSystem {
public:
    static void saveHighScore(int score, const std::string& filename = "highscore.dat");
    static int loadHighScore(const std::string& filename = "highscore.dat");
};
`
  },
  {
    path: "src/SaveSystem.cpp",
    category: "source",
    description: "Save System source - binary file read/write mechanics",
    getContent: () => `#include "SaveSystem.hpp"
#include <fstream>
#include <iostream>

void SaveSystem::saveHighScore(int score, const std::string& filename) {
    int currentHighScore = loadHighScore(filename);
    if (score <= currentHighScore) return;

    std::ofstream outFile(filename, std::ios::binary);
    if (!outFile) {
        std::cerr << "Error writing high score file: " << filename << std::endl;
        return;
    }
    outFile.write(reinterpret_cast<const char*>(&score), sizeof(score));
    outFile.close();
}

int SaveSystem::loadHighScore(const std::string& filename) {
    std::ifstream inFile(filename, std::ios::binary);
    if (!inFile) {
        // File doesn't exist yet, return 0
        return 0;
    }
    int highScore = 0;
    inFile.read(reinterpret_cast<char*>(&highScore), sizeof(highScore));
    inFile.close();
    return highScore;
}
`
  },
  {
    path: "include/LevelManager.hpp",
    category: "header",
    description: "Level Manager header - handles stage progression and difficulty spikes",
    getContent: () => `#pragma once
#include <SFML/Graphics.hpp>

enum class LevelPhase {
    NormalSpawner,
    WarningMessage,
    BossBattle,
    LevelCleared
};

class LevelManager {
public:
    LevelManager();
    ~LevelManager() = default;

    void update(float deltaTime, int activeEnemies, bool bossIsDead);
    void reset();

    // Getters
    int getCurrentLevel() const;
    LevelPhase getPhase() const;
    float getSpawnInterval() const;
    int getEnemiesRemainingInWave() const;
    void decrementEnemiesRemaining();
    void triggerBossFight();

private:
    int m_currentLevel;
    LevelPhase m_phase;
    
    int m_enemiesPerLevel;
    int m_enemiesSpawned;
    int m_enemiesRemainingToSpawn;
    
    float m_spawnInterval;
    float m_phaseTimer;
};
`
  },
  {
    path: "src/LevelManager.cpp",
    category: "source",
    description: "Level Manager source - state machine driving wave spawners",
    getContent: () => `#include "LevelManager.hpp"
#include "SoundManager.hpp"

LevelManager::LevelManager() {
    reset();
}

void LevelManager::reset() {
    m_currentLevel = 1;
    m_phase = LevelPhase::NormalSpawner;
    m_enemiesPerLevel = 15;
    m_enemiesSpawned = 0;
    m_enemiesRemainingToSpawn = m_enemiesPerLevel;
    m_spawnInterval = 2.0f;
    m_phaseTimer = 0.f;
}

void LevelManager::update(float deltaTime, int activeEnemies, bool bossIsDead) {
    m_phaseTimer += deltaTime;

    if (m_phase == LevelPhase::NormalSpawner) {
        if (m_enemiesRemainingToSpawn <= 0 && activeEnemies == 0) {
            // Initiate Boss Entry phase
            m_phase = LevelPhase::WarningMessage;
            m_phaseTimer = 0.f;
            SoundManager::getInstance().playSound("hurt.wav"); // Loud sound warning
        }
    } 
    else if (m_phase == LevelPhase::WarningMessage) {
        // Show warning message for 3 seconds before boss enters
        if (m_phaseTimer >= 3.0f) {
            m_phase = LevelPhase::BossBattle;
            m_phaseTimer = 0.f;
        }
    } 
    else if (m_phase == LevelPhase::BossBattle) {
        if (bossIsDead) {
            m_phase = LevelPhase::LevelCleared;
            m_phaseTimer = 0.f;
            SoundManager::getInstance().stopMusic();
            SoundManager::getInstance().playSound("powerup.wav");
        }
    } 
    else if (m_phase == LevelPhase::LevelCleared) {
        // Proceed to next level after 4 seconds
        if (m_phaseTimer >= 4.0f) {
            m_currentLevel++;
            m_phase = LevelPhase::NormalSpawner;
            m_enemiesPerLevel += 5; // Difficulty scale
            m_enemiesRemainingToSpawn = m_enemiesPerLevel;
            m_spawnInterval = std::max(0.6f, 2.0f - (m_currentLevel * 0.15f)); // Spawns faster
            m_phaseTimer = 0.f;
            SoundManager::getInstance().playMusic("bgm.ogg", true);
        }
    }
}

int LevelManager::getCurrentLevel() const { return m_currentLevel; }
LevelPhase LevelManager::getPhase() const { return m_phase; }
float LevelManager::getSpawnInterval() const { return m_spawnInterval; }
int LevelManager::getEnemiesRemainingInWave() const { return m_enemiesRemainingToSpawn; }
void LevelManager::decrementEnemiesRemaining() { m_enemiesRemainingToSpawn--; }
void LevelManager::triggerBossFight() { m_phase = LevelPhase::BossBattle; }
`
  },
  {
    path: "include/UI.hpp",
    category: "header",
    description: "UI display header - scoreboard, hearts indicator, and warning overlays",
    getContent: () => `#pragma once
#include <SFML/Graphics.hpp>
#include "Player.hpp"
#include "Boss.hpp"
#include "LevelManager.hpp"

class UI {
public:
    UI();
    ~UI() = default;

    void drawHUD(sf::RenderWindow& window, const Player& player, int score, int highscore, int coins, int level, LevelPhase phase, int bossHp, int bossMaxHp);
    void drawPauseScreen(sf::RenderWindow& window);
    void drawGameOverScreen(sf::RenderWindow& window, int finalScore);
    void drawVictoryScreen(sf::RenderWindow& window, int finalScore);

private:
    sf::Font m_font;
    sf::Text m_textHUD;
    sf::Text m_bossHUD;
    sf::Text m_overlayTitle;
    sf::Text m_overlaySubtitle;

    sf::RectangleShape m_healthBarOuter;
    sf::RectangleShape m_healthBarInner;
};
`
  },
  {
    path: "src/UI.cpp",
    category: "source",
    description: "UI display source - renders heads-up-display indicators, text, and vector shields",
    getContent: () => `#include "UI.hpp"
#include "ResourceManager.hpp"
#include <string>

UI::UI() {
    m_font = ResourceManager::getInstance().getFont("font.ttf");
    
    m_textHUD.setFont(m_font);
    m_textHUD.setCharacterSize(18);
    m_textHUD.setFillColor(sf::Color::White);

    m_bossHUD.setFont(m_font);
    m_bossHUD.setCharacterSize(22);
    m_bossHUD.setFillColor(sf::Color::Red);

    m_overlayTitle.setFont(m_font);
    m_overlayTitle.setCharacterSize(45);
    m_overlayTitle.setFillColor(sf::Color::Red);

    m_overlaySubtitle.setFont(m_font);
    m_overlaySubtitle.setCharacterSize(20);
    m_overlaySubtitle.setFillColor(sf::Color::White);

    // Boss healthbar layout
    m_healthBarOuter.setSize(sf::Vector2f(400.f, 15.f));
    m_healthBarOuter.setFillColor(sf::Color(50, 0, 0, 150));
    m_healthBarOuter.setOutlineThickness(2.f);
    m_healthBarOuter.setOutlineColor(sf::Color::Red);
    m_healthBarOuter.setOrigin(200.f, 7.5f);
}

void UI::drawHUD(sf::RenderWindow& window, const Player& player, int score, int highscore, int coins, int level, LevelPhase phase, int bossHp, int bossMaxHp) {
    // Standard HUD Text
    std::string hudString = "SCORE: " + std::to_string(score) + 
                           "   HI-SCORE: " + std::to_string(highscore) +
                           "   COINS: " + std::to_string(coins) + 
                           "\\nLIVES: " + std::to_string(player.getLives()) + 
                           "   HP: " + std::to_string(player.getHealth()) + "/3" +
                           "   LEVEL: " + std::to_string(level);
    
    if (player.isShieldActive()) {
        hudString += "   [SHIELD ACTIVE]";
    }

    m_textHUD.setString(hudString);
    m_textHUD.setPosition(15.f, 15.f);
    window.draw(m_textHUD);

    // Warning Message
    if (phase == LevelPhase::WarningMessage) {
        m_overlayTitle.setString("WARNING: BOSS APPROACHING!");
        m_overlayTitle.setFillColor(sf::Color::Red);
        m_overlayTitle.setOrigin(m_overlayTitle.getLocalBounds().width / 2.f, m_overlayTitle.getLocalBounds().height / 2.f);
        m_overlayTitle.setPosition(window.getSize().x / 2.f, window.getSize().y / 2.f - 100.f);
        window.draw(m_overlayTitle);
    }

    // Boss HP Bar overlay
    if (phase == LevelPhase::BossBattle && bossHp > 0) {
        m_bossHUD.setString("BOSS");
        m_bossHUD.setOrigin(m_bossHUD.getLocalBounds().width / 2.f, m_bossHUD.getLocalBounds().height / 2.f);
        m_bossHUD.setPosition(window.getSize().x / 2.f, 60.f);
        window.draw(m_bossHUD);

        // Calculate scale size
        float ratio = static_cast<float>(bossHp) / static_cast<float>(bossMaxHp);
        m_healthBarInner.setSize(sf::Vector2f(400.f * ratio, 15.f));
        m_healthBarInner.setFillColor(sf::Color::Red);
        m_healthBarInner.setOrigin(200.f, 7.5f);
        
        m_healthBarOuter.setPosition(window.getSize().x / 2.f, 90.f);
        m_healthBarInner.setPosition(window.getSize().x / 2.f, 90.f);

        window.draw(m_healthBarOuter);
        window.draw(m_healthBarInner);
    }

    // Level Clear Message
    if (phase == LevelPhase::LevelCleared) {
        m_overlayTitle.setString("LEVEL COMPLETED!");
        m_overlayTitle.setFillColor(sf::Color::Green);
        m_overlayTitle.setOrigin(m_overlayTitle.getLocalBounds().width / 2.f, m_overlayTitle.getLocalBounds().height / 2.f);
        m_overlayTitle.setPosition(window.getSize().x / 2.f, window.getSize().y / 2.f - 100.f);

        m_overlaySubtitle.setString("PREPARING ENEMY GRID FOR NEXT SECTOR...");
        m_overlaySubtitle.setOrigin(m_overlaySubtitle.getLocalBounds().width / 2.f, m_overlaySubtitle.getLocalBounds().height / 2.f);
        m_overlaySubtitle.setPosition(window.getSize().x / 2.f, window.getSize().y / 2.f - 30.f);

        window.draw(m_overlayTitle);
        window.draw(m_overlaySubtitle);
    }
}

void UI::drawPauseScreen(sf::RenderWindow& window) {
    // Transparent background backdrop dim
    sf::RectangleShape backdrop(sf::Vector2f(window.getSize().x, window.getSize().y));
    backdrop.setFillColor(sf::Color(0, 0, 0, 180));
    window.draw(backdrop);

    m_overlayTitle.setString("GAME PAUSED");
    m_overlayTitle.setFillColor(sf::Color::Cyan);
    m_overlayTitle.setOrigin(m_overlayTitle.getLocalBounds().width / 2.f, m_overlayTitle.getLocalBounds().height / 2.f);
    m_overlayTitle.setPosition(window.getSize().x / 2.f, window.getSize().y / 2.f - 50.f);

    m_overlaySubtitle.setString("PRESS 'P' OR 'ESC' TO RESUME GAMEPLAY\\nPRESS 'ESC' IN MENU TO QUIT");
    m_overlaySubtitle.setOrigin(m_overlaySubtitle.getLocalBounds().width / 2.f, m_overlaySubtitle.getLocalBounds().height / 2.f);
    m_overlaySubtitle.setPosition(window.getSize().x / 2.f, window.getSize().y / 2.f + 20.f);

    window.draw(m_overlayTitle);
    window.draw(m_overlaySubtitle);
}

void UI::drawGameOverScreen(sf::RenderWindow& window, int finalScore) {
    sf::RectangleShape backdrop(sf::Vector2f(window.getSize().x, window.getSize().y));
    backdrop.setFillColor(sf::Color(20, 0, 0, 220));
    window.draw(backdrop);

    m_overlayTitle.setString("GAME OVER");
    m_overlayTitle.setFillColor(sf::Color::Red);
    m_overlayTitle.setOrigin(m_overlayTitle.getLocalBounds().width / 2.f, m_overlayTitle.getLocalBounds().height / 2.f);
    m_overlayTitle.setPosition(window.getSize().x / 2.f, window.getSize().y / 2.f - 80.f);

    m_overlaySubtitle.setString("FINAL SCORE: " + std::to_string(finalScore) + "\\n\\nPRESS 'SPACE' TO RETURN TO MAIN MENU");
    m_overlaySubtitle.setOrigin(m_overlaySubtitle.getLocalBounds().width / 2.f, m_overlaySubtitle.getLocalBounds().height / 2.f);
    m_overlaySubtitle.setPosition(window.getSize().x / 2.f, window.getSize().y / 2.f + 10.f);

    window.draw(m_overlayTitle);
    window.draw(m_overlaySubtitle);
}

void UI::drawVictoryScreen(sf::RenderWindow& window, int finalScore) {
    sf::RectangleShape backdrop(sf::Vector2f(window.getSize().x, window.getSize().y));
    backdrop.setFillColor(sf::Color(0, 30, 10, 220));
    window.draw(backdrop);

    m_overlayTitle.setString("VICTORY IMMINENT!");
    m_overlayTitle.setFillColor(sf::Color::Yellow);
    m_overlayTitle.setOrigin(m_overlayTitle.getLocalBounds().width / 2.f, m_overlayTitle.getLocalBounds().height / 2.f);
    m_overlayTitle.setPosition(window.getSize().x / 2.f, window.getSize().y / 2.f - 80.f);

    m_overlaySubtitle.setString("YOU SAVED THE GALAXY SECURELY!\\nFINAL SCORE: " + std::to_string(finalScore) + "\\n\\nPRESS 'SPACE' TO GO TO MAIN MENU");
    m_overlaySubtitle.setOrigin(m_overlaySubtitle.getLocalBounds().width / 2.f, m_overlaySubtitle.getLocalBounds().height / 2.f);
    m_overlaySubtitle.setPosition(window.getSize().x / 2.f, window.getSize().y / 2.f + 10.f);

    window.draw(m_overlayTitle);
    window.draw(m_overlaySubtitle);
}
`
  },
  {
    path: "include/Menu.hpp",
    category: "header",
    description: "Main Menu class header - keyboard navigatable selection screen",
    getContent: () => `#pragma once
#include <SFML/Graphics.hpp>
#include <vector>
#include <string>

enum class MenuState {
    MainMenu,
    Settings,
    Playing,
    Exit
};

class Menu {
public:
    Menu(float width, float height);
    ~Menu() = default;

    void draw(sf::RenderWindow& window, int highscore);
    void moveUp();
    void moveDown();
    int getPressedItem() const { return m_selectedIndex; }
    void setMenuState(MenuState state);
    MenuState getMenuState() const;

private:
    int m_selectedIndex;
    sf::Font m_font;
    sf::Text m_title;
    sf::Text m_highscoreText;
    std::vector<sf::Text> m_menuItems;
    std::vector<sf::Text> m_settingsItems;

    MenuState m_state;
};
`
  },
  {
    path: "src/Menu.cpp",
    category: "source",
    description: "Main Menu class source - updates highlighting text tags and handles settings toggle",
    getContent: () => `#include "Menu.hpp"
#include "ResourceManager.hpp"
#include "SoundManager.hpp"

Menu::Menu(float width, float height)
    : m_selectedIndex(0)
    , m_state(MenuState::MainMenu)
{
    m_font = ResourceManager::getInstance().getFont("font.ttf");

    m_title.setFont(m_font);
    m_title.setCharacterSize(50);
    m_title.setFillColor(sf::Color::White);
    m_title.setString("SPACE SHOOTER");
    m_title.setOrigin(m_title.getLocalBounds().width / 2.f, m_title.getLocalBounds().height / 2.f);
    m_title.setPosition(sf::Vector2f(width / 2.f, height / 5.f));

    m_highscoreText.setFont(m_font);
    m_highscoreText.setCharacterSize(18);
    m_highscoreText.setFillColor(sf::Color::Yellow);
    m_highscoreText.setPosition(20.f, 20.f);

    // Add main items
    std::vector<std::string> labels = { "PLAY GAME", "SETTINGS", "EXIT GAME" };
    for (size_t i = 0; i < labels.size(); ++i) {
        sf::Text t;
        t.setFont(m_font);
        t.setCharacterSize(28);
        t.setString(labels[i]);
        t.setFillColor(i == 0 ? sf::Color::Cyan : sf::Color::White);
        t.setOrigin(t.getLocalBounds().width / 2.f, t.getLocalBounds().height / 2.f);
        t.setPosition(sf::Vector2f(width / 2.f, height / 2.2f + i * 65.f));
        m_menuItems.push_back(t);
    }

    // Add Settings Items (e.g. Volume Controls)
    std::vector<std::string> setLabels = { "MUSIC VOLUME: 35%", "SOUND VOLUME: 50%", "BACK TO MAIN" };
    for (size_t i = 0; i < setLabels.size(); ++i) {
        sf::Text t;
        t.setFont(m_font);
        t.setCharacterSize(26);
        t.setString(setLabels[i]);
        t.setFillColor(i == 0 ? sf::Color::Cyan : sf::Color::White);
        t.setOrigin(t.getLocalBounds().width / 2.f, t.getLocalBounds().height / 2.f);
        t.setPosition(sf::Vector2f(width / 2.f, height / 2.2f + i * 65.f));
        m_settingsItems.push_back(t);
    }
}

void Menu::draw(sf::RenderWindow& window, int highscore) {
    m_highscoreText.setString("HI-SCORE: " + std::to_string(highscore));
    window.draw(m_highscoreText);
    window.draw(m_title);

    if (m_state == MenuState::MainMenu) {
        m_title.setString("SPACE SHOOTER");
        for (auto& item : m_menuItems) {
            window.draw(item);
        }
    } else if (m_state == MenuState::Settings) {
        m_title.setString("AUDIO SETTINGS");
        
        // Dynamically update strings with active volumes
        float mv = SoundManager::getInstance().getMusicVolume();
        float sv = SoundManager::getInstance().getSoundVolume();
        m_settingsItems[0].setString("MUSIC VOLUME: " + std::to_string(static_cast<int>(mv)) + "%");
        m_settingsItems[1].setString("SOUND VOLUME: " + std::to_string(static_cast<int>(sv)) + "%");

        for (auto& item : m_settingsItems) {
            window.draw(item);
        }
    }
}

void Menu::moveUp() {
    SoundManager::getInstance().playSound("coin.wav");
    if (m_state == MenuState::MainMenu) {
        m_menuItems[m_selectedIndex].setFillColor(sf::Color::White);
        m_selectedIndex = (m_selectedIndex - 1 + m_menuItems.size()) % m_menuItems.size();
        m_menuItems[m_selectedIndex].setFillColor(sf::Color::Cyan);
    } else if (m_state == MenuState::Settings) {
        m_settingsItems[m_selectedIndex].setFillColor(sf::Color::White);
        m_selectedIndex = (m_selectedIndex - 1 + m_settingsItems.size()) % m_settingsItems.size();
        m_settingsItems[m_selectedIndex].setFillColor(sf::Color::Cyan);
    }
}

void Menu::moveDown() {
    SoundManager::getInstance().playSound("coin.wav");
    if (m_state == MenuState::MainMenu) {
        m_menuItems[m_selectedIndex].setFillColor(sf::Color::White);
        m_selectedIndex = (m_selectedIndex + 1) % m_menuItems.size();
        m_menuItems[m_selectedIndex].setFillColor(sf::Color::Cyan);
    } else if (m_state == MenuState::Settings) {
        m_settingsItems[m_selectedIndex].setFillColor(sf::Color::White);
        m_selectedIndex = (m_selectedIndex + 1) % m_settingsItems.size();
        m_settingsItems[m_selectedIndex].setFillColor(sf::Color::Cyan);
    }
}

void Menu::setMenuState(MenuState state) {
    m_state = state;
    m_selectedIndex = 0;
    
    // Reset highlighting selections
    for (size_t i = 0; i < m_menuItems.size(); ++i) {
        m_menuItems[i].setFillColor(i == 0 ? sf::Color::Cyan : sf::Color::White);
    }
    for (size_t i = 0; i < m_settingsItems.size(); ++i) {
        m_settingsItems[i].setFillColor(i == 0 ? sf::Color::Cyan : sf::Color::White);
    }
}

MenuState Menu::getMenuState() const { return m_state; }
`
  },
  {
    path: "include/Game.hpp",
    category: "header",
    description: "Core Game engine header - manages delta times and spawns thread processes",
    getContent: () => `#pragma once
#include <SFML/Graphics.hpp>
#include <vector>
#include <memory>
#include "Player.hpp"
#include "Enemy.hpp"
#include "Boss.hpp"
#include "Bullet.hpp"
#include "PowerUp.hpp"
#include "Explosion.hpp"
#include "UI.hpp"
#include "Menu.hpp"
#include "LevelManager.hpp"

enum class GameState {
    Menu,
    Playing,
    Paused,
    GameOver,
    Victory
};

class Game {
public:
    Game();
    ~Game() = default;

    void run();

private:
    void processEvents();
    void update(float deltaTime);
    void render();

    void spawnEnemies(float deltaTime);
    void resetGame();

    // Window config
    sf::RenderWindow m_window;
    GameState m_state;

    // Game Managers
    UI m_ui;
    Menu m_menu;
    LevelManager m_levelManager;

    // Entities
    Player m_player;
    Boss m_boss;
    std::vector<std::unique_ptr<Enemy>> m_enemies;
    std::vector<std::unique_ptr<Bullet>> m_bullets;
    std::vector<std::unique_ptr<PowerUp>> m_powerups;
    std::vector<std::unique_ptr<Explosion>> m_explosions;

    // Gameplay parameters
    int m_score;
    int m_highScore;
    int m_coinsCollected;

    // Spawning timers
    float m_spawnTimer;

    // Scrolling backgrounds
    sf::Sprite m_bgSprite1;
    sf::Sprite m_bgSprite2;
    float m_bgSpeed;

    // Time tracks
    sf::Clock m_clock;
};
`
  },
  {
    path: "src/Game.cpp",
    category: "source",
    description: "Core Game engine source - updates main loops, coordinates scrolling backgrounds, and draws sprites",
    getContent: () => `#include "Game.hpp"
#include "ResourceManager.hpp"
#include "SoundManager.hpp"
#include "CollisionManager.hpp"
#include "SaveSystem.hpp"
#include <iostream>

Game::Game()
    : m_window(sf::VideoMode(800, 900), "Space Shooter C++", sf::Style::Titlebar | sf::Style::Close)
    , m_state(GameState::Menu)
    , m_menu(800.f, 900.f)
    , m_score(0)
    , m_coinsCollected(0)
    , m_spawnTimer(0.f)
    , m_bgSpeed(100.f)
{
    m_window.setFramerateLimit(60);

    // Setup scrolling backgrounds
    sf::Texture& bgTex = ResourceManager::getInstance().getTexture("background.png");
    bgTex.setRepeated(true);
    m_bgSprite1.setTexture(bgTex);
    m_bgSprite2.setTexture(bgTex);
    m_bgSprite1.setPosition(0.f, 0.f);
    m_bgSprite2.setPosition(0.f, -900.f); // Stack exactly above

    m_highScore = SaveSystem::loadHighScore();

    // Trigger title screen audio loop
    SoundManager::getInstance().playMusic("bgm.ogg", true);
}

void Game::run() {
    m_clock.restart();
    while (m_window.isOpen()) {
        float deltaTime = m_clock.restart().asSeconds();
        
        // Prevent massive deltaTime jumps during window drags / hiccups
        if (deltaTime > 0.1f) deltaTime = 0.1f;

        processEvents();
        update(deltaTime);
        render();
    }
}

void Game::processEvents() {
    sf::Event event;
    while (m_window.pollEvent(event)) {
        if (event.type == sf::Event::Closed) {
            m_window.close();
        }

        if (event.type == sf::Event::KeyPressed) {
            // MENU EVENTS
            if (m_state == GameState::Menu) {
                if (m_menu.getMenuState() == MenuState::MainMenu) {
                    if (event.key.code == sf::Event::KeyPressed) {
                        if (event.key.code == sf::Keyboard::W || event.key.code == sf::Keyboard::Up) {
                            m_menu.moveUp();
                        } else if (event.key.code == sf::Keyboard::S || event.key.code == sf::Keyboard::Down) {
                            m_menu.moveDown();
                        } else if (event.key.code == sf::Keyboard::Enter) {
                            int idx = m_menu.getPressedItem();
                            if (idx == 0) { // Play
                                resetGame();
                                m_state = GameState::Playing;
                            } else if (idx == 1) { // Settings
                                m_menu.setMenuState(MenuState::Settings);
                            } else if (idx == 2) { // Exit
                                m_window.close();
                            }
                        }
                    }
                } 
                else if (m_menu.getMenuState() == MenuState::Settings) {
                    if (event.key.code == sf::Keyboard::W || event.key.code == sf::Keyboard::Up) {
                        m_menu.moveUp();
                    } else if (event.key.code == sf::Keyboard::S || event.key.code == sf::Keyboard::Down) {
                        m_menu.moveDown();
                    } else if (event.key.code == sf::Keyboard::A || event.key.code == sf::Keyboard::Left) {
                        // Decrease volumes
                        int idx = m_menu.getPressedItem();
                        if (idx == 0) {
                            float vol = std::max(0.f, SoundManager::getInstance().getMusicVolume() - 10.f);
                            SoundManager::getInstance().setMusicVolume(vol);
                        } else if (idx == 1) {
                            float vol = std::max(0.f, SoundManager::getInstance().getSoundVolume() - 10.f);
                            SoundManager::getInstance().setSoundVolume(vol);
                        }
                    } else if (event.key.code == sf::Keyboard::D || event.key.code == sf::Keyboard::Right) {
                        // Increase volumes
                        int idx = m_menu.getPressedItem();
                        if (idx == 0) {
                            float vol = std::min(100.f, SoundManager::getInstance().getMusicVolume() + 10.f);
                            SoundManager::getInstance().setMusicVolume(vol);
                        } else if (idx == 1) {
                            float vol = std::min(100.f, SoundManager::getInstance().getSoundVolume() + 10.f);
                            SoundManager::getInstance().setSoundVolume(vol);
                        }
                    } else if (event.key.code == sf::Keyboard::Enter) {
                        int idx = m_menu.getPressedItem();
                        if (idx == 2) { // Back to Main Menu
                            m_menu.setMenuState(MenuState::MainMenu);
                        }
                    }
                }
            } 
            // PLAYING EVENTS
            else if (m_state == GameState::Playing) {
                if (event.key.code == sf::Keyboard::Escape || event.key.code == sf::Keyboard::P) {
                    m_state = GameState::Paused;
                }
            } 
            // PAUSE MENU
            else if (m_state == GameState::Paused) {
                if (event.key.code == sf::Keyboard::Escape || event.key.code == sf::Keyboard::P) {
                    m_state = GameState::Playing;
                }
            } 
            // GAME OVER / VICTORY OVERLAY
            else if (m_state == GameState::GameOver || m_state == GameState::Victory) {
                if (event.key.code == sf::Keyboard::Space || event.key.code == sf::Keyboard::Enter) {
                    m_state = GameState::Menu;
                    m_menu.setMenuState(MenuState::MainMenu);
                    SoundManager::getInstance().playMusic("bgm.ogg", true);
                }
            }
        }
    }
}

void Game::update(float deltaTime) {
    // Scroll background regardless of state (looks beautiful on pause or menu)
    m_bgSprite1.move(0.f, m_bgSpeed * deltaTime);
    m_bgSprite2.move(0.f, m_bgSpeed * deltaTime);

    if (m_bgSprite1.getPosition().y >= 900.f) {
        m_bgSprite1.setPosition(0.f, m_bgSprite2.getPosition().y - 900.f);
    }
    if (m_bgSprite2.getPosition().y >= 900.f) {
        m_bgSprite2.setPosition(0.f, m_bgSprite1.getPosition().y - 900.f);
    }

    if (m_state != GameState::Playing) return;

    // Spawning wave patterns
    spawnEnemies(deltaTime);

    // Update Entities
    m_player.update(deltaTime, m_window.getSize(), m_bullets);

    if (m_levelManager.getPhase() == LevelPhase::BossBattle) {
        if (m_boss.getState() == BossState::Destroyed) {
            // Boss was just defeated
            m_boss.spawn(sf::Vector2f(400.f, 200.f)); // Spawns next boss iteration
        }
        m_boss.update(deltaTime, m_bullets, m_player.getPosition());
    }

    // Update Bullets
    for (auto& bullet : m_bullets) {
        bullet->update(deltaTime);
    }
    // Update Enemies
    for (auto& enemy : m_enemies) {
        enemy->update(deltaTime, m_bullets, m_player.getPosition());
    }
    // Update Items
    for (auto& p : m_powerups) {
        p->update(deltaTime);
    }
    // Update Particles
    for (auto& exp : m_explosions) {
        exp->update(deltaTime);
    }

    // Handles collisions
    CollisionManager::handleCollisions(
        m_player, m_enemies, m_bullets, m_powerups, m_explosions, m_boss, m_score, m_coinsCollected
    );

    // Save dynamic Highscore records
    if (m_score > m_highScore) {
        m_highScore = m_score;
        SaveSystem::saveHighScore(m_highScore);
    }

    // Level state progression checks
    bool bossIsDead = (m_levelManager.getPhase() == LevelPhase::BossBattle && m_boss.getState() == BossState::Destroyed);
    m_levelManager.update(deltaTime, m_enemies.size(), bossIsDead);

    // Garbage collection of expired entities
    m_bullets.erase(std::remove_if(m_bullets.begin(), m_bullets.end(), [](const auto& b) { return b->isExpired(); }), m_bullets.end());
    m_enemies.erase(std::remove_if(m_enemies.begin(), m_enemies.end(), [](const auto& e) { return e->isExpired(); }), m_enemies.end());
    m_powerups.erase(std::remove_if(m_powerups.begin(), m_powerups.end(), [](const auto& p) { return p->isExpired(); }), m_powerups.end());
    m_explosions.erase(std::remove_if(m_explosions.begin(), m_explosions.end(), [](const auto& exp) { return exp->isFinished(); }), m_explosions.end());

    // Game over conditional check
    if (m_player.isDead()) {
        m_state = GameState::GameOver;
        SoundManager::getInstance().stopMusic();
        SoundManager::getInstance().playSound("explosion.wav");
    }
}

void Game::spawnEnemies(float deltaTime) {
    if (m_levelManager.getPhase() != LevelPhase::NormalSpawner) return;

    m_spawnTimer += deltaTime;
    if (m_spawnTimer >= m_levelManager.getSpawnInterval()) {
        m_spawnTimer = 0.f;

        if (m_levelManager.getEnemiesRemainingInWave() > 0) {
            // Choose type randomly (Basic, Fast, ZigZag)
            int dice = rand() % 100;
            EnemyType type = EnemyType::Basic;
            if (dice > 70) type = EnemyType::Fast;
            else if (dice > 45) type = EnemyType::ZigZag;

            float spawnX = 50.f + static_cast<float>(rand() % 700);
            m_enemies.push_back(std::make_unique<Enemy>(type, sf::Vector2f(spawnX, -50.f)));
            m_levelManager.decrementEnemiesRemaining();
        }
    }
}

void Game::resetGame() {
    m_score = 0;
    m_coinsCollected = 0;
    m_enemies.clear();
    m_bullets.clear();
    m_powerups.clear();
    m_explosions.clear();
    m_player.reset(sf::Vector2f(400.f, 800.f));
    m_levelManager.reset();
    
    // Begin playing music
    SoundManager::getInstance().playMusic("bgm.ogg", true);
}

void Game::render() {
    m_window.clear();

    // Draw background grid scroll
    m_window.draw(m_bgSprite1);
    m_window.draw(m_bgSprite2);

    if (m_state == GameState::Menu) {
        m_menu.draw(m_window, m_highScore);
    } 
    else {
        // Draw gameplay entities
        for (auto& bullet : m_bullets) bullet->draw(m_window);
        for (auto& enemy : m_enemies) enemy->draw(m_window);
        for (auto& p : m_powerups) p->draw(m_window);
        for (auto& exp : m_explosions) exp->draw(m_window);

        if (m_levelManager.getPhase() == LevelPhase::BossBattle) {
            m_boss.draw(m_window);
        }

        m_player.draw(m_window);

        // Draw overlay menus
        m_ui.drawHUD(m_window, m_player, m_score, m_highScore, m_coinsCollected, 
                    m_levelManager.getCurrentLevel(), m_levelManager.getPhase(), 
                    m_boss.getHealth(), m_boss.getMaxHealth());

        if (m_state == GameState::Paused) {
            m_ui.drawPauseScreen(m_window);
        } else if (m_state == GameState::GameOver) {
            m_ui.drawGameOverScreen(m_window, m_score);
        } else if (m_state == GameState::Victory) {
            m_ui.drawVictoryScreen(m_window, m_score);
        }
    }

    m_window.display();
}
`
  }
];

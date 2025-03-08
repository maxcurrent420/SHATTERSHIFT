# MVP Development Plan: Shattershift Hunters

<br>

## 1. Project Overview

**Concept:** Shattershift Hunters is a browser-based, low-poly 3D exploration and hunting game. Players take on the role of Shattershift Hunters, tasked with capturing elusive, AI-controlled Specters in procedurally generated Shatterscapes. The core gameplay revolves around using a Shattershift Rifle with reality-altering effects to strategically trap Specters, rather than direct combat. The game emphasizes exploration, strategic thinking, and emergent gameplay within dynamic, physics-bending environments.

**Purpose of MVP:** To create a playable prototype that demonstrates the core mechanics of Shattershift Hunting: movement, Shattershift Rifle interaction (gravity wells), Specter behavior, and basic environment interaction within a single, procedurally generated Shatterscape. This MVP will serve to validate the core gameplay loop and attract initial interest.

<br>

## 2. Target User and Problem Statement

**Target User:**  Gamers interested in unique FPS experiences that prioritize strategy and exploration over traditional combat. Specifically, players who enjoy games with physics-based puzzles, emergent gameplay, and a blend of action and tactical thinking, potentially fans of games like Portal, Prey (2017), or stealth-action titles, but seeking a less violent and more intellectually engaging experience.

**Problem Statement:** Current FPS games often rely heavily on direct combat and violence, potentially alienating players seeking more strategic and less aggressive gameplay.  There is an unmet need for an FPS-style game that emphasizes non-lethal problem-solving, environmental interaction, and strategic hunting within a visually appealing and easily accessible browser environment. The MVP aims to solve this by providing a first taste of this unique gameplay, demonstrating the appeal of strategic Specter hunting and reality manipulation.

<br>

## 3. Core Features

**Prioritized Feature List for MVP (in order of importance):**

1.  **Player Movement and Controls:**
    -   Basic WASD movement and mouse-look controls within a 3D environment.
    -   Jumping and basic physics interactions (gravity).

2.  **Procedurally Generated Shatterscape (Single Biome):**
    -   Generation of a simple, playable 3D environment with basic low-poly terrain and simple structures.
    -   One distinct biome to establish visual style.

3.  **Shattershift Rifle - Gravity Well Functionality:**
    -   Implementation of the Shattershift Rifle with at least the "Gravity Well" effect.
    -   Visual and functional feedback for firing and effect of the Gravity Well.
    -   Limited ammo for strategic use.

4.  **Basic Specter AI and Behavior:**
    -   A single type of Specter with simple AI: patrolling, reacting to player presence, and being affected by Gravity Wells.
    -   Visual representation of the Specter (low-poly, ethereal).
    -   Objective: Capture (basic capture mechanic, no scoring needed for MVP).

5.  **Basic UI Elements:**
    -   Simple crosshair.
    -   Ammo counter for Shattershift Rifle.
    -   Basic instructions/objective display.

**Features Included Last:**

*   Multiple Shatterscapes or biomes.
*   Advanced Specter AI or multiple Specter types.
*   Time Bubbles, Phase Nets, or other Shattershift Rifle effects beyond Gravity Wells.
*   Environmental manipulation beyond basic physics.
*   Gear and ability combos.
*   Multiplayer functionality.
*   Saving and loading game state.
*   Scoring system or progression.
*   Detailed UI/UX or polished art assets.
*   Sound effects and music.
*   Hardcore Mode or monetization features.

<br>



## 4. Risk Assessment and Mitigation

**Potential Risks:**

1.  **Technical Complexity of 3D Development:**  Risk:  Developing a 3D game in the browser, even low-poly, can be technically challenging and time-consuming, potentially exceeding the timeline. Mitigation: Utilize Three.js. Focus on core mechanics first and iterate. Keep the visual fidelity minimal and prioritize functionality.

2.  **Procedural Generation Challenges:** Risk: Creating a procedurally generated Shatterscape that is both interesting and performant within the browser might be more complex than anticipated. Mitigation: Start with very simple procedural generation algorithms (e.g., basic heightmap or grid-based generation). Focus on functionality over visual complexity for the MVP.

3.  **Specter AI Implementation:** Risk: Even basic AI behavior can be time-consuming to implement and debug. Mitigation: Implement a very rudimentary state machine for Specter AI. Focus on making it react to the Gravity Well and player presence, rather than complex behaviors.

4.  **Scope Creep:** Risk:  The desire to add more features during development can lead to delays and increased costs. Mitigation: Strictly adhere to the defined core features for the MVP.  Document and defer any "nice-to-have" features for post-MVP development.  Regularly review the feature list and timeline to ensure focus.

5.  **Developer Bottleneck:** Risk: Relying on a single developer can create a bottleneck and increase the risk of delays if the developer faces unforeseen issues or workload becomes too high. Mitigation: Break down tasks into smaller, manageable chunks. Prioritize tasks and focus on the most critical features first. Maintain clear communication and proactively address any roadblocks.

<br>

## 5. MVP Development Phases

To ensure a structured approach to developing the MVP, we will break down the implementation into phases. Each phase will focus on a subset of core features, allowing for iterative development and testing.

**Phase 1: Core Movement and Environment**

*   **Objective:** Establish basic player movement and a simple procedurally generated environment.
*   **Tasks:**
    *   Implement WASD and mouse-look controls using Three.js.
    *   Set up a basic Three.js scene.
    *   Implement simple procedural terrain generation (e.g., heightmap).
    *   Basic collision detection for player movement.

**Phase 2: Shattershift Rifle - Gravity Well**

*   **Objective:** Implement the Gravity Well functionality of the Shattershift Rifle.
*   **Tasks:**
    *   Create a Shattershift Rifle object in Three.js.
    *   Implement Gravity Well effect on objects in the scene.
    *   Add visual feedback for firing and Gravity Well effect.
    *   Implement ammo counter and limited ammo.

**Phase 3: Specter AI and Interaction**

*   **Objective:** Introduce basic Specter AI and interaction with the Gravity Well.
*   **Tasks:**
    *   Create a simple Specter entity with basic patrol AI.
    *   Implement Specter reaction to player presence.
    *   Make Specter AI react to Gravity Well effect.
    *   Implement basic "capture" mechanic when Specter is in a Gravity Well.

**Phase 4: UI and Polish**

*   **Objective:** Add basic UI elements and polish the core gameplay loop.
*   **Tasks:**
    *   Implement crosshair.
    *   Display specters collected. 
    *   Add basic instructions/objective and radar into the HUD
    *   Playtesting and bug fixing.
    *   Minor visual and gameplay polish.

These phases are designed to be iterative, with each phase building upon the previous one. This allows for continuous testing and refinement of the core mechanics as we progress towards the MVP.
